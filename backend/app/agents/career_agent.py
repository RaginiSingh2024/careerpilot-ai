import re
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class CareerProfileAgent(BaseAgent):
    name = "Career Profile Agent"
    description = "Understands career aspirations, parses dictated/typed goals, extracts skills, target roles, and produces structured candidate profiles."

    def process_goal_input(self, raw_text: str, existing_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyzes natural language (voice/typed) input and returns a structured profile."""
        task = "Parse natural language career goals and structure profile"

        def live_runner(text: str) -> Dict[str, Any]:
            prompt = f"""
You are the Career Profile Agent in CareerPilot AI.
Analyze the following natural language input from a user (which may be from voice dictation or typed input):
---
{text}
---

Extract and return a strictly valid JSON object with the following keys:
{{
  "name": "Candidate name if mentioned, otherwise 'Aspiring Engineer'",
  "current_stage": "e.g. University Student, Fresh Graduate, Career Switcher, Working Professional",
  "education": "e.g. B.S. in Computer Science (or extracted level)",
  "target_role": "Target career role, e.g. Backend Software Engineer, AI Engineer, Full-Stack Engineer",
  "skills": [
    {{"name": "SkillName", "category": "Programming/Backend/Database/Cloud/AI", "proficiency": "Beginner|Intermediate|Advanced", "verified": false, "source": "self-reported"}}
  ],
  "weekly_hours": 14,
  "preferred_schedule": "e.g. Daily (2 hrs/day) or Flexible",
  "career_goals_summary": "Clean executive summary of what the candidate wants to achieve",
  "missing_essential_info": ["List of any key missing details like portfolio links, graduation date, or target companies"]
}}
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Extract structured career profile data from user dictation.")

        def fallback_runner(text: str) -> Dict[str, Any]:
            lower = text.lower()
            
            # Detect target role
            target_role = "Backend Software Engineer"
            if "ai engineer" in lower or "machine learning" in lower or "data scientist" in lower:
                target_role = "AI Engineer"
            elif "frontend" in lower:
                target_role = "Frontend Engineer"
            elif "full stack" in lower or "fullstack" in lower:
                target_role = "Full-Stack Software Engineer"
            elif "devops" in lower or "cloud" in lower:
                target_role = "Cloud & DevOps Engineer"
            elif "backend" in lower or "software engineer" in lower:
                target_role = "Backend Software Engineer"

            # Detect current stage
            stage = "University Student"
            if "graduate" in lower:
                stage = "Fresh Graduate"
            elif "switching" in lower or "career changer" in lower or "transition" in lower:
                stage = "Career Switcher"
            elif "working" in lower or "professional" in lower:
                stage = "Working Professional"

            # Detect education
            education = "B.S. in Computer Science" if "computer science" in lower else "Undergraduate Degree"

            # Detect skills
            skill_keywords = {
                "Python": "Programming",
                "Java": "Programming",
                "SQL": "Database",
                "REST APIs": "Backend",
                "Web Development": "Frontend",
                "JavaScript": "Frontend",
                "Git": "Tools",
                "FastAPI": "Backend",
                "Docker": "DevOps",
                "PostgreSQL": "Database"
            }
            extracted_skills = []
            for skill, cat in skill_keywords.items():
                if skill.lower() in lower:
                    extracted_skills.append({
                        "name": skill,
                        "category": cat,
                        "proficiency": "Intermediate" if skill in ["Python", "Java", "SQL"] else "Beginner",
                        "verified": False,
                        "source": "self-reported"
                    })

            if not extracted_skills:
                extracted_skills = [
                    {"name": "Python", "category": "Programming", "proficiency": "Intermediate", "verified": False, "source": "self-reported"},
                    {"name": "Java", "category": "Programming", "proficiency": "Intermediate", "verified": False, "source": "self-reported"},
                    {"name": "SQL", "category": "Database", "proficiency": "Intermediate", "verified": False, "source": "self-reported"},
                    {"name": "Web Development", "category": "Frontend", "proficiency": "Beginner", "verified": False, "source": "self-reported"}
                ]

            # Detect study hours
            hours = 14
            match = re.search(r'(\d+)\s*(?:hours|hrs)', lower)
            if match:
                daily = int(match.group(1))
                if "day" in lower or "daily" in lower:
                    hours = daily * 7
                else:
                    hours = daily

            return {
                "name": "Alex Chen",
                "current_stage": stage,
                "education": education,
                "target_role": target_role,
                "skills": extracted_skills,
                "weekly_hours": hours,
                "preferred_schedule": "Daily (approx 2 hrs/day)",
                "career_goals_summary": text.strip() or "Transition into a high-impact engineering role with verified system engineering skills.",
                "missing_essential_info": [
                    "Prior internship or production experience details",
                    "Target application timeline (e.g., Summer 2025)",
                    "GitHub profile or live project link"
                ]
            }

        return self.execute_with_telemetry(task, raw_text, live_runner, fallback_runner)

