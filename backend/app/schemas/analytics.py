from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class AnalyticsOverviewResponse(BaseModel):
    has_profile: bool
    target_role: Optional[str] = None
    readiness_score: float = 0.0
    readiness_formula_explanation: str = ""
    skills_count: int = 0
    strong_skills_count: int = 0
    missing_skills_count: int = 0
    partial_skills_count: int = 0
    
    # Roadmap progress
    total_roadmap_tasks: int = 0
    completed_roadmap_tasks: int = 0
    roadmap_progress_pct: float = 0.0
    upcoming_tasks: List[Any] = []
    milestones: List[Any] = []
    
    # Projects
    portfolio_projects_count: int = 0
    saved_projects_count: int = 0
    
    # Interview stats
    interviews_conducted: int = 0
    avg_interview_score: float = 0.0
    
    # Application stats
    total_applications: int = 0
    applications_by_status: Dict[str, int] = {}
    response_rate_pct: float = 0.0
    interview_rate_pct: float = 0.0
    
    # Next recommended action
    recommended_next_action: Dict[str, Any] = {}
    is_demo_mode: bool = False

