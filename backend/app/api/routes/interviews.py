from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.career import CareerProfile
from app.models.interview import InterviewSession, InterviewQA
from app.schemas.interview import (
    StartInterviewRequest,
    EvaluateAnswerRequest,
    InterviewSessionResponse,
    InterviewQAResponse
)
from app.agents.interview_agent import MockInterviewAgent

router = APIRouter()

@router.post("/start", response_model=InterviewSessionResponse)
def start_interview_session(req: StartInterviewRequest, db: Session = Depends(get_db)):
    profile = db.query(CareerProfile).first()
    target_role = req.target_role or (profile.target_role if profile else "Backend Software Engineer")
    topic = req.topic or "System Design & APIs"

    agent = MockInterviewAgent(db)
    questions = agent.generate_questions(
        target_role=target_role,
        topic=topic,
        num_questions=req.num_questions or 3
    )

    session = InterviewSession(
        target_role=target_role,
        topic=topic,
        overall_score=0.0
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    for q in questions:
        qa = InterviewQA(
            session_id=session.id,
            question=q.get("question", "Question"),
            category=q.get("category", topic),
            difficulty=q.get("difficulty", "Medium"),
            rubric=q.get("rubric", {
                "correctness": 25,
                "clarity": 25,
                "technical_depth": 25,
                "problem_solving": 25
            })
        )
        db.add(qa)
    db.commit()
    db.refresh(session)
    return session

@router.post("/evaluate", response_model=InterviewQAResponse)
def evaluate_interview_answer(req: EvaluateAnswerRequest, db: Session = Depends(get_db)):
    qa = db.query(InterviewQA).filter(InterviewQA.id == req.qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="Interview question not found.")

    agent = MockInterviewAgent(db)
    evaluation = agent.evaluate_answer(
        question=qa.question,
        user_answer=req.user_answer,
        rubric=qa.rubric
    )

    qa.user_answer = req.user_answer
    qa.score = evaluation.get("total_score", 75.0)
    qa.correctness_score = evaluation.get("correctness_score", 20.0)
    qa.clarity_score = evaluation.get("clarity_score", 20.0)
    qa.technical_depth_score = evaluation.get("technical_depth_score", 18.0)
    qa.problem_solving_score = evaluation.get("problem_solving_score", 17.0)
    qa.feedback = evaluation.get("feedback", "")
    qa.strengths = evaluation.get("strengths", [])
    qa.gaps = evaluation.get("gaps", [])
    qa.suggested_improved_answer = evaluation.get("suggested_improved_answer", "")

    # Recalculate session overall score
    session = db.query(InterviewSession).filter(InterviewSession.id == qa.session_id).first()
    if session:
        all_qas = db.query(InterviewQA).filter(InterviewQA.session_id == session.id).all()
        scored = [item.score for item in all_qas if item.score is not None]
        if scored:
            session.overall_score = round(sum(scored) / len(scored), 1)

    db.commit()
    db.refresh(qa)
    return qa

@router.get("/history", response_model=List[InterviewSessionResponse])
def get_interview_history(db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).all()
    return sessions

