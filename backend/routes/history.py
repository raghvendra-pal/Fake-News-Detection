from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from collections import Counter

from backend.database.connection import get_db
from backend.database.models import AnalysisHistory

router = APIRouter(prefix="/history", tags=["History & Dashboard Analytics"])

@router.get("")
def list_history(
    input_type: Optional[str] = Query(None, description="Filter by 'news_text', 'news_url', or 'review'"),
    prediction: Optional[str] = Query(None, description="Filter by 'REAL', 'SUSPICIOUS', 'FAKE', 'GENUINE'"),
    search: Optional[str] = Query(None, description="Search in text or title preview"),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns paginated historical analysis records with optional filtering.
    """
    query = db.query(AnalysisHistory)

    if input_type and input_type.lower() != "all":
        query = query.filter(AnalysisHistory.input_type == input_type.lower())

    if prediction and prediction.lower() != "all":
        query = query.filter(AnalysisHistory.prediction == prediction.upper())

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (AnalysisHistory.query_preview.ilike(search_fmt)) |
            (AnalysisHistory.content.ilike(search_fmt))
        )

    total_count = query.count()
    records = query.order_by(AnalysisHistory.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "items": [r.to_dict() for r in records]
    }

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Computes verified statistical summary of historical analyses.
    Strictly returns 'has_history: False' if the database is empty, preventing fabricated numbers.
    """
    total = db.query(AnalysisHistory).count()
    if total == 0:
        return {
            "has_history": False,
            "message": "No analysis history available"
        }

    # Aggregate counts by input type
    news_articles_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.input_type.in_(["news_text", "news_url"])
    ).count()

    reviews_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.input_type == "review"
    ).count()

    # Aggregate predictions count
    real_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.prediction.in_(["REAL", "GENUINE"])
    ).count()

    fake_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.prediction == "FAKE"
    ).count()

    suspicious_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.prediction == "SUSPICIOUS"
    ).count()

    # Calculate average confidence
    avg_conf = db.query(func.avg(AnalysisHistory.confidence)).scalar() or 0.0

    # Extract common suspicious signals from past analyses
    all_signals_records = db.query(AnalysisHistory.signals).all()
    signal_counter = Counter()
    for row in all_signals_records:
        signals_list = row[0]
        if isinstance(signals_list, list):
            for s in signals_list:
                if isinstance(s, dict) and s.get("type") == "warning":
                    signal_counter[s.get("name", "Unknown Signal")] += 1

    common_signals = [
        {"signal": name, "count": count}
        for name, count in signal_counter.most_common(6)
    ]

    return {
        "has_history": True,
        "total_analyzed": total,
        "articles_analyzed": news_articles_count,
        "reviews_analyzed": reviews_count,
        "real_predictions": real_count,
        "fake_predictions": fake_count,
        "suspicious_predictions": suspicious_count,
        "average_confidence": round(float(avg_conf), 1),
        "most_common_signals": common_signals
    }

@router.get("/{record_id}")
def get_history_detail(record_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full details of a specific past analysis.
    """
    record = db.query(AnalysisHistory).filter(AnalysisHistory.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return record.to_dict()

@router.delete("/{record_id}")
def delete_history_record(record_id: int, db: Session = Depends(get_db)):
    """
    Deletes a historical analysis record.
    """
    record = db.query(AnalysisHistory).filter(AnalysisHistory.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Record {record_id} deleted successfully."}
