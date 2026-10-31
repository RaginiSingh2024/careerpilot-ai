from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class JobApplicationCreate(BaseModel):
    company: str
    role: str
    job_url: Optional[str] = None
    application_date: Optional[str] = None
    source: Optional[str] = "LinkedIn"
    status: Optional[str] = "Applied"
    notes: Optional[str] = None
    interview_date: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    job_url: Optional[str] = None
    application_date: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    job_url: Optional[str] = None
    application_date: Optional[str] = None
    source: Optional[str] = None
    status: str
    notes: Optional[str] = None
    interview_date: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
