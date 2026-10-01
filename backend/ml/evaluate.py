import os
import json
from typing import Dict, Any

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
METRICS_FILE = os.path.join(MODELS_DIR, "evaluation_metrics.json")

def load_evaluation_metrics() -> Dict[str, Any]:
    """
    Reads the saved evaluation metrics JSON produced by train.py.
    Provides verifiable benchmarks for the developer/evaluation page.
    """
    if not os.path.exists(METRICS_FILE):
        return {
            "status": "not_trained",
            "message": "Evaluation metrics not found. Please run 'python backend/ml/train.py' first."
        }
        
    try:
        with open(METRICS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            data["status"] = "ready"
            return data
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error loading metrics file: {str(e)}"
        }
