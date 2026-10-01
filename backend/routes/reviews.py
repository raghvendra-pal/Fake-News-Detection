from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from backend.database.connection import get_db
from backend.database.models import AnalysisHistory
from backend.services.predictor import predictor

router = APIRouter(prefix="/reviews", tags=["Review Analysis"])

class ReviewAnalysisRequest(BaseModel):
    review_text: str
    product_name: Optional[str] = ""
    category: Optional[str] = "General"

@router.post("/analyze")
def analyze_product_review(payload: ReviewAnalysisRequest, db: Session = Depends(get_db)):
    """
    Evaluates deceptive and incentivized signals in a consumer product review.
    """
    text = payload.review_text.strip() if payload.review_text else ""
    if len(text) < 10:
        raise HTTPException(
            status_code=400,
            detail="Please provide a review text before continuing (at least 10 characters)."
        )

    product_name = payload.product_name.strip() if payload.product_name else ""
    category = payload.category.strip() if payload.category else "General"

    analysis = predictor.predict_review(
        review_text=text,
        product_name=product_name,
        category=category
    )

    # Save to history
    preview = f"[{category}] " + (product_name + ": " if product_name else "") + (text[:80] + "..." if len(text) > 80 else text)
    history_record = AnalysisHistory(
        input_type="review",
        query_preview=preview,
        content=text,
        source_url=None,
        prediction=analysis["prediction"],
        confidence=analysis["confidence"],
        signals=analysis["detected_signals"],
        claims=[],
        evidence_summary={"breakdown": analysis["signals_breakdown"]},
        metadata_info={"product_name": product_name, "category": category, "word_count": len(text.split())},
        model_version=analysis["model_info"]["version"]
    )
    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    return {
        "id": history_record.id,
        "product_name": product_name,
        "category": category,
        "review_text": text,
        **analysis
    }
