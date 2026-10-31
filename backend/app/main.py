import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
import app.models  # Ensures all models are registered with Base

from app.api.routes.health import router as health_router
from app.api.routes.career import router as career_router
from app.api.routes.resume import router as resume_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.skill_gaps import router as skill_gaps_router
from app.api.routes.roadmap import router as roadmap_router
from app.api.routes.projects import router as projects_router
from app.api.routes.interviews import router as interviews_router
from app.api.routes.applications import router as applications_router
from app.api.routes.agents import router as agents_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.settings import router as settings_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("careerpilot")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CareerPilot database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info(f"CareerPilot AI started. Demo Mode: {settings.is_demo_mode}")
    yield
    logger.info("Shutting down CareerPilot AI...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Your Skills. Your Direction. Your Next Opportunity. Voice-first agentic AI career platform.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(career_router, prefix="/api/career", tags=["Career Profile"])
app.include_router(resume_router, prefix="/api/resume", tags=["Resume Intelligence"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["Job Description Intelligence"])
app.include_router(skill_gaps_router, prefix="/api/skill-gaps", tags=["Skill Gap Analysis"])
app.include_router(roadmap_router, prefix="/api/roadmap", tags=["Adaptive Roadmap"])
app.include_router(projects_router, prefix="/api/projects", tags=["Portfolio Projects"])
app.include_router(interviews_router, prefix="/api/interviews", tags=["Mock Interviews"])
app.include_router(applications_router, prefix="/api/applications", tags=["Application Tracker"])
app.include_router(agents_router, prefix="/api/agents", tags=["AI Agent Activity"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics & Overview"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings & Privacy"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

