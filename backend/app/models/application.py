from sqlalchemy import Column, Integer, String, Text, DateTime, Date
from datetime import datetime
from app.core.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    job_url = Column(String(512), nullable=True)
    application_date = Column(String(50), nullable=True)  # YYYY-MM-DD
    source = Column(String(100), default="Direct")  # LinkedIn, Indeed, Referral, Direct, etc.
    status = Column(String(50), default="Applied")  # Saved, Applied, Assessment, Interview, Offer, Rejected
    notes = Column(Text, nullable=True)
    interview_date = Column(String(50), nullable=True)
    salary_range = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

