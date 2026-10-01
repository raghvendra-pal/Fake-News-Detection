import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from backend.database.connection import Base

class AnalysisHistory(Base):
    """
    Stores history of user analysis for news (text/URL) and reviews.
    Designed to easily migrate to PostgreSQL in the future.
    """
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    input_type = Column(String(50), nullable=False, index=True)  # 'news_text', 'news_url', 'review'
    query_preview = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source_url = Column(String(512), nullable=True)
    
    # Prediction results
    prediction = Column(String(50), nullable=False, index=True)  # 'REAL', 'SUSPICIOUS', 'FAKE'
    confidence = Column(Float, nullable=False)
    
    # Granular analysis details stored as JSON (portable across SQLite and Postgres)
    signals = Column(JSON, nullable=True)
    claims = Column(JSON, nullable=True)
    evidence_summary = Column(JSON, nullable=True)
    metadata_info = Column(JSON, nullable=True)
    
    # Model tracking
    model_version = Column(String(50), default="1.0.0-tfidf")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "input_type": self.input_type,
            "query_preview": self.query_preview,
            "content": self.content,
            "source_url": self.source_url,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "signals": self.signals or [],
            "claims": self.claims or [],
            "evidence_summary": self.evidence_summary or {},
            "metadata_info": self.metadata_info or {},
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
