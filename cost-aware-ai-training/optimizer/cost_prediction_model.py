import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os
import sys

# Add backend to path to import AWS pricing
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from aws_pricing import get_gpu_price

# Create mock dataset for training costs
def create_mock_data(samples=1000):
    np.random.seed(42)
    
    # Pre-fetch AWS live prices
    gpu_prices = {
        'T4': get_gpu_price('T4'),
        'A100': get_gpu_price('A100')
    }
    
    # Features
    datasets = ['CIFAR-10', 'ImageNet', 'WikiText']
    models = ['ResNet50', 'BERT', 'YOLOv8']
    gpus = ['T4', 'A100']
    
    data = []
    
    for _ in range(samples):
        dataset = np.random.choice(datasets)
        model = np.random.choice(models)
        gpu = np.random.choice(gpus)
        epochs = np.random.randint(10, 100)
        batch_size = np.random.choice([16, 32, 64, 128])
        
        # Base logic for mock cost and time
        base_time = 0.5 if gpu == 'A100' else 2.5
        gpu_price = gpu_prices[gpu]
        
        # Multipliers
        model_multiplier = 1.5 if model == 'BERT' else (0.8 if model == 'YOLOv8' else 1.0)
        dataset_multiplier = 5.0 if dataset == 'ImageNet' else 1.0
        
        # Calculate mock target variables
        time_hours = base_time * model_multiplier * dataset_multiplier * (epochs / 50.0) * (32 / batch_size)
        time_hours = max(0.1, time_hours + np.random.normal(0, 0.2)) # Add some noise
        
        cost_usd = time_hours * gpu_price
        
        data.append({
            'model': model,
            'dataset': dataset,
            'gpu': gpu,
            'epochs': epochs,
            'batch_size': batch_size,
            'time_hours': time_hours,
            'cost_usd': cost_usd
        })
        
    return pd.DataFrame(data)

def train_and_save_model():
    print("Generating mock data...")
    df = create_mock_data()
    
    # Feature Engineering (One-Hot Encoding)
    X = pd.get_dummies(df[['model', 'dataset', 'gpu', 'epochs', 'batch_size']], drop_first=True)
    y_time = df['time_hours']
    y_cost = df['cost_usd']
    
    print("Training Random Forest Models...")
    # Train model for Time
    rf_time = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_time.fit(X, y_time)
    
    # Train model for Cost
    rf_cost = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_cost.fit(X, y_cost)
    
    # Save Models and Feature columns
    model_dir = os.path.dirname(os.path.abspath(__file__))
    joblib.dump(rf_cost, os.path.join(model_dir, 'rf_cost_model.joblib'))
    joblib.dump(rf_time, os.path.join(model_dir, 'rf_time_model.joblib'))
    joblib.dump(X.columns.tolist(), os.path.join(model_dir, 'model_features.joblib'))
    
    print("Models saved successfully in optimizer directory.")
    
if __name__ == "__main__":
    train_and_save_model()
