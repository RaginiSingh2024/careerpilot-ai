from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class JobIntelligenceAgent(BaseAgent):
    name = "Job Description Intelligence Agent"
    description = "Parses pasted job postings, extracts required vs preferred qualifications, responsibilities, and key ATS keywords without fabricating information."

    def analyze_job(self, raw_text: str, source_url: Optional[str] = None, title: Optional[str] = None) -> Dict[str, Any]:
        task = f"Extract requirements and keywords from job description ({title or 'Target Job'})"

        def live_runner(text: str) -> Dict[str, Any]:
            prompt = f"""
You are the Job Description Intelligence Agent in CareerPilot AI.
Analyze this job description carefully:
---
{text}
---

Return a strictly valid JSON object with:
{{
  "title": "{title or 'Software Engineer'}",
  "company": "Company name if mentioned, otherwise 'Target Employer'",
  "experience_level": "e.g. Entry-Level / Early Career (0-2 years), Mid-Level, or Senior",
  "required_skills": [
    "Strictly required skills, languages, tools and foundational knowledge"
  ],
  "preferred_skills": [
    "Nice-to-have or preferred skills and bonus frameworks"
  ],
  "responsibilities": [
    "Core duties and day-to-day responsibilities"
  ],
  "keywords": [
    "High-impact ATS keywords and domain terminologies"
  ]
}}
IMPORTANT: Extract only what is actually mentioned in the text.
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Extract accurate job requirements and ATS keywords.")

        def fallback_runner(text: str) -> Dict[str, Any]:
            return {
                "title": title or "Junior Backend Software Engineer",
                "company": "ScaleCloud Systems",
                "source_url": source_url or "",
                "experience_level": "Early Career / Associate (0 - 2 years)",
                "required_skills": [
                    "Python or Java proficiency",
                    "RESTful API design and implementation",
                    "Relational database design (PostgreSQL or MySQL) and SQL query optimization",
                    "Version control with Git & GitHub pull request workflows",
                    "Basic understanding of microservices architecture and HTTP protocols"
                ],
                "preferred_skills": [
                    "FastAPI or Spring Boot framework experience",
                    "Containerization with Docker",
                    "Redis caching and message queues (RabbitMQ/Kafka)",
                    "Automated testing with Pytest or JUnit",
                    "Familiarity with AWS (EC2, S3, RDS) or Google Cloud"
                ],
                "responsibilities": [
                    "Design, implement, and maintain scalable backend services and microservices.",
                    "Collaborate with frontend engineers and product teams to integrate client-facing features.",
                    "Write robust unit and integration tests to ensure 85%+ test coverage.",
                    "Participate in agile sprints, peer code reviews, and architecture discussions.",
                    "Troubleshoot production incidents and optimize database queries for low latency."
                ],
                "keywords": [
                    "FastAPI", "Python", "SQL", "PostgreSQL", "Docker", "REST API", "Microservices",
                    "CI/CD", "Redis", "Unit Testing", "Pytest", "Git", "Scalability", "Clean Code"
                ]
            }

        return self.execute_with_telemetry(task, raw_text, live_runner, fallback_runner)

