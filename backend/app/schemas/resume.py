from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    id: Optional[int] = None
    filename: Optional[str] = None
    parsed_text: Optional[str] = None
    skills: List[Any] = []
    education: List[Any] = []
    experience_highlights: List[Any] = []
    strengths: List[str] = []
    missing_elements: List[str] = []
    improvement_suggestions: List[str] = []
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class JobAnalyzeRequest(BaseModel):
    raw_text: str
    title: Optional[str] = None
    company: Optional[str] = None
    source_url: Optional[str] = None

class JobDescriptionResponse(BaseModel):
    id: Optional[int] = None
    title: str
    company: Optional[str] = None
    source_url: Optional[str] = None
    raw_text: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    responsibilities: List[str] = []
    experience_level: Optional[str] = None
    keywords: List[str] = []
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
