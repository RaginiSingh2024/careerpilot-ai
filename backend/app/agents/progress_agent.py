from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class ProgressApplicationAgent(BaseAgent):
    name = "Progress and Application Insights Agent"
    description = "Monitors roadmap task completion, dynamically recalibrates learning pacing, and computes honest application conversion analytics."

    def adapt_roadmap(
        self,
        current_roadmap: Dict[str, Any],
        completed_tasks: List[Dict[str, Any]],
        remaining_tasks: List[Dict[str, Any]],
        user_notes: str = ""
    ) -> Dict[str, Any]:
        task = "Adapt learning roadmap based on user progress and feedback"

        def live_runner(inputs: Any) -> Dict[str, Any]:
            prompt = f"""
You are the Progress and Application Insights Agent in CareerPilot AI.
The user has provided progress updates on their 4-week learning roadmap.
Completed Tasks ({len(completed_tasks)}):
{completed_tasks}

Remaining Tasks ({len(remaining_tasks)}):
{remaining_tasks}

User Notes / Feedback:
{user_notes}

Provide an adapted recommendation for the remaining weeks.
Return a strictly valid JSON object:
{{
  "adjustment_summary": "Executive summary of changes made to pacing and task priorities.",
  "recommended_pacing": "Accelerated | On Track | Extended",
  "adapted_tasks": [
    {{
      "week_number": 3,
      "title": "Adapted or reprioritized task title",
      "description": "Adjusted description with updated guidance",
      "estimated_hours": 3,
      "priority": "High|Medium|Low"
    }}
  ],
  "encouragement": "Supportive coaching comment acknowledging accomplishments."
}}
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Adapt developer learning roadmaps based on empirical progress.")

        def fallback_runner(inputs: Any) -> Dict[str, Any]:
            pct = (len(completed_tasks) / max(len(completed_tasks) + len(remaining_tasks), 1)) * 100
            pacing = "Accelerated" if pct > 60 else "On Track"
            return {
                "adjustment_summary": f"Analyzed {len(completed_tasks)} completed milestones ({pct:.1f}% progress). Reprioritized hands-on containerization and load testing to capitalize on your backend momentum.",
                "recommended_pacing": pacing,
                "adapted_tasks": [
                    {
                        "week_number": 3,
                        "title": "Streamline Docker Compose with Multi-Service Health Checks",
                        "description": "Adjusted: Focus directly on Docker network bridging and automated service restart policies.",
                        "estimated_hours": 3,
                        "priority": "High"
                    },
                    {
                        "week_number": 4,
                        "title": "Deploy Live Showcase with GitHub Actions Automated Deploy",
                        "description": "Adjusted: Expedite deployment to give you a live production URL ready for job applications sooner.",
                        "estimated_hours": 3,
                        "priority": "High"
                    }
                ],
                "encouragement": "Outstanding momentum! You've verified your foundational API comprehension—now containerizing will make your applications stand out."
            }

        return self.execute_with_telemetry(task, {"completed": len(completed_tasks), "remaining": len(remaining_tasks)}, live_runner, fallback_runner)

    def analyze_applications(self, applications: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates honest conversion rates and detects response patterns."""
        total = len(applications)
        if total == 0:
            return {
                "total_applications": 0,
                "response_rate_pct": 0.0,
                "interview_rate_pct": 0.0,
                "status_breakdown": {},
                "insight_pattern": "No job applications recorded yet. Start tracking your applications to surface response patterns."
            }

        status_counts = {}
        for app in applications:
            status = app.get("status", "Applied")
            status_counts[status] = status_counts.get(status, 0) + 1

        # Responsive statuses: Assessment, Interview, Offer
        responsive = sum(status_counts.get(s, 0) for s in ["Assessment", "Interview", "Offer"])
        interviews = sum(status_counts.get(s, 0) for s in ["Interview", "Offer"])

        response_rate = round((responsive / total) * 100, 1)
        interview_rate = round((interviews / total) * 100, 1)

        # Source breakdown
        sources = {}
        for app in applications:
            src = app.get("source", "Direct")
            sources[src] = sources.get(src, 0) + 1

        insight = ""
        if total >= 3:
            top_source = max(sources.items(), key=lambda x: x[1])[0]
            insight = f"Your highest application volume is from '{top_source}'. With a {response_rate}% response rate, consider increasing targeted employee referrals to boost interview callbacks."
        else:
            insight = f"Tracking {total} application(s). Adding 5+ applications will reveal meaningful channel response patterns."

        return {
            "total_applications": total,
            "response_rate_pct": response_rate,
            "interview_rate_pct": interview_rate,
            "status_breakdown": status_counts,
            "source_breakdown": sources,
            "insight_pattern": insight
        }

