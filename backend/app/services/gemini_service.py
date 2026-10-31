import json
import logging
import re
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self._client = None
        if self.api_key and self.api_key.strip():
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key.strip())
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI Client: {e}")
                self._client = None

    def is_available(self) -> bool:
        return bool(self._client and not settings.is_demo_mode)

    def generate_structured_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Calls Gemini API requesting structured JSON, with clean parsing and fallback."""
        if not self.is_available():
            raise RuntimeError("Gemini API is in Demo Mode or unconfigured.")

        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
                system_instruction=system_instruction
            )
            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config
            )
            raw_text = response.text or ""
            return self._parse_json_safely(raw_text)
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise e

    @staticmethod
    def _parse_json_safely(text: str) -> Dict[str, Any]:
        text = text.strip()
        # Remove markdown code fences if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback: search for first { and last }
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(text[start:end+1])
                except Exception:
                    pass
            # Array fallback
            start = text.find("[")
            end = text.rfind("]")
            if start != -1 and end != -1 and end > start:
                try:
                    return {"items": json.loads(text[start:end+1])}
                except Exception:
                    pass
            raise ValueError(f"Failed to parse model response as JSON. Output was: {text[:200]}")

gemini_service = GeminiService()

