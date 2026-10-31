from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class TaskUpdate(BaseModel):
    is_completed: Optional[bool] = None
    notes: Optional[str] = None

class RoadmapTaskResponse(BaseModel):
    id: int
    roadmap_id: int
    week_number: int
    title: str
    description: Optional[str] = None
    estimated_hours: int = 2
    priority: str = "Medium"
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    resources: List[Any] = []

    model_config = ConfigDict(from_attributes=True)

class RoadmapMilestoneResponse(BaseModel):
    id: int
    roadmap_id: int
    week_number: int
    title: str
    criteria: Optional[str] = None
    is_achieved: bool = False
    achieved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RoadmapResponse(BaseModel):
    id: int
    title: str
    target_role: str
    total_weeks: int
    summary: Optional[str] = None
    is_active: bool
    adaptation_history: List[Any] = []
    created_at: Optional[datetime] = None
    tasks: List[RoadmapTaskResponse] = []
    milestones: List[RoadmapMilestoneResponse] = []

    model_config = ConfigDict(from_attributes=True)

class RoadmapGenerateRequest(BaseModel):
    target_role: Optional[str] = None
    weeks: Optional[int] = 4
    weekly_hours: Optional[int] = 10

class RoadmapAdaptRequest(BaseModel):
    user_feedback: Optional[str] = None
    adjust_reason: Optional[str] = "Pacing and completed tasks update"
