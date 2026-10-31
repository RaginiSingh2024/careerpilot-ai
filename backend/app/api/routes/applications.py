from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.application import JobApplication
from app.schemas.application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse
)
from app.agents.progress_agent import ProgressApplicationAgent

router = APIRouter()

@router.get("", response_model=List[JobApplicationResponse])
def get_job_applications(db: Session = Depends(get_db)):
    apps = db.query(JobApplication).order_by(JobApplication.created_at.desc()).all()
    return apps

@router.post("", response_model=JobApplicationResponse)
def create_job_application(app_in: JobApplicationCreate, db: Session = Depends(get_db)):
    app = JobApplication(**app_in.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.patch("/{application_id}", response_model=JobApplicationResponse)
def update_job_application(application_id: int, app_up: JobApplicationUpdate, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Job application record not found.")

    for k, v in app_up.model_dump(exclude_unset=True).items():
        setattr(app, k, v)
    db.commit()
    db.refresh(app)
    return app

@router.delete("/{application_id}")
def delete_job_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Job application record not found.")
    db.delete(app)
    db.commit()
    return {"status": "success", "message": "Job application deleted."}

@router.get("/metrics")
def get_application_metrics(db: Session = Depends(get_db)):
    apps = db.query(JobApplication).all()
    agent = ProgressApplicationAgent(db)
    metrics = agent.analyze_applications([
        {"id": a.id, "status": a.status, "source": a.source, "company": a.company}
        for a in apps
    ])
    return metrics
