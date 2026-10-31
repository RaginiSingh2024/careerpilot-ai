from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    target_role = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    overall_score = Column(Float, default=0.0)
    summary_feedback = Column(Text, nullable=True)
    key_strengths = Column(JSON, default=list)
    areas_for_improvement = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    qa_items = relationship("InterviewQA", back_populates="session", cascade="all, delete-orphan")

class InterviewQA(Base):
    __tablename__ = "interview_qa"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question = Column(Text, nullable=False)
    category = Column(String(100), default="Technical")
    difficulty = Column(String(50), default="Medium")
    rubric = Column(JSON, default=dict)  # {"correctness": 25, "clarity": 25, "technical_depth": 25, "problem_solving": 25}
    user_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)  # Out of 100
    correctness_score = Column(Float, nullable=True)
    clarity_score = Column(Float, nullable=True)
    technical_depth_score = Column(Float, nullable=True)
    problem_solving_score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    gaps = Column(JSON, default=list)
    suggested_improved_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="qa_items")

