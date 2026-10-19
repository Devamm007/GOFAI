import pytest
from fastapi.testclient import TestClient

from backend.src.api.main import app
from backend.src.core.graph import Graph
from backend.src.core.informed_search_engine import (
    InformedSearchEngine,
    make_pairs_h,
    occurs_in,
    reconstruct_path_h,
    remove_seen,
    sort_h,
)


def test_sort_h_ordering_and_tie_breaking():
    """
    Verifies that sort_h strictly adheres to Week 3, Page 2 & 3 rules:
    - Primary key: h(node) ascending (lower distance is better)
    - Secondary key: alphabetical order of node label
    """
    heuristic = {"C": 5.0, "A": 3.0, "B": 3.0, "D": 1.0}
    
    # Test on raw node list
    nodes = ["C", "B", "A", "D"]
    sorted_nodes = sort_h(nodes, heuristic)
    # D (1.0), then A & B both 3.0 -> A before B alphabetically, then C (5.0)
    assert sorted_nodes == ["D", "A", "B", "C"]

    # Test on triples (node, parent, h)
    triples = [
        ("C", "S", 5.0),
        ("B", "S", 3.0),
        ("A", "S", 3.0),
        ("D", "S", 1.0),
    ]
    sorted_triples = sort_h(triples, heuristic)
    assert [t[0] for t in sorted_triples] == ["D", "A", "B", "C"]


def test_best_first_search_minimal_success():
    """
    Tests Best-First-Search on a basic graph finding goal path.
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["G"],
            "B": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    # Heuristic steering towards B (h=1) over A (h=4)
    heuristic = {"S": 5.0, "A": 4.0, "B": 1.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_first_search()

    assert result.found_goal is True
    assert result.path == ["S", "B", "G"]
    assert result.terminal_status == "SUCCESS"
    assert result.terminal_reason == "GOAL_FOUND"


def test_best_first_search_start_equals_goal():
    """
    When start_node == goal_node, Best-First-Search terminates on the first iteration.
    """
    graph = Graph(
        nodes=["S", "A"],
        edges={"S": ["A"], "A": []},
        start_node="S",
        goal_node="S",
    )
    heuristic = {"S": 0.0, "A": 2.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_first_search()

    assert result.found_goal is True
    assert result.path == ["S"]
    assert result.nodes_expanded == 0
    # Line 6 evaluated GoalTest(S) = TRUE, Line 7 returned path
    goal_event = [ev for ev in result.events if ev.event_type == "GOAL_FOUND"][0]
    assert goal_event.line_number == 7


def test_best_first_search_goal_unreachable():
    """
    When goal cannot be reached, OPEN empties and Line 13 executes.
    """
    graph = Graph(
        nodes=["S", "A", "G"],
        edges={"S": ["A"], "A": [], "G": []},
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 10.0, "A": 5.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_first_search()

    assert result.found_goal is False
    assert result.path == []
    assert result.terminal_status == "FAILURE"
    assert result.terminal_reason == "OPEN_EMPTY"

    last_event = result.events[-1]
    assert last_event.line_number == 13
    assert last_event.event_type == "TERMINATE_FAILURE"


def test_best_first_search_cycle_handling():
    """
    Verifies that cycles are pruned by RemoveSeen without infinite loops.
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A"],
            "A": ["B", "S"],  # Cycle back to S
            "B": ["A", "G"],  # Cycle back to A
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 3.0, "A": 2.0, "B": 1.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_first_search()

    assert result.found_goal is True
    assert result.path == ["S", "A", "B", "G"]


