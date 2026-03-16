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

def predict_cost_and_time(job: JobRequest, target_gpu: str):
    if not rf_cost or not rf_time:
        return 5.5, 2.0  # Fallback dummy values
        
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
    df_encoded = df_encoded[model_features]

    time = rf_time.predict(df_encoded)[0]
    
    # Use live actual AWS spot pricing dynamically
    live_price = get_gpu_price(target_gpu)
    real_cost = time * live_price
    
    return float(real_cost), float(time)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Cost-Aware AI API running", "ml_loaded": rf_cost is not None}

@app.post("/jobs/submit")
async def submit_job(job: JobRequest):
    job_id = str(uuid.uuid4())
    
    # Predict for requested GPU
    req_cost, req_time = predict_cost_and_time(job, job.gpu_type)
    
    # Check if a cheaper GPU is viable (e.g., T4 instead of A100)
    suggested_gpu = job.gpu_type
    opt_cost, opt_time = req_cost, req_time
    reason = "Selected GPU is already the most cost-effective option for this workload."

    alt_gpu = 'T4' if job.gpu_type == 'A100' else 'A100'
    alt_cost, alt_time = predict_cost_and_time(job, alt_gpu)
    
    # Very simple heuristic: if alternate is significantly cheaper and time is acceptable, suggest it.
    if alt_cost < req_cost - 0.5:
        suggested_gpu = alt_gpu
        opt_cost, opt_time = alt_cost, alt_time
        reason = f"Switching to {alt_gpu} can save approximately ${req_cost - alt_cost:.2f}."

    # Log to DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO job_logs (job_id, model_name, dataset, epochs, gpu_type, batch_size, estimated_cost, estimated_time, suggested_gpu, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (job_id, job.model_name, job.dataset, job.epochs, job.gpu_type, job.batch_size, opt_cost, opt_time, suggested_gpu, 'queued', datetime.datetime.now().isoformat()))
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
def get_estimate(model_name: str, dataset: str, epochs: int, gpu_type: str, batch_size: int):
    """Returns cost/time estimate for current config and comparison across GPUs (for New Job preview)."""
    job = JobRequest(model_name=model_name, dataset=dataset, epochs=epochs, gpu_type=gpu_type, batch_size=batch_size)
    result = {}
    for gpu in ["T4", "A100"]:
        cost, time_hrs = predict_cost_and_time(job, gpu)
        result[gpu] = {"cost_usd": round(cost, 2), "time_hours": round(time_hrs, 2)}
    return {"by_gpu": result}


@app.get("/stats")
def get_stats():
    """Summary statistics for dashboard: total jobs, total cost, averages, by GPU."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*), COALESCE(SUM(estimated_cost), 0), COALESCE(AVG(estimated_cost), 0) FROM job_logs')
    total_jobs, total_cost, avg_cost = cursor.fetchone()
    cursor.execute('SELECT suggested_gpu, COUNT(*), COALESCE(SUM(estimated_cost), 0) FROM job_logs GROUP BY suggested_gpu')
    by_gpu = [{"gpu": row[0], "count": row[1], "total_cost": round(row[2], 2)} for row in cursor.fetchall()]
    conn.close()
    return {
        "total_jobs": total_jobs,
        "total_estimated_cost_usd": round(total_cost, 2),
        "avg_cost_per_job_usd": round(avg_cost, 2),
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
