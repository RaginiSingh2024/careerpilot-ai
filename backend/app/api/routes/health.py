from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    ai_status = "live_gemini" if gemini_service.is_available() else "demo_mode"

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": db_status,
        "ai_engine": ai_status,
        "is_demo_mode": settings.is_demo_mode,
        "gemini_model": settings.GEMINI_MODEL
    }

