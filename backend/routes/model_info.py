from fastapi import APIRouter
from backend.ml.evaluate import load_evaluation_metrics
from backend.config import settings

router = APIRouter(prefix="/model", tags=["Model Evaluation & Developer Info"])

@router.get("/evaluation")
def get_model_evaluation_metrics():
    """
    Returns authentic empirical evaluation metrics and classifier comparisons
    loaded from the trained artifacts JSON.
    """
    metrics = load_evaluation_metrics()
    return {
        "configured_model_type": settings.MODEL_TYPE,
        "evaluation_data": metrics
    }
