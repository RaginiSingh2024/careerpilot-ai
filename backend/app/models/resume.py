from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=True)
    parsed_text = Column(Text, nullable=False)
    skills = Column(JSON, default=list)
    education = Column(JSON, default=list)
    experience_highlights = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    missing_elements = Column(JSON, default=list)
    improvement_suggestions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    source_url = Column(String(512), nullable=True)
    raw_text = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    experience_level = Column(String(100), nullable=True)
    keywords = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

