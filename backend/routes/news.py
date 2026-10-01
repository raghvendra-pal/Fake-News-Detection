from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any

from backend.database.connection import get_db
from backend.database.models import AnalysisHistory
from backend.services.article_extractor import extract_article_from_url
from backend.services.predictor import predictor
from backend.services.news_api import fetch_latest_news

router = APIRouter(prefix="/news", tags=["News Analysis"])

class NewsTextRequest(BaseModel):
    text: str
    title: Optional[str] = ""

class NewsUrlRequest(BaseModel):
    url: str

@router.post("/analyze-text")
def analyze_news_text(payload: NewsTextRequest, db: Session = Depends(get_db)):
    """
    Analyzes submitted raw news text or paragraphs using NLP and source checking.
    """
    text = payload.text.strip() if payload.text else ""
    if len(text) < 15:
        raise HTTPException(
            status_code=400,
            detail="Please provide an article or news excerpt before continuing (at least 15 characters)."
        )

    title = payload.title.strip() if payload.title else ""
    analysis = predictor.predict_news(text=text, title=title)

    # Save to history
    preview = title if title else (text[:120] + "..." if len(text) > 120 else text)
    history_record = AnalysisHistory(
        input_type="news_text",
        query_preview=preview,
        content=text,
        source_url=None,
        prediction=analysis["prediction"],
        confidence=analysis["confidence"],
        signals=analysis["signals"],
        claims=analysis["claims"],
        evidence_summary=analysis["evidence_summary"],
        metadata_info={"title": title, "word_count": len(text.split())},
        model_version=analysis["model_info"]["version"]
    )
    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    return {
        "id": history_record.id,
        "input_type": "news_text",
        "title": title,
        "text": text,
        **analysis
    }

@router.post("/analyze-url")
def analyze_news_url(payload: NewsUrlRequest, db: Session = Depends(get_db)):
    """
    Extracts article content from a web URL and performs credibility & veracity analysis.
    Gracefully handles site blocking without bypass attempts.
    """
    url = payload.url.strip() if payload.url else ""
    if not url:
        raise HTTPException(status_code=400, detail="Please enter a valid article URL.")

    # Extract article
    extracted = extract_article_from_url(url)
    if not extracted["success"]:
        return {
            "success": False,
            "error_type": extracted.get("error_type", "extraction_failed"),
            "message": extracted.get("message", "We couldn't retrieve this article automatically."),
            "can_paste_manually": True
        }

    # Analyze extracted text
    article_text = extracted["article_text"]
    title = extracted["title"]
    metadata = {
        "publisher": extracted["publisher"],
        "domain": extracted["domain"],
        "author": extracted["author"],
        "published_date": extracted["published_date"],
        "image_url": extracted["image_url"],
        "word_count": extracted["word_count"]
    }

    analysis = predictor.predict_news(
        text=article_text,
        title=title,
        source_url=url,
        metadata=metadata
    )

    # Save record
    history_record = AnalysisHistory(
        input_type="news_url",
        query_preview=title or url,
        content=article_text[:2000],  # store reasonable preview in db
        source_url=url,
        prediction=analysis["prediction"],
        confidence=analysis["confidence"],
        signals=analysis["signals"],
        claims=analysis["claims"],
        evidence_summary=analysis["evidence_summary"],
        metadata_info=metadata,
        model_version=analysis["model_info"]["version"]
    )
    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    return {
        "success": True,
        "id": history_record.id,
        "input_type": "news_url",
        "source_url": url,
        "article_info": metadata,
        "title": title,
        "article_text": article_text,
        **analysis
    }

@router.get("/latest")
def get_latest_news(
    category: str = Query("All", description="News category filter"),
    query: str = Query("", description="Optional search term"),
    limit: int = Query(15, ge=1, le=50),
    refresh: bool = Query(False, description="Bypass cache")
):
    """
    Delivers daily live news feed from the configured news provider architecture.
    """
    articles = fetch_latest_news(category=category, query=query, limit=limit, force_refresh=refresh)
    return {
        "category": category,
        "total_results": len(articles),
        "articles": articles
    }
