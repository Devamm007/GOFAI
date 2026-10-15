import pytest
from backend.src.core.graph import Graph
from backend.src.core.search_engine import (
    SearchEngine,
    occurs_in,
    remove_seen,
    make_pairs_2,
    make_pairs_3,
    skip_to_2,
    skip_to_3,
    reconstruct_path_2,
    reconstruct_path_3,
)


def test_ancillary_occurs_in():
    pairs = [("A", None), ("B", "A"), ("C", "B")]
    assert occurs_in("A", pairs) is True
    assert occurs_in("B", pairs) is True
    assert occurs_in("C", pairs) is True
    assert occurs_in("D", pairs) is False
    assert occurs_in("A", []) is False

    triples = [("A", None, 0), ("B", "A", 1)]
    assert occurs_in("A", triples) is True
    assert occurs_in("B", triples) is True
    assert occurs_in("Z", triples) is False


def test_ancillary_remove_seen():
    open_list = [("B", "A"), ("C", "A")]
    closed_list = [("A", None)]
    neighbours = ["A", "B", "D", "E", "C"]
    # A is in CLOSED, B and C are in OPEN, D and E are new
    new_nodes = remove_seen(neighbours, open_list, closed_list)
    assert new_nodes == ["D", "E"]


def test_ancillary_skip_to_and_reconstruct_path_pairs():
    # CLOSED ordered most-recent first:
    # Path: S -> B -> G
    closed_list = [
        ("E", "B"),
        ("D", "A"),
        ("C", "A"),
        ("B", "S"),
        ("A", "S"),
        ("S", None),
    ]
    goal_pair = ("G", "B")
    path = reconstruct_path_2(goal_pair, closed_list)
    assert path == ["S", "B", "G"]


def test_ancillary_skip_to_and_reconstruct_path_triples():
    # Triples with depths: S(0) -> B(1) -> G(2)
    closed_list = [
        ("E", "B", 2),
        ("B", "S", 1),
        ("A", "S", 1),
        ("S", None, 0),
    ]
    goal_triple = ("G", "B", 2)
    path = reconstruct_path_3(goal_triple, closed_list)
    assert path == ["S", "B", "G"]


def test_start_equals_goal():
    graph = Graph(
        nodes=["S", "A"],
        edges={"S": ["A"], "A": []},
        start_node="S",
        goal_node="S",
    )
    engine = SearchEngine(graph)

    # BFS
    res_bfs = engine.run_bfs()
    assert res_bfs.found_goal is True
    assert res_bfs.path == ["S"]
    assert res_bfs.terminal_status == "SUCCESS"

    # DFS
    res_dfs = engine.run_dfs()
    assert res_dfs.found_goal is True
    assert res_dfs.path == ["S"]

    # DFID-N
    res_dfid_n = engine.run_dfid_n()
    assert res_dfid_n.found_goal is True
    assert res_dfid_n.path == ["S"]

    # DFID-C
    res_dfid_c = engine.run_dfid_c()
    assert res_dfid_c.found_goal is True
    assert res_dfid_c.path == ["S"]


def test_goal_unreachable():
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={"S": ["A"], "A": ["B"], "B": [], "G": []},
        start_node="S",
        goal_node="G",
    )
    engine = SearchEngine(graph)

    # BFS
    res_bfs = engine.run_bfs()
    assert res_bfs.found_goal is False
    assert res_bfs.path == []
    assert res_bfs.terminal_status == "FAILURE"

    # DFS
    res_dfs = engine.run_dfs()
    assert res_dfs.found_goal is False
    assert res_dfs.path == []

    # DFID-N
    res_dfid_n = engine.run_dfid_n()
    assert res_dfid_n.found_goal is False
    assert res_dfid_n.path == []
    assert "count stagnation" in res_dfid_n.terminal_reason

    # DFID-C on DAG
    res_dfid_c = engine.run_dfid_c()
    assert res_dfid_c.found_goal is False
    assert res_dfid_c.path == []


