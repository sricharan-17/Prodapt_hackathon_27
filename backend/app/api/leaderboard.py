from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Job, User, Resume
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard & Intelligence"])

@router.get("/jobs/{job_id}")
def get_job_leaderboard(
    job_id: int,
    search: Optional[str] = Query(None, description="Search candidate name or skill"),
    min_score: Optional[int] = Query(None, description="Filter candidates by minimum match score"),
    missing_skill: Optional[str] = Query(None, description="Filter candidates who are missing a specific skill"),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    query = db.query(Application).filter(Application.job_id == job_id)
    applications = query.all()

    leaderboard_list = []
    for app in applications:
        cand_user = db.query(User).filter(User.id == app.candidate_id).first()
        if not cand_user:
            continue

        # Extract missing skills list
        req_matches = app.match_details.get("required_matches", []) if app.match_details else []
        missing_skills = [m["canonical_skill"] for m in req_matches if m.get("match_type") == "MISSING"]
        matched_skills = [m["canonical_skill"] for m in req_matches if m.get("match_type") in ["EXACT_MATCH", "RELATED_MATCH", "PARTIAL_MATCH"]]

        # Filter by Search
        if search:
            s_lower = search.lower()
            if (s_lower not in cand_user.full_name.lower() and 
                s_lower not in cand_user.email.lower() and 
                not any(s_lower in sk.lower() for sk in matched_skills)):
                continue

        # Filter by Minimum Score
        if min_score is not None and app.match_score < min_score:
            continue

        # Filter by Missing Skill
        if missing_skill:
            m_lower = missing_skill.lower()
            if not any(m_lower in ms.lower() for ms in missing_skills):
                continue

        leaderboard_list.append({
            "application_id": app.id,
            "job_id": app.job_id,
            "candidate_id": cand_user.id,
            "candidate_name": cand_user.full_name,
            "candidate_email": cand_user.email,
            "match_score": app.match_score,
            "coverage_ratio": app.coverage_ratio,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "summary": app.summary,
            "created_at": app.created_at
        })

    # Sort candidates by score descending
    leaderboard_list.sort(key=lambda x: x["match_score"], reverse=True)

    # Assign Rank
    for index, item in enumerate(leaderboard_list):
        item["rank"] = index + 1

    return {
        "job_id": job.id,
        "job_title": job.title,
        "total_applicants": len(leaderboard_list),
        "leaderboard": leaderboard_list
    }

@router.get("/candidate-intelligence/{application_id}")
def get_candidate_intelligence(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns the deep Explainable Candidate Intelligence Payload:
    - Score Breakdown wheel / card
    - Why Candidate Scored X% explanation
    - Requirement vs Resume Evidence RAG chunks with confidence score
    - Skill Ontology relationship matrix (EXACT, RELATED, TRANSFERABLE, PARTIAL, MISSING)
    - Skill Gap Severity & Transferable skill recommendations
    - AI evidence-grounded summary
    """
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found.")

    cand_user = db.query(User).filter(User.id == app.candidate_id).first()
    job = db.query(Job).filter(Job.id == app.job_id).first()
    resume = db.query(Resume).filter(Resume.id == app.resume_id).first()

    return {
        "application_id": app.id,
        "candidate": {
            "id": cand_user.id,
            "name": cand_user.full_name,
            "email": cand_user.email,
            "organization": cand_user.organization
        },
        "job": {
            "id": job.id,
            "title": job.title,
            "department": job.department,
            "required_skills": job.required_skills,
            "preferred_skills": job.preferred_skills,
            "experience_years": job.experience_years
        },
        "overall_score": app.match_score,
        "coverage_ratio": app.coverage_ratio,
        "score_breakdown": app.score_breakdown,
        "match_details": app.match_details,
        "gap_analysis": app.gap_analysis,
        "ai_summary": app.summary,
        "resume": {
            "id": resume.id if resume else None,
            "filename": resume.filename if resume else "N/A",
            "raw_text": resume.raw_text if resume else "",
            "extracted_skills": resume.extracted_skills if resume else [],
            "experience_years": resume.experience_years if resume else 0.0
        }
    }

@router.post("/compare")
def compare_candidates(
    application_ids: List[int],
    db: Session = Depends(get_db)
):
    """Side-by-side candidate comparative analysis."""
    apps = db.query(Application).filter(Application.id.in_(application_ids)).all()
    comparison_data = []
    
    for app in apps:
        cand_user = db.query(User).filter(User.id == app.candidate_id).first()
        req_matches = app.match_details.get("required_matches", []) if app.match_details else []
        
        exact = [m["canonical_skill"] for m in req_matches if m.get("match_type") == "EXACT_MATCH"]
        partial = [m["canonical_skill"] for m in req_matches if m.get("match_type") in ["RELATED_MATCH", "PARTIAL_MATCH", "TRANSFERABLE_SKILL"]]
        missing = [m["canonical_skill"] for m in req_matches if m.get("match_type") == "MISSING"]

        comparison_data.append({
            "application_id": app.id,
            "candidate_name": cand_user.full_name,
            "score": app.match_score,
            "coverage_ratio": app.coverage_ratio,
            "exact_matches": exact,
            "partial_matches": partial,
            "missing_skills": missing,
            "summary": app.summary
        })

    return {"candidates": comparison_data}
