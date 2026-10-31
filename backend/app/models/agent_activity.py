from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from datetime import datetime
from app.core.database import Base

class AgentExecutionLog(Base):
    __tablename__ = "agent_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), nullable=False)
    task_description = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    structured_output = Column(JSON, default=dict)
    duration_ms = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    is_demo = Column(Integer, default=0)  # 1 if run via demo mode
    created_at = Column(DateTime, default=datetime.utcnow)

