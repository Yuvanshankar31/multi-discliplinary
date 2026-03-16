# Cost-Aware AI Training Infrastructure Optimization System

This project is an AI system that reduces cloud AI training costs by tracking simulated GPU/CPU usage, predicting costs with ML, and suggesting optimal infrastructure configurations.

## 🚀 Quick Start Guide

The system consists of two main parts: a FastAPI Python Backend and a React Vite Frontend.

### Prerequisites
- Python 3.10+
- Node.js 20+

### 1. Start the Backend API

Open a terminal and navigate to the backend directory:
```bash
cd f:\multi-discliplinary\cost-aware-ai-training\backend
```

Activate the virtual environment:
- **Windows (PowerShell):** `.\venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*The API will be available at http://localhost:8000 (Swagger docs at http://localhost:8000/docs)*

### 2. Start the Frontend Dashboard

Open a **new, separate terminal** and navigate to the frontend directory:
```bash
cd f:\multi-discliplinary\cost-aware-ai-training\frontend
```

Start the development server:
```bash
npm run dev
```
*The React application will be available at http://localhost:3000*

---

## 🧠 Retraining the AI Optimizer (Optional)
If you want to regenerate the mock data and retrain the Scikit-Learn Random Forest cost prediction model:

```bash
cd f:\multi-discliplinary\cost-aware-ai-training\backend
.\venv\Scripts\activate
python ..\optimizer\cost_prediction_model.py
```

## 📁 Project Structure
- `/frontend` - React.js + TailwindCSS UI dashboard
- `/backend` - FastAPI server and SQLite DB connection
- `/optimizer` - Scikit-Learn Random Forest cost/time prediction models
- `/database` - SQLite file establishing the `job_logs.db`
- `/training` - Mock Python simulated training scripts designed to run inside Docker
- `/monitoring` - Theoretical Prometheus scraping configurations

