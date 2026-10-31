from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class SkillItem(BaseModel):
    name: str
    category: Optional[str] = "General"
    proficiency: Optional[str] = "Intermediate"
    verified: bool = False
    source: Optional[str] = "self-reported"

class CareerProfileCreate(BaseModel):
    name: str
    email: Optional[str] = None
    education: Optional[str] = None
    current_stage: Optional[str] = "Student"
    target_role: str
    current_skills: List[Any] = []
    experience: Optional[str] = None
    preferred_schedule: Optional[str] = "Flexible"
    weekly_hours: int = 10
    career_goals: Optional[str] = None
    raw_voice_transcript: Optional[str] = None

class CareerProfileResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    education: Optional[str] = None
    current_stage: Optional[str] = None
    target_role: str
    current_skills: List[Any] = []
    experience: Optional[str] = None
    preferred_schedule: Optional[str] = None
    weekly_hours: int = 10
    career_goals: Optional[str] = None
    raw_voice_transcript: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class VoiceGoalInput(BaseModel):
    text: str = Field(..., description="Dictated or typed natural language career aspirations")
    source: Optional[str] = "wispr_flow"
