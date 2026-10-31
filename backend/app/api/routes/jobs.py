from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.resume import JobDescription
from app.schemas.resume import JobAnalyzeRequest, JobDescriptionResponse
from app.agents.job_agent import JobIntelligenceAgent
from app.services.document_service import document_service

router = APIRouter()

@router.post("/analyze", response_model=JobDescriptionResponse)
def analyze_job_description(req: JobAnalyzeRequest, db: Session = Depends(get_db)):
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    sanitized = document_service.sanitize_text(req.raw_text)
    agent = JobIntelligenceAgent(db)
    result = agent.analyze_job(
        raw_text=sanitized,
        source_url=req.source_url,
        title=req.title
    )

    job = db.query(JobDescription).first()
    if not job:
        job = JobDescription(
            title=result.get("title", req.title or "Target Job"),
            company=result.get("company", req.company or "Target Company"),
            source_url=req.source_url or "",
            raw_text=sanitized,
            required_skills=result.get("required_skills", []),
            preferred_skills=result.get("preferred_skills", []),
            responsibilities=result.get("responsibilities", []),
            experience_level=result.get("experience_level", "Early Career"),
            keywords=result.get("keywords", [])
        )
        db.add(job)
    else:
        job.title = result.get("title", req.title or job.title)
        job.company = result.get("company", req.company or job.company)
        job.source_url = req.source_url or job.source_url
        job.raw_text = sanitized
        job.required_skills = result.get("required_skills", [])
        job.preferred_skills = result.get("preferred_skills", [])
        job.responsibilities = result.get("responsibilities", [])
        job.experience_level = result.get("experience_level", job.experience_level)
        job.keywords = result.get("keywords", [])
    db.commit()
    db.refresh(job)
    return job

@router.get("/latest", response_model=JobDescriptionResponse)
def get_latest_job(db: Session = Depends(get_db)):
    job = db.query(JobDescription).first()
    if not job:
        raise HTTPException(status_code=404, detail="No job description has been analyzed yet.")
    return job

