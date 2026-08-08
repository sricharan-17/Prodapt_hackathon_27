import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="CANDIDATE") # "HR" or "CANDIDATE"
    organization = Column(String, nullable=True, default="TechCorp Inc.")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    jobs = relationship("Job", back_populates="hr_user")
    resumes = relationship("Resume", back_populates="candidate_user")
    applications = relationship("Application", back_populates="candidate_user")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, default="Engineering")
    location = Column(String, default="Remote / Hybrid")
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=False) # ["Python", "SQL", "React", "AWS"]
    preferred_skills = Column(JSON, default=list) # ["Docker", "MongoDB"]
    experience_years = Column(Float, default=3.0)
    hr_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    hr_user = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    file_type = Column(String, default="GENERAL") # "GENERAL" or "JOB_SPECIFIC"
    associated_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, default=list)
    experience_years = Column(Float, default=2.0)
    parsed_chunks = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate_user = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    candidate_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    match_score = Column(Integer, default=0) # 0 to 100
    coverage_ratio = Column(String, default="0/0") # "8/9"
    match_details = Column(JSON, default=dict) # Skills breakdown with ontology & RAG evidence
    score_breakdown = Column(JSON, default=dict) # Deterministic weights breakdown
    summary = Column(Text, default="")
    gap_analysis = Column(JSON, default=list)
    status = Column(String, default="COMPLETED") # "PENDING", "PARSING", "COMPLETED", "FAILED"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    candidate_user = relationship("User", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")
