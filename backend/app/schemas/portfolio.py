from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class PortfolioProjectCreate(BaseModel):
    title: str
    problem_statement: str
    why_it_matters: str
    skills_covered: List[str] = []
    tech_stack: List[str] = []
    suggested_features: List[str] = []
    deliverables: List[str] = []
    difficulty: str = "Intermediate"
    expected_outcome: Optional[str] = None
    mapped_job_requirements: List[str] = []
    is_saved: bool = False

class PortfolioProjectResponse(BaseModel):
    id: int
    title: str
    problem_statement: str
    why_it_matters: str
    skills_covered: List[str] = []
    tech_stack: List[str] = []
    suggested_features: List[str] = []
    deliverables: List[str] = []
    difficulty: str = "Intermediate"
    expected_outcome: Optional[str] = None
    mapped_job_requirements: List[str] = []
    is_saved: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RecommendProjectsRequest(BaseModel):
    target_role: Optional[str] = None
    count: Optional[int] = 3
