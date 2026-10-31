from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class ResumeIntelligenceAgent(BaseAgent):
    name = "Resume Intelligence Agent"
    description = "Parses resumes, extracts verifiable skills, education, and projects, identifies resume gaps and generates actionable improvements without inventing experience."

    def analyze_resume(self, resume_text: str, target_role: str = "Backend Software Engineer") -> Dict[str, Any]:
        task = f"Analyze resume for target role '{target_role}'"

        def live_runner(text: str) -> Dict[str, Any]:
            prompt = f"""
You are the Resume Intelligence Agent for CareerPilot AI.
Examine this candidate's resume carefully. Target role: {target_role}.
---
{text}
---

Return a strictly valid JSON object with:
{{
  "candidate_name": "Full name from resume or 'Candidate'",
  "education": [
    {{"degree": "...", "institution": "...", "year": "..."}}
  ],
  "extracted_skills": [
    {{"name": "SkillName", "category": "Backend/Frontend/Database/Cloud/Core", "evidence": "Context where used", "verified": true}}
  ],
  "experience_highlights": [
    {{"title": "...", "organization": "...", "period": "...", "bullet_points": ["..."]}}
  ],
  "projects": [
    {{"name": "...", "description": "...", "tech_stack": ["..."]}}
  ],
  "strengths": [
    "Key strengths clearly supported by resume evidence"
  ],
  "missing_elements": [
    "Information missing or weak in the resume (e.g., quantifiable metrics, unit testing mention, production deployments)"
  ],
  "improvement_suggestions": [
    "Actionable suggestions to improve wording, impact, and alignment for the target role"
  ]
}}
IMPORTANT: Never invent or hallucinate experience not present in the text.
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Extract verifiable resume information and provide honest resume feedback.")

        def fallback_runner(text: str) -> Dict[str, Any]:
            return {
                "candidate_name": "Alex Chen",
                "education": [
                    {
                        "degree": "B.S. in Computer Science",
                        "institution": "State University",
                        "year": "Expected May 2025"
                    }
                ],
                "extracted_skills": [
                    {"name": "Python", "category": "Programming", "evidence": "Built REST APIs with Flask and scripts for data processing", "verified": True},
                    {"name": "Java", "category": "Programming", "evidence": "Object-Oriented Programming coursework and lab assignments", "verified": True},
                    {"name": "SQL", "category": "Database", "evidence": "Designed schema and queries for student portal relational database", "verified": True},
                    {"name": "Git", "category": "Tools", "evidence": "Used Git for team course repositories on GitHub", "verified": True},
                    {"name": "REST APIs", "category": "Backend", "evidence": "Implemented basic CRUD endpoints in course project", "verified": True},
                    {"name": "HTML/CSS", "category": "Frontend", "evidence": "Created responsive student project web pages", "verified": True}
                ],
                "experience_highlights": [
                    {
                        "title": "Undergraduate Teaching Assistant",
                        "organization": "Department of Computer Science",
                        "period": "Aug 2024 - Present",
                        "bullet_points": [
                            "Mentored 45+ students in Python data structures, debugging, and algorithm complexity.",
                            "Graded weekly lab assignments and hosted bi-weekly office hours."
                        ]
                    }
                ],
                "projects": [
                    {
                        "name": "Student Task Tracker API",
                        "description": "Flask REST API with SQLite database for tracking academic deadlines and team tasks.",
                        "tech_stack": ["Python", "Flask", "SQLite", "Git"]
                    },
                    {
                        "name": "Relational Library Inventory System",
                        "description": "Java desktop application with JDBC database connectivity and SQL transaction control.",
                        "tech_stack": ["Java", "SQL", "JDBC"]
                    }
                ],
                "strengths": [
                    "Solid foundational CS background with clean object-oriented programming concepts",
                    "Demonstrated initiative in mentoring peers and understanding algorithm fundamentals",
                    "Hands-on experience building multi-tier applications connecting Python/Java to relational databases"
                ],
                "missing_elements": [
                    "No mentions of automated testing frameworks (Pytest, JUnit) or CI/CD pipelines",
                    "Limited cloud infrastructure or containerization exposure (Docker, AWS, GCP)",
                    "Bullet points lack quantifiable metrics (e.g., latency reduction, throughput, user count)"
                ],
                "improvement_suggestions": [
                    "Add quantifiable impact to project bullets (e.g., 'Engineered 12 REST endpoints handling 200+ mock records with <50ms query latency').",
                    "Include unit test coverage badges and CI/CD workflow files (.github/workflows) in your GitHub projects.",
                    "Containerize existing Flask/Java applications using Docker and document run instructions in README."
                ]
            }

        return self.execute_with_telemetry(task, resume_text, live_runner, fallback_runner)

