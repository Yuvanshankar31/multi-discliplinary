import time
import argparse
import random

def simulate_training(model_name, dataset, epochs, batch_size, gpu_type):
    print(f"--- Starting Simulated Training ---")
    print(f"Model: {model_name}")
    print(f"Dataset: {dataset}")
    print(f"Epochs: {epochs}")
    print(f"Batch Size: {batch_size}")
    print(f"Allocated GPU: {gpu_type}")
    print("-" * 30)

    # Early stopping parameters
    best_loss = float('inf')
    patience_counter = 0
    patience_limit = 5

    for epoch in range(1, epochs + 1):
        # Simulate time taken for one epoch
        time.sleep(0.1) 
        
        # Simulate metrics
        loss = round(random.uniform(0.1, 2.5) / (epoch ** 0.5), 4)
        accuracy = min(99.0, round(50 + (epoch * 0.8) + random.uniform(-2, 2), 2))
        gpu_utilization = random.randint(75, 98)
        
        print(f"Epoch [{epoch}/{epochs}] - Loss: {loss} - Accuracy: {accuracy}% - GPU Util: {gpu_utilization}%")
        
        # Early Stopping Logic
        if loss < best_loss - 0.001:
            best_loss = loss
            patience_counter = 0
        else:
            patience_counter += 1
            
        if patience_counter >= patience_limit:
            print(f">>> EARLY STOPPING TRIGGERED at Epoch {epoch} <<<")
            print("Reason: Loss did not improve for 5 consecutive epochs.")
            break
        
    print("--- Training Completed Successfully ---")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate AI Model Training")
    parser.add_argument("--model", type=str, required=True)
    parser.add_argument("--dataset", type=str, required=True)
    parser.add_argument("--epochs", type=int, required=True)
    parser.add_argument("--batch_size", type=int, required=True)
    parser.add_argument("--gpu_type", type=str, required=True)
    
    args = parser.parse_args()
    simulate_training(args.model, args.dataset, args.epochs, args.batch_size, args.gpu_type)
