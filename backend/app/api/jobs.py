import re
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, User
from app.schemas import JobCreate, JobOut
from app.api.auth import get_current_user
from app.ontology.ontology_service import ontology_service
from app.rag.rag_service import rag_service

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

def extract_requirements_from_text(text: str) -> Dict[str, Any]:
    """
    Extracts job requirements, required skills, preferred skills, and experience years using Ontology mapping.
    """
    text_lower = text.lower()
    
    # Identify skills mentioned in JD
    all_found_skills = []
    for canonical, info in ontology_service.skills_map.items():
        synonyms = [s.lower() for s in info.get("synonyms", [])] + [canonical.lower()]
        if any(syn in text_lower for syn in synonyms):
            all_found_skills.append(canonical)
            
    # Classify required vs preferred skills based on section headings or keywords
    preferred_keywords = ["preferred", "nice to have", "bonus", "plus", "desirable"]
    required_skills = []
    preferred_skills = []
    
    lines = text.split("\n")
    current_section = "required"
    
    for line in lines:
        line_lower = line.lower()
        if any(k in line_lower for k in preferred_keywords):
            current_section = "preferred"
        elif "required" in line_lower or "must have" in line_lower or "requirements" in line_lower:
            current_section = "required"
            
        for skill in all_found_skills:
            info = ontology_service.skills_map.get(skill, {})
            syns = [s.lower() for s in info.get("synonyms", [])] + [skill.lower()]
            if any(syn in line_lower for syn in syns):
                if current_section == "preferred":
                    if skill not in preferred_skills:
                        preferred_skills.append(skill)
                else:
                    if skill not in required_skills:
                        required_skills.append(skill)

    # Clean up duplicates
    for p in preferred_skills:
        if p in required_skills:
            preferred_skills.remove(p)

    if not required_skills:
        required_skills = ["Python", "SQL", "REST API", "React", "Git"]
    if not preferred_skills:
        preferred_skills = ["Docker", "AWS", "MongoDB"]

    # Extract experience years using regex
    exp_match = re.search(r'(\d+)\+?\s*(?:-\s*\d+\s*)?(?:years?|yrs?)', text_lower)
    exp_years = float(exp_match.group(1)) if exp_match else 3.0

    return {
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "experience_years": exp_years
    }

@router.post("", response_model=JobOut)
def create_job(job_in: JobCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "HR":
        raise HTTPException(status_code=403, detail="Only HR users can create job postings.")
    
    new_job = Job(
        title=job_in.title,
        department=job_in.department or "Engineering",
        location=job_in.location or "Remote / Hybrid",
        description=job_in.description,
        required_skills=job_in.required_skills,
        preferred_skills=job_in.preferred_skills or [],
        experience_years=job_in.experience_years or 3.0,
        hr_id=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.post("/upload-jd", response_model=JobOut)
async def upload_job_description(
    title: str = Form(...),
    department: str = Form("Engineering"),
    location: str = Form("Remote / Hybrid"),
    file: UploadFile = File(None),
    description_text: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "HR":
        raise HTTPException(status_code=403, detail="Only HR users can upload job descriptions.")
    
    jd_content = ""
    if file:
        content_bytes = await file.read()
        jd_content = rag_service.extract_text_from_file(content_bytes, file.filename)
    elif description_text:
        jd_content = description_text
    else:
        raise HTTPException(status_code=400, detail="Please provide either a JD document file or plain text description.")

    extracted = extract_requirements_from_text(jd_content)

    new_job = Job(
        title=title,
        department=department,
        location=location,
        description=jd_content,
        required_skills=extracted["required_skills"],
        preferred_skills=extracted["preferred_skills"],
        experience_years=extracted["experience_years"],
        hr_id=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("", response_model=List[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")
    return job
