import pytest
from backend.src.core.graph import Graph, generate_graph, index_to_letter_label


def test_index_to_letter_label():
    assert index_to_letter_label(0) == "A"
    assert index_to_letter_label(25) == "Z"
    assert index_to_letter_label(26) == "AA"
    assert index_to_letter_label(27) == "AB"


def test_graph_validation_success():
    g = Graph(
        nodes=["A", "B", "C"],
        edges={"A": ["B", "C"], "B": ["C"], "C": []},
        start_node="A",
        goal_node="C",
    )
    assert g.nodes == ["A", "B", "C"]
    assert g.move_gen("A") == ["B", "C"]
    assert g.move_gen("B") == ["C"]
    assert g.move_gen("C") == []


def test_graph_validation_duplicate_nodes():
    with pytest.raises(ValueError, match="Duplicate node labels"):
        Graph(
            nodes=["A", "B", "A"],
            edges={"A": ["B"], "B": []},
            start_node="A",
            goal_node="B",
        )


def test_graph_validation_invalid_start_or_goal():
    with pytest.raises(ValueError, match="Start node 'X' is not in nodes list"):
        Graph(
            nodes=["A", "B"],
            edges={"A": ["B"], "B": []},
            start_node="X",
            goal_node="B",
        )

    with pytest.raises(ValueError, match="Goal node 'Z' is not in nodes list"):
        Graph(
            nodes=["A", "B"],
            edges={"A": ["B"], "B": []},
            start_node="A",
            goal_node="Z",
        )


def test_graph_validation_invalid_edge_target():
    with pytest.raises(ValueError, match="Edge target 'Q' from 'A' is not in nodes list"):
        Graph(
            nodes=["A", "B"],
            edges={"A": ["Q"], "B": []},
            start_node="A",
            goal_node="B",
        )


def test_graph_generation_determinism():
    g1 = generate_graph(num_nodes=8, branching_factor=2, cycle_probability=0.3, seed=12345)
    g2 = generate_graph(num_nodes=8, branching_factor=2, cycle_probability=0.3, seed=12345)
    assert g1.nodes == g2.nodes
    assert g1.edges == g2.edges
    assert g1.start_node == g2.start_node
    assert g1.goal_node == g2.goal_node


def test_graph_generation_different_seeds():
    g1 = generate_graph(num_nodes=10, branching_factor=3, seed=111)
    g2 = generate_graph(num_nodes=10, branching_factor=3, seed=999)
    # With 10 nodes and random branching, edges should differ
    assert g1.edges != g2.edges


def test_graph_custom_start_and_goal():
    g = generate_graph(num_nodes=6, custom_start="B", custom_goal="E", seed=42)
    assert g.start_node == "B"
    assert g.goal_node == "E"


def test_graph_generation_with_disconnected():
    g = generate_graph(num_nodes=8, disconnected_probability=0.8, seed=42)
    assert g.start_node in g.nodes
    assert g.goal_node in g.nodes
    # Ensure graph is valid
    assert len(g.nodes) == 8

