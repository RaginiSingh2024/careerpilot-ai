from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class SkillMatchItem(BaseModel):
    skill: str
    evidence: Optional[str] = None
    confidence: str = "High"
    verified: bool = False
    source: Optional[str] = None

class PartialMatchItem(BaseModel):
    skill: str
    current_level: str
    needed_level: str
    priority: str = "Medium"
    why: str

class MissingSkillItem(BaseModel):
    skill: str
    priority: str = "High"
    category: Optional[str] = "Core"
    why: str

class UnverifiedSkillItem(BaseModel):
    skill: str
    source: str = "Self-reported"
    verification_needed: str

class SkillGapAnalyzeRequest(BaseModel):
    target_role: Optional[str] = None
    profile_id: Optional[int] = None
    resume_id: Optional[int] = None
    job_id: Optional[int] = None

class SkillGapResponse(BaseModel):
    id: Optional[int] = None
    target_role: str
    readiness_score: float
    score_breakdown: Dict[str, Any] = {}
    strong_matches: List[Any] = []
    partial_matches: List[Any] = []
    missing_skills: List[Any] = []
    unverified_skills: List[Any] = []
    summary: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
