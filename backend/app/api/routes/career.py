from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.models.career import CareerProfile
from app.schemas.career import CareerProfileCreate, CareerProfileResponse, VoiceGoalInput
from app.agents.career_agent import CareerProfileAgent

router = APIRouter()

@router.post("/profile", response_model=CareerProfileResponse)
def create_or_update_profile(profile_in: CareerProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    if not profile:
        profile = CareerProfile(**profile_in.model_dump())
        db.add(profile)
    else:
        for k, v in profile_in.model_dump().items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/profile", response_model=CareerProfileResponse)
def get_career_profile(db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No career profile found. Complete onboarding first.")
    return profile

@router.post("/voice-parse")
def parse_voice_goal(goal_in: VoiceGoalInput, db: Session = Depends(get_db)):
    agent = CareerProfileAgent(db)
    result = agent.process_goal_input(goal_in.text)
    return result

@router.post("/load-sample", response_model=CareerProfileResponse)
def load_sample_profile(db: Session = Depends(get_db)):
    """Loads realistic, clearly labelled CS Student demo profile."""
    sample_skills = [
        {"name": "Python", "category": "Programming", "proficiency": "Intermediate", "verified": True, "source": "resume-extracted"},
        {"name": "Java", "category": "Programming", "proficiency": "Intermediate", "verified": True, "source": "resume-extracted"},
        {"name": "SQL", "category": "Database", "proficiency": "Intermediate", "verified": True, "source": "resume-extracted"},
        {"name": "Git", "category": "Tools", "proficiency": "Intermediate", "verified": True, "source": "resume-extracted"},
        {"name": "REST APIs", "category": "Backend", "proficiency": "Beginner", "verified": False, "source": "self-reported"},
        {"name": "Web Development", "category": "Frontend", "proficiency": "Beginner", "verified": False, "source": "self-reported"}
    ]

    profile = db.query(CareerProfile).first()
    if not profile:
        profile = CareerProfile(
            name="Alex Chen",
            email="alex.chen@university.edu",
            education="B.S. in Computer Science (Junior/Senior)",
            current_stage="University Student",
            target_role="Backend Software Engineer",
            current_skills=sample_skills,
            experience="Undergraduate Teaching Assistant in CS. Built course project REST APIs.",
            preferred_schedule="Daily (approx 2 hrs/day)",
            weekly_hours=14,
            career_goals="I want to bridge my academic CS foundation into production backend engineering, master Docker and Pytest, and secure a software engineering role.",
            raw_voice_transcript="I am a computer science student. I know Python, Java, SQL and basic web development. I want to become a backend software engineer or AI engineer. I can study around two hours every day. Help me understand my skill gaps and create a practical learning roadmap."
        )
        db.add(profile)
    else:
        profile.name = "Alex Chen"
        profile.email = "alex.chen@university.edu"
        profile.education = "B.S. in Computer Science (Junior/Senior)"
        profile.current_stage = "University Student"
        profile.target_role = "Backend Software Engineer"
        profile.current_skills = sample_skills
        profile.experience = "Undergraduate Teaching Assistant in CS. Built course project REST APIs."
        profile.preferred_schedule = "Daily (approx 2 hrs/day)"
        profile.weekly_hours = 14
        profile.career_goals = "I want to bridge my academic CS foundation into production backend engineering, master Docker and Pytest, and secure a software engineering role."
        profile.raw_voice_transcript = "I am a computer science student. I know Python, Java, SQL and basic web development. I want to become a backend software engineer or AI engineer. I can study around two hours every day. Help me understand my skill gaps and create a practical learning roadmap."
    db.commit()
    db.refresh(profile)
    return profile
