from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class CareerRoadmapAgent(BaseAgent):
    name = "Career Roadmap Agent"
    description = "Generates personalized 4-week learning roadmaps tailored to the candidate's exact skill gaps, available study hours, and target role."

    def generate_roadmap(
        self,
        target_role: str,
        missing_skills: List[Dict[str, Any]],
        weekly_hours: int = 14,
        experience_level: str = "Student"
    ) -> Dict[str, Any]:
        task = f"Generate 4-week roadmap for '{target_role}' with {weekly_hours} hrs/week"

        def live_runner(inputs: Any) -> Dict[str, Any]:
            prompt = f"""
You are the Career Roadmap Agent in CareerPilot AI.
Create a structured 4-week learning roadmap for a candidate aiming to become: {target_role}.
Available study time: {weekly_hours} hours per week.
Current level: {experience_level}.
Missing/Partial Skills to bridge:
{missing_skills}

Generate a strictly valid JSON object structured as:
{{
  "title": "4-Week High-Impact {target_role} Sprint",
  "target_role": "{target_role}",
  "total_weeks": 4,
  "summary": "Clear executive overview of how this roadmap bridges the candidate's specific gaps.",
  "milestones": [
    {{"week_number": 1, "title": "Milestone title", "criteria": "Measurable output (e.g., Working Dockerized API)"}},
    {{"week_number": 2, "title": "Milestone title", "criteria": "Measurable output"}},
    {{"week_number": 3, "title": "Milestone title", "criteria": "Measurable output"}},
    {{"week_number": 4, "title": "Milestone title", "criteria": "Measurable output"}}
  ],
  "tasks": [
    {{
      "week_number": 1,
      "title": "Actionable task title",
      "description": "Concrete step-by-step guidance",
      "estimated_hours": 3,
      "priority": "High|Medium|Low",
      "resources": [
        {{"title": "Resource Name", "type": "docs|tutorial|interactive", "url": "Official docs or reputable link"}}
      ]
    }}
  ]
}}
Ensure exactly 3-4 actionable tasks per week totaling roughly {weekly_hours} hours per week.
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Create actionable, realistic 4-week developer career roadmaps.")

        def fallback_runner(inputs: Any) -> Dict[str, Any]:
            return {
                "title": f"4-Week Fast-Track {target_role} Roadmap",
                "target_role": target_role,
                "total_weeks": 4,
                "summary": f"Targeted 4-week intensive curriculum designed for {weekly_hours} hours/week. Focuses on bridging containerization (Docker), automated testing (Pytest), relational indexing, and real-world API development.",
                "milestones": [
                    {
                        "week_number": 1,
                        "title": "Modern Backend Architecture & Type Validation",
                        "criteria": "Build a production-grade FastAPI service with Pydantic validation schemas, error handlers, and clean router separation."
                    },
                    {
                        "week_number": 2,
                        "title": "Database Optimization & Automated Test Suites",
                        "criteria": "Achieve 85%+ test coverage using Pytest and write optimized SQL queries with indexes, transactions, and foreign key constraints."
                    },
                    {
                        "week_number": 3,
                        "title": "Containerization & Microservices Infrastructure",
                        "criteria": "Dockerize the backend API and database with Docker Compose, health checks, and multi-stage builds."
                    },
                    {
                        "week_number": 4,
                        "title": "Caching, Performance & Portfolio Deployment",
                        "criteria": "Integrate Redis caching, deploy to a cloud container platform, and publish complete API documentation with Swagger."
                    }
                ],
                "tasks": [
                    # Week 1
                    {
                        "week_number": 1,
                        "title": "Set up FastAPI with Pydantic v2 schemas and modular routing",
                        "description": "Establish a clean layered structure (api, services, models, core config) with environment variable management.",
                        "estimated_hours": 3,
                        "priority": "High",
                        "resources": [
                            {"title": "FastAPI Official Tutorial", "type": "docs", "url": "https://fastapi.tiangolo.com/tutorial/"}
                        ]
                    },
                    {
                        "week_number": 1,
                        "title": "Implement RESTful CRUD endpoints with HTTP status codes and pagination",
                        "description": "Enforce standard response models, proper HTTP 201/400/404/422 status codes, and query-based pagination (skip/limit).",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "HTTP Status Codes & REST Conventions", "type": "guide", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status"}
                        ]
                    },
                    {
                        "week_number": 1,
                        "title": "Integrate SQLAlchemy 2.0 with SQLite/PostgreSQL connection pooling",
                        "description": "Configure session management, database migrations with Alembic, and declarative base models.",
                        "estimated_hours": 4,
                        "priority": "Medium",
                        "resources": [
                            {"title": "SQLAlchemy 2.0 Unified Tutorial", "type": "docs", "url": "https://docs.sqlalchemy.org/en/20/tutorial/"}
                        ]
                    },
                    # Week 2
                    {
                        "week_number": 2,
                        "title": "Write comprehensive unit and integration tests with Pytest and TestClient",
                        "description": "Implement pytest fixtures for in-memory database test sessions, mocking external calls, and testing edge error cases.",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "Testing FastAPI with Pytest", "type": "docs", "url": "https://fastapi.tiangolo.com/tutorial/testing/"}
                        ]
                    },
                    {
                        "week_number": 2,
                        "title": "Database indexing and SQL query execution plan analysis",
                        "description": "Use EXPLAIN QUERY PLAN in SQL to identify full table scans, create composite indexes, and optimize query latency.",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "Use The Index, Luke (SQL Indexing Guide)", "type": "guide", "url": "https://use-the-index-luke.com/"}
                        ]
                    },
                    {
                        "week_number": 2,
                        "title": "Configure GitHub Actions CI workflow for automated linting & test runs",
                        "description": "Create .github/workflows/ci.yml to run Flake8/Black and Pytest automatically on every pull request.",
                        "estimated_hours": 3,
                        "priority": "Medium",
                        "resources": [
                            {"title": "GitHub Actions Python Workflow", "type": "docs", "url": "https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-python"}
                        ]
                    },
                    # Week 3
                    {
                        "week_number": 3,
                        "title": "Author production-grade Dockerfile with multi-stage build",
                        "description": "Minimize image size using python:3.11-slim, create a non-root execution user, and set up healthcheck directives.",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "Docker Best Practices for Python", "type": "docs", "url": "https://docs.docker.com/language/python/build-images/"}
                        ]
                    },
                    {
                        "week_number": 3,
                        "title": "Orchestrate multi-container backend stack with Docker Compose",
                        "description": "Link FastAPI, PostgreSQL, and Redis containers with persistent named volumes and environment secrets.",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "Docker Compose Networking & Volumes", "type": "docs", "url": "https://docs.docker.com/compose/"}
                        ]
                    },
                    {
                        "week_number": 3,
                        "title": "Implement rate limiting and secure CORS middleware",
                        "description": "Protect API endpoints against brute force with IP/Token based rate limiting and verify origin whitelisting.",
                        "estimated_hours": 3,
                        "priority": "Medium",
                        "resources": [
                            {"title": "FastAPI Middleware & Security", "type": "docs", "url": "https://fastapi.tiangolo.com/tutorial/cors/"}
                        ]
                    },
                    # Week 4
                    {
                        "week_number": 4,
                        "title": "Implement Redis caching layer for read-heavy API queries",
                        "description": "Cache frequent database responses with TTL expiration and implement cache invalidation on write mutations.",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "Redis Python Client Guide", "type": "docs", "url": "https://redis.io/docs/latest/develop/connect/clients/python/"}
                        ]
                    },
                    {
                        "week_number": 4,
                        "title": "Deploy API service to Render / Railway / Fly.io with public HTTPS URL",
                        "description": "Set up production cloud environment variables, verify live database connection, and test remote latency.",
                        "estimated_hours": 4,
                        "priority": "High",
                        "resources": [
                            {"title": "FastAPI Deployment Guide", "type": "docs", "url": "https://fastapi.tiangolo.com/deployment/"}
                        ]
                    },
                    {
                        "week_number": 4,
                        "title": "Polish project README with architecture diagram, API documentation, and test badges",
                        "description": "Create a professional GitHub showcase with setup commands, architectural flow diagram, and live demo link.",
                        "estimated_hours": 3,
                        "priority": "Medium",
                        "resources": [
                            {"title": "Standard Readme Best Practices", "type": "guide", "url": "https://github.com/matiassingers/awesome-readme"}
                        ]
                    }
                ]
            }

        return self.execute_with_telemetry(task, missing_skills, live_runner, fallback_runner)

