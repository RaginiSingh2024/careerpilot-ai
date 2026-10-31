import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

# Use in-memory SQLite with StaticPool so all connections share the same memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "is_demo_mode" in data

def test_load_sample_profile():
    response = client.post("/api/career/load-sample")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alex Chen"
    assert data["target_role"] == "Backend Software Engineer"
    assert len(data["current_skills"]) > 0

def test_voice_goal_parse():
    payload = {
        "text": "I am a computer science student with Python and SQL experience. I want to become a backend engineer studying 2 hours a day."
    }
    response = client.post("/api/career/voice-parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "target_role" in data
    assert "skills" in data

def test_resume_and_job_analysis():
    # Analyze resume text
    res_resp = client.post("/api/resume/analyze", json={
        "resume_text": "Alex Chen. B.S. in Computer Science. Skills: Python, Java, SQL, Git, REST APIs."
    })
    assert res_resp.status_code == 200
    res_data = res_resp.json()
    assert len(res_data["skills"]) > 0

    # Analyze job text
    job_resp = client.post("/api/jobs/analyze", json={
        "raw_text": "Seeking Junior Backend Engineer. Must know Python, SQL, REST APIs, Docker, and Pytest."
    })
    assert job_resp.status_code == 200
    job_data = job_resp.json()
    assert len(job_data["required_skills"]) > 0

def test_skill_gap_and_roadmap():
    # Setup profile
    client.post("/api/career/load-sample")

    # Analyze skill gaps
    gap_resp = client.post("/api/skill-gaps/analyze", json={})
    assert gap_resp.status_code == 200
    gap_data = gap_resp.json()
    assert "readiness_score" in gap_data
    assert len(gap_data["strong_matches"]) > 0
    assert len(gap_data["missing_skills"]) > 0

    # Generate roadmap
    road_resp = client.post("/api/roadmap/generate", json={"weeks": 4})
    assert road_resp.status_code == 200
    road_data = road_resp.json()
    assert len(road_data["tasks"]) > 0
    assert len(road_data["milestones"]) > 0

    # Toggle task
    first_task = road_data["tasks"][0]
    patch_resp = client.patch(f"/api/roadmap/tasks/{first_task['id']}", json={"is_completed": True})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["is_completed"] is True

def test_portfolio_recommendations():
    client.post("/api/career/load-sample")
    client.post("/api/skill-gaps/analyze", json={})
    resp = client.post("/api/projects/recommend", json={"count": 3})
    assert resp.status_code == 200
    projects = resp.json()
    assert len(projects) >= 3
    assert "problem_statement" in projects[0]

def test_mock_interview_flow():
    start_resp = client.post("/api/interviews/start", json={
        "target_role": "Backend Software Engineer",
        "topic": "Databases & Query Optimization",
        "num_questions": 2
    })
    assert start_resp.status_code == 200
    session_data = start_resp.json()
    assert len(session_data["qa_items"]) >= 2

    # Evaluate answer
    qa_id = session_data["qa_items"][0]["id"]
    eval_resp = client.post("/api/interviews/evaluate", json={
        "qa_id": qa_id,
        "user_answer": "B-Trees are balanced trees supporting range queries with O(log N) lookup time. Hash indexes provide O(1) exact equality lookup but cannot perform range scans. Adding too many indexes slows down INSERT and UPDATE operations because index pages must be updated."
    })
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["score"] > 60
    assert "suggested_improved_answer" in eval_data

def test_job_application_tracker():
    app_payload = {
        "company": "Vercel",
        "role": "Backend Engineer",
        "source": "LinkedIn",
        "status": "Applied",
        "job_url": "https://vercel.com/careers"
    }
    create_resp = client.post("/api/applications", json=app_payload)
    assert create_resp.status_code == 200
    app_id = create_resp.json()["id"]

    # Update status
    patch_resp = client.patch(f"/api/applications/{app_id}", json={"status": "Interview"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "Interview"

    # Get metrics
    metrics_resp = client.get("/api/applications/metrics")
    assert metrics_resp.status_code == 200
    assert metrics_resp.json()["total_applications"] >= 1

def test_orchestrated_pipeline():
    pipe_resp = client.post("/api/agents/run-pipeline", json={})
    assert pipe_resp.status_code == 200
    data = pipe_resp.json()
    assert data["status"] == "success"
    assert len(data["executed_agents"]) >= 5

    # Check agent activity log
    act_resp = client.get("/api/agents/activity")
    assert act_resp.status_code == 200
    assert len(act_resp.json()) >= 5
