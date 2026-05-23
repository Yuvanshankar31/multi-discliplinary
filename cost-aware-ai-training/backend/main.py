from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import joblib
import pandas as pd
import os
import uuid
import datetime
import sys
import hashlib
import secrets

# Add current path for aws_pricing
from aws_pricing import get_gpu_price

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OPTIMIZER_DIR = os.path.join(os.path.dirname(BASE_DIR), 'optimizer')
DB_DIR = os.path.join(os.path.dirname(BASE_DIR), 'database')
DB_PATH = os.path.join(DB_DIR, 'job_logs.db')

# --- Initialize DB ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_logs (
            job_id TEXT PRIMARY KEY,
            model_name TEXT,
            dataset TEXT,
            epochs INTEGER,
            gpu_type TEXT,
            batch_size INTEGER,
            estimated_cost REAL,
            estimated_time REAL,
            suggested_gpu TEXT,
            status TEXT,
            submitted_at TEXT
        )
    ''')
    # Check if cloud_model exists in DB, otherwise add it
    cursor.execute("PRAGMA table_info(job_logs)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'cloud_model' not in columns:
        cursor.execute("ALTER TABLE job_logs ADD COLUMN cloud_model TEXT DEFAULT 'IaaS'")
    
    # Create users table for security
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password_hash TEXT,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Load ML Models ---
try:
    rf_cost = joblib.load(os.path.join(OPTIMIZER_DIR, 'rf_cost_model.joblib'))
    rf_time = joblib.load(os.path.join(OPTIMIZER_DIR, 'rf_time_model.joblib'))
    model_features = joblib.load(os.path.join(OPTIMIZER_DIR, 'model_features.joblib'))
except FileNotFoundError:
    print("WARNING: ML Models not found. Ensure cost_prediction_model.py is executed.")
    rf_cost, rf_time, model_features = None, None, []

# --- App Definition ---
app = FastAPI(title="Cost-Aware AI Training API", description="API for scheduling and optimizing AI jobs.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobRequest(BaseModel):
    model_name: str
    dataset: str
    epochs: int
    gpu_type: str
    batch_size: int
    cloud_model: str = "IaaS"

class UserAuthRequest(BaseModel):
    email: str
    password: str

# --- Security Helpers ---
def hash_password(password: str, salt: str = None) -> str:
    """Hashes password with SHA-256 and salt, returning salt:hash"""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_credential: str) -> bool:
    """Verifies a password against a stored credential 'salt:hash'"""
    try:
        salt, stored_hash = stored_credential.split(':')
        _, rehashed = hash_password(password, salt).split(':')
        return secrets.compare_digest(stored_hash, rehashed)
    except Exception:
        return False

# --- Authentication Endpoints ---
@app.post("/auth/register")
def register_user(auth: UserAuthRequest):
    email_lower = auth.email.strip().lower()
    if not email_lower or "@" not in email_lower:
        raise HTTPException(status_code=400, detail="Invalid email format")
    if len(auth.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT email FROM users WHERE email = ?', (email_lower,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email address is already registered")
    
    password_hash = hash_password(auth.password)
    cursor.execute('''
        INSERT INTO users (email, password_hash, created_at)
        VALUES (?, ?, ?)
    ''', (email_lower, password_hash, datetime.datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    return {"status": "success", "message": "User account created successfully"}

@app.post("/auth/login")
def login_user(auth: UserAuthRequest):
    email_lower = auth.email.strip().lower()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT password_hash FROM users WHERE email = ?', (email_lower,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=401, detail="Incorrect email address or password")
    
    stored_credential = row[0]
    if not verify_password(auth.password, stored_credential):
        raise HTTPException(status_code=401, detail="Incorrect email address or password")
    
    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "email": email_lower
        }
    }

def predict_cost_and_time(job: JobRequest, target_gpu: str, cloud_model: str = None):
    if cloud_model is None:
        cloud_model = getattr(job, 'cloud_model', 'IaaS')
    if not rf_cost or not rf_time:
        base_time = 2.0  # Fallback dummy value
    else:
        df = pd.DataFrame([{
            'model': job.model_name,
            'dataset': job.dataset,
            'gpu': target_gpu,
            'epochs': job.epochs,
            'batch_size': job.batch_size
        }])
        
        # One-hot encode using the exact same columns as training
        df_encoded = pd.get_dummies(df, drop_first=True)
        
        # Realign columns with training features (fill missing with 0)
        for col in model_features:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
            df_encoded[col] = pd.to_numeric(df_encoded[col]) # Fix type warnings
        df_encoded = df_encoded[model_features]

        base_time = rf_time.predict(df_encoded)[0]
    
    # Use live actual AWS spot pricing dynamically
    live_price = get_gpu_price(target_gpu)
    real_cost = base_time * live_price
    
    # SaaS uses pre-optimized/warm container orchestration, resulting in slightly faster runs (e.g. 0.85x time)
    # but has a higher price premium.
    time_multiplier = 0.85 if cloud_model == 'SaaS' else 1.0
    cost_multiplier = 1.0
    if cloud_model == 'PaaS':
        cost_multiplier = 1.35
    elif cloud_model == 'SaaS':
        cost_multiplier = 2.20
        
    final_time = base_time * time_multiplier
    final_cost = real_cost * cost_multiplier * time_multiplier
    
    return float(final_cost), float(final_time)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Cost-Aware AI API running", "ml_loaded": rf_cost is not None}

@app.post("/jobs/submit")
async def submit_job(job: JobRequest):
    job_id = str(uuid.uuid4())
    
    # Predict for requested GPU and cloud model
    req_cost, req_time = predict_cost_and_time(job, job.gpu_type, job.cloud_model)
    
    # Compare options: check alternative GPUs and cloud models
    cheaper_found = False
    alt_cloud_options = ['IaaS', 'PaaS', 'SaaS']
    best_cost = req_cost
    best_gpu = job.gpu_type
    best_cloud = job.cloud_model
    best_time = req_time
    
    for c_model in alt_cloud_options:
        for g_type in ['T4', 'A100']:
            c, t = predict_cost_and_time(job, g_type, c_model)
            if c < best_cost - 0.2:  # must save at least $0.20 to suggest
                best_cost = c
                best_gpu = g_type
                best_cloud = c_model
                best_time = t
                cheaper_found = True
                
    if cheaper_found:
        suggested_gpu = best_gpu
        suggested_cloud = best_cloud
        opt_cost, opt_time = best_cost, best_time
        savings = req_cost - best_cost
        reason = f"Routing optimized: Switch from {job.cloud_model} ({job.gpu_type}) to {best_cloud} ({best_gpu}) to save approximately ${savings:.2f}."
    else:
        suggested_gpu = job.gpu_type
        suggested_cloud = job.cloud_model
        opt_cost, opt_time = req_cost, req_time
        reason = f"Selected {job.cloud_model} with {job.gpu_type} is already the most cost-effective architecture for this training job."

    # Log to DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO job_logs (job_id, model_name, dataset, epochs, gpu_type, batch_size, estimated_cost, estimated_time, suggested_gpu, status, submitted_at, cloud_model)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (job_id, job.model_name, job.dataset, job.epochs, job.gpu_type, job.batch_size, opt_cost, opt_time, suggested_gpu, 'queued', datetime.datetime.now().isoformat(), suggested_cloud))
    conn.commit()
    conn.close()

    return {
        "job_id": job_id,
        "status": "queued",
        "job_details": job.model_dump(),
        "optimization": {
            "estimated_cost_usd": opt_cost,
            "estimated_time_hours": opt_time,
            "suggested_gpu": suggested_gpu,
            "suggested_cloud": suggested_cloud,
            "reason": reason
        }
    }

@app.get("/pricing")
def get_live_pricing():
    """Returns the current live pricing for the dashboard to display"""
    return {
        "prices": {
            "T4": get_gpu_price("T4"),
            "A100": get_gpu_price("A100")
        }
    }

@app.get("/jobs")
def get_jobs():
    """Returns a list of all submitted jobs"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM job_logs ORDER BY submitted_at DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return {"jobs": [dict(row) for row in rows]}


@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    """Returns a single job by ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM job_logs WHERE job_id = ?', (job_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")
    return dict(row)


class JobStatusUpdate(BaseModel):
    status: str  # queued | running | completed | failed | cancelled


@app.patch("/jobs/{job_id}")
def update_job_status(job_id: str, update: JobStatusUpdate):
    """Update job status (e.g. queued -> running -> completed)"""
    allowed = {"queued", "running", "completed", "failed", "cancelled"}
    if update.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {allowed}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE job_logs SET status = ? WHERE job_id = ?', (update.status, job_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Job not found")
    conn.commit()
    conn.close()
    return {"job_id": job_id, "status": update.status}


@app.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    """Delete a job from history"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM job_logs WHERE job_id = ?', (job_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Job not found")
    conn.commit()
    conn.close()
    return {"deleted": job_id}


@app.get("/estimate")
def get_estimate(model_name: str, dataset: str, epochs: int, gpu_type: str, batch_size: int, cloud_model: str = "IaaS"):
    """Returns cost/time estimate for current config and comparison across GPUs (for New Job preview)."""
    job = JobRequest(model_name=model_name, dataset=dataset, epochs=epochs, gpu_type=gpu_type, batch_size=batch_size, cloud_model=cloud_model)
    result = {}
    for gpu in ["T4", "A100"]:
        cost, time_hrs = predict_cost_and_time(job, gpu, cloud_model)
        result[gpu] = {"cost_usd": round(cost, 2), "time_hours": round(time_hrs, 2)}
    return {"by_gpu": result}


@app.get("/stats")
def get_stats():
    """Summary statistics for dashboard: total jobs, total cost, averages, by GPU, cumulative savings and carbon footprint."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*), COALESCE(SUM(estimated_cost), 0), COALESCE(AVG(estimated_cost), 0) FROM job_logs')
    total_jobs, total_cost, avg_cost = cursor.fetchone()
    
    # Gather total estimated run hours
    cursor.execute('SELECT COALESCE(SUM(estimated_time), 0) FROM job_logs')
    total_time = cursor.fetchone()[0]
    
    cursor.execute('SELECT suggested_gpu, COUNT(*), COALESCE(SUM(estimated_cost), 0) FROM job_logs GROUP BY suggested_gpu')
    by_gpu = [{"gpu": row[0], "count": row[1], "total_cost": round(row[2], 2)} for row in cursor.fetchall()]
    conn.close()
    
    # Simulated metrics based on routing effectiveness
    savings_usd = total_cost * 0.428 if total_cost > 0 else 0
    carbon_saved_kg = total_time * 0.155 if total_time > 0 else 0
    
    total_budget_usd = 600.0  # Monthly cluster budget cap (~₹50,000)
    remaining_budget_usd = max(0.0, total_budget_usd - total_cost)
    budget_percent_consumed = (total_cost / total_budget_usd) * 100.0 if total_budget_usd > 0 else 0.0
    
    return {
        "total_jobs": total_jobs,
        "total_estimated_cost_usd": round(total_cost, 2),
        "avg_cost_per_job_usd": round(avg_cost, 2),
        "total_savings_usd": round(savings_usd, 2),
        "total_carbon_saved_kg": round(carbon_saved_kg, 2),
        "total_budget_usd": total_budget_usd,
        "remaining_budget_usd": round(remaining_budget_usd, 2),
        "budget_percent_consumed": round(budget_percent_consumed, 2),
        "by_gpu": by_gpu,
    }


@app.get("/metrics")
def get_live_metrics():
    """Simulates real-time Prometheus hardware metrics for the dashboard"""
    import random
    
    # Generate random active fluctuating metrics
    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "gpu_utilization": random.randint(75, 95),
        "cpu_utilization": random.randint(30, 60),
        "memory_usage_gb": round(random.uniform(12.5, 15.0), 1)
    }
