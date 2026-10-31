from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.resume import ResumeAnalysis
from app.models.career import CareerProfile
from app.schemas.resume import ResumeAnalyzeRequest, ResumeAnalysisResponse
from app.agents.resume_agent import ResumeIntelligenceAgent
from app.services.document_service import document_service
from app.core.config import settings

router = APIRouter()

@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume_pdf(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "resume.pdf"
    if not (filename.lower().endswith(".pdf") or filename.lower().endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are accepted for resume parsing.")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 10MB limit.")

    if filename.lower().endswith(".pdf"):
        extracted_text = document_service.extract_text_from_pdf(content)
    else:
        extracted_text = content.decode("utf-8", errors="replace")

    sanitized_text = document_service.sanitize_text(extracted_text)
    if not sanitized_text.strip():
        raise HTTPException(status_code=400, detail="Unable to extract readable text from uploaded file.")

    # Determine target role
    if not target_role:
        prof = db.query(CareerProfile).first()
        target_role = prof.target_role if prof else "Backend Software Engineer"

    agent = ResumeIntelligenceAgent(db)
    result = agent.analyze_resume(sanitized_text, target_role=target_role)

    # Save to DB
    analysis = db.query(ResumeAnalysis).first()
    if not analysis:
        analysis = ResumeAnalysis(
            filename=filename,
            parsed_text=sanitized_text,
            skills=result.get("extracted_skills", []),
            education=result.get("education", []),
            experience_highlights=result.get("experience_highlights", []),
            strengths=result.get("strengths", []),
            missing_elements=result.get("missing_elements", []),
            improvement_suggestions=result.get("improvement_suggestions", [])
        )
        db.add(analysis)
    else:
        analysis.filename = filename
        analysis.parsed_text = sanitized_text
        analysis.skills = result.get("extracted_skills", [])
        analysis.education = result.get("education", [])
        analysis.experience_highlights = result.get("experience_highlights", [])
        analysis.strengths = result.get("strengths", [])
        analysis.missing_elements = result.get("missing_elements", [])
        analysis.improvement_suggestions = result.get("improvement_suggestions", [])
    db.commit()
    db.refresh(analysis)
    return analysis

@router.post("/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume_text(req: ResumeAnalyzeRequest, db: Session = Depends(get_db)):
    if not req.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    target_role = req.target_role
    if not target_role:
        prof = db.query(CareerProfile).first()
        target_role = prof.target_role if prof else "Backend Software Engineer"

    sanitized_text = document_service.sanitize_text(req.resume_text)
    agent = ResumeIntelligenceAgent(db)
    result = agent.analyze_resume(sanitized_text, target_role=target_role)

    analysis = db.query(ResumeAnalysis).first()
    if not analysis:
        analysis = ResumeAnalysis(
            filename="pasted_resume.txt",
            parsed_text=sanitized_text,
            skills=result.get("extracted_skills", []),
            education=result.get("education", []),
            experience_highlights=result.get("experience_highlights", []),
            strengths=result.get("strengths", []),
            missing_elements=result.get("missing_elements", []),
            improvement_suggestions=result.get("improvement_suggestions", [])
        )
        db.add(analysis)
    else:
        analysis.filename = "pasted_resume.txt"
        analysis.parsed_text = sanitized_text
        analysis.skills = result.get("extracted_skills", [])
        analysis.education = result.get("education", [])
        analysis.experience_highlights = result.get("experience_highlights", [])
        analysis.strengths = result.get("strengths", [])
        analysis.missing_elements = result.get("missing_elements", [])
        analysis.improvement_suggestions = result.get("improvement_suggestions", [])
    db.commit()
    db.refresh(analysis)
    return analysis

@router.get("/latest", response_model=ResumeAnalysisResponse)
def get_latest_resume_analysis(db: Session = Depends(get_db)):
    analysis = db.query(ResumeAnalysis).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No resume has been uploaded or analyzed yet.")
    return analysis

