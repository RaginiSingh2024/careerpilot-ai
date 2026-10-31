from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    education = Column(String(255), nullable=True)
    current_stage = Column(String(100), nullable=True)  # e.g., Student, Career Switcher, Professional
    target_role = Column(String(255), nullable=False)
    current_skills = Column(JSON, default=list)  # list of skill objects or strings
    experience = Column(Text, nullable=True)
    preferred_schedule = Column(String(100), nullable=True)  # e.g., Evenings, Weekends, Daily
    weekly_hours = Column(Integer, default=10)
    career_goals = Column(Text, nullable=True)
    raw_voice_transcript = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