def test_bfs_vs_dfs_search_order():
    # Tree where BFS and DFS diverge:
    # S -> [A, B]
    # A -> [C, D]
    # B -> [E, G]
    # D -> [G]
    # Goal is G
    graph = Graph(
        nodes=["S", "A", "B", "C", "D", "E", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["C", "D"],
            "B": ["E", "G"],
            "C": [],
            "D": ["G"],
            "E": [],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    engine = SearchEngine(graph)

    res_bfs = engine.run_bfs()
    res_dfs = engine.run_dfs()

    assert res_bfs.found_goal is True
    assert res_dfs.found_goal is True

    # In BFS: S expands [A, B]; A expands [C, D]; B expands [E, G]; G reached via B: path S->B->G
    # In DFS: S expands [A, B]; A expands [C, D]; C expands []; D expands [G]; G reached via D: path S->A->D->G
    assert res_bfs.path == ["S", "B", "G"]
    assert res_dfs.path == ["S", "A", "D", "G"]


def test_cycles_handling():
    # Cycle between S and A: S -> A -> S, and A -> B -> G
    graph = Graph(
        nodes=["S", "A", "B", "G"],
        edges={
            "S": ["A"],
            "A": ["S", "B"],
            "B": ["G"],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    engine = SearchEngine(graph)

    for run_func in [engine.run_bfs, engine.run_dfs, engine.run_dfid_n, engine.run_dfid_c]:
        res = run_func()
        assert res.found_goal is True
        assert res.path == ["S", "A", "B", "G"]


def test_dfid_n_vs_dfid_c_reopening():
    # Graph where node C is reachable via A (first) and B (second):
    # S -> [A, B]
    # A -> [C]
    # B -> [C, G]
    # C -> []
    # G -> []
    # In DB-DFS at depthBound=2:
    # S(0) expands A(1), B(1).
    # A(1) expands C(2). C(2) is in CLOSED.
    # B(1) expands MoveGen(B) = [C, G].
    # In DFID-N: RemoveSeen([C, G], OPEN, CLOSED) prunes C because C is in CLOSED!
    # In DFID-C: RemoveSeen([C, G], OPEN, []) keeps C because CLOSED is ignored!
    graph = Graph(
        nodes=["S", "A", "B", "C", "G"],
        edges={
            "S": ["A", "B"],
            "A": ["C"],
            "B": ["C", "G"],
            "C": [],
            "G": [],
        },
        start_node="S",
        goal_node="G",
    )
    engine = SearchEngine(graph)

    res_dfid_n = engine.run_dfid_n()
    res_dfid_c = engine.run_dfid_c()

    assert res_dfid_n.found_goal is True
    assert res_dfid_c.found_goal is True

    # Check DFID-C events at iteration 2 (depthBound=2) to confirm C was reopened
    c_reopened_events = [
        ev for ev in res_dfid_c.events
        if ev.event_type == "DB_DFS_REMOVE_SEEN" and ev.raw_neighbours == ["C", "G"]
    ]
    assert len(c_reopened_events) >= 1
    # In DFID-C, filtered_nodes contains 'C' and 'G'
    assert "C" in c_reopened_events[0].filtered_nodes
    assert "G" in c_reopened_events[0].filtered_nodes

    # In DFID-N, filtered_nodes only contains 'G' because 'C' was seen in CLOSED
    n_filter_events = [
        ev for ev in res_dfid_n.events
        if ev.event_type == "DB_DFS_REMOVE_SEEN" and ev.raw_neighbours == ["C", "G"]
    ]
    assert len(n_filter_events) >= 1
    assert "C" not in n_filter_events[0].filtered_nodes
    assert "G" in n_filter_events[0].filtered_nodes


def test_open_closed_size_fidelity():
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
    engine = SearchEngine(graph)

    for run_func in [engine.run_bfs, engine.run_dfs, engine.run_dfid_n, engine.run_dfid_c]:
        res = run_func()
        for event in res.events:
            assert event.open_size_before == len(event.open_before)
            assert event.open_size_after == len(event.open_after)
            assert event.closed_size_before == len(event.closed_before)
            assert event.closed_size_after == len(event.closed_after)


def test_dfid_optimality_gap():
    """Authoritative test proving DFID-N is not optimal on graphs while DFID-C is optimal."""
    nodes = ["S", "A", "B", "C", "D", "E", "F", "G"]
    edges = {
        "S": ["A", "D"],
        "A": ["C", "F"],
        "B": ["G"],
        "C": ["E"],
        "D": ["B"],
        "E": ["G"],
        "F": ["B"],
        "G": [],
    }
    graph = Graph(nodes=nodes, edges=edges, start_node="S", goal_node="G")
    engine = SearchEngine(graph)

    res_n = engine.run_dfid_n()
    res_c = engine.run_dfid_c()

    # DFID-C discovers the optimal 3-edge path: S -> D -> B -> G
    assert res_c.found_goal is True
    assert res_c.path == ["S", "D", "B", "G"]
    assert len(res_c.path) == 4

    # DFID-N misses the optimal path because B was prematurely closed via S -> A -> F -> B
    # It instead discovers the longer 4-edge path: S -> A -> C -> E -> G
    assert res_n.found_goal is True
    assert res_n.path == ["S", "A", "C", "E", "G"]
    assert len(res_n.path) == 5
    assert len(res_n.path) > len(res_c.path)


def test_dfid_trace_open_closed_persistence_on_depth_increment():
    """Verify OPEN and CLOSED are preserved on outer DFID events (Lines 7 and 8)."""
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
    engine = SearchEngine(graph)
    for run_func in [engine.run_dfid_n, engine.run_dfid_c]:
        res = run_func()
        inc_events = [ev for ev in res.events if ev.event_type == "DFID_INCREMENT_DEPTH"]
        assert len(inc_events) >= 1
        for inc_ev in inc_events:
            # CLOSED must not be empty at depthBound increment since at least S was explored
            assert len(inc_ev.closed_after) > 0
            assert inc_ev.closed_size_after == len(inc_ev.closed_after)
            # OPEN must match size counter
            assert inc_ev.open_size_after == len(inc_ev.open_after)

