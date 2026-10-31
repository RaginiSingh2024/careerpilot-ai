import time
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.agent_activity import AgentExecutionLog
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class BaseAgent:
    name: str = "BaseAgent"
    description: str = "Base agent specification"

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def log_execution(
        self,
        task: str,
        status: str,
        input_summary: str,
        output_summary: str,
        structured_output: Dict[str, Any],
        duration_ms: int,
        error_message: Optional[str] = None,
        is_demo: bool = False
    ) -> Optional[AgentExecutionLog]:
        """Saves execution trace to SQLite database."""
        if not self.db:
            return None
        try:
            log = AgentExecutionLog(
                agent_name=self.name,
                task_description=task,
                status=status,
                input_summary=input_summary[:500] if input_summary else None,
                output_summary=output_summary[:500] if output_summary else None,
                structured_output=structured_output or {},
                duration_ms=duration_ms,
                error_message=error_message,
                is_demo=1 if is_demo else 0
            )
            self.db.add(log)
            self.db.commit()
            self.db.refresh(log)
            return log
        except Exception as e:
            logger.error(f"Failed to record agent execution log: {e}")
            if self.db:
                self.db.rollback()
            return None

    def execute_with_telemetry(self, task: str, input_data: Any, runner_fn, fallback_fn):
        start_time = time.time()
        is_demo = False
        input_repr = str(input_data)[:250]

        try:
            if gemini_service.is_available():
                try:
                    result = runner_fn(input_data)
                except Exception as live_err:
                    logger.warning(f"{self.name} live execution error: {live_err}. Using deterministic fallback.")
                    result = fallback_fn(input_data)
                    is_demo = True
            else:
                result = fallback_fn(input_data)
                is_demo = True

            duration_ms = int((time.time() - start_time) * 1000)
            output_repr = str(result)[:250]
            self.log_execution(
                task=task,
                status="completed",
                input_summary=input_repr,
                output_summary=output_repr,
                structured_output=result if isinstance(result, dict) else {"result": result},
                duration_ms=duration_ms,
                is_demo=is_demo
            )
            if isinstance(result, dict):
                result["_is_demo"] = is_demo
            return result
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            self.log_execution(
                task=task,
                status="failed",
                input_summary=input_repr,
                output_summary="Failed with error",
                structured_output={},
                duration_ms=duration_ms,
                error_message=str(e),
                is_demo=is_demo
            )
            raise e

