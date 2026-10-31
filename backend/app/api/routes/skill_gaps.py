from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.career import CareerProfile
from app.models.resume import ResumeAnalysis, JobDescription
from app.models.skill_gap import SkillGapAnalysis
from app.schemas.skill_gap import SkillGapAnalyzeRequest, SkillGapResponse
from app.agents.skill_gap_agent import SkillGapAgent

router = APIRouter()

@router.post("/analyze", response_model=SkillGapResponse)
def analyze_skill_gaps(req: SkillGapAnalyzeRequest, db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    resume = db.query(ResumeAnalysis).first()
    job = db.query(JobDescription).first()

    target_role = req.target_role or (profile.target_role if profile else "Backend Software Engineer")
    
    # Aggregate candidate skills
    candidate_skills = []
    if resume and resume.skills:
        candidate_skills.extend(resume.skills)
    elif profile and profile.current_skills:
        candidate_skills.extend(profile.current_skills)

    job_requirements = {
        "required_skills": job.required_skills if job else ["Python", "SQL", "Git", "REST APIs", "Docker", "Pytest"],
        "preferred_skills": job.preferred_skills if job else ["FastAPI", "Redis", "AWS"],
        "responsibilities": job.responsibilities if job else []
    }

    agent = SkillGapAgent(db)
    result = agent.analyze_gaps(
        candidate_skills=candidate_skills,
        job_requirements=job_requirements,
        target_role=target_role
    )

    gap = db.query(SkillGapAnalysis).first()
    if not gap:
        gap = SkillGapAnalysis(
            target_role=target_role,
            readiness_score=result.get("readiness_score", 65.0),
            score_breakdown=result.get("score_breakdown", {}),
            strong_matches=result.get("strong_matches", []),
            partial_matches=result.get("partial_matches", []),
            missing_skills=result.get("missing_skills", []),
            unverified_skills=result.get("unverified_skills", []),
            summary=result.get("summary", "")
        )
        db.add(gap)
    else:
        gap.target_role = target_role
        gap.readiness_score = result.get("readiness_score", 65.0)
        gap.score_breakdown = result.get("score_breakdown", {})
        gap.strong_matches = result.get("strong_matches", [])
        gap.partial_matches = result.get("partial_matches", [])
        gap.missing_skills = result.get("missing_skills", [])
        gap.unverified_skills = result.get("unverified_skills", [])
        gap.summary = result.get("summary", "")
    db.commit()
    db.refresh(gap)
    return gap

@router.get("/latest", response_model=SkillGapResponse)
def get_latest_skill_gaps(db: Session = Depends(get_db)):
    gap = db.query(SkillGapAnalysis).first()
    if not gap:
        raise HTTPException(status_code=404, detail="No skill gap analysis generated yet.")
    return gap

