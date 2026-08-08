import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, Job, Resume, Application
from app.api.auth import get_password_hash
from app.rag.rag_service import rag_service
from app.api.resumes import process_resume_matching, extract_candidate_skills, extract_experience_years

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_hr = db.query(User).filter(User.email == "hr@techcorp.com").first()
        if existing_hr:
            print("Database already seeded with demo data!")
            return

        print("Seeding database with realistic hackathon demo data...")

        # 1. Create HR User
        hr_user = User(
            email="hr@techcorp.com",
            hashed_password=get_password_hash("password123"),
            full_name="Sarah Jenkins",
            role="HR",
            organization="TechCorp Inc."
        )
        db.add(hr_user)
        db.commit()
        db.refresh(hr_user)

        # 2. Create Job Posting: "Python Full Stack Developer"
        job = Job(
            title="Python Full Stack Developer",
            department="Engineering & Product",
            location="San Francisco, CA (Hybrid)",
            description="""
We are seeking an experienced Python Full Stack Developer to build high-scale web applications.
Required Technical Skills:
- Python (FastAPI or Flask backend development)
- SQL (PostgreSQL or MySQL database design and querying)
- REST APIs (Designing RESTful web services)
- React (React.js, modern hooks, component state management)
- Git (Version control and pull request workflows)

Preferred Skills:
- Docker (Containerization and compose orchestration)
- AWS (Cloud deployment, EC2, S3)
- MongoDB (Document NoSQL storage)

Experience Required: 3+ years in full-stack web development.
            """,
            required_skills=["Python", "SQL", "REST API", "React", "Git"],
            preferred_skills=["Docker", "AWS", "MongoDB"],
            experience_years=3.0,
            hr_id=hr_user.id
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        # 3. Create Candidates and Resumes
        candidates_data = [
            {
                # Candidate 1: Perfect 100% match (has all required & preferred skills + exp + projects + edu)
                "email": "alex.rivera@gmail.com",
                "name": "Alex Rivera",
                "resume_text": """
Alex Rivera — Senior Full-Stack Engineer
Experience: 5 years building scalable web solutions.

SKILLS:
Python, FastAPI, React, JavaScript, TypeScript, PostgreSQL, SQL, REST API, Git, Docker, AWS, MongoDB, Redis.

EXPERIENCE:
Senior Engineer at CloudScale Inc. (2021 - Present):
- Engineered Python backend services using FastAPI and REST API standards serving 2M daily API requests.
- Developed React-based customer portal with responsive UI components and state management.
- Designed relational database schemas in PostgreSQL with complex SQL query optimization.
- Deployed microservices on AWS EC2 and containerized using Docker Compose.
- Maintained Git repository pull request code reviews.

PROJECTS:
- Enterprise Dashboard: Full stack Python + React app with REST API endpoints, AWS S3 file storage, MongoDB caching layer.

EDUCATION:
BS in Computer Science, University of California Berkeley.
                """,
                "exp_years": 5.0
            },
            {
                # Candidate 2: 98% match (has all required skills + Docker + MongoDB, but missing AWS)
                "email": "beatriz.vance@gmail.com",
                "name": "Beatriz Vance",
                "resume_text": """
Beatriz Vance — Python Backend & Frontend Developer
Experience: 4 years of software development.

SKILLS:
Python, Flask, React.js, MySQL, SQL, REST APIs, Git, Docker, MongoDB, HTML/CSS.

EXPERIENCE:
Full Stack Developer at DataFlow Solutions (2022 - Present):
- Built microservices in Python using Flask framework and designed custom REST APIs.
- Built student interactive frontend using React.js and CSS modules.
- Formulated relational database tables in MySQL, writing optimized SQL queries.
- Deployed web applications using Docker containers and maintained code using Git.
- Implemented document database schemas in MongoDB.

PROJECTS:
- E-Learning Portal: Full stack Flask and React application with RESTful APIs.

EDUCATION:
BS in Software Engineering.
                """,
                "exp_years": 4.0
            },
            {
                # Candidate 3: 85% match (has Python, SQL, REST API, Git, but missing React & AWS)
                "email": "charlie.chen@gmail.com",
                "name": "Charlie Chen",
                "resume_text": """
Charlie Chen — Web Developer
Experience: 3 years web engineering.

SKILLS:
Python, Django, MySQL, SQL, Vue.js, JavaScript, Git, Docker.

EXPERIENCE:
Web Developer at WebCraft Studio (2022 - Present):
- Developed web APIs and web applications using Python and Django REST framework.
- Wrote raw SQL queries for database migration in MySQL.
- Created interactive interfaces using Vue.js and JavaScript.
- Utilized Git for version control and daily code reviews.

PROJECTS:
- Inventory Web Portal: Django REST framework backend with Vue frontend.

EDUCATION:
Bachelor of Science in Information Technology.
                """,
                "exp_years": 3.0
            },
            {
                # Candidate 4: 78% match
                "email": "david.miller@gmail.com",
                "name": "David Miller",
                "resume_text": """
David Miller — Backend Developer
Experience: 2 years backend engineering.

SKILLS:
Python, Flask, SQL, SQLite, REST APIs, Git, Linux.

EXPERIENCE:
Junior Backend Developer at Systems Core (2023 - Present):
- Created internal Flask REST APIs for data collection scripts in Python.
- Maintained SQL database tables and simple analytical queries.
- Worked with Git repository branches and pull requests.

PROJECTS:
- Analytics API: Flask REST API microservice.

EDUCATION:
Associate Degree in Computer Programming.
                """,
                "exp_years": 2.0
            },
            {
                # Candidate 5: 47% match
                "email": "elena.rostova@gmail.com",
                "name": "Elena Rostova",
                "resume_text": """
Elena Rostova — Frontend Developer
Experience: 1.5 years frontend design.

SKILLS:
JavaScript, React, HTML, CSS, Tailwind CSS, Git.

EXPERIENCE:
Frontend Developer at DesignLabs (2024 - Present):
- Created client-side web pages using React and JavaScript.
- Styled responsive user interfaces using HTML, CSS, and Tailwind.
- Used Git for code repository versioning.

PROJECTS:
- Portfolio Website: React and Tailwind CSS single-page application.

EDUCATION:
Full Stack Web Coding Bootcamp Certificate.
                """,
                "exp_years": 1.5
            }
        ]

        for cdata in candidates_data:
            user = User(
                email=cdata["email"],
                hashed_password=get_password_hash("password123"),
                full_name=cdata["name"],
                role="CANDIDATE",
                organization="Applicant"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            extracted_skills = extract_candidate_skills(cdata["resume_text"])
            chunks = rag_service.chunk_text(cdata["resume_text"])

            resume = Resume(
                candidate_id=user.id,
                filename=f"{user.full_name.replace(' ', '_')}_Resume.pdf",
                file_type="GENERAL",
                associated_job_id=job.id,
                raw_text=cdata["resume_text"],
                extracted_skills=extracted_skills,
                experience_years=cdata["exp_years"],
                parsed_chunks=chunks
            )
            db.add(resume)
            db.commit()
            db.refresh(resume)

            # Process matching against sample job
            process_resume_matching(resume, job, user, db)

        print("Database seeded successfully with 1 HR User, 1 JD, and 5 Candidates!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
