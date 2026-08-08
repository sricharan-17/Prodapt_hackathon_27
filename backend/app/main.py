import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import engine, Base
from app.seed import seed_database
from app.api import auth, jobs, resumes, leaderboard

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Resume Screening Assistant",
    description="Explainable Candidate Intelligence with RAG, Skill Ontology & Deterministic Match Scoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(resumes.router)
app.include_router(leaderboard.router)

@app.on_event("startup")
def on_startup():
    seed_database()

# Path to Frontend production build
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(os.path.join(FRONTEND_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

@app.get("/api-status")
def api_status():
    return {
        "status": "online",
        "app": "AI Resume Screening Assistant",
        "unified_link": "http://localhost:8000",
        "documentation": "http://localhost:8000/docs",
        "message": "Unified Frontend Web App + Backend REST APIs + Interactive Documentation server active!"
    }

@app.get("/{full_path:path}", include_in_schema=False)
def serve_unified_project(full_path: str = ""):
    """
    Serves the production Frontend Single-Page Application (SPA) for all non-API paths,
    combining Frontend, Backend, and Documentation under one single project link.
    """
    # Allow docs, openapi.json, and api routes to be handled by FastAPI
    if full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json") or full_path.startswith("api/"):
        return None
        
    target_file = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
        return FileResponse(target_file)
        
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
        
    return {"message": "AI Resume Screening Assistant Backend Active. Visit /docs for API documentation."}
