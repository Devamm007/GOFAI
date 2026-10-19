import os
import pytest
from fastapi.testclient import TestClient
from backend.src.api.main import app

client = TestClient(app)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_api_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "AI-SMPS-2023" in data["spec_version"]
    assert set(data["supported_algorithms"]) == {"BFS", "DFS", "DFID-N", "DFID-C"}


def test_heuristic_html_asset_integrity():
    """Verify that week3-pa4-gemini.html exists and is deployment-safe in public folder."""
    public_html = os.path.join(REPO_ROOT, "frontend", "public", "week3-pa4-gemini.html")
    assert os.path.exists(public_html), f"Missing public HTML visualizer: {public_html}"
    assert os.path.getsize(public_html) > 50000

    with open(public_html, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify key heuristic elements and back navigation
    assert "h1" in content or "Misplaced" in content
    assert "h2" in content or "Level" in content
    assert "h3" in content or "Support" in content
    assert "h4" in content or "Deep" in content
    assert "three.min.js" in content
    assert "triggerHillClimbing" in content
    assert 'href="/"' in content or "Lab Home" in content


def test_pdf_course_documents_integrity():
    """Verify that official course PDFs exist in frontend/public/docs for static serving."""
    docs_dir = os.path.join(REPO_ROOT, "frontend", "public", "docs")
    assert os.path.exists(docs_dir), f"Missing docs directory: {docs_dir}"

    for pdf_name in ["symbols.pdf", "algorithms_week2.pdf", "algorithms_week3.pdf"]:
        pdf_path = os.path.join(docs_dir, pdf_name)
        assert os.path.exists(pdf_path), f"Missing PDF asset: {pdf_path}"
        assert os.path.getsize(pdf_path) > 10000, f"PDF file suspiciously small: {pdf_path}"


def test_search_visualizer_engine_remains_operational():
    """Verify that the core algorithm visualizer engine remains 100% operational."""
    graph_payload = {
        "nodes": ["S", "A", "G"],
        "edges": {"S": ["A"], "A": ["G"], "G": []},
        "start_node": "S",
        "goal_node": "G",
    }
    for algo in ["BFS", "DFS", "DFID-N", "DFID-C"]:
        res = client.post(
            "/api/search/run",
            json={"graph": graph_payload, "algorithm": algo, "persist": False},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["algorithm"] == algo
        assert data["found_goal"] is True
        assert len(data["events"]) > 0
