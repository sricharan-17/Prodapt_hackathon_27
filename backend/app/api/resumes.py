import re
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, Application, Job, User
from app.api.auth import get_current_user
from app.ontology.ontology_service import ontology_service
from app.rag.rag_service import rag_service
from app.services.scoring_engine import scoring_engine
from app.services.llm_service import llm_service

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

def extract_candidate_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found_skills = []
    for canonical, info in ontology_service.skills_map.items():
        synonyms = [s.lower() for s in info.get("synonyms", [])] + [canonical.lower()]
        if any(syn in text_lower for syn in synonyms):
            found_skills.append(canonical)
    return found_skills

def extract_experience_years(text: str) -> float:
    text_lower = text.lower()
    matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:-\s*\d+\s*)?(?:years?|yrs?)', text_lower)
    if matches:
        return max([float(m) for m in matches])
    return 3.0

def process_resume_matching(
    resume: Resume, job: Job, candidate: User, db: Session
) -> Application:
    """
    Executes full RAG + Skill Ontology + Deterministic Scoring pipeline for a candidate resume against a JD.
    """
    resume_chunks = resume.parsed_chunks or []
    cand_skills = resume.extracted_skills or []
    
    # 1. Evaluate Required Skills via Skill Ontology & Vector RAG evidence search
    req_matches = []
    for req_skill in job.required_skills:
        evidence = rag_service.retrieve_relevant_evidence(resume_chunks, req_skill, top_k=2)
        evidence_texts = [e["text"] for e in evidence]
        
        classification = ontology_service.classify_skill_match(req_skill, cand_skills, evidence_texts)
        classification["evidence"] = evidence
        req_matches.append(classification)

    # 2. Evaluate Preferred Skills
    pref_matches = []
    for pref_skill in (job.preferred_skills or []):
        evidence = rag_service.retrieve_relevant_evidence(resume_chunks, pref_skill, top_k=1)
        evidence_texts = [e["text"] for e in evidence]
        
        classification = ontology_service.classify_skill_match(pref_skill, cand_skills, evidence_texts)
        classification["evidence"] = evidence
        pref_matches.append(classification)

    # 3. Calculate Deterministic Score
    score_result = scoring_engine.calculate_candidate_score(
        required_skill_matches=req_matches,
        preferred_skill_matches=pref_matches,
        candidate_experience_years=resume.experience_years,
        required_experience_years=job.experience_years,
        has_relevant_projects="project" in resume.raw_text.lower() or "built" in resume.raw_text.lower(),
        has_relevant_education="bachelor" in resume.raw_text.lower() or "degree" in resume.raw_text.lower() or "bs" in resume.raw_text.lower()
    )

    # 4. Analyze Skill Gap Severities
    gap_analysis = []
    for match in req_matches:
        if match["match_type"] == "MISSING":
            gap_info = llm_service.analyze_skill_gap_severity(match["canonical_skill"], cand_skills)
            gap_analysis.append(gap_info)

    # 5. Generate Evidence-Grounded AI Summary
    summary_text = llm_service.generate_candidate_summary(
        candidate_name=candidate.full_name,
        job_title=job.title,
        required_matches=req_matches,
        preferred_matches=pref_matches,
        overall_score=score_result["final_score"]
    )

    # Check for existing application
    existing_app = db.query(Application).filter(
        Application.job_id == job.id, Application.candidate_id == candidate.id
    ).first()

    match_details = {
        "required_matches": req_matches,
        "preferred_matches": pref_matches
    }

    if existing_app:
        existing_app.resume_id = resume.id
        existing_app.match_score = score_result["final_score"]
        existing_app.coverage_ratio = score_result["coverage_ratio"]
        existing_app.match_details = match_details
        existing_app.score_breakdown = score_result
        existing_app.summary = summary_text
        existing_app.gap_analysis = gap_analysis
        existing_app.status = "COMPLETED"
        db.commit()
        db.refresh(existing_app)
        return existing_app
    else:
        new_app = Application(
            job_id=job.id,
            candidate_id=candidate.id,
            resume_id=resume.id,
            match_score=score_result["final_score"],
            coverage_ratio=score_result["coverage_ratio"],
            match_details=match_details,
            score_breakdown=score_result,
            summary=summary_text,
            gap_analysis=gap_analysis,
            status="COMPLETED"
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        return new_app

@router.post("/upload")
async def upload_resume(
    file_type: str = Form("GENERAL"), # "GENERAL" or "JOB_SPECIFIC"
    associated_job_id: Optional[int] = Form(None),
    file: UploadFile = File(None),
    raw_text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "CANDIDATE":
        raise HTTPException(status_code=403, detail="Only candidate accounts can upload resumes.")

    resume_text = ""
    filename = "pasted_resume.txt"
    if file:
        filename = file.filename
        content_bytes = await file.read()
        resume_text = rag_service.extract_text_from_file(content_bytes, filename)
    elif raw_text:
        resume_text = raw_text
    else:
        raise HTTPException(status_code=400, detail="Please upload a resume file or paste plain text resume.")

    extracted_skills = extract_candidate_skills(resume_text)
    exp_years = extract_experience_years(resume_text)
    chunks = rag_service.chunk_text(resume_text)

    new_resume = Resume(
        candidate_id=current_user.id,
        filename=filename,
        file_type=file_type.upper(),
        associated_job_id=associated_job_id,
        raw_text=resume_text,
        extracted_skills=extracted_skills,
        experience_years=exp_years,
        parsed_chunks=chunks
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # If associated with a job, run matching immediately
    app_result = None
    if associated_job_id:
        target_job = db.query(Job).filter(Job.id == associated_job_id).first()
        if target_job:
            app_result = process_resume_matching(new_resume, target_job, current_user, db)
    elif file_type.upper() == "GENERAL":
        # Match against latest job if available
        latest_job = db.query(Job).order_by(Job.created_at.desc()).first()
        if latest_job:
            app_result = process_resume_matching(new_resume, latest_job, current_user, db)

    return {
        "resume_id": new_resume.id,
        "filename": new_resume.filename,
        "file_type": new_resume.file_type,
        "extracted_skills": extracted_skills,
        "experience_years": exp_years,
        "chunks_count": len(chunks),
        "application_match": app_result.id if app_result else None
    }

@router.get("/my-resumes")
def get_my_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.candidate_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return resumes
