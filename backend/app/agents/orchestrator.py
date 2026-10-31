import time
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.career import CareerProfile
from app.models.resume import ResumeAnalysis, JobDescription
from app.models.skill_gap import SkillGapAnalysis
from app.models.roadmap import LearningRoadmap, RoadmapTask, RoadmapMilestone
from app.models.portfolio import PortfolioProject
from app.models.agent_activity import AgentExecutionLog

from app.agents.career_agent import CareerProfileAgent
from app.agents.resume_agent import ResumeIntelligenceAgent
from app.agents.job_agent import JobIntelligenceAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.roadmap_agent import CareerRoadmapAgent
from app.agents.portfolio_agent import PortfolioProjectAgent
from app.agents.progress_agent import ProgressApplicationAgent

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.career_agent = CareerProfileAgent(db)
        self.resume_agent = ResumeIntelligenceAgent(db)
        self.job_agent = JobIntelligenceAgent(db)
        self.skill_gap_agent = SkillGapAgent(db)
        self.roadmap_agent = CareerRoadmapAgent(db)
        self.portfolio_agent = PortfolioProjectAgent(db)
        self.progress_agent = ProgressApplicationAgent(db)

    def run_full_pipeline(
        self,
        voice_or_goal_text: Optional[str] = None,
        resume_text: Optional[str] = None,
        job_text: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Coordinates full multi-agent pipeline:
        Profile Agent -> Resume Agent -> Job Agent -> Skill Gap Agent -> Roadmap Agent -> Portfolio Agent
        """
        start_time = time.time()
        executed_agents = []
        logs_created = []

        try:
            # 1. Step 1: Career Profile Agent
            profile_input = voice_or_goal_text or (
                "I am a computer science student. I know Python, Java, SQL and basic web development. "
                "I want to become a backend software engineer or AI engineer. I can study around two hours every day. "
                "Help me understand my skill gaps and create a practical learning roadmap."
            )
            profile_data = self.career_agent.process_goal_input(profile_input)
            executed_agents.append(self.career_agent.name)
            
            # Persist profile
            chosen_role = target_role or profile_data.get("target_role", "Backend Software Engineer")
            profile = self.db.query(CareerProfile).first()
            if not profile:
                profile = CareerProfile(
                    name=profile_data.get("name", "Aspiring Engineer"),
                    education=profile_data.get("education", "Undergraduate"),
                    current_stage=profile_data.get("current_stage", "Student"),
                    target_role=chosen_role,
                    current_skills=profile_data.get("skills", []),
                    weekly_hours=profile_data.get("weekly_hours", 14),
                    preferred_schedule=profile_data.get("preferred_schedule", "Daily"),
                    career_goals=profile_data.get("career_goals_summary", profile_input),
                    raw_voice_transcript=voice_or_goal_text
                )
                self.db.add(profile)
            else:
                profile.target_role = chosen_role
                profile.current_skills = profile_data.get("skills", profile.current_skills)
                profile.weekly_hours = profile_data.get("weekly_hours", profile.weekly_hours)
                profile.career_goals = profile_data.get("career_goals_summary", profile.career_goals)
                if voice_or_goal_text:
                    profile.raw_voice_transcript = voice_or_goal_text
            self.db.commit()
            self.db.refresh(profile)

            # 2. Step 2: Resume Intelligence Agent
            res_text = resume_text or (
                "Alex Chen\n"
                "State University - B.S. in Computer Science (Expected 2025)\n"
                "Relevant Coursework: Data Structures, Algorithms, Database Systems, Computer Networks\n"
                "Technical Skills: Python, Java, SQL, Git, REST APIs, HTML/CSS\n"
                "Experience: Undergraduate TA - mentored 45+ students in Python & data structures\n"
                "Projects:\n"
                "- Student Task Tracker: Built REST API using Flask and SQLite\n"
                "- Library Inventory System: Java desktop app with JDBC and SQL"
            )
            resume_data = self.resume_agent.analyze_resume(res_text, target_role=chosen_role)
            executed_agents.append(self.resume_agent.name)

            # Persist resume analysis
            res_analysis = self.db.query(ResumeAnalysis).first()
            if not res_analysis:
                res_analysis = ResumeAnalysis(
                    filename="resume.txt",
                    parsed_text=res_text,
                    skills=resume_data.get("extracted_skills", []),
                    education=resume_data.get("education", []),
                    experience_highlights=resume_data.get("experience_highlights", []),
                    strengths=resume_data.get("strengths", []),
                    missing_elements=resume_data.get("missing_elements", []),
                    improvement_suggestions=resume_data.get("improvement_suggestions", [])
                )
                self.db.add(res_analysis)
            else:
                res_analysis.parsed_text = res_text
                res_analysis.skills = resume_data.get("extracted_skills", [])
                res_analysis.strengths = resume_data.get("strengths", [])
                res_analysis.missing_elements = resume_data.get("missing_elements", [])
                res_analysis.improvement_suggestions = resume_data.get("improvement_suggestions", [])
            self.db.commit()

            # 3. Step 3: Job Intelligence Agent
            j_text = job_text or (
                "ScaleCloud Systems is seeking an Early-Career Backend Software Engineer.\n"
                "Requirements:\n"
                "- Proficiency in Python or Java\n"
                "- Practical experience with REST APIs and relational databases (PostgreSQL/MySQL)\n"
                "- Solid understanding of Git workflows\n"
                "Preferred:\n"
                "- Containerization with Docker and Docker Compose\n"
                "- Automated testing with Pytest\n"
                "- Redis caching experience"
            )
            job_data = self.job_agent.analyze_job(j_text, title=chosen_role)
            executed_agents.append(self.job_agent.name)

            # Persist job description
            job_desc = self.db.query(JobDescription).first()
            if not job_desc:
                job_desc = JobDescription(
                    title=job_data.get("title", chosen_role),
                    company=job_data.get("company", "ScaleCloud Systems"),
                    source_url=job_data.get("source_url", ""),
                    raw_text=j_text,
                    required_skills=job_data.get("required_skills", []),
                    preferred_skills=job_data.get("preferred_skills", []),
                    responsibilities=job_data.get("responsibilities", []),
                    experience_level=job_data.get("experience_level", "Entry-Level"),
                    keywords=job_data.get("keywords", [])
                )
                self.db.add(job_desc)
            else:
                job_desc.title = job_data.get("title", chosen_role)
                job_desc.required_skills = job_data.get("required_skills", [])
                job_desc.preferred_skills = job_data.get("preferred_skills", [])
                job_desc.keywords = job_data.get("keywords", [])
            self.db.commit()

            # 4. Step 4: Skill Gap Agent
            candidate_skills = resume_data.get("extracted_skills", profile.current_skills or [])
            skill_gap_data = self.skill_gap_agent.analyze_gaps(
                candidate_skills=candidate_skills,
                job_requirements=job_data,
                target_role=chosen_role
            )
            executed_agents.append(self.skill_gap_agent.name)

            # Persist skill gap
            gap_record = self.db.query(SkillGapAnalysis).first()
            if not gap_record:
                gap_record = SkillGapAnalysis(
                    target_role=chosen_role,
                    readiness_score=skill_gap_data.get("readiness_score", 65.0),
                    score_breakdown=skill_gap_data.get("score_breakdown", {}),
                    strong_matches=skill_gap_data.get("strong_matches", []),
                    partial_matches=skill_gap_data.get("partial_matches", []),
                    missing_skills=skill_gap_data.get("missing_skills", []),
                    unverified_skills=skill_gap_data.get("unverified_skills", []),
                    summary=skill_gap_data.get("summary", "")
                )
                self.db.add(gap_record)
            else:
                gap_record.target_role = chosen_role
                gap_record.readiness_score = skill_gap_data.get("readiness_score", 65.0)
                gap_record.score_breakdown = skill_gap_data.get("score_breakdown", {})
                gap_record.strong_matches = skill_gap_data.get("strong_matches", [])
                gap_record.partial_matches = skill_gap_data.get("partial_matches", [])
                gap_record.missing_skills = skill_gap_data.get("missing_skills", [])
                gap_record.unverified_skills = skill_gap_data.get("unverified_skills", [])
                gap_record.summary = skill_gap_data.get("summary", "")
            self.db.commit()

            # 5. Step 5: Career Roadmap Agent
            missing_skills = skill_gap_data.get("missing_skills", []) + skill_gap_data.get("partial_matches", [])
            roadmap_data = self.roadmap_agent.generate_roadmap(
                target_role=chosen_role,
                missing_skills=missing_skills,
                weekly_hours=profile.weekly_hours or 14,
                experience_level=profile.current_stage or "Student"
            )
            executed_agents.append(self.roadmap_agent.name)

            # Persist roadmap
            existing_roadmap = self.db.query(LearningRoadmap).filter(LearningRoadmap.is_active == True).first()
            if existing_roadmap:
                self.db.delete(existing_roadmap)
                self.db.commit()

            new_roadmap = LearningRoadmap(
                title=roadmap_data.get("title", f"4-Week {chosen_role} Sprint"),
                target_role=chosen_role,
                total_weeks=4,
                summary=roadmap_data.get("summary", ""),
                is_active=True
            )
            self.db.add(new_roadmap)
            self.db.commit()
            self.db.refresh(new_roadmap)

            for m in roadmap_data.get("milestones", []):
                ms = RoadmapMilestone(
                    roadmap_id=new_roadmap.id,
                    week_number=m.get("week_number", 1),
                    title=m.get("title", "Milestone"),
                    criteria=m.get("criteria", ""),
                    is_achieved=False
                )
                self.db.add(ms)

            for t in roadmap_data.get("tasks", []):
                task_item = RoadmapTask(
                    roadmap_id=new_roadmap.id,
                    week_number=t.get("week_number", 1),
                    title=t.get("title", "Task"),
                    description=t.get("description", ""),
                    estimated_hours=t.get("estimated_hours", 2),
                    priority=t.get("priority", "Medium"),
                    is_completed=False,
                    resources=t.get("resources", [])
                )
                self.db.add(task_item)
            self.db.commit()

            # 6. Step 6: Portfolio Project Agent
            portfolio_projects = self.portfolio_agent.recommend_projects(
                target_role=chosen_role,
                missing_skills=missing_skills,
                count=3
            )
            executed_agents.append(self.portfolio_agent.name)

            # Persist portfolio projects (clear existing non-saved or populate)
            existing_saved_ids = [p.title for p in self.db.query(PortfolioProject).filter(PortfolioProject.is_saved == True).all()]
            for p_dict in portfolio_projects:
                if p_dict.get("title") not in existing_saved_ids:
                    # check if already exists
                    existing = self.db.query(PortfolioProject).filter(PortfolioProject.title == p_dict.get("title")).first()
                    if not existing:
                        proj = PortfolioProject(
                            title=p_dict.get("title", "Portfolio Project"),
                            problem_statement=p_dict.get("problem_statement", ""),
                            why_it_matters=p_dict.get("why_it_matters", ""),
                            skills_covered=p_dict.get("skills_covered", []),
                            tech_stack=p_dict.get("tech_stack", []),
                            suggested_features=p_dict.get("suggested_features", []),
                            deliverables=p_dict.get("deliverables", []),
                            difficulty=p_dict.get("difficulty", "Intermediate"),
                            expected_outcome=p_dict.get("expected_outcome", ""),
                            mapped_job_requirements=p_dict.get("mapped_job_requirements", []),
                            is_saved=False
                        )
                        self.db.add(proj)
            self.db.commit()

            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "status": "success",
                "executed_agents": executed_agents,
                "duration_ms": duration_ms,
                "message": f"Multi-agent orchestrator executed {len(executed_agents)} specialized career agents successfully.",
                "profile_id": profile.id,
                "roadmap_id": new_roadmap.id,
                "readiness_score": gap_record.readiness_score
            }
        except Exception as e:
            logger.error(f"Agent pipeline orchestration failed: {e}", exc_info=True)
            self.db.rollback()
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "status": "failed",
                "executed_agents": executed_agents,
                "duration_ms": duration_ms,
                "message": f"Orchestrator failed during execution: {str(e)}"
            }

