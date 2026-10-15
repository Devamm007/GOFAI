import pytest
from fastapi.testclient import TestClient
from backend.src.api.main import app
from backend.src.db.session import init_db

# Initialize database for tests
init_db()
client = TestClient(app)


def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "BFS" in data["supported_algorithms"]
    assert "DFID-C" in data["supported_algorithms"]


def test_api_graph_generate():
    payload = {
        "num_nodes": 6,
        "branching_factor": 2,
        "cycle_probability": 0.2,
        "seed": 42,
    }
    res = client.post("/api/graph/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["nodes"]) == 6
    assert data["start_node"] in data["nodes"]
    assert data["goal_node"] in data["nodes"]


def test_api_search_run_bfs_and_persist():
    graph_payload = {
        "nodes": ["S", "A", "G"],
        "edges": {"S": ["A"], "A": ["G"], "G": []},
        "start_node": "S",
        "goal_node": "G",
    }
    search_payload = {
        "graph": graph_payload,
        "algorithm": "BFS",
        "persist": True,
    }
    res = client.post("/api/search/run", json=search_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["algorithm"] == "BFS"
    assert data["found_goal"] is True
    assert data["path"] == ["S", "A", "G"]
    assert data["run_id"] is not None
    assert len(data["events"]) > 0

    # Test retrieval from history
    run_id = data["run_id"]
    get_res = client.get(f"/api/runs/{run_id}")
    assert get_res.status_code == 200
    run_data = get_res.json()
    assert run_data["id"] == run_id
    assert run_data["algorithm"] == "BFS"
    assert run_data["path"] == ["S", "A", "G"]
    assert len(run_data["events"]) == len(data["events"])


def test_api_search_run_dfid_n_and_dfid_c():
    graph_payload = {
        "nodes": ["S", "A", "B", "G"],
        "edges": {
            "S": ["A", "B"],
            "A": ["G"],
            "B": ["G"],
            "G": [],
        },
        "start_node": "S",
        "goal_node": "G",
    }

    for algo in ["DFID-N", "DFID-C"]:
        search_payload = {
            "graph": graph_payload,
            "algorithm": algo,
            "persist": True,
        }
        res = client.post("/api/search/run", json=search_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["algorithm"] == algo
        assert data["found_goal"] is True
        assert data["path"] == ["S", "A", "G"]


def test_api_search_invalid_algorithm():
    graph_payload = {
        "nodes": ["S", "G"],
        "edges": {"S": ["G"], "G": []},
        "start_node": "S",
        "goal_node": "G",
    }
    search_payload = {
        "graph": graph_payload,
        "algorithm": "A_STAR_NON_EXISTENT",
    }
    res = client.post("/api/search/run", json=search_payload)
    assert res.status_code == 400
    assert "Unsupported algorithm" in res.json()["detail"]


def test_api_list_runs():
    res = client.get("/api/runs")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
