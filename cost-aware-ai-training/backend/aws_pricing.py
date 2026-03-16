import boto3
import datetime

# Map our generic GPU names to typical AWS instance types
GPU_INSTANCE_MAP = {
    "T4": "g4dn.xlarge",      # 1x T4 GPU
    "A100": "p4d.24xlarge"    # 8x A100 GPUs (We'll divide the price by 8)
}

# Cache to prevent spamming AWS API
_price_cache = {}
CACHE_TTL_MINUTES = 10

def get_spot_price(instance_type: str, region: str = "us-east-1", hours: int = 1) -> float:
    """
    Fetches the current spot price history for a given instance type and returns the average recent price.
    """
    try:
        client = boto3.client('ec2', region_name=region)
        end_time = datetime.datetime.utcnow()
        start_time = end_time - datetime.timedelta(hours=hours)
        
        response = client.describe_spot_price_history(
            InstanceTypes=[instance_type],
            ProductDescriptions=['Linux/UNIX'],
            StartTime=start_time,
            EndTime=end_time,
            MaxResults=1 # Important to just get the latest
        )
        
        prices = response.get('SpotPriceHistory', [])
        if not prices:
            print(f"Warning: No spot pricing found for {instance_type} in {region}. Using fallback.")
            return None
            
        # Get the latest price
        latest_price = float(prices[0]['SpotPrice'])
        return latest_price
        
    except Exception as e:
        print(f"Error fetching AWS pricing for {instance_type}: {e}")
        return None

def get_gpu_price(gpu_name: str, region: str = "us-east-1") -> float:
    """
    Returns the estimated hourly cost for a specific class of GPU.
    Uses live AWS Spot Prices if available, caching the results for 10 minutes.
    """
    global _price_cache
    
    cache_key = f"{gpu_name}_{region}"
    now = datetime.datetime.now()
    
    # Check cache first
    if cache_key in _price_cache:
        cached_price, timestamp = _price_cache[cache_key]
        if (now - timestamp).total_seconds() < CACHE_TTL_MINUTES * 60:
            return cached_price

    instance_type = GPU_INSTANCE_MAP.get(gpu_name)
    if not instance_type:
        return 0.0
        
    price = get_spot_price(instance_type, region)
    
    if price is None:
        # Fallbacks just in case AWS credentials or permissions fail
        print(f"Using fallback pricing for {gpu_name}")
        price = 3.0 if gpu_name == "A100" else 0.35
    elif gpu_name == "A100":
        # p4d.24xlarge has 8 A100s. Divide the instance price by 8 for a single GPU estimate.
        price = price / 8.0
        
    # Store in cache
    _price_cache[cache_key] = (price, now)
        
    return price

if __name__ == "__main__":
    t4_price = get_gpu_price("T4")
    a100_price = get_gpu_price("A100")
    print(f"Live T4 (g4dn.xlarge) Spot Price: ${t4_price:.3f}/hr")
    print(f"Live A100 (p4d.24xlarge) Spot Price: ${a100_price:.3f}/hr")
