from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from app.core.database import get_db
from app.models.career import CareerProfile
from app.models.skill_gap import SkillGapAnalysis
from app.models.roadmap import LearningRoadmap, RoadmapTask, RoadmapMilestone
from app.schemas.roadmap import (
    RoadmapResponse,
    RoadmapGenerateRequest,
    TaskUpdate,
    RoadmapTaskResponse,
    RoadmapAdaptRequest
)
from app.agents.roadmap_agent import CareerRoadmapAgent
from app.agents.progress_agent import ProgressApplicationAgent

router = APIRouter()

@router.get("", response_model=RoadmapResponse)
def get_active_roadmap(db: Session = Depends(get_db)):
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.is_active == True).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active learning roadmap found. Generate one first.")
    return roadmap

@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(req: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    gap = db.query(SkillGapAnalysis).first()

    target_role = req.target_role or (profile.target_role if profile else "Backend Software Engineer")
    weekly_hours = req.weekly_hours or (profile.weekly_hours if profile else 14)
    missing_skills = []
    if gap:
        missing_skills = (gap.missing_skills or []) + (gap.partial_matches or [])

    agent = CareerRoadmapAgent(db)
    result = agent.generate_roadmap(
        target_role=target_role,
        missing_skills=missing_skills,
        weekly_hours=weekly_hours,
        experience_level=profile.current_stage if profile else "Student"
    )

    # Deactivate or delete old roadmap
    old_roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.is_active == True).first()
    if old_roadmap:
        db.delete(old_roadmap)
        db.commit()

    roadmap = LearningRoadmap(
        title=result.get("title", f"4-Week {target_role} Sprint"),
        target_role=target_role,
        total_weeks=4,
        summary=result.get("summary", ""),
        is_active=True
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    for m in result.get("milestones", []):
        ms = RoadmapMilestone(
            roadmap_id=roadmap.id,
            week_number=m.get("week_number", 1),
            title=m.get("title", "Milestone"),
            criteria=m.get("criteria", ""),
            is_achieved=False
        )
        db.add(ms)

    for t in result.get("tasks", []):
        task_item = RoadmapTask(
            roadmap_id=roadmap.id,
            week_number=t.get("week_number", 1),
            title=t.get("title", "Task"),
            description=t.get("description", ""),
            estimated_hours=t.get("estimated_hours", 2),
            priority=t.get("priority", "Medium"),
            is_completed=False,
            resources=t.get("resources", [])
        )
        db.add(task_item)

    db.commit()
    db.refresh(roadmap)
    return roadmap

@router.patch("/tasks/{task_id}", response_model=RoadmapTaskResponse)
def update_task_status(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Roadmap task not found.")

    if update.is_completed is not None:
        task.is_completed = update.is_completed
        task.completed_at = datetime.utcnow() if update.is_completed else None
        
        # Check if all tasks in this week are completed to mark milestone
        roadmap_tasks_in_week = db.query(RoadmapTask).filter(
            RoadmapTask.roadmap_id == task.roadmap_id,
            RoadmapTask.week_number == task.week_number
        ).all()
        all_completed = all(t.is_completed for t in roadmap_tasks_in_week)
        milestone = db.query(RoadmapMilestone).filter(
            RoadmapMilestone.roadmap_id == task.roadmap_id,
            RoadmapMilestone.week_number == task.week_number
        ).first()
        if milestone:
            milestone.is_achieved = all_completed
            milestone.achieved_at = datetime.utcnow() if all_completed else None

    if update.notes is not None:
        task.notes = update.notes

    db.commit()
    db.refresh(task)
    return task

@router.post("/adapt", response_model=RoadmapResponse)
def adapt_roadmap(req: RoadmapAdaptRequest, db: Session = Depends(get_db)):
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.is_active == True).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap found to adapt.")

    tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
    completed = [{"id": t.id, "title": t.title, "week": t.week_number} for t in tasks if t.is_completed]
    remaining = [{"id": t.id, "title": t.title, "week": t.week_number} for t in tasks if not t.is_completed]

    agent = ProgressApplicationAgent(db)
    result = agent.adapt_roadmap(
        current_roadmap={"title": roadmap.title, "target_role": roadmap.target_role},
        completed_tasks=completed,
        remaining_tasks=remaining,
        user_notes=req.user_feedback or req.adjust_reason
    )

    history = roadmap.adaptation_history or []
    history.append({
        "timestamp": datetime.utcnow().isoformat(),
        "reason": req.adjust_reason,
        "summary": result.get("adjustment_summary"),
        "pacing": result.get("recommended_pacing")
    })
    roadmap.adaptation_history = history
    db.commit()
    db.refresh(roadmap)
    return roadmap

