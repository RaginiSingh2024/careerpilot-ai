from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.career import CareerProfile
from app.models.resume import ResumeAnalysis, JobDescription
from app.models.skill_gap import SkillGapAnalysis
from app.models.roadmap import LearningRoadmap, RoadmapTask, RoadmapMilestone
from app.models.portfolio import PortfolioProject
from app.models.interview import InterviewSession, InterviewQA
from app.models.application import JobApplication
from app.core.config import settings

class AnalyticsService:
    @staticmethod
    def get_overview_data(db: Session) -> Dict[str, Any]:
        profile = db.query(CareerProfile).first()
        resume = db.query(ResumeAnalysis).first()
        job = db.query(JobDescription).first()
        gap = db.query(SkillGapAnalysis).first()
        roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.is_active == True).first()
        applications = db.query(JobApplication).all()
        interviews = db.query(InterviewSession).all()
        portfolio_projects = db.query(PortfolioProject).all()

        if not profile and not resume and not gap:
            return {
                "has_profile": False,
                "target_role": None,
                "readiness_score": 0.0,
                "readiness_formula_explanation": "Complete profile intake or resume analysis to generate your baseline career readiness score.",
                "skills_count": 0,
                "strong_skills_count": 0,
                "missing_skills_count": 0,
                "partial_skills_count": 0,
                "total_roadmap_tasks": 0,
                "completed_roadmap_tasks": 0,
                "roadmap_progress_pct": 0.0,
                "upcoming_tasks": [],
                "milestones": [],
                "portfolio_projects_count": 0,
                "saved_projects_count": 0,
                "interviews_conducted": 0,
                "avg_interview_score": 0.0,
                "total_applications": 0,
                "applications_by_status": {},
                "response_rate_pct": 0.0,
                "interview_rate_pct": 0.0,
                "recommended_next_action": {
                    "action": "start_onboarding",
                    "title": "Welcome! Set Up Your Career Goal",
                    "description": "Speak or type your current background and target role to launch the specialized career agent team.",
                    "route": "/profile"
                },
                "is_demo_mode": settings.is_demo_mode
            }

        # Calculate Roadmap Tasks
        tasks = []
        milestones = []
        total_tasks = 0
        completed_tasks = 0
        roadmap_pct = 0.0

        if roadmap:
            tasks = db.query(RoadmapTask).filter(RoadmapTask.roadmap_id == roadmap.id).all()
            milestones = db.query(RoadmapMilestone).filter(RoadmapMilestone.roadmap_id == roadmap.id).all()
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.is_completed])
            if total_tasks > 0:
                roadmap_pct = round((completed_tasks / total_tasks) * 100, 1)

        # Calculate Interviews
        interview_count = len(interviews)
        avg_score = 0.0
        if interview_count > 0:
            scores = [i.overall_score for i in interviews if i.overall_score > 0]
            if scores:
                avg_score = round(sum(scores) / len(scores), 1)

        # Calculate Applications
        total_apps = len(applications)
        app_status_counts = {}
        for app in applications:
            app_status_counts[app.status] = app_status_counts.get(app.status, 0) + 1

        responsive_count = sum(app_status_counts.get(s, 0) for s in ["Assessment", "Interview", "Offer"])
        interview_stage_count = sum(app_status_counts.get(s, 0) for s in ["Interview", "Offer"])

        resp_rate = round((responsive_count / total_apps) * 100, 1) if total_apps > 0 else 0.0
        intv_rate = round((interview_stage_count / total_apps) * 100, 1) if total_apps > 0 else 0.0

        # Skill metrics
        strong_count = len(gap.strong_matches) if gap and gap.strong_matches else 0
        partial_count = len(gap.partial_matches) if gap and gap.partial_matches else 0
        missing_count = len(gap.missing_skills) if gap and gap.missing_skills else 0
        unverified_count = len(gap.unverified_skills) if gap and gap.unverified_skills else 0
        total_evaluated = strong_count + partial_count + missing_count

        # Transparent Career Readiness Formula
        # Baseline skill score (up to 70 pts)
        base_skill_pts = 0.0
        if total_evaluated > 0:
            base_skill_pts = ((strong_count * 1.0) + (partial_count * 0.5)) / total_evaluated * 70.0
        # Roadmap task completion (up to 15 pts)
        roadmap_pts = (roadmap_pct / 100.0) * 15.0
        # Interview practice (up to 15 pts)
        interview_pts = (avg_score / 100.0) * 15.0 if avg_score > 0 else (5.0 if interview_count > 0 else 0.0)
        
        calculated_readiness = round(base_skill_pts + roadmap_pts + interview_pts, 1)
        if gap and gap.readiness_score > 0 and calculated_readiness == 0:
            calculated_readiness = gap.readiness_score

        formula_text = (
            f"Readiness ({calculated_readiness}%) = Skills Match ({base_skill_pts:.1f}/70 pts) + "
            f"Roadmap Progress ({roadmap_pts:.1f}/15 pts) + "
            f"Interview Performance ({interview_pts:.1f}/15 pts)"
        )

        # Identify upcoming incomplete tasks
        upcoming = []
        if roadmap:
            incomplete = [t for t in tasks if not t.is_completed]
            for t in incomplete[:4]:
                upcoming.append({
                    "id": t.id,
                    "week_number": t.week_number,
                    "title": t.title,
                    "estimated_hours": t.estimated_hours,
                    "priority": t.priority
                })

        milestone_data = []
        for m in milestones:
            milestone_data.append({
                "id": m.id,
                "week_number": m.week_number,
                "title": m.title,
                "criteria": m.criteria,
                "is_achieved": m.is_achieved
            })

        # Next recommended action logic
        next_action = {
            "action": "view_roadmap",
            "title": "Continue Week 1 Roadmap Tasks",
            "description": "Complete your current backend sprint tasks to advance your readiness score.",
            "route": "/roadmap"
        }
        if not resume:
            next_action = {
                "action": "analyze_resume",
                "title": "Upload or Paste Resume",
                "description": "Let the Resume Intelligence Agent extract verifiable skills and generate ATS suggestions.",
                "route": "/resume"
            }
        elif not gap:
            next_action = {
                "action": "analyze_skill_gaps",
                "title": "Run Skill Gap Intelligence",
                "description": "Compare your extracted skills against live job descriptions to expose missing competencies.",
                "route": "/skill-gaps"
            }
        elif interview_count == 0:
            next_action = {
                "action": "practice_interview",
                "title": "Take a Mock Technical Interview",
                "description": "Test your API and database design fundamentals against our rubric-based Mock Interview Agent.",
                "route": "/interviews"
            }

        return {
            "has_profile": True,
            "target_role": profile.target_role if profile else "Software Engineer",
            "readiness_score": calculated_readiness,
            "readiness_formula_explanation": formula_text,
            "skills_count": len(profile.current_skills) if profile and profile.current_skills else strong_count,
            "strong_skills_count": strong_count,
            "missing_skills_count": missing_count,
            "partial_skills_count": partial_count,
            "total_roadmap_tasks": total_tasks,
            "completed_roadmap_tasks": completed_tasks,
            "roadmap_progress_pct": roadmap_pct,
            "upcoming_tasks": upcoming,
            "milestones": milestone_data,
            "portfolio_projects_count": len(portfolio_projects),
            "saved_projects_count": len([p for p in portfolio_projects if p.is_saved]),
            "interviews_conducted": interview_count,
            "avg_interview_score": avg_score,
            "total_applications": total_apps,
            "applications_by_status": app_status_counts,
            "response_rate_pct": resp_rate,
            "interview_rate_pct": intv_rate,
            "recommended_next_action": next_action,
            "is_demo_mode": settings.is_demo_mode
        }

analytics_service = AnalyticsService()

