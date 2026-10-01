import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TruthLens"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # ML settings
    MODEL_TYPE: str = "tfidf"
    
    # Database
    DATABASE_URL: str = "sqlite:///./truthlens.db"
    
    # News APIs
    NEWS_API_KEY: str = ""
    GNEWS_API_KEY: str = ""
    
    # Server / Network
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    REQUEST_TIMEOUT_SECONDS: int = 10
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    USER_AGENT: str = "TruthLens-ArticleExtractor/1.0 (+https://github.com/truthlens)"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
