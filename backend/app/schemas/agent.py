from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class AgentActivityResponse(BaseModel):
    id: int
    agent_name: str
    task_description: str
    status: str
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    structured_output: Dict[str, Any] = {}
    duration_ms: int = 0
    error_message: Optional[str] = None
    is_demo: int = 0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PipelineRunRequest(BaseModel):
    include_agents: Optional[List[str]] = None
    force_refresh: bool = False

class PipelineRunResponse(BaseModel):
    status: str
    executed_agents: List[str]
    duration_ms: int
    logs: List[AgentActivityResponse] = []
    message: str
