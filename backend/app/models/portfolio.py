from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class PortfolioProject(Base):
    __tablename__ = "portfolio_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    skills_covered = Column(JSON, default=list)
    tech_stack = Column(JSON, default=list)
    suggested_features = Column(JSON, default=list)
    deliverables = Column(JSON, default=list)
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    expected_outcome = Column(Text, nullable=True)
    mapped_job_requirements = Column(JSON, default=list)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

