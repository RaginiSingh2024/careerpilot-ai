from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.career import CareerProfile
from app.models.resume import ResumeAnalysis, JobDescription
from app.models.skill_gap import SkillGapAnalysis
from app.models.roadmap import LearningRoadmap, RoadmapTask, RoadmapMilestone
from app.models.portfolio import PortfolioProject
from app.models.interview import InterviewSession, InterviewQA
from app.models.application import JobApplication
from app.models.agent_activity import AgentExecutionLog
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.get("/info")
def get_system_settings_info():
    return {
        "project_name": settings.PROJECT_NAME,
        "is_demo_mode": settings.is_demo_mode,
        "gemini_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()),
        "gemini_model": settings.GEMINI_MODEL,
        "database_type": "SQLite with SQLAlchemy ORM",
        "voice_engine": "Wispr Flow Dictation Compatibility & Browser Speech Recognition",
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
    }

@router.post("/reset-data")
def reset_all_career_data(db: Session = Depends(get_db)):
    """Deletes all saved career data, honoring privacy requirements."""
    try:
        db.query(RoadmapTask).delete()
        db.query(RoadmapMilestone).delete()
        db.query(LearningRoadmap).delete()
        db.query(PortfolioProject).delete()
        db.query(InterviewQA).delete()
        db.query(InterviewSession).delete()
        db.query(JobApplication).delete()
        db.query(SkillGapAnalysis).delete()
        db.query(JobDescription).delete()
        db.query(ResumeAnalysis).delete()
        db.query(CareerProfile).delete()
        db.query(AgentExecutionLog).delete()
        db.commit()
        return {"status": "success", "message": "All user and agent data has been permanently cleared."}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Failed to reset data: {str(e)}"}

