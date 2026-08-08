<<<<<<< HEAD
# AI Resume Screening Assistant — RAG + Skill Ontology + Explainable Ranking

> *"From Resume Matching to Explainable Candidate Intelligence"*

A complete hackathon-ready full-stack web application designed for HR recruiters and job candidates to perform evidence-grounded resume matching and candidate ranking.

---

## 🌟 Key Differentiators

Unlike traditional Applicant Tracking Systems (ATS) that rely on keyword matching or black-box LLM scoring:
1. **RAG-Based Evidence Retrieval**: Extracts exact sentence and paragraph citations from candidate resumes supporting each Job Description requirement.
2. **Skill Ontology Normalization**: Multi-tiered graph mapping exact matches, related matches, transferable skills, partial matches, and missing skill gaps.
3. **Deterministic & Transparent Scoring**: Transparent weighted scoring model (Required Skills 50%, Experience 20%, Projects 15%, Education 10%, Preferred Skills 5%) with transparent score explanations (*"Why Candidate Scored X%"*).
4. **Dual Portals**: Tailored interfaces for **HR Recruiters** (Job Creation, JD Extractor, Candidate Leaderboard, Intelligence Dashboard) and **Candidates** (General & Job-Specific Resume Submissions).

---

## 🏗️ Architecture

```
 ┌──────────────────────────────────────────────────────────┐
 │                    React Frontend (Vite)                 │
 │  - HR Dashboard, Leaderboard & Candidate Intelligence   │
 │  - Candidate Dashboard & Dual Resume Upload              │
 └────────────────────────────┬─────────────────────────────┘
                              │ HTTP / REST API
 ┌────────────────────────────▼─────────────────────────────┐
 │                   FastAPI Backend (Python)                │
 │  - Auth & Role Management (HR vs Candidate JWT)          │
 │  - Resume Parsing (PDF, DOCX, TXT)                       │
 └──────┬─────────────────────┬──────────────────────┬──────┘
        │                     │                      │
 ┌──────▼──────┐       ┌──────▼──────┐        ┌──────▼──────┐
 │  Skill      │       │   RAG       │        │Deterministic│
 │  Ontology   │       │ Vector Store│        │ Scoring     │
 │  Engine     │       │ & Retrieval │        │ Engine      │
 └──────┬──────┘       └──────┬──────┘        └──────┬──────┘
        │                     │                      │
 ┌──────▼─────────────────────▼──────────────────────▼──────┐
 │             SQLite / PostgreSQL Database                 │
 └──────────────────────────────────────────────────────────┘
```

---

## ⚡ Technology Choices & Rationale

| Technology | Role | Why Chosen? |
|---|---|---|
| **React + Vite** | Frontend Framework | Fast component-based interactive dashboards, smooth glassmorphism rendering, instant hot module reloading. |
| **Tailwind CSS** | Design Tokens & Styling | Sleek modern SaaS aesthetics with custom dark theme tokens (`#0B0F17`), glowing indicators, and visual score badges. |
| **FastAPI (Python)** | Backend API Gateway | High-performance asynchronous Python API server with built-in Pydantic data validation and seamless AI/RAG integration. |
| **Skill Ontology (JSON)** | Knowledge Graph | Normalizes synonyms (e.g. `React.js` ➔ `React`, `Postgres` ➔ `PostgreSQL`) and maps domain hierarchy (e.g. `Flask` ➔ `REST API`). |
| **Vector RAG Engine** | Retrieval Layer | Splits resume text into overlapping sentence chunks and retrieves top-k evidence citations with similarity confidence scores. |
| **SQLite / SQLAlchemy** | Relational Database | Zero-configuration portable database storing Users, Jobs, Resumes, and Application match histories out-of-the-box. |

---

## 🚀 3-Minute Hackathon Demo Walkthrough

1. **0:00–0:40 | HR Job Creation**: HR logs in with 1-Click Demo (`hr@techcorp.com`) and posts/uploads a JD. The ontology engine extracts required (`Python`, `SQL`, `REST API`, `React`, `Git`) and preferred (`Docker`, `AWS`, `MongoDB`) skills.
2. **0:40–1:30 | Candidate Submissions**: Candidates submit general or job-specific resumes. RAG engine parses text, generates sentence chunks, and indexes vector embeddings.
3. **1:30–2:30 | Leaderboard Ranking**: HR opens the Candidate Leaderboard showing candidates ranked deterministically (e.g. Rank 1: Alex Rivera @ 91%, Rank 2: Beatriz Vance @ 86%, Rank 3: Charlie Chen @ 78%).
4. **2:30–3:00 | "Why 91%?" Intelligence**: HR clicks a candidate to open the Candidate Intelligence Dashboard, inspecting exact resume quote evidence, ontology match relationships, gap severities, and AI summaries.

---

## 🔒 Security & Data Privacy

- **Role-Based Access Control (RBAC)**: Enforces distinct permissions for HR Recruiters and Candidates.
- **Data Minimization**: PII (phone numbers, full addresses) is filtered from public leaderboards.
- **Evidence Grounding**: AI candidate summaries are strictly restricted to retrieved resume section quotes to prevent hallucinated experience.

---

## 🛠️ How to Run Locally

### 1. Start FastAPI Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Start Vite Frontend:
```bash
cd frontend
npm run dev
```

Open browser at `http://localhost:5173`.
FastAPI Swagger documentation available at `http://localhost:8000/docs`.
=======
# Prodapt_hackathon_27
>>>>>>> d74e2f9f3b2d01632e6233ea643b7edb5335d7a7
