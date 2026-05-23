# 💸 Cost-Aware AI Training Infrastructure Optimization System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62B)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

An advanced AI-powered orchestration and infrastructure optimization dashboard designed to slash cloud deep learning training costs. By utilizing live cloud spot-pricing data and machine learning regressors, the system analyzes training parameters, predicts cost and runtime duration, and dynamically suggests the most efficient, cost-optimized cluster architecture (IaaS, PaaS, or SaaS) and GPU instances (T4, A100).

---

## 🖥️ Platform Dashboard Preview

![System Dashboard Mockup](dashboard_mockup.png)

*Our high-performance analytics interface monitors hardware utilization, tracks dynamic cluster budget caps, calculates carbon offset savings, and routes jobs through optimized computing instances.*

---

## ✨ Features

- **🧠 Machine Learning Cost Optimizer:** Custom Scikit-Learn Random Forest Regressor models that predict execution time and pricing based on dataset sizing, model architecture complexity, epoch limits, and batch size configuration.
- **⚡ Dynamic Multi-Cloud Routing:** Compare computing modalities in real-time between IaaS (Raw Virtual Machines), PaaS (Managed Clusters), and SaaS (Serverless API endpoints with pre-warmed configurations).
- **📉 Live Cloud Price Scraper:** Direct integration simulating AWS spot instances pricing (tracking A100 and T4 rates).
- **📊 Real-time Monitoring & Metrics:** Interactive charts mapping CPU/GPU workloads, memory utilization, and active hardware constraints.
- **🌱 Environmental & Budget Analytics:** Interactive metrics tracing monthly budget consumptions, dollar savings, and carbon footprints offset through smart routing.
- **🔐 Secure Authentication:** Complete user registration and session management powered by salted SHA-256 password hashing.

---

## 📁 Repository Structure

```text
cost-aware-ai-training/
├── backend/                  # FastAPI Application Core
│   ├── main.py               # API endpoints, SQLite queries, auth, and optimizer logic
│   ├── aws_pricing.py        # Real-time AWS Spot Pricing fetching mechanisms
│   ├── requirements.txt      # Backend Python dependencies
│   └── venv/                 # Local virtual environment
├── frontend/                 # React UI Dashboard (Vite & TailwindCSS)
│   ├── src/                  # React components & page routes (Dashboard, NewJob, Login)
│   ├── package.json          # Node script configs and assets
│   └── vite.config.js        # Vite bundler parameters
├── optimizer/                # Scikit-Learn Regression Pipeline
│   ├── cost_prediction_model.py # Mock dataset engine and Random Forest training script
│   ├── rf_cost_model.joblib  # Trained model tracking costs in USD
│   ├── rf_time_model.joblib  # Trained model tracking time in hours
│   └── model_features.joblib # One-hot encoded feature matrix metadata
├── database/                 # Structured SQLite storage (job_logs.db)
├── training/                 # Executable Python training loops designed for Docker containers
└── monitoring/               # Theoretical Prometheus & Grafana configurations
```

---

## 🚀 How to Run the System

Follow these step-by-step instructions to get the platform up and running locally.

### 📋 Prerequisites

Ensure you have the following software installed:
- [Python 3.10+](https://www.python.org/)
- [Node.js 20+](https://nodejs.org/)

---

### Step 1: Set Up & Run the Backend API

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI development server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

> [!NOTE]
> The backend server will launch at **`http://localhost:8000`**. You can view the interactive Swagger API documentation at **`http://localhost:8000/docs`**.

---

### Step 2: Train the ML Optimizer Models (Optional)

The backend comes preconfigured, but if you want to regenerate training parameters and train/update the Random Forest Regressors, run:

```bash
# Ensure your virtual environment is active in the backend directory
cd ../optimizer
python cost_prediction_model.py
```

This updates `rf_cost_model.joblib`, `rf_time_model.joblib`, and `model_features.joblib` inside the `optimizer/` directory.

---

### Step 3: Set Up & Run the React Frontend Dashboard

1. Open a **new, separate terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install all frontend packages and node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite local development server:
   ```bash
   npm run dev
   ```

> [!TIP]
> The React Dashboard application will open at **`http://localhost:5173`** (or another port outputted to the terminal). Open it in your web browser to interact with the platform!

---

## 🛠️ Verification & API Integration

- **API Heartbeat:** Query `GET /` to verify the online status of the backend and confirm the ML models are fully loaded.
- **Interactive Routing Simulation:** Submit a job configuration payload via `POST /jobs/submit` to test the dynamic router, which logs metrics to SQLite and recommends cost-efficient cluster targets.
- **Prometheus Metrics Endpoint:** Access `GET /metrics` to inspect simulated GPU and memory utilization feeds that supply dashboard telemetry.
