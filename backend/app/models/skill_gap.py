from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    target_role = Column(String(255), nullable=False)
    readiness_score = Column(Float, default=0.0)
    score_breakdown = Column(JSON, default=dict)  # Transparent breakdown calculation
    strong_matches = Column(JSON, default=list)    # [{"skill": "Python", "evidence": "...", "confidence": "high", "verified": True}]
    partial_matches = Column(JSON, default=list)   # [{"skill": "SQL", "current_level": "basic", "needed": "advanced", "priority": "high", "why": "..."}]
    missing_skills = Column(JSON, default=list)    # [{"skill": "Docker", "priority": "critical", "why": "..."}]
    unverified_skills = Column(JSON, default=list) # [{"skill": "FastAPI", "source": "self-reported", "verification_needed": "..."}]
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

