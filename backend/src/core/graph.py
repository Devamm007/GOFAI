import random
import string
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field, model_validator


def index_to_letter_label(index: int) -> str:
    """Generate uppercase letter labels: 0->A, 25->Z, 26->AA, 27->AB, etc."""
    label = ""
    while index >= 0:
        label = chr(ord('A') + (index % 26)) + label
        index = (index // 26) - 1
    return label


class Graph(BaseModel):
    nodes: List[str]
    edges: Dict[str, List[str]] = Field(default_factory=dict)
    start_node: str
    goal_node: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_graph(self):
        # Prevent duplicate node labels
        if len(self.nodes) != len(set(self.nodes)):
            seen = set()
            duplicates = [n for n in self.nodes if n in seen or seen.add(n)]
            raise ValueError(f"Duplicate node labels detected: {duplicates}")

        node_set = set(self.nodes)

        # Validate start and goal
        if self.start_node not in node_set:
            raise ValueError(f"Start node '{self.start_node}' is not in nodes list {self.nodes}")
        if self.goal_node not in node_set:
            raise ValueError(f"Goal node '{self.goal_node}' is not in nodes list {self.nodes}")

        # Ensure every node has an entry in edges and neighbours are sorted alphabetically
        for node in self.nodes:
            if node not in self.edges:
                self.edges[node] = []
            else:
                self.edges[node] = sorted(list(self.edges[node]))

        # Validate edge endpoints and ensure no invalid references
        for src, targets in self.edges.items():
            if src not in node_set:
                raise ValueError(f"Edge source '{src}' is not in nodes list")
            for tgt in targets:
                if tgt not in node_set:
                    raise ValueError(f"Edge target '{tgt}' from '{src}' is not in nodes list")

        return self

    def move_gen(self, node: str) -> List[str]:
        """State-space successor function: MoveGen(N).
        For simplicity, returns neighbours in alphabetical order."""
        if node not in self.edges:
            return []
        return sorted(self.edges[node])

    def to_dict(self) -> dict:
        return {
            "nodes": list(self.nodes),
            "edges": {k: list(v) for k, v in self.edges.items()},
            "start_node": self.start_node,
            "goal_node": self.goal_node,
            "metadata": dict(self.metadata),
        }


def generate_graph(
    num_nodes: int = 7,
    branching_factor: int = 2,
    cycle_probability: float = 0.2,
    disconnected_probability: float = 0.0,
    seed: int = 42,
    custom_start: Optional[str] = None,
    custom_goal: Optional[str] = None,
    ensure_path_to_goal: bool = True,
) -> Graph:
    """Generate a deterministic, directed state-space graph with letter-labelled nodes,
    ordered successor lists, an explicit start node, and an explicit goal node.
    """
    if num_nodes < 2:
        raise ValueError("Graph must have at least 2 nodes")

    rng = random.Random(seed)
    nodes = [index_to_letter_label(i) for i in range(num_nodes)]
    start_node = custom_start if custom_start and custom_start in nodes else nodes[0]
    goal_node = custom_goal if custom_goal and custom_goal in nodes else nodes[-1]

    edges: Dict[str, List[str]] = {n: [] for n in nodes}

    # If ensure_path_to_goal, create at least one backbone path from start to goal
    other_nodes = [n for n in nodes if n != start_node and n != goal_node]
    rng.shuffle(other_nodes)
    
    if ensure_path_to_goal:
        # Determine intermediate backbone path length
        max_intermediates = min(len(other_nodes), max(1, num_nodes // 2))
        path_len = rng.randint(1, max_intermediates) if max_intermediates > 0 else 0
        backbone = [start_node] + other_nodes[:path_len] + [goal_node]
        for i in range(len(backbone) - 1):
            src, tgt = backbone[i], backbone[i + 1]
            if tgt not in edges[src]:
                edges[src].append(tgt)

    # For remaining nodes and branching
    for i, u in enumerate(nodes):
        if disconnected_probability > 0 and u != start_node and u != goal_node:
            if rng.random() < disconnected_probability:
                continue

        # Choose forward successors (DAG structure)
        candidates_forward = [v for v in nodes if v != u and v not in edges[u]]
        # Sort candidates to ensure deterministic behavior across platforms
        candidates_forward.sort()
        rng.shuffle(candidates_forward)

        num_edges_to_add = max(0, min(branching_factor - len(edges[u]), len(candidates_forward)))
        for v in candidates_forward[:num_edges_to_add]:
            if v not in edges[u]:
                edges[u].append(v)

        # Cycles: back-edges
        if cycle_probability > 0 and rng.random() < cycle_probability:
            # Pick a potential cycle target (earlier or any node)
            cycle_candidates = [v for v in nodes if v not in edges[u]]
            cycle_candidates.sort()
            if cycle_candidates:
                target = rng.choice(cycle_candidates)
                edges[u].append(target)

    # Clean up duplicate edges per node while preserving original insertion order
    for u in nodes:
        seen: Set[str] = set()
        deduped = []
        for v in edges[u]:
            if v not in seen:
                seen.add(v)
                deduped.append(v)
        edges[u] = deduped

    return Graph(
        nodes=nodes,
        edges=edges,
        start_node=start_node,
        goal_node=goal_node,
        metadata={
            "seed": seed,
            "branching_factor": branching_factor,
            "cycle_probability": cycle_probability,
            "disconnected_probability": disconnected_probability,
            "ensure_path_to_goal": ensure_path_to_goal,
        },
    )
