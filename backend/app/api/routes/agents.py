from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.agent_activity import AgentExecutionLog
from app.models.career import CareerProfile
from app.models.resume import ResumeAnalysis, JobDescription
from app.schemas.agent import AgentActivityResponse, PipelineRunRequest, PipelineRunResponse
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter()

@router.get("/activity", response_model=List[AgentActivityResponse])
def get_agent_activity(
    limit: int = Query(50, ge=1, le=200),
    agent_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AgentExecutionLog)
    if agent_name:
        query = query.filter(AgentExecutionLog.agent_name == agent_name)
    logs = query.order_by(AgentExecutionLog.created_at.desc()).limit(limit).all()
    return logs

@router.post("/run-pipeline", response_model=PipelineRunResponse)
def run_orchestrated_pipeline(req: PipelineRunRequest, db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    resume = db.query(ResumeAnalysis).first()
    job = db.query(JobDescription).first()

    orchestrator = AgentOrchestrator(db)
    result = orchestrator.run_full_pipeline(
        voice_or_goal_text=profile.raw_voice_transcript if profile else None,
        resume_text=resume.parsed_text if resume else None,
        job_text=job.raw_text if job else None,
        target_role=profile.target_role if profile else "Backend Software Engineer"
    )

    recent_logs = db.query(AgentExecutionLog).order_by(AgentExecutionLog.created_at.desc()).limit(10).all()

    return PipelineRunResponse(
        status=result.get("status", "success"),
        executed_agents=result.get("executed_agents", []),
        duration_ms=result.get("duration_ms", 0),
        logs=[AgentActivityResponse.model_validate(l) for l in recent_logs],
        message=result.get("message", "Pipeline completed")
    )
