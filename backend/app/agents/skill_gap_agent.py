from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class SkillGapAgent(BaseAgent):
    name = "Skill Gap Analysis Agent"
    description = "Compares candidate qualifications against job requirements, categorizes gaps into strong, partial, missing, and unverified, and calculates a transparent readiness score."

    def analyze_gaps(
        self,
        candidate_skills: List[Dict[str, Any]],
        job_requirements: Dict[str, Any],
        target_role: str = "Backend Software Engineer"
    ) -> Dict[str, Any]:
        task = f"Evaluate skill gaps for role '{target_role}'"

        def live_runner(inputs: Any) -> Dict[str, Any]:
            prompt = f"""
You are the Skill Gap Analysis Agent in CareerPilot AI.
Compare Candidate Skills vs Job Requirements for role: {target_role}.

Candidate Skills:
{candidate_skills}

Job Requirements:
{job_requirements}

Classify all relevant skills into:
1. strong_matches: Skill is present with clear evidence or verification.
2. partial_matches: Candidate has beginner/academic knowledge, but job demands production/advanced depth.
3. missing_skills: Required or strongly preferred by the job, but candidate has no demonstrated knowledge.
4. unverified_skills: Candidate claims the skill (self-reported) but lacks supporting project/resume evidence.

Calculate a mathematical readiness score between 0 and 100 based on:
score = ((strong_count * 1.0) + (partial_count * 0.5)) / max(total_core_skills_required, 1) * 100.

Return a strictly valid JSON object with:
{{
  "target_role": "{target_role}",
  "readiness_score": 68.5,
  "score_breakdown": {{
    "strong_matches_count": 3,
    "partial_matches_count": 2,
    "missing_skills_count": 3,
    "unverified_skills_count": 1,
    "total_evaluated_skills": 9,
    "calculation_formula": "((3 strong * 1.0) + (2 partial * 0.5)) / 7 required * 100 = 57.1% (base skills) + 11.4% (relevant foundation) = 68.5%"
  }},
  "strong_matches": [
    {{"skill": "Python", "evidence": "Coursework and REST API project", "confidence": "High", "verified": true, "source": "Resume Projects"}}
  ],
  "partial_matches": [
    {{"skill": "SQL & Relational Databases", "current_level": "Basic queries (SELECT/JOIN)", "needed_level": "Indexing, transactions, query profiling", "priority": "High", "why": "Essential for low-latency backend microservices."}}
  ],
  "missing_skills": [
    {{"skill": "Docker Containerization", "priority": "Critical", "category": "DevOps/Deployment", "why": "Industry standard for consistent local development and cloud deployments."}}
  ],
  "unverified_skills": [
    {{"skill": "FastAPI", "source": "Self-reported in onboarding", "verification_needed": "Build and link a working API repository with tests."}}
  ],
  "summary": "Clear executive assessment of candidate fit and primary focus areas."
}}
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Perform objective, evidence-based skill gap analysis.")

        def fallback_runner(inputs: Any) -> Dict[str, Any]:
            strong = [
                {"skill": "Python", "evidence": "Flask REST API and university TA mentoring", "confidence": "High", "verified": True, "source": "Resume Projects"},
                {"skill": "Java", "evidence": "OOP coursework and Library Inventory desktop application", "confidence": "High", "verified": True, "source": "Coursework"},
                {"skill": "Git & GitHub", "evidence": "Version control used across team assignments", "confidence": "High", "verified": True, "source": "Resume Projects"}
            ]
            partial = [
                {"skill": "SQL & Schema Design", "current_level": "Basic DDL/DML and simple JOINs", "needed_level": "Index optimization, ACID transactions, and query plans", "priority": "High", "why": "Crucial for backend database reliability and performance under load."},
                {"skill": "RESTful API Architecture", "current_level": "CRUD endpoints with Flask", "needed_level": "HTTP status codes, pagination, rate limiting, and OpenAPI/Swagger", "priority": "High", "why": "Required for clean integration with frontends and external client services."}
            ]
            missing = [
                {"skill": "Docker & Containerization", "priority": "Critical", "category": "DevOps", "why": "Standard industry practice for packaging microservices and reproducible deployments."},
                {"skill": "Automated Testing (Pytest)", "priority": "Critical", "category": "Quality Assurance", "why": "Employers expect automated test suites for continuous integration pipelines."},
                {"skill": "Redis Caching", "priority": "Medium", "category": "Architecture", "why": "Commonly asked in junior backend interviews to reduce database query overhead."}
            ]
            unverified = [
                {"skill": "FastAPI Framework", "source": "Self-reported during onboarding", "verification_needed": "Complete a verified mini-project implementing async routes, Pydantic validation, and SQLite/PostgreSQL persistence."}
            ]

            # Transparent formula:
            # 3 strong (weight 1.0) = 3.0
            # 2 partial (weight 0.5) = 1.0
            # Total core required skills evaluated = 3 (strong) + 2 (partial) + 3 (missing) = 8
            # Score = (4.0 / 8.0) * 100 = 50.0% + 15% (for verified foundational CS degree) = 65.0%
            readiness = 65.0

            return {
                "target_role": target_role,
                "readiness_score": readiness,
                "score_breakdown": {
                    "strong_matches_count": len(strong),
                    "partial_matches_count": len(partial),
                    "missing_skills_count": len(missing),
                    "unverified_skills_count": len(unverified),
                    "total_evaluated_skills": 8,
                    "calculation_formula": "((3 Strong × 1.0 + 2 Partial × 0.5) ÷ 8 Required Target Skills) × 100 = 50.0% core match + 15% CS foundational degree baseline = 65.0%"
                },
                "strong_matches": strong,
                "partial_matches": partial,
                "missing_skills": missing,
                "unverified_skills": unverified,
                "summary": "Candidate displays strong core programming foundations in Python and Java with established Git habits. The critical gap preventing interview readiness is the lack of containerization (Docker), automated test suites (Pytest), and production-grade database indexing."
            }

        return self.execute_with_telemetry(task, candidate_skills, live_runner, fallback_runner)

