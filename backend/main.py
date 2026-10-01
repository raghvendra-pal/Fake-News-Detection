import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.config import settings
from backend.database.connection import init_db
from backend.routes.news import router as news_router
from backend.routes.reviews import router as reviews_router
from backend.routes.verification import router as verification_router
from backend.routes.history import router as history_router
from backend.routes.model_info import router as model_router

# Initialize database tables on load
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure DB tables are initialized
    init_db()
    print("[TruthLens] Database tables initialized successfully.")
    yield

app = FastAPI(
    title="TruthLens API",
    description="Backend API for TruthLens — AI-Powered Fake News & Review Detection System",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe exception handler: avoid exposing internal tracebacks to users (Section 19)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(f"[Internal Server Exception] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred while processing your request. Please try again or check the provided input."
        }
    )

# Include Routers under /api
app.include_router(news_router, prefix=settings.API_V1_STR)
app.include_router(reviews_router, prefix=settings.API_V1_STR)
app.include_router(verification_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(model_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TruthLens API",
        "version": settings.VERSION,
        "model_type": settings.MODEL_TYPE
    }

@app.get("/")
def root():
    return {
        "service": "TruthLens — AI-Powered Fake News & Review Detection System",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
