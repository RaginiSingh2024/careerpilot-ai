from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class PortfolioProjectAgent(BaseAgent):
    name = "Portfolio Project Agent"
    description = "Designs resume-worthy software engineering projects specifically targeted at proving mastery over identified skill gaps."

    def recommend_projects(
        self,
        target_role: str,
        missing_skills: List[Dict[str, Any]],
        count: int = 3
    ) -> List[Dict[str, Any]]:
        task = f"Recommend {count} portfolio projects targeting missing skills for {target_role}"

        def live_runner(inputs: Any) -> Dict[str, Any]:
            prompt = f"""
You are the Portfolio Project Agent in CareerPilot AI.
Propose {count} standout, production-grade portfolio projects for a candidate targeting: {target_role}.
Identified skill gaps to prove:
{missing_skills}

Return a strictly valid JSON object with:
{{
  "projects": [
    {{
      "title": "Clear, compelling project name",
      "problem_statement": "Realistic engineering problem this application solves",
      "why_it_matters": "What this demonstrates to hiring managers and technical interviewers",
      "skills_covered": ["Docker", "Pytest", "FastAPI", "SQL Optimization"],
      "tech_stack": ["Python 3.11", "FastAPI", "PostgreSQL", "Docker", "Pytest", "Redis"],
      "suggested_features": [
        "Feature 1 with technical depth",
        "Feature 2 with technical depth",
        "Feature 3 with technical depth"
      ],
      "deliverables": [
        "Deliverable 1 (e.g. GitHub Repo with CI/CD)",
        "Deliverable 2 (e.g. Docker Compose file)",
        "Deliverable 3 (e.g. Live hosted Swagger docs)"
      ],
      "difficulty": "Intermediate",
      "expected_outcome": "Working microservice deployed with automated test suite",
      "mapped_job_requirements": ["RESTful API design", "Containerization", "Automated Testing"]
    }}
  ]
}}
"""
            res = gemini_service.generate_structured_json(prompt, system_instruction="Recommend realistic, high-signal engineering portfolio projects.")
            return res.get("projects", [])

        def fallback_runner(inputs: Any) -> List[Dict[str, Any]]:
            return [
                {
                    "title": "CloudPulse: Distributed API Health & Incident Telemetry Engine",
                    "problem_statement": "Microservice teams struggle with uncoordinated uptime monitoring and slow alerts when downstream third-party dependencies degrade.",
                    "why_it_matters": "Proves you can design resilient asynchronous backend architectures, handle periodic background tasks, and store time-series metrics with indexed database queries.",
                    "skills_covered": ["FastAPI", "Docker", "PostgreSQL", "SQL Optimization", "Pytest", "Background Tasks"],
                    "tech_stack": ["Python 3.11", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker Compose", "Pytest"],
                    "suggested_features": [
                        "Asynchronous health check polling workers checking remote HTTP endpoints every 30 seconds.",
                        "Incident event logging with database indexing on timestamps and status codes for fast aggregation.",
                        "Webhook alert dispatch system with exponential backoff retry on client failures.",
                        "Pytest suite with 88%+ coverage validating edge cases, connection timeouts, and authentication."
                    ],
                    "deliverables": [
                        "GitHub repository with GitHub Actions CI verifying test suites on every pull request.",
                        "Multi-container docker-compose.yml launching API service and PostgreSQL container with volume persistence.",
                        "Interactive Swagger / OpenAPI docs with live API demo hosted on cloud."
                    ],
                    "difficulty": "Intermediate",
                    "expected_outcome": "A production-grade telemetry API that immediately stands out on a resume over generic todo apps.",
                    "mapped_job_requirements": ["RESTful API design", "Relational database design", "Automated testing with Pytest", "Docker"]
                },
                {
                    "title": "FastCache URL Intelligence & Analytics Proxy",
                    "problem_statement": "High-volume redirect gateways experience database bottlenecks without an in-memory caching tier and rate limiting against web scrapers.",
                    "why_it_matters": "Demonstrates mastery of caching strategies (write-through/lazy loading), TTL invalidation, Redis connection pooling, and sub-10ms response latency under benchmark load.",
                    "skills_covered": ["Redis Caching", "FastAPI", "Rate Limiting", "SQL Indexing", "Performance Benchmarking"],
                    "tech_stack": ["Python", "FastAPI", "Redis", "SQLite/PostgreSQL", "Docker", "Locust (Load testing)"],
                    "suggested_features": [
                        "Redis-backed URL redirection delivering <5ms latency with fallback to relational database.",
                        "Sliding-window IP rate limiter preventing abuse (100 req/min/IP) using Redis sorted sets.",
                        "Analytics tracking (browser, referer, geographic region) queued and flushed asynchronously in batches.",
                        "Benchmarking script using Locust proving throughput exceeding 1,200 req/sec."
                    ],
                    "deliverables": [
                        "Production codebase with structured environment variable configuration (.env.example).",
                        "Performance benchmark report with graphs showing cache hit vs cache miss latency.",
                        "Dockerized deployment setup with Redis health check verification."
                    ],
                    "difficulty": "Intermediate",
                    "expected_outcome": "Concrete proof of your ability to optimize backend throughput and reason about distributed caching.",
                    "mapped_job_requirements": ["Redis caching", "Microservices architecture", "Performance optimization"]
                },
                {
                    "title": "AuthGuard: Enterprise Role-Based Access Control (RBAC) Microservice",
                    "problem_statement": "Modern engineering teams need standardized, tamper-proof user authentication and granular permission management across multiple internal services.",
                    "why_it_matters": "Security and authentication are core requirements in every serious backend job description. Shows you understand JWT signing, password hashing, and role-based middleware.",
                    "skills_covered": ["JWT Authentication", "Bcrypt Hashing", "Security Best Practices", "Pytest", "FastAPI Middleware"],
                    "tech_stack": ["FastAPI", "PyJWT", "Passlib/Bcrypt", "PostgreSQL", "Pytest", "Docker"],
                    "suggested_features": [
                        "Secure signup and login issuing cryptographically signed RS256 JWT access and refresh tokens.",
                        "Declarative role & permission middleware protecting routes based on scopes (e.g., admin:write, user:read).",
                        "Audit log recording all authentication attempts, privilege escalations, and revocations.",
                        "Comprehensive security test suite verifying token expiry, replay attacks, and invalid signature rejections."
                    ],
                    "deliverables": [
                        "Reusable Python client library / middleware package for internal service communication.",
                        "Automated test suite achieving 92%+ coverage of security-critical code paths.",
                        "Postman / Bruno collection demonstrating token rotation and role enforcement."
                    ],
                    "difficulty": "Advanced",
                    "expected_outcome": "A security-first backend service that gives interviewers immense confidence in your production readiness.",
                    "mapped_job_requirements": ["Security best practices", "RESTful API design", "Automated testing", "Clean Code"]
                }
            ]

        res = self.execute_with_telemetry(task, missing_skills, live_runner, fallback_runner)
        return res if isinstance(res, list) else res.get("projects", [])