def test_best_first_search_tie_breaking():
    """
    Verifies that two nodes with identical heuristic values are expanded in alphabetical order.
    """
    graph = Graph(
        nodes=["S", "Z", "A", "G"],
        edges={
            "S": ["Z", "A"],  # MoveGen produces Z then A
            "Z": ["G"],
            "A": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    # Both Z and A have identical h = 2.0
    heuristic = {"S": 5.0, "Z": 2.0, "A": 2.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_first_search()

    assert result.found_goal is True
    # By Week 3 Page 2 rule, 'A' must be chosen over 'Z' due to alphabetical tie-breaking!
    assert result.path == ["S", "A", "G"]


def test_best_first_search_source_line_fidelity():
    """
    Verifies that all events map to valid source pseudocode lines (1 through 13).
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={"S": ["A", "B"], "A": ["G"], "B": ["G"], "G": []},
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 3.0, "A": 1.0, "B": 2.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_first_search()

    valid_lines = set(range(1, 14))
    for ev in result.events:
        assert ev.line_number in valid_lines, f"Invalid source line {ev.line_number}"
        assert ev.algorithm == "Best-First-Search"
        assert ev.line_pseudocode != ""


def test_api_informed_search_endpoint():
    """
    Tests the POST /api/search/informed/run endpoint.
    """
    client = TestClient(app)
    payload = {
        "graph": {
            "nodes": ["S", "A", "B", "G"],
            "edges": {"S": ["A", "B"], "A": ["G"], "B": ["G"], "G": []},
            "start_node": "S",
            "goal_node": "G",
        },
        "algorithm": "Best-First-Search",
        "heuristic": {"S": 4.0, "A": 1.0, "B": 3.0, "G": 0.0},
        "persist": False,
    }

    res = client.post("/api/search/informed/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["algorithm"] == "Best-First-Search"
    assert data["found_goal"] is True
    assert data["path"] == ["S", "A", "G"]
    assert len(data["events"]) > 0


def test_api_informed_search_invalid_algorithm():
    """
    Rejects unsupported informed algorithm names with HTTP 400.
    """
    client = TestClient(app)
    payload = {
        "graph": {
            "nodes": ["S", "G"],
            "edges": {"S": ["G"], "G": []},
            "start_node": "S",
            "goal_node": "G",
        },
        "algorithm": "Unknown-Algo",
        "heuristic": {},
    }
    res = client.post("/api/search/informed/run", json=payload)
    assert res.status_code == 400


def test_move_gen_open_preserves_duplicates():
    """
    Tests Move-Gen(OPEN) ancillary procedure from Page 3, line 4:
    Explicitly verifies that duplicates are preserved when multiple nodes
    in OPEN share a common child.
    """
    from backend.src.core.informed_search_engine import move_gen_open

    move_gen_fn = lambda x: ["C", "D"] if x == "A" else ["C", "E"]
    open_list = ["A", "B"]
    nbrs = move_gen_open(open_list, move_gen_fn)
    # Both A and B generate C -> C should appear twice
    assert nbrs == ["C", "D", "C", "E"]


def test_beam_search_finds_goal():
    """
    Tests Beam-Search with w=2 on a graph where goal is reachable.
    """
    graph = Graph(
        nodes=["S", "A", "B", "C", "D", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["C", "D"],
            "B": ["G"],
            "C": [],
            "D": [],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    # B has lower heuristic than A -> included in beam
    heuristic = {"S": 10.0, "A": 8.0, "B": 2.0, "C": 7.0, "D": 6.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_beam_search(beam_width=2)

    assert result.found_goal is True
    assert result.terminal_status == "SUCCESS"
    assert result.terminal_reason == "GOAL_FOUND"
    assert "G" in result.path

    # Verify individual MOVE_GEN_NODE events for nodes in OPEN
    move_gen_events = [ev for ev in result.events if ev.event_type == "MOVE_GEN_NODE"]
    # Iteration 1 expanded S -> ['A', 'B']
    assert move_gen_events[0].current_node == "S"
    assert move_gen_events[0].raw_neighbours == ["A", "B"]
    assert move_gen_events[0].new_pairs == [["A", "S"], ["B", "S"]]

    # Iteration 2 expanded B then A individually
    assert move_gen_events[1].current_node == "B"
    assert move_gen_events[1].raw_neighbours == ["G"]
    assert move_gen_events[1].new_pairs == [["G", "B"]]

    assert move_gen_events[2].current_node == "A"
    assert move_gen_events[2].raw_neighbours == ["C", "D"]
    assert move_gen_events[2].new_pairs == [["C", "A"], ["D", "A"]]


def test_beam_search_heuristic_stagnation():
    """
    Tests Beam-Search terminating at Line 10 when a new layer fails to improve h.
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A"],
            "A": ["B"],
            "B": [],
        },
        start_node="S",
        goal_node="G",
    )
    # A has h=5 (better than S h=10), but B has h=8 (worse than A)
    heuristic = {"S": 10.0, "A": 5.0, "B": 8.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_beam_search(beam_width=1)

    assert result.found_goal is False
    assert result.terminal_status == "STOPPED"
    assert result.terminal_reason == "HEURISTIC_STAGNATION"


def test_hill_climbing_local_optimum():
    """
    Tests Hill-Climbing strictly climbing while h improves, and stopping at local optimum.
    """
    graph = Graph(
        nodes=["S", "A", "B", "C"],
        edges={
            "S": ["A", "B"],
            "A": ["C"],
            "B": [],
            "C": [],
        },
        start_node="S",
        goal_node="C",
    )
    # S(10) -> A(6) -> C(8: worse than A)
    heuristic = {"S": 10.0, "A": 6.0, "B": 9.0, "C": 8.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_hill_climbing()

    # Converges to A because C (h=8) is not better than A (h=6)
    assert result.path == ["S", "A"]
    assert result.terminal_status == "LOCAL_OPTIMUM"
    assert result.terminal_reason == "NO_BETTER_NEIGHBOUR"


def test_variable_neighbourhood_descent():
    """
    Tests Variable-Neighbourhood-Descent switching to second neighborhood structure.
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A"],  # 1-hop only goes to A
            "A": [],      # A has no 1-hop neighbours
            "B": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 10.0, "A": 7.0, "B": 3.0, "G": 0.0}

    # MoveGen1: direct edges
    mg1 = graph.move_gen
    # MoveGen2: jumps from S to B
    mg2 = lambda u: ["B"] if u in {"S", "A"} else graph.move_gen(u)

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_variable_neighbourhood_descent(move_gen_list=[mg1, mg2])

    assert result.found_goal is True
    assert "B" in result.path or "G" in result.path


def test_vnd_escapes_local_optimum_via_2hop_strategy():
    """
    Verifies that VND with 2-hop jump strategy escapes the local optimum trap where Hill Climbing gets stuck.
    - S -> A (h=4) vs B (h=6)
    - At A, 1-hop neighbours are C (7), D (8): trapped!
    - Under MoveGen_2 (2-hop), A -> C -> E (h=2): strictly better! VND climbs to E, then E -> G (0)!
    """
    graph = Graph(
        nodes=["S", "A", "B", "C", "D", "E", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["C", "D"],
            "B": ["E"],
            "C": ["E"],
            "D": [],
            "E": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 10.0, "A": 4.0, "B": 6.0, "C": 7.0, "D": 8.0, "E": 2.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)

    # Standard Hill Climbing gets trapped at A
    res_hc = engine.run_hill_climbing()
    assert res_hc.found_goal is False
    assert res_hc.path == ["S", "A"]

    # VND with 2-hop jumps escapes to E and reaches G!
    res_vnd = engine.run_variable_neighbourhood_descent(strategy="k-hop")
    assert res_vnd.found_goal is True
    assert res_vnd.path == ["G"]
    assert res_vnd.terminal_status == "SUCCESS"
    assert any(ev.event_type == "POP_MOVEGEN" for ev in res_vnd.events)
    assert any(ev.event_type == "MOVE_GEN_NEIGHBOURS" for ev in res_vnd.events)


def test_best_neighbour_search():
    """
    Tests Best-Neighbour-Search taking the best neighbour at each step.
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A"],
            "A": ["B"],
            "B": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 5.0, "A": 6.0, "B": 2.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_best_neighbour_search(max_iterations=10)

    assert result.found_goal is True
    assert result.path == ["S", "A", "B", "G"]


def test_iterated_hill_climbing():
    """
    Tests Iterated-Hill-Climbing over multiple restarts tracking global best.
    """
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A"],
            "A": [],
            "B": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 10.0, "A": 8.0, "B": 4.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    result = engine.run_iterated_hill_climbing(restarts=3, candidate_seeds=["S", "B", "A"])

    assert result.found_goal is True
    assert result.path[-1] == "G"


def test_tsp_nearest_neighbour():
    """
    Tests Nearest-Neighbour-Heuristic on a 4-city metric TSP.
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D"]
    costs = {
        ("A", "B"): 2.0,
        ("A", "C"): 9.0,
        ("A", "D"): 10.0,
        ("B", "C"): 6.0,
        ("B", "D"): 4.0,
        ("C", "D"): 8.0,
    }
    engine = TSPEngine(cities, costs)
    res = engine.run_nearest_neighbour(start_city="A")

    assert res.algorithm == "Nearest-Neighbour-Heuristic"
    # A -> nearest is B (2.0) -> from B nearest unvisited is D (4.0) -> from D only C remains (8.0) -> C to A (9.0)
    assert res.tour == ["A", "B", "D", "C", "A"]
    assert res.total_cost == 2.0 + 4.0 + 8.0 + 9.0
    assert len(res.events) > 0


def test_tsp_greedy_heuristic():
    """
    Tests Greedy-Heuristic on a 4-city metric TSP.
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D"]
    costs = {
        ("A", "B"): 2.0,
        ("B", "D"): 4.0,
        ("B", "C"): 6.0,
        ("C", "D"): 8.0,
        ("A", "C"): 9.0,
        ("A", "D"): 10.0,
    }
    engine = TSPEngine(cities, costs)
    res = engine.run_greedy_heuristic()

    assert res.algorithm == "Greedy-Heuristic"
    assert len(res.tour) == 5
    assert res.tour[0] == res.tour[-1]
    assert res.total_cost > 0


def test_tsp_savings_heuristic():
    """
    Tests Savings-Heuristic (Clarke-Wright) on a 4-city metric TSP.
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D"]
    costs = {
        ("A", "B"): 10.0,
        ("A", "C"): 12.0,
        ("A", "D"): 8.0,
        ("B", "C"): 5.0,
        ("B", "D"): 7.0,
        ("C", "D"): 9.0,
    }
    engine = TSPEngine(cities, costs)
    res = engine.run_savings_heuristic(base_city="A")

    assert res.algorithm == "Savings-Heuristic"
    assert len(res.tour) == 5
    assert res.tour[0] == "A"
    assert res.tour[-1] == "A"
    assert res.total_cost > 0


def test_api_all_informed_algorithms():
    """
    Tests the POST /api/search/informed/run endpoint with all supported Week 3 algorithms.
    """
    client = TestClient(app)
    graph_dict = {
        "nodes": ["S", "A", "B", "G"],
        "edges": {"S": ["A", "B"], "A": ["G"], "B": ["G"], "G": []},
        "start_node": "S",
        "goal_node": "G",
    }
    heuristic = {"S": 4.0, "A": 1.0, "B": 3.0, "G": 0.0}

    for algo in ["Best-First-Search", "Beam-Search", "Hill-Climbing", "Variable-Neighbourhood-Descent", "Best-Neighbour-Search", "Iterated-Hill-Climbing"]:
        payload = {
            "graph": graph_dict,
            "algorithm": algo,
            "heuristic": heuristic,
            "beam_width": 2,
            "restarts": 2,
        }
        res = client.post("/api/search/informed/run", json=payload)
        assert res.status_code == 200, f"Failed for algorithm {algo}: {res.text}"
        data = res.json()
        assert data["algorithm"] == algo
        assert len(data["events"]) > 0


def test_api_tsp_endpoint():
    """
    Tests the POST /api/search/tsp/run endpoint with all three TSP heuristics.
    """
    client = TestClient(app)
    payload = {
        "cities": ["A", "B", "C", "D"],
        "costs": {
            "A": {"B": 2.0, "C": 9.0, "D": 10.0},
            "B": {"A": 2.0, "C": 6.0, "D": 4.0},
            "C": {"A": 9.0, "B": 6.0, "D": 8.0},
            "D": {"A": 10.0, "B": 4.0, "C": 8.0},
        },
        "algorithm": "Savings-Heuristic",
        "base_city": "A",
    }

    for algo in ["Nearest-Neighbour-Heuristic", "Greedy-Heuristic", "Savings-Heuristic"]:
        payload["algorithm"] = algo
        res = client.post("/api/search/tsp/run", json=payload)
        assert res.status_code == 200, f"Failed for TSP {algo}: {res.text}"
        data = res.json()
        assert data["algorithm"] == algo
        assert len(data["tour"]) == 5
        assert data["total_cost"] > 0


def test_beam_search_pruning_pitfall_w1_vs_w2():
    """
    Verifies the Beam Search Pruning Pitfall:
    - With w=1, Beam Search greedily commits to A (h=3) over B (h=5), pruning B. Branch A hits dead ends C and D, failing to find G.
    - With w=2, Beam Search retains both A and B, discovering G at the next level with continuous path [S, B, G].
    """
    graph = Graph(
        nodes=["S", "A", "B", "C", "D", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["C", "D"],
            "B": ["G"],
            "C": [],
            "D": [],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 10.0, "A": 3.0, "B": 5.0, "C": 8.0, "D": 7.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)

    # With w=1: fails to find goal G, returns bestEver A directly per Line 10
    res_w1 = engine.run_beam_search(beam_width=1)
    assert res_w1.found_goal is False
    assert res_w1.path == ["A"]
    assert res_w1.terminal_status == "STOPPED"
    assert res_w1.terminal_reason == "HEURISTIC_STAGNATION"

    # With w=2: succeeds in finding goal G, returns goal node G directly per Line 5
    res_w2 = engine.run_beam_search(beam_width=2)
    assert res_w2.found_goal is True
    assert res_w2.path == ["G"]
    assert res_w2.terminal_status == "SUCCESS"
    assert res_w2.terminal_reason == "GOAL_FOUND"


def test_beam_search_path_continuity_multi_parent():
    """
    Verifies that Beam Search correctly identifies the goal in OPEN across multi-parent candidates
    and returns [goal_node] per Line 5.
    """
    graph = Graph(
        nodes=["S", "P1", "P2", "C1", "C2", "G"],
        edges={
            "S": ["P1", "P2"],
            "P1": ["C1"],
            "P2": ["C2"],
            "C1": [],
            "C2": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    # Heuristic where P1 (h=3) is slightly better than P2 (h=4), but P2 leads to C2 (h=2) -> G (h=0)
    heuristic = {"S": 10.0, "P1": 3.0, "P2": 4.0, "C1": 8.0, "C2": 2.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    res = engine.run_beam_search(beam_width=2)

    assert res.found_goal is True
    # In Week 3 Page 3, Beam Search returns the goal node directly (no path reconstruction)
    assert res.path == ["G"]


def test_local_optimum_trap_hc_vs_vnd_and_best_first():
    """
    Verifies the Local Optimum Trap:
    - Hill Climbing steps to local minimum A (h=4) and gets trapped because all neighbours C (7), D (8) are worse.
    - Best-First Search backtracks to B (6) -> E (2) -> G (0).
    - VND (2-hop) escapes the local optimum and reaches G.
    """
    graph = Graph(
        nodes=["S", "A", "B", "C", "D", "E", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["C", "D"],
            "B": ["E"],
            "C": [],
            "D": [],
            "E": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 10.0, "A": 4.0, "B": 6.0, "C": 7.0, "D": 8.0, "E": 2.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)

    # Hill Climbing: halts at A
    res_hc = engine.run_hill_climbing()
    assert res_hc.found_goal is False
    assert res_hc.path == ["S", "A"]
    assert res_hc.terminal_status == "LOCAL_OPTIMUM"

    # Best-First Search: finds G
    res_bfs = engine.run_best_first_search()
    assert res_bfs.found_goal is True
    assert res_bfs.path == ["S", "B", "E", "G"]

    # Iterated Hill Climbing: restarts escape local optimum and reach G
    res_ihc = engine.run_iterated_hill_climbing(restarts=3, candidate_seeds=["S", "B"])
    assert res_ihc.found_goal is True
    assert res_ihc.path[-1] == "G"


def test_plateau_stagnation_strict_inequality():
    """
    Verifies that Hill Climbing terminates at state A when encountering a plateau
    (h(A) == h(B) == 5), per Page 3 Line 4 `while h(N) is better than h(bestEver)`.
    """
    graph = Graph(
        nodes=["S", "A", "B", "C", "G"],
        edges={
            "S": ["A"],
            "A": ["B"],
            "B": ["C"],
            "C": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    heuristic = {"S": 8.0, "A": 5.0, "B": 5.0, "C": 5.0, "G": 0.0}

    engine = InformedSearchEngine(graph, heuristic)
    res_hc = engine.run_hill_climbing()

    # Step S -> A was an improvement (8 -> 5).
    # At A, neighbour B has h=5, which is not strictly less than 5.
    # Therefore, HC halts at A.
    assert res_hc.found_goal is False
    assert res_hc.path == ["S", "A"]
    assert res_hc.terminal_status == "LOCAL_OPTIMUM"


def test_tsp_nn_outlier_trap_contrast():
    """
    Verifies TSP contrasting behavior on Nearest-Neighbour Outlier Trap:
    - Nearest-Neighbour starting at A visits clustered A -> B -> C -> E -> D, leaving D last, forcing a huge return leg D -> A (15). Total cost 23.0.
    - Greedy and Savings achieve the optimal tour with total cost 11.0 (>100% cost improvement over NN)!
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D", "E"]
    costs = {
        ("A", "B"): 2.0,
        ("A", "C"): 2.0,
        ("A", "D"): 15.0,
        ("A", "E"): 3.0,
        ("B", "C"): 2.0,
        ("B", "D"): 3.0,
        ("B", "E"): 15.0,
        ("C", "D"): 15.0,
        ("C", "E"): 2.0,
        ("D", "E"): 2.0,
    }

    engine = TSPEngine(cities, costs)

    res_nn = engine.run_nearest_neighbour(start_city="A")
    res_greedy = engine.run_greedy_heuristic()
    res_savings = engine.run_savings_heuristic(base_city="A")

    # Verify all tours are valid full TSP cycles
    for res in [res_nn, res_greedy, res_savings]:
        assert len(res.tour) == len(cities) + 1
        assert res.tour[0] == res.tour[-1]
        assert set(res.tour) == set(cities)

    # NN cost is 23.0, Greedy is 11.0, Savings is 11.0
    assert res_nn.total_cost == 23.0
    assert res_greedy.total_cost == 11.0
    assert res_savings.total_cost == 11.0
    assert res_greedy.total_cost < res_nn.total_cost
    assert res_savings.total_cost < res_nn.total_cost


def test_tsp_greedy_deadlock_contrast():
    """
    Verifies that Greedy gets trapped into a high cost tour (32.0) due to degree saturation
    and premature loop constraints, whereas NN and Savings find the much cheaper tour (22.0).
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D", "E"]
    costs = {
        ("A", "B"): 4.0,
        ("A", "C"): 1.0,
        ("A", "D"): 9.0,
        ("A", "E"): 8.0,
        ("B", "C"): 8.0,
        ("B", "D"): 5.0,
        ("B", "E"): 4.0,
        ("C", "D"): 18.0,
        ("C", "E"): 3.0,
        ("D", "E"): 19.0,
    }

    engine = TSPEngine(cities, costs)
    res_nn = engine.run_nearest_neighbour(start_city="A")
    res_greedy = engine.run_greedy_heuristic()
    res_savings = engine.run_savings_heuristic(base_city="A")

    assert res_greedy.total_cost == 32.0
    assert res_nn.total_cost == 22.0
    assert res_savings.total_cost == 22.0
    assert res_greedy.total_cost > res_nn.total_cost
    assert res_greedy.total_cost > res_savings.total_cost


def test_tsp_hub_and_spoke_savings_optimality():
    """
    Verifies that Savings Heuristic discovers the optimal tour on the depot distribution benchmark,
    decisively beating NN and Greedy (44.0 vs 76.0).
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D", "E"]
    costs = {
        ("A", "B"): 4.0,
        ("A", "C"): 13.0,
        ("A", "D"): 30.0,
        ("A", "E"): 13.0,
        ("B", "C"): 6.0,
        ("B", "D"): 8.0,
        ("B", "E"): 6.0,
        ("C", "D"): 12.0,
        ("C", "E"): 7.0,
        ("D", "E"): 29.0,
    }

    engine = TSPEngine(cities, costs)
    res_savings = engine.run_savings_heuristic(base_city="A")
    res_nn = engine.run_nearest_neighbour(start_city="A")
    res_greedy = engine.run_greedy_heuristic()

    assert res_savings.total_cost == 44.0
    assert res_nn.total_cost == 76.0
    assert res_greedy.total_cost == 76.0
    assert res_savings.total_cost < res_nn.total_cost
    assert res_savings.total_cost < res_greedy.total_cost

    assert len(res_savings.tour) == 6
    assert res_savings.tour[0] == res_savings.tour[-1] == "A"


def test_tsp_clustered_islands_bridge_trap():
    """
    Verifies that NN falls into the premature bridge trap (crossing B -> D before visiting C),
    stranding C and forcing an inflated tour cost (42.0), while Savings consolidates both clusters (24.0).
    """
    from backend.src.core.tsp_engine import TSPEngine

    cities = ["A", "B", "C", "D", "E", "F"]
    costs = {
        ("A", "B"): 3.0,
        ("A", "C"): 6.0,
        ("A", "D"): 18.0,
        ("A", "E"): 22.0,
        ("A", "F"): 5.0,
        ("B", "C"): 4.0,
        ("B", "D"): 2.0,
        ("B", "E"): 20.0,
        ("B", "F"): 22.0,
        ("C", "D"): 5.0,
        ("C", "E"): 20.0,
        ("C", "F"): 24.0,
        ("D", "E"): 3.0,
        ("D", "F"): 6.0,
        ("E", "F"): 4.0,
    }

    engine = TSPEngine(cities, costs)
    res_nn = engine.run_nearest_neighbour(start_city="A")
    res_savings = engine.run_savings_heuristic(base_city="A")

    assert res_nn.total_cost == 42.0
    assert res_savings.total_cost == 24.0
    assert res_savings.total_cost < res_nn.total_cost
    assert len(res_savings.tour) == 7
    assert res_savings.tour[0] == res_savings.tour[-1] == "A"



