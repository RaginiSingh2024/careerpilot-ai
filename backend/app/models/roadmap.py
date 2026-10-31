from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    target_role = Column(String(255), nullable=False)
    total_weeks = Column(Integer, default=4)
    summary = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    adaptation_history = Column(JSON, default=list)  # tracks when & why adapted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan")
    milestones = relationship("RoadmapMilestone", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    estimated_hours = Column(Integer, default=2)
    priority = Column(String(50), default="Medium")  # High, Medium, Low
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    resources = Column(JSON, default=list)  # [{"title": "...", "type": "docs/tutorial", "url": "..."}]
    
    roadmap = relationship("LearningRoadmap", back_populates="tasks")

class RoadmapMilestone(Base):
    __tablename__ = "roadmap_milestones"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    criteria = Column(Text, nullable=True)
    is_achieved = Column(Boolean, default=False)
    achieved_at = Column(DateTime, nullable=True)

    roadmap = relationship("LearningRoadmap", back_populates="milestones")

