# CareerPilot AI 🚀
> **Your Skills. Your Direction. Your Next Opportunity.**

CareerPilot AI is a voice-first, agentic career development platform engineered to guide students, career switchers, and engineers transitioning into backend, cloud, and AI engineering roles.

Unlike generic conversational chatbots, CareerPilot AI functions as a **coordinated team of specialized career agents** that audit resumes, parse real job descriptions, diagnose granular skill gaps, generate adaptive 4-week learning sprints, recommend targeted portfolio capstones, and conduct interactive rubric-based mock technical interviews.

---

## Table of Contents
1. [Core Differentiators & Identity](#core-differentiators--identity)
2. [Multi-Agent Architecture](#multi-agent-architecture)
3. [Wispr Flow Voice Dictation Integration](#wispr-flow-voice-dictation-integration)
4. [Transparent Career Readiness Calculation](#transparent-career-readiness-calculation)
5. [Technology Stack](#technology-stack)
6. [Local Quickstart & Execution](#local-quickstart--execution)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Offline Demo Mode](#offline-demo-mode)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Deployment Architecture](#deployment-architecture)

---

## 1. Core Differentiators & Identity

- **Orchestrated Multi-Agent Team:** 8 specialized agents with dedicated contracts, structured Pydantic validations, and traceable execution telemetry.
- **Voice-First Input with Wispr Flow Compatibility:** Fast, natural voice dictation interface tolerant of pauses and self-corrections, with browser speech recognition fallback.
- **Evidence-Based Skill Gap Matrix:** Classifies skills into **Strong Matches** (backed by verifiable evidence), **Partial Matches** (needs depth), **Missing Gaps** (unmentioned), and **Unverified Skills** (self-reported claims requiring proof).
- **Adaptive 4-Week Sprints:** Dynamic weekly milestones, actionable tasks, estimated study hours, and automatic pacing recalibration by the Progress Agent.
- **Resume & Job Intelligence:** Real PDF extraction powered by PyMuPDF (`fitz`), ATS keyword extraction, and actionable improvements without fabricated experience.
- **Transparent Rubric Mock Interviews:** Multi-criterion evaluations across **Correctness (25%)**, **Clarity (25%)**, **Technical Depth (25%)**, and **Problem Solving (25%)** with model senior-level answers.
- **Live Application Analytics:** Honest conversion rates (Response Rate % and Interview Callback Rate %) derived from persisted application records.

---

## 2. Multi-Agent Architecture

```
[User Dictation / Resume / Job Posting]
                   │
                   ▼
       ┌────────────────────────┐
       │   Agent Orchestrator   │
       └───────────┬────────────┘
                   │
   ┌───────────────┼───────────────┐
   ▼               ▼               ▼
Agent 1         Agent 2         Agent 3
Career Profile  Resume Intel    Job Description
(Parse Goals)   (PyMuPDF Audit) (ATS Extraction)
   │               │               │
   └───────────────┼───────────────┘
                   │
                   ▼
                Agent 4
          Skill Gap Analysis
          (Strong/Partial/Gap)
                   │
   ┌───────────────┴───────────────┐
   ▼                               ▼
Agent 5                         Agent 6
Career Roadmap                  Portfolio Projects
(4-Week Sprint)                 (Capstones Bridging Gaps)
   │                               │
   └───────────────┬───────────────┘
                   │
   ┌───────────────┴───────────────┐
   ▼                               ▼
Agent 7                         Agent 8
Mock Technical Interview        Progress & Application Insights
(Rubric-Based Evaluation)       (Pacing Adaptation & Conversions)
```

### Specialized Agents:
1. **Career Profile Agent:** Extracts target role, career stage, weekly availability, and structured skills from natural language.
2. **Resume Intelligence Agent:** Extracts education, verified skills, and experience highlights from PDF or text; provides constructive resume improvement suggestions without hallucinating facts.
3. **Job Description Intelligence Agent:** Parses pasted job descriptions, extracts strict vs preferred qualifications, and isolates high-impact ATS keywords.
4. **Skill Gap Analysis Agent:** Cross-references candidate qualifications with job demands, assigning priority levels and calculating honest career readiness scores.
5. **Career Roadmap Agent:** Generates an intensive 4-week learning sprint with weekly milestones, actionable tasks, and vetted documentation links.
6. **Portfolio Project Agent:** Recommends 3+ targeted capstones designed specifically to prove mastery over identified skill gaps.
7. **Mock Interview Agent:** Delivers role-specific technical questions, evaluates user answers against an objective 100-point rubric, and provides model senior-level answers.
8. **Progress and Application Insights Agent:** Tracks task completion, recalibrates roadmap pacing, and calculates conversion rates from real application records.

---

## 3. Wispr Flow Voice Dictation Integration

Wispr Flow is an external OS-level voice dictation engine. CareerPilot AI includes an input experience tailored for Wispr Flow users:
- **Instant Focus Shortcut:** A dedicated **"Focus Dictation Target"** button positions your cursor inside the main input area, ready for your Wispr Flow hotkey.
- **Natural Language & Self-Correction:** Dictate freeform thoughts, pauses, and corrections. The Career Profile Agent extracts clean structured attributes from unstructured text.
- **Review & Edit:** All dictated text remains fully editable before submission.
- **Browser Speech Fallback:** For environments without Wispr Flow installed, a built-in browser speech recognition option is available.

---

## 4. Transparent Career Readiness Calculation

CareerPilot AI avoids arbitrary percentages. Readiness scores are calculated using an explainable formula:

$$\text{Readiness Score} = \text{Skills Match Score (up to 70 pts)} + \text{Roadmap Progress (up to 15 pts)} + \text{Interview Performance (up to 15 pts)}$$

Where:
$$\text{Skills Match} = \frac{\text{Strong Matches} \times 1.0 + \text{Partial Matches} \times 0.5}{\text{Total Required Skills}} \times 70.0$$

Every dashboard displays the exact breakdown formula for complete transparency.

---

## 5. Technology Stack

### Backend
- **Python 3.11**
- **FastAPI:** High-performance async REST API
- **SQLAlchemy 2.0:** Relational ORM with connection pooling
- **SQLite:** Zero-setup local database persistence
- **Google GenAI Python SDK (`google-genai`):** Official Gemini 2.5 Flash LLM integration
- **PyMuPDF (`fitz`):** Safe, high-speed PDF text extraction
- **Pydantic v2:** Strict request/response data contracts
- **Pytest & HTTPX:** End-to-end API test automation

### Frontend
- **React 18 + Vite:** Modern reactive UI build toolchain
- **TypeScript:** End-to-end type safety
- **Tailwind CSS:** SaaS design system with deep navy palette (`#0a0f1d`) and indigo/brand accents
- **Lucide React:** Consistent iconography
- **Vitest & React Testing Library:** Unit and component testing

---

## 6. Local Quickstart & Execution

### Prerequisites
- Node.js 18+ or 22+
- Python 3.11+

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure Gemini API Key
# If omitted, CareerPilot AI will automatically run in high-fidelity Demo Mode.
cp .env.example .env

# Run FastAPI backend server (Port 8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server (Port 5173 with API proxy to port 8000)
npm run dev
```

Open your browser to: **http://localhost:5173**

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, AI engine status, and demo mode indicator |
| `POST` | `/api/career/profile` | Create or update candidate career profile |
| `GET` | `/api/career/profile` | Retrieve active candidate profile |
| `POST` | `/api/career/load-sample` | 1-Click load realistic CS Student demo profile |
| `POST` | `/api/career/voice-parse` | Parse natural language voice dictation |
| `POST` | `/api/resume/upload` | Upload & parse PDF resume via PyMuPDF |
| `POST` | `/api/resume/analyze` | Analyze pasted resume text |
| `POST` | `/api/jobs/analyze` | Analyze job posting & extract ATS keywords |
| `POST` | `/api/skill-gaps/analyze` | Compare skills vs requirements & compute readiness |
| `POST` | `/api/roadmap/generate` | Synthesize 4-week adaptive sprint |
| `PATCH` | `/api/roadmap/tasks/{id}` | Toggle task completion / update task notes |
| `POST` | `/api/roadmap/adapt` | Recalibrate roadmap pacing using Progress Agent |
| `POST` | `/api/projects/recommend` | Propose 3+ capstones addressing missing skills |
| `POST` | `/api/projects/{id}/save` | Save project to personal portfolio plan |
| `POST` | `/api/interviews/start` | Generate role-specific technical questions |
| `POST` | `/api/interviews/evaluate` | Grade answer using 4-part objective rubric |
| `GET` | `/api/applications` | List tracked job applications |
| `POST` | `/api/applications` | Create new job application record |
| `GET` | `/api/agents/activity` | Retrieve agent execution telemetry traces |
| `POST` | `/api/agents/run-pipeline` | Run coordinated multi-agent orchestration pipeline |
| `POST` | `/api/settings/reset-data` | Privacy compliance: erase all saved user data |

---

## 8. Offline Demo Mode

If `GEMINI_API_KEY` is not supplied, CareerPilot AI **automatically activates Demo Mode**:
- Clear, tasteful indicators appear in the header and sidebar.
- High-fidelity, deterministic career domain intelligence parses student inputs, detects Docker/Pytest gaps, builds a 4-week sprint, and evaluates mock interview answers.
- All 8 agents log execution traces in the Agent Activity Center with `is_demo=1`.
- The product demonstrates a full end-to-end journey without network blocks or API quota limits.

---

## 9. Testing & Quality Assurance

### Run Backend Pytest Suite
```bash
PYTHONPATH=backend ./backend/venv/bin/pytest backend/tests/test_api.py -v
```
*(All 9 tests validating health, sample profiles, voice parsing, PyMuPDF extraction, skill gaps, roadmaps, capstones, rubrics, and the multi-agent pipeline pass with 100% success).*

### Run Frontend Vitest Suite & Build
```bash
cd frontend
npm test
npm run build
```

---

## 10. Deployment Architecture

- **Frontend:** Pre-configured for zero-config Vercel / Netlify deployment via `frontend/vercel.json`.
- **Backend:** Ready for deployment on Render, Railway, Fly.io, or AWS with standard Uvicorn commands.
- **Database:** Local SQLite database with automated migration on startup.

---

© 2025 CareerPilot AI Team. Built for the Hackathon.

