from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.career import CareerProfile
from app.models.skill_gap import SkillGapAnalysis
from app.models.portfolio import PortfolioProject
from app.schemas.portfolio import PortfolioProjectResponse, RecommendProjectsRequest
from app.agents.portfolio_agent import PortfolioProjectAgent

router = APIRouter()

@router.get("", response_model=List[PortfolioProjectResponse])
def get_portfolio_projects(db: Session = Depends(get_db)):
    projects = db.query(PortfolioProject).all()
    return projects

@router.post("/recommend", response_model=List[PortfolioProjectResponse])
def recommend_projects(req: RecommendProjectsRequest, db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    gap = db.query(SkillGapAnalysis).first()

    target_role = req.target_role or (profile.target_role if profile else "Backend Software Engineer")
    missing_skills = []
    if gap:
        missing_skills = (gap.missing_skills or []) + (gap.partial_matches or [])

    agent = PortfolioProjectAgent(db)
    results = agent.recommend_projects(
        target_role=target_role,
        missing_skills=missing_skills,
        count=req.count or 3
    )

    saved_titles = [p.title for p in db.query(PortfolioProject).filter(PortfolioProject.is_saved == True).all()]
    
    # Add new recommendations if not already present
    for p in results:
        existing = db.query(PortfolioProject).filter(PortfolioProject.title == p.get("title")).first()
        if not existing:
            new_p = PortfolioProject(
                title=p.get("title", "Project"),
                problem_statement=p.get("problem_statement", ""),
                why_it_matters=p.get("why_it_matters", ""),
                skills_covered=p.get("skills_covered", []),
                tech_stack=p.get("tech_stack", []),
                suggested_features=p.get("suggested_features", []),
                deliverables=p.get("deliverables", []),
                difficulty=p.get("difficulty", "Intermediate"),
                expected_outcome=p.get("expected_outcome", ""),
                mapped_job_requirements=p.get("mapped_job_requirements", []),
                is_saved=p.get("title") in saved_titles
            )
            db.add(new_p)
    db.commit()

    return db.query(PortfolioProject).all()

@router.post("/{project_id}/save", response_model=PortfolioProjectResponse)
def toggle_save_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(PortfolioProject).filter(PortfolioProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Portfolio project not found.")

    project.is_saved = not project.is_saved
    db.commit()
    db.refresh(project)
    return project

