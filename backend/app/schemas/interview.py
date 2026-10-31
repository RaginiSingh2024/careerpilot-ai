from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class StartInterviewRequest(BaseModel):
    target_role: Optional[str] = "Backend Software Engineer"
    topic: Optional[str] = "System Design & APIs"
    num_questions: Optional[int] = 3

class EvaluateAnswerRequest(BaseModel):
    qa_id: int
    user_answer: str

class InterviewQAResponse(BaseModel):
    id: int
    session_id: int
    question: str
    category: str
    difficulty: str
    rubric: Dict[str, Any] = {}
    user_answer: Optional[str] = None
    score: Optional[float] = None
    correctness_score: Optional[float] = None
    clarity_score: Optional[float] = None
    technical_depth_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    feedback: Optional[str] = None
    strengths: List[str] = []
    gaps: List[str] = []
    suggested_improved_answer: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class InterviewSessionResponse(BaseModel):
    id: int
    target_role: str
    topic: str
    overall_score: float
    summary_feedback: Optional[str] = None
    key_strengths: List[str] = []
    areas_for_improvement: List[str] = []
    created_at: Optional[datetime] = None
    qa_items: List[InterviewQAResponse] = []

    model_config = ConfigDict(from_attributes=True)
