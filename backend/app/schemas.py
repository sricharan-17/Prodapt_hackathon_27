from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "CANDIDATE" # "HR" or "CANDIDATE"
    organization: Optional[str] = "TechCorp Inc."

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    organization: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class JobCreate(BaseModel):
    title: str
    department: Optional[str] = "Engineering"
    location: Optional[str] = "Remote / Hybrid"
    description: str
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []
    experience_years: Optional[float] = 3.0

class JobOut(BaseModel):
    id: int
    title: str
    department: str
    location: str
    description: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience_years: float
    hr_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeUploadRequest(BaseModel):
    raw_text: Optional[str] = None
    file_type: str = "GENERAL" # "GENERAL" or "JOB_SPECIFIC"
    associated_job_id: Optional[int] = None

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    candidate_name: str
    candidate_email: str
    job_title: str
    match_score: int
    coverage_ratio: str
    match_details: Dict[str, Any]
    score_breakdown: Dict[str, Any]
    summary: str
    gap_analysis: List[Dict[str, Any]]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
