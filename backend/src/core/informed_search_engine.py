"""
Code-faithful Informed Search Engine for AI SMPS 2023 Week 3.
Implements Best-First-Search and supporting algorithms strictly adhering to
specifications in `algorithms_week3.pdf` (prepared by S. Baskaran, IIT Madras).
"""

from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from backend.src.core.graph import Graph
from backend.src.core.types import SearchResult, TraceEvent


def move_gen_open(open_list: List[str], move_gen_fn: Any) -> List[str]:
    """
    Move-Gen(OPEN) ancillary procedure (Week 3, Page 3, Lines 1–4):
    1  neighbours ← []
    2  for each X in OPEN
    3     neighbours ← neighbours ++ Move-Gen(X)
    4  return neighbours   ▷ the list preserves duplicates
    """
    neighbours: List[str] = []
    for x in open_list:
        neighbours.extend(move_gen_fn(x))
    return neighbours


def occurs_in(node: str, tuple_list: List[Any]) -> bool:
    """
    Occurs-In ancillary procedure:
    Checks if a node label occurs as the first element in any tuple or directly in a list.
    """
    for item in tuple_list:
        if isinstance(item, (list, tuple)) and len(item) > 0:
            if item[0] == node:
                return True
        elif item == node:
            return True
    return False


def remove_seen(neighbours: List[str], open_list: List[Any], closed_list: List[Any]) -> List[str]:
    """
    Remove-Seen ancillary procedure:
    Filters neighbours that already appear in either OPEN or CLOSED.
    """
    return [
        n for n in neighbours
        if not occurs_in(n, open_list) and not occurs_in(n, closed_list)
    ]


def sort_h(items: List[Any], heuristic: Dict[str, float]) -> List[Any]:
    """
    sort_h heuristic sorting function with authoritative tie-breaking (Week 3, Page 2 & 3):
    - Primary key: h(node) ascending (lower heuristic distance/cost is better)
    - Secondary tie-breaker: alphabetical order of node label ascending
    """
    def sort_key(item: Any) -> Tuple[float, str]:
        if isinstance(item, (list, tuple)):
            node = str(item[0])
            h_val = float(item[2]) if len(item) > 2 and item[2] is not None else heuristic.get(node, float("inf"))
        else:
            node = str(item)
            h_val = heuristic.get(node, float("inf"))
        return (h_val, node)

    return sorted(items, key=sort_key)


def make_pairs_h(new_nodes: List[str], parent: str, heuristic: Dict[str, float]) -> List[Tuple[str, Optional[str], float]]:
    """
    Make-Pairs for Best-First-Search (Week 3, Line 11):
    Constructs candidate triples (child, parent, h(child)).
    """
    return [(node, parent, heuristic.get(node, 0.0)) for node in new_nodes]


def reconstruct_path_h(
    node_triple: Tuple[str, Optional[str], float],
    closed_list: List[Tuple[str, Optional[str], float]]
) -> List[str]:
    """
    Reconstruct-Path for Best-First-Search (Week 3, Line 7):
    Backtracks from goal node triple through parent links in CLOSED.
    """
    node = node_triple[0]
    parent = node_triple[1]
    path = [node]
    
    curr_parent = parent
    while curr_parent is not None:
        path.insert(0, curr_parent)
        # Scan CLOSED (ordered most recent first) for matching parent
        next_parent = None
        for item in closed_list:
            if item[0] == curr_parent:
                next_parent = item[1]
                break
        curr_parent = next_parent

    return path


class InformedSearchEngine:
    """
    Execution engine for Week 3 informed search algorithms with step-by-step
    deterministic event logging and exact pseudocode line mapping.
    """

    def __init__(self, graph: Graph, heuristic: Optional[Dict[str, float]] = None):
        self.graph = graph
        self.heuristic = heuristic or {}

    def run_best_first_search(self) -> SearchResult:
        """
        Executes Best-First-Search strictly according to Week 3, Page 3, Lines 1–13.

        Best-First-Search(S)
        1   OPEN ← (S, null, h(S)) : []
        2   CLOSED ← empty list
        3   while OPEN is not empty
        4     nodePair ← head OPEN
        5     (N, _, _) ← nodePair
        6     if GoalTest(N) = TRUE
        7       return ReconstructPath(nodePair, CLOSED)
        8     else CLOSED ← nodePair : CLOSED
        9       neighbours ← MoveGen(N)
        10      newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)
        11      newPairs ← MakePairs(newNodes, N)
        12      OPEN ← sort_h ( newPairs ++ tail OPEN )
        13  return empty list
        """
        events: List[TraceEvent] = []
        step_idx = 0
        nodes_expanded = 0

        start_node = self.graph.start_node
        goal_node = self.graph.goal_node
        h_start = self.heuristic.get(start_node, 0.0)

        # Line 1: OPEN ← (S, null, h(S)) : []
        start_triple = (start_node, None, h_start)
        open_list: List[Tuple[str, Optional[str], float]] = [start_triple]
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Best-First-Search",
                line_number=1,
                line_pseudocode="OPEN ← (S, null, h(S)) : []",
                event_type="INIT_OPEN",
                description=f"Initialized OPEN with start node triple: ({start_node}, null, {h_start})",
                current_node=start_node,
                current_parent=None,
                open_before=[],
                open_after=list(open_list),
                open_size_before=0,
                open_size_after=len(open_list),
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step_idx += 1

        # Line 2: CLOSED ← empty list
        closed_list: List[Tuple[str, Optional[str], float]] = []
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Best-First-Search",
                line_number=2,
                line_pseudocode="CLOSED ← empty list",
                event_type="INIT_CLOSED",
                description="Initialized CLOSED as empty list",
                open_before=list(open_list),
                open_after=list(open_list),
                open_size_before=len(open_list),
                open_size_after=len(open_list),
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step_idx += 1

        # Line 3: while OPEN is not empty
        while True:
            is_open_empty = len(open_list) == 0
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=3,
                    line_pseudocode="while OPEN is not empty",
                    event_type="LOOP_CHECK",
                    description=f"Evaluating while loop: OPEN has {len(open_list)} items"
                    if not is_open_empty
                    else "Evaluating while loop: OPEN is empty",
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step_idx += 1

            if is_open_empty:
                # Loop terminates -> Line 13
                break

            # Line 4: nodePair ← head OPEN
            node_pair = open_list[0]
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=4,
                    line_pseudocode="nodePair ← head OPEN",
                    event_type="SELECT_HEAD",
                    description=f"Extracted head of OPEN: ({node_pair[0]}, {node_pair[1] if node_pair[1] is not None else 'null'}, {node_pair[2]})",
                    current_node=node_pair[0],
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step_idx += 1

            # Line 5: (N, _, _) ← nodePair
            n = node_pair[0]
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=5,
                    line_pseudocode="(N, _, _) ← nodePair",
                    event_type="UNPACK_TUPLE",
                    description=f"Unpacked node label N = '{n}' from candidate tuple",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step_idx += 1

            # Line 6: if GoalTest(N) = TRUE
            is_goal = n == goal_node
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=6,
                    line_pseudocode="if GoalTest(N) = TRUE",
                    event_type="GOAL_TEST",
                    description=f"GoalTest('{n}') = {'TRUE' if is_goal else 'FALSE'} (Goal is '{goal_node}')",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step_idx += 1

            if is_goal:
                # Line 7: return ReconstructPath(nodePair, CLOSED)
                path = reconstruct_path_h(node_pair, closed_list)
                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Best-First-Search",
                        line_number=7,
                        line_pseudocode="return ReconstructPath(nodePair, CLOSED)",
                        event_type="GOAL_FOUND",
                        description=f"Goal node '{n}' reached! Reconstructed path: {' -> '.join(path)}",
                        current_node=n,
                        current_parent=node_pair[1],
                        open_before=list(open_list),
                        open_after=list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=list(closed_list),
                        closed_after=list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                        path=path,
                        is_terminal=True,
                        terminal_status="SUCCESS",
                        terminal_reason="GOAL_FOUND",
                    )
                )
                return SearchResult(
                    algorithm="Best-First-Search",
                    start_node=start_node,
                    goal_node=goal_node,
                    found_goal=True,
                    path=path,
                    total_steps=len(events),
                    nodes_expanded=nodes_expanded,
                    events=events,
                    terminal_status="SUCCESS",
                    terminal_reason="GOAL_FOUND",
                )

            # Line 8: else CLOSED ← nodePair : CLOSED
            nodes_expanded += 1
            closed_before = list(closed_list)
            closed_list.insert(0, node_pair)
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=8,
                    line_pseudocode="else CLOSED ← nodePair : CLOSED",
                    event_type="ADD_CLOSED",
                    description=f"Prepended ({node_pair[0]}, {node_pair[1] if node_pair[1] is not None else 'null'}, {node_pair[2]}) to CLOSED",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=closed_before,
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_before),
                    closed_size_after=len(closed_list),
                )
            )
            step_idx += 1

            # Line 9: neighbours ← MoveGen(N)
            neighbours = self.graph.move_gen(n)
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=9,
                    line_pseudocode="neighbours ← MoveGen(N)",
                    event_type="MOVE_GEN",
                    description=f"MoveGen('{n}') returned {len(neighbours)} neighbours: {neighbours}",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                    raw_neighbours=neighbours,
                )
            )
            step_idx += 1

            # Line 10: newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)
            new_nodes = remove_seen(neighbours, open_list, closed_list)
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=10,
                    line_pseudocode="newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)",
                    event_type="REMOVE_SEEN",
                    description=f"RemoveSeen checked {len(neighbours)} neighbours against OPEN and CLOSED; retained {len(new_nodes)} unseen: {new_nodes}",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                    raw_neighbours=neighbours,
                    filtered_nodes=new_nodes,
                )
            )
            step_idx += 1

            # Line 11: newPairs ← MakePairs(newNodes, N)
            new_pairs = make_pairs_h(new_nodes, n, self.heuristic)
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=11,
                    line_pseudocode="newPairs ← MakePairs(newNodes, N)",
                    event_type="MAKE_PAIRS",
                    description=f"MakePairs created {len(new_pairs)} candidate triples with heuristic values: {new_pairs}",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                    filtered_nodes=new_nodes,
                    new_pairs=new_pairs,
                )
            )
            step_idx += 1

            # Line 12: OPEN ← sort_h ( newPairs ++ tail OPEN )
            open_before = list(open_list)
            tail_open = open_list[1:]
            combined = new_pairs + tail_open
            open_list = sort_h(combined, self.heuristic)
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-First-Search",
                    line_number=12,
                    line_pseudocode="OPEN ← sort_h ( newPairs ++ tail OPEN )",
                    event_type="UPDATE_OPEN_SORTED",
                    description=f"Appended new triples to tail OPEN and sorted by h (alphabetical tie-breaking). Head is now {open_list[0] if open_list else '[]'}",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=open_before,
                    open_after=list(open_list),
                    open_size_before=len(open_before),
                    open_size_after=len(open_list),
                    closed_before=list(closed_list),
                    closed_after=list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                    new_pairs=new_pairs,
                )
            )
            step_idx += 1

        # Line 13: return empty list
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Best-First-Search",
                line_number=13,
                line_pseudocode="return empty list",
                event_type="TERMINATE_FAILURE",
                description="OPEN is empty. Goal node is unreachable from start node.",
                open_before=[],
                open_after=[],
                open_size_before=0,
                open_size_after=0,
                closed_before=list(closed_list),
                closed_after=list(closed_list),
                closed_size_before=len(closed_list),
                closed_size_after=len(closed_list),
                path=[],
                is_terminal=True,
                terminal_status="FAILURE",
                terminal_reason="OPEN_EMPTY",
            )
        )

        return SearchResult(
            algorithm="Best-First-Search",
            start_node=start_node,
            goal_node=goal_node,
            found_goal=False,
            path=[],
            total_steps=len(events),
            nodes_expanded=nodes_expanded,
            events=events,
            terminal_status="FAILURE",
            terminal_reason="OPEN_EMPTY",
        )

    def run_beam_search(self, beam_width: int = 2) -> SearchResult:
        """
        Executes Beam-Search strictly according to Week 3, Page 3, Lines 1–10.

        Beam-Search(S, w)
        1   OPEN ← S : []
        2   N ← S
        3   do bestEver ← N
        4      if OPEN contains goal node
        5         return that goal node
        6      else neighbours ← Move-Gen(OPEN)
        7           OPEN ← take w (sort_h neighbours)
        8           N ← head OPEN   ▷ best in new layer
        9   while h(N) is better than h(bestEver)
        10  return bestEver
        """
        events: List[TraceEvent] = []
        step_idx = 0
        nodes_expanded = 0

        start_node = self.graph.start_node
        goal_node = self.graph.goal_node

        # Line 1: OPEN ← S : []
        open_list: List[str] = [start_node]
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Beam-Search",
                line_number=1,
                line_pseudocode="OPEN ← S : []",
                event_type="INIT_OPEN",
                description=f"Initialized OPEN layer with start node: [{start_node}] (beam width w = {beam_width})",
                current_node=start_node,
                open_before=[],
                open_after=list(open_list),
                open_size_before=0,
                open_size_after=len(open_list),
            )
        )
        step_idx += 1

        # Line 2: N ← S
        n = start_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Beam-Search",
                line_number=2,
                line_pseudocode="N ← S",
                event_type="INIT_LEADER",
                description=f"Set leading node N = '{n}' (h = {self.heuristic.get(n, 0.0)})",
                current_node=n,
                open_before=list(open_list),
                open_after=list(open_list),
                open_size_before=len(open_list),
                open_size_after=len(open_list),
            )
        )
        step_idx += 1

        # Parent tracking for geometrically accurate path reconstruction
        parent_map: Dict[str, Optional[str]] = {start_node: None}

        def reconstruct_beam_path(target: str) -> List[str]:
            p: List[str] = []
            curr: Optional[str] = target
            visited_set = set()
            while curr is not None and curr not in visited_set:
                p.insert(0, curr)
                visited_set.add(curr)
                curr = parent_map.get(curr)
            return p

        # Lines 3–9: do ... while h(N) is better than h(bestEver)
        while True:
            # Line 3: do bestEver ← N
            best_ever = n
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Beam-Search",
                    line_number=3,
                    line_pseudocode="do bestEver ← N",
                    event_type="RECORD_BEST",
                    description=f"Recorded bestEver = '{best_ever}' (h = {self.heuristic.get(best_ever, 0.0)})",
                    current_node=best_ever,
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                )
            )
            step_idx += 1

            # Line 4: if OPEN contains goal node
            contains_goal = goal_node in open_list
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Beam-Search",
                    line_number=4,
                    line_pseudocode="if OPEN contains goal node",
                    event_type="GOAL_CHECK",
                    description=f"Checking if OPEN contains goal '{goal_node}': {'TRUE' if contains_goal else 'FALSE'}",
                    current_node=goal_node if contains_goal else best_ever,
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                )
            )
            step_idx += 1

            if contains_goal:
                # Line 5: return that goal node (Page 3: returns goal node directly, no path reconstruction)
                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Beam-Search",
                        line_number=5,
                        line_pseudocode="return that goal node",
                        event_type="GOAL_FOUND",
                        description=f"Goal node '{goal_node}' found in current beam OPEN layer! Returning goal node '{goal_node}'.",
                        current_node=goal_node,
                        current_parent=best_ever,
                        open_before=list(open_list),
                        open_after=list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        path=[goal_node],
                        is_terminal=True,
                        terminal_status="SUCCESS",
                        terminal_reason="GOAL_FOUND",
                    )
                )
                return SearchResult(
                    algorithm="Beam-Search",
                    start_node=start_node,
                    goal_node=goal_node,
                    found_goal=True,
                    path=[goal_node],
                    total_steps=len(events),
                    nodes_expanded=nodes_expanded,
                    events=events,
                    terminal_status="SUCCESS",
                    terminal_reason="GOAL_FOUND",
                )

            # Line 6: else neighbours ← Move-Gen(OPEN)
            # Move-Gen(OPEN) specification (Week 3, Page 3, Lines 1–4):
            # 1 neighbours ← []
            # 2 for each X in OPEN
            # 3    neighbours ← neighbours ++ Move-Gen(X)
            # 4 return neighbours
            neighbours: List[str] = []
            layer_pairs: List[List[str]] = []
            for p_node in open_list:
                nodes_expanded += 1
                p_nbrs = self.graph.move_gen(p_node)
                node_pairs: List[List[str]] = []
                for c_node in p_nbrs:
                    neighbours.append(c_node)
                    if c_node not in parent_map:
                        parent_map[c_node] = p_node
                    node_pairs.append([c_node, p_node])
                    layer_pairs.append([c_node, p_node])

                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Beam-Search",
                        line_number=6,
                        line_pseudocode="else neighbours ← Move-Gen(OPEN)   ▷ Move-Gen(X)",
                        event_type="MOVE_GEN_NODE",
                        description=f"Move-Gen('{p_node}') expanded node '{p_node}' from current beam OPEN layer into {len(p_nbrs)} neighbour(s): {p_nbrs}",
                        current_node=p_node,
                        current_parent=best_ever,
                        open_before=list(open_list),
                        open_after=list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        raw_neighbours=p_nbrs,
                        new_pairs=node_pairs,
                    )
                )
                step_idx += 1

            # Line 7: OPEN ← take w (sort_h neighbours)
            sorted_neighbours = sort_h(neighbours, self.heuristic)
            open_before = list(open_list)
            open_list = sorted_neighbours[:beam_width]
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Beam-Search",
                    line_number=7,
                    line_pseudocode="OPEN ← take w (sort_h neighbours)",
                    event_type="PRUNE_BEAM",
                    description=f"Sorted {len(sorted_neighbours)} total layer neighbour(s) across OPEN by heuristic and retained top w={beam_width}: {open_list}",
                    current_node=open_list[0] if open_list else best_ever,
                    current_parent=best_ever,
                    open_before=open_before,
                    open_after=list(open_list),
                    open_size_before=len(open_before),
                    open_size_after=len(open_list),
                    filtered_nodes=list(open_list),
                    raw_neighbours=sorted_neighbours,
                    new_pairs=layer_pairs,
                )
            )
            step_idx += 1

            if not open_list:
                # No neighbours left -> cannot advance layer
                break

            # Line 8: N ← head OPEN ▷ best in new layer
            n = open_list[0]
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Beam-Search",
                    line_number=8,
                    line_pseudocode="N ← head OPEN   ▷ best in new layer",
                    event_type="PICK_BEST_LAYER",
                    description=f"Selected head of new layer N = '{n}' with best h = {self.heuristic.get(n, 0.0)}",
                    current_node=n,
                    current_parent=best_ever,
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                )
            )
            step_idx += 1

            # Line 9: while h(N) is better than h(bestEver)
            h_n = self.heuristic.get(n, float("inf"))
            h_best = self.heuristic.get(best_ever, float("inf"))
            is_better = h_n < h_best

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Beam-Search",
                    line_number=9,
                    line_pseudocode="while h(N) is better than h(bestEver)",
                    event_type="WHILE_CONDITION",
                    description=f"Evaluating layer improvement: h('{n}') = {h_n} {'<' if is_better else '>='} h('{best_ever}') = {h_best} -> {'CONTINUE' if is_better else 'STOP'}",
                    current_node=n,
                    current_parent=best_ever,
                    open_before=list(open_list),
                    open_after=list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                )
            )
            step_idx += 1

            if not is_better:
                break

        # Line 10: return bestEver (Page 3: returns bestEver directly, no path reconstruction)
        stagnation_path = [best_ever]
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Beam-Search",
                line_number=10,
                line_pseudocode="return bestEver",
                event_type="RETURN_STAGNATION",
                description=f"Search stopped because new layer does not strictly improve heuristic. Returning bestEver = '{best_ever}'.",
                current_node=best_ever,
                current_parent=best_ever,
                open_before=list(open_list),
                open_after=list(open_list),
                open_size_before=len(open_list),
                open_size_after=len(open_list),
                path=stagnation_path,
                is_terminal=True,
                terminal_status="SUCCESS" if best_ever == goal_node else "STOPPED",
                terminal_reason="GOAL_FOUND" if best_ever == goal_node else "HEURISTIC_STAGNATION",
            )
        )

        return SearchResult(
            algorithm="Beam-Search",
            start_node=start_node,
            goal_node=goal_node,
            found_goal=best_ever == goal_node,
            path=stagnation_path,
            total_steps=len(events),
            nodes_expanded=nodes_expanded,
            events=events,
            terminal_status="SUCCESS" if best_ever == goal_node else "STOPPED",
            terminal_reason="GOAL_FOUND" if best_ever == goal_node else "HEURISTIC_STAGNATION",
        )

    def run_hill_climbing(
        self,
        start_node: Optional[str] = None,
        custom_move_gen: Optional[Callable[[str], List[str]]] = None
    ) -> SearchResult:
        """
        Executes Hill-Climbing strictly according to Week 3, Page 3, Lines 1–5.

        Hill-Climbing(S)
        1   N ← S
        2   do bestEver ← N
        3      N ← head sort_h MoveGen(bestEver)
        4   while h(N) is better than h(bestEver)
        5   return bestEver
        """
        events: List[TraceEvent] = []
        step_idx = 0
        nodes_expanded = 0

        start = start_node if start_node is not None else self.graph.start_node
        move_gen_fn = custom_move_gen if custom_move_gen is not None else self.graph.move_gen

        # Line 1: N ← S
        n = start
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Hill-Climbing",
                line_number=1,
                line_pseudocode="N ← S",
                event_type="INIT_STATE",
                description=f"Initialized current state N = '{n}' (h = {self.heuristic.get(n, 0.0)})",
                current_node=n,
            )
        )
        step_idx += 1

        trajectory: List[str] = [n]

        # Lines 2–4: do ... while h(N) is better than h(bestEver)
        while True:
            # Line 2: do bestEver ← N
            best_ever = n
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Hill-Climbing",
                    line_number=2,
                    line_pseudocode="do bestEver ← N",
                    event_type="RECORD_BEST",
                    description=f"Recorded bestEver = '{best_ever}' (h = {self.heuristic.get(best_ever, 0.0)})",
                    current_node=best_ever,
                )
            )
            step_idx += 1

            # Line 3: N ← head sort_h MoveGen(bestEver)
            nodes_expanded += 1
            raw_neighbours = move_gen_fn(best_ever)
            if not raw_neighbours:
                # Dead end: no neighbours available
                break

            sorted_neighbours = sort_h(raw_neighbours, self.heuristic)
            n = sorted_neighbours[0]
            node_pairs = [[c, best_ever] for c in raw_neighbours]

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Hill-Climbing",
                    line_number=3,
                    line_pseudocode="N ← head sort_h MoveGen(bestEver)",
                    event_type="GEN_AND_SELECT",
                    description=f"Generated neighbours of '{best_ever}', sorted by h: {sorted_neighbours}. Head is N = '{n}' (h = {self.heuristic.get(n, 0.0)})",
                    current_node=n,
                    current_parent=best_ever,
                    raw_neighbours=raw_neighbours,
                    filtered_nodes=sorted_neighbours,
                    new_pairs=node_pairs,
                )
            )
            step_idx += 1

            # Line 4: while h(N) is better than h(bestEver)
            h_n = self.heuristic.get(n, float("inf"))
            h_best = self.heuristic.get(best_ever, float("inf"))
            is_better = h_n < h_best

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Hill-Climbing",
                    line_number=4,
                    line_pseudocode="while h(N) is better than h(bestEver)",
                    event_type="LOOP_CONDITION",
                    description=f"Evaluating strictly better: h('{n}') = {h_n} {'<' if is_better else '>='} h('{best_ever}') = {h_best} -> {'CLIMB' if is_better else 'STOP'}",
                    current_node=n,
                )
            )
            step_idx += 1

            if is_better:
                trajectory.append(n)
            else:
                break

        # Line 5: return bestEver
        is_goal = best_ever == self.graph.goal_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Hill-Climbing",
                line_number=5,
                line_pseudocode="return bestEver",
                event_type="RETURN_RESULT",
                description=f"Hill climbing completed. Returning bestEver = '{best_ever}' (h = {self.heuristic.get(best_ever, 0.0)})",
                current_node=best_ever,
                path=trajectory,
                is_terminal=True,
                terminal_status="SUCCESS" if is_goal else "LOCAL_OPTIMUM",
                terminal_reason="GOAL_FOUND" if is_goal else "NO_BETTER_NEIGHBOUR",
            )
        )

        return SearchResult(
            algorithm="Hill-Climbing",
            start_node=start,
            goal_node=self.graph.goal_node,
            found_goal=is_goal,
            path=trajectory,
            total_steps=len(events),
            nodes_expanded=nodes_expanded,
            events=events,
            terminal_status="SUCCESS" if is_goal else "LOCAL_OPTIMUM",
            terminal_reason="GOAL_FOUND" if is_goal else "NO_BETTER_NEIGHBOUR",
        )

    def run_variable_neighbourhood_descent(
        self,
        strategy: str = "k-hop",
        move_gen_list: Optional[List[Any]] = None
    ) -> SearchResult:
        """
        Executes Variable-Neighbourhood-Descent strictly according to Week 3, Page 3, Lines 1–6.

        Variable-Neighbourhood-Descent(S)
        1   MoveGenList ← MoveGen1 : MoveGen2 : · · · : MoveGenn : []
        2   bestNode ← S
        3   while MoveGenList is not empty
        4     bestNode ← Hill-Climbing(bestNode, head MoveGenList)
        5     MoveGenList ← tail MoveGenList
        6   return bestNode
        """
        events: List[TraceEvent] = []
        step_idx = 0
        nodes_expanded = 0

        # Define neighbourhood generator structures based on strategy or custom list
        if move_gen_list is not None:
            generators = []
            for i, mg in enumerate(move_gen_list):
                if isinstance(mg, tuple):
                    generators.append(mg)
                else:
                    generators.append((f"MoveGen_{i+1}", mg))
        elif strategy == "2-hop":
            mg1 = self.graph.move_gen
            def mg2_fn(u: str) -> List[str]:
                nbrs = list(self.graph.move_gen(u))
                for v in list(nbrs):
                    for w in self.graph.move_gen(v):
                        if w != u and w not in nbrs:
                            nbrs.append(w)
                return sorted(nbrs)
            generators = [("MoveGen_1 (1-Hop)", mg1), ("MoveGen_2 (≤2-Hop Jumps)", mg2_fn)]
        elif strategy == "connectivity":
            mg1 = self.graph.move_gen
            def mg_rev(u: str) -> List[str]:
                return sorted([p for p, succs in self.graph.edges.items() if u in succs])
            def mg_undir(u: str) -> List[str]:
                s = set(self.graph.move_gen(u)) | set(mg_rev(u))
                return sorted([x for x in s if x != u])
            generators = [("MoveGen_1 (Forward)", mg1), ("MoveGen_2 (Reverse)", mg_rev), ("MoveGen_3 (Undirected)", mg_undir)]
        else: # "k-hop" default
            mg1 = self.graph.move_gen
            def mg2_fn(u: str) -> List[str]:
                nbrs = list(self.graph.move_gen(u))
                for v in list(nbrs):
                    for w in self.graph.move_gen(v):
                        if w != u and w not in nbrs:
                            nbrs.append(w)
                return sorted(nbrs)
            def mg3_fn(u: str) -> List[str]:
                nbrs = list(mg2_fn(u))
                for v in list(nbrs):
                    for w in self.graph.move_gen(v):
                        if w != u and w not in nbrs:
                            nbrs.append(w)
                return sorted(nbrs)
            generators = [("MoveGen_1 (1-Hop)", mg1), ("MoveGen_2 (≤2-Hop Jumps)", mg2_fn), ("MoveGen_3 (≤3-Hop Leaps)", mg3_fn)]

        # Line 1: MoveGenList ← MoveGen1 : MoveGen2 : · · · : MoveGenn : []
        gen_queue = list(generators)
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Variable-Neighbourhood-Descent",
                line_number=1,
                line_pseudocode="MoveGenList ← MoveGen1 : MoveGen2 : · · · : MoveGenn : []",
                event_type="INIT_MOVEGEN_LIST",
                description=f"Initialized MoveGenList with {len(gen_queue)} neighbourhood structures: {[g[0] for g in gen_queue]}",
                current_node=self.graph.start_node,
                current_parent=self.graph.start_node,
                iteration=1,
            )
        )
        step_idx += 1

        # Line 2: bestNode ← S
        best_node = self.graph.start_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Variable-Neighbourhood-Descent",
                line_number=2,
                line_pseudocode="bestNode ← S",
                event_type="INIT_BEST",
                description=f"Set bestNode = '{best_node}' (h = {self.heuristic.get(best_node, 0.0)})",
                current_node=best_node,
                current_parent=best_node,
                iteration=1,
            )
        )
        step_idx += 1

        overall_path: List[str] = [best_node]
        structure_index = 0

        # Line 3: while MoveGenList is not empty
        while gen_queue:
            curr_name, curr_mg = gen_queue[0]
            structure_index += 1

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Variable-Neighbourhood-Descent",
                    line_number=3,
                    line_pseudocode="while MoveGenList is not empty",
                    event_type="WHILE_LOOP",
                    description=f"MoveGenList active. Head neighbourhood structure is '{curr_name}' ({len(gen_queue)} structures remaining: {[g[0] for g in gen_queue]}).",
                    current_node=best_node,
                    current_parent=best_node,
                    iteration=structure_index,
                )
            )
            step_idx += 1

            # Line 4: bestNode ← Hill-Climbing(bestNode, head MoveGenList)
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Variable-Neighbourhood-Descent",
                    line_number=4,
                    line_pseudocode=f"bestNode ← Hill-Climbing(bestNode, {curr_name})",
                    event_type="ENTER_HILL_CLIMBING",
                    description=f"Beginning Hill-Climbing descent from bestNode = '{best_node}' (h = {self.heuristic.get(best_node, 0.0)}) using '{curr_name}'.",
                    current_node=best_node,
                    current_parent=best_node,
                    iteration=structure_index,
                )
            )
            step_idx += 1

            n = best_node
            while True:
                # 4.1: do bestEver ← N
                best_ever = n
                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Variable-Neighbourhood-Descent",
                        line_number=4,
                        line_pseudocode=f"  do bestEver ← N   ▷ [{curr_name}]",
                        event_type="RECORD_BEST",
                        description=f"[{curr_name}] Recorded bestEver = '{best_ever}' (h = {self.heuristic.get(best_ever, 0.0)})",
                        current_node=best_ever,
                        current_parent=best_node,
                        iteration=structure_index,
                    )
                )
                step_idx += 1

                # 4.2: neighbours ← MoveGen(bestEver)
                nodes_expanded += 1
                raw_nbrs = curr_mg(best_ever)
                nbr_pairs = [[c, best_ever] for c in raw_nbrs]

                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Variable-Neighbourhood-Descent",
                        line_number=4,
                        line_pseudocode=f"  neighbours ← {curr_name}(bestEver)",
                        event_type="MOVE_GEN_NEIGHBOURS",
                        description=f"[{curr_name}] Generated {len(raw_nbrs)} candidate neighbour(s) for '{best_ever}': {raw_nbrs}",
                        current_node=best_ever,
                        current_parent=best_node,
                        raw_neighbours=raw_nbrs,
                        new_pairs=nbr_pairs,
                        iteration=structure_index,
                    )
                )
                step_idx += 1

                if not raw_nbrs:
                    events.append(
                        TraceEvent(
                            step_index=step_idx,
                            algorithm="Variable-Neighbourhood-Descent",
                            line_number=4,
                            line_pseudocode=f"  ▷ [{curr_name}] No neighbours generated",
                            event_type="LOCAL_OPTIMUM_TRAPPED",
                            description=f"[{curr_name}] No neighbours generated for '{best_ever}'. Stagnation reached in this neighbourhood structure.",
                            current_node=best_ever,
                            current_parent=best_node,
                            iteration=structure_index,
                        )
                    )
                    step_idx += 1
                    break

                # 4.3: N ← head (sort_h neighbours)
                sorted_nbrs = sort_h(raw_nbrs, self.heuristic)
                n = sorted_nbrs[0]

                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Variable-Neighbourhood-Descent",
                        line_number=4,
                        line_pseudocode=f"  N ← head (sort_h neighbours)   ▷ [{curr_name}]",
                        event_type="PICK_BEST_NEIGHBOUR",
                        description=f"[{curr_name}] Selected best candidate neighbour N = '{n}' (h = {self.heuristic.get(n, 0.0)}) from {sorted_nbrs}",
                        current_node=n,
                        current_parent=best_ever,
                        raw_neighbours=sorted_nbrs,
                        new_pairs=nbr_pairs,
                        iteration=structure_index,
                    )
                )
                step_idx += 1

                # 4.4: while h(N) is better than h(bestEver)
                h_n = self.heuristic.get(n, float("inf"))
                h_best = self.heuristic.get(best_ever, float("inf"))
                is_better = h_n < h_best

                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Variable-Neighbourhood-Descent",
                        line_number=4,
                        line_pseudocode=f"  while h(N) is better than h(bestEver)   ▷ [{curr_name}]",
                        event_type="LOOP_CONDITION",
                        description=f"[{curr_name}] Evaluating strictly better: h('{n}') = {h_n} {'<' if is_better else '>='} h('{best_ever}') = {h_best} -> {'CLIMB' if is_better else 'LOCAL MINIMUM TRAP'}",
                        current_node=n,
                        current_parent=best_ever,
                        raw_neighbours=sorted_nbrs,
                        new_pairs=nbr_pairs,
                        iteration=structure_index,
                    )
                )
                step_idx += 1

                if not is_better:
                    events.append(
                        TraceEvent(
                            step_index=step_idx,
                            algorithm="Variable-Neighbourhood-Descent",
                            line_number=4,
                            line_pseudocode=f"  ▷ [{curr_name}] Trapped at local optimum '{best_ever}'",
                            event_type="LOCAL_OPTIMUM_TRAPPED",
                            description=f"[{curr_name}] Trapped in local optimum at '{best_ever}' (h = {h_best}). Best candidate '{n}' (h = {h_n}) is not strictly better. Concluding Hill-Climbing for '{curr_name}'.",
                            current_node=best_ever,
                            current_parent=best_node,
                            iteration=structure_index,
                        )
                    )
                    step_idx += 1
                    break

            new_best = best_ever
            if new_best != best_node:
                overall_path.append(new_best)
            best_node = new_best

            # Line 5: MoveGenList ← tail MoveGenList
            popped_name = gen_queue.pop(0)[0]
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Variable-Neighbourhood-Descent",
                    line_number=5,
                    line_pseudocode="MoveGenList ← tail MoveGenList",
                    event_type="POP_MOVEGEN",
                    description=f"Popped '{popped_name}'. Remaining neighbourhood structures: {[g[0] for g in gen_queue]}",
                    current_node=best_node,
                    current_parent=best_node,
                    iteration=structure_index,
                )
            )
            step_idx += 1

        # Line 6: return bestNode
        is_goal = best_node == self.graph.goal_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Variable-Neighbourhood-Descent",
                line_number=6,
                line_pseudocode="return bestNode",
                event_type="RETURN_RESULT",
                description=f"VND completed across all neighbourhood structures. Returning bestNode = '{best_node}' (h = {self.heuristic.get(best_node, 0.0)}).",
                current_node=best_node,
                current_parent=best_node,
                path=[best_node],
                is_terminal=True,
                terminal_status="SUCCESS" if is_goal else "LOCAL_OPTIMUM",
                terminal_reason="GOAL_FOUND" if is_goal else "NEIGHBOURHOODS_EXHAUSTED",
            )
        )

        return SearchResult(
            algorithm="Variable-Neighbourhood-Descent",
            start_node=self.graph.start_node,
            goal_node=self.graph.goal_node,
            found_goal=is_goal,
            path=[best_node],
            total_steps=len(events),
            nodes_expanded=nodes_expanded,
            events=events,
            terminal_status="SUCCESS" if is_goal else "LOCAL_OPTIMUM",
            terminal_reason="GOAL_FOUND" if is_goal else "NEIGHBOURHOODS_EXHAUSTED",
        )

    def run_best_neighbour_search(self, max_iterations: int = 20) -> SearchResult:
        """
        Executes Best-Neighbour-Search strictly according to Week 3, Page 3, Lines 1–7.

        Best-Neighbour-Search(S)
        1   N ← S
        2   bestEver ← S
        3   until some termination condition
        4     N ← best Move-Gen(N)
        5     if N is better than bestEver
        6       bestEver ← N
        7   return bestEver
        """
        events: List[TraceEvent] = []
        step_idx = 0
        nodes_expanded = 0

        # Line 1: N ← S
        n = self.graph.start_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Best-Neighbour-Search",
                line_number=1,
                line_pseudocode="N ← S",
                event_type="INIT_STATE",
                description=f"Initialized current node N = '{n}'",
                current_node=n,
            )
        )
        step_idx += 1

        # Line 2: bestEver ← S
        best_ever = self.graph.start_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Best-Neighbour-Search",
                line_number=2,
                line_pseudocode="bestEver ← S",
                event_type="INIT_BEST",
                description=f"Initialized bestEver = '{best_ever}' (h = {self.heuristic.get(best_ever, 0.0)})",
                current_node=best_ever,
            )
        )
        step_idx += 1

        iteration = 0
        trajectory = [n]

        # Line 3: until some termination condition
        while iteration < max_iterations:
            iteration += 1

            # Line 4: N ← best Move-Gen(N)
            nodes_expanded += 1
            n_prev = n
            raw_neighbours = self.graph.move_gen(n_prev)
            if not raw_neighbours:
                # Dead end termination condition
                break

            sorted_neighbours = sort_h(raw_neighbours, self.heuristic)
            n = sorted_neighbours[0]
            trajectory.append(n)
            node_pairs = [[c, n_prev] for c in raw_neighbours]

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-Neighbour-Search",
                    line_number=4,
                    line_pseudocode="N ← best Move-Gen(N)",
                    event_type="TRANSITION_BEST",
                    description=f"Step {iteration}: Move-Gen('{n_prev}') -> {sorted_neighbours}. Transitioned to best neighbour N = '{n}' (h = {self.heuristic.get(n, 0.0)})",
                    current_node=n,
                    current_parent=best_ever,
                    raw_neighbours=raw_neighbours,
                    filtered_nodes=sorted_neighbours,
                    new_pairs=node_pairs,
                )
            )
            step_idx += 1

            # Line 5: if N is better than bestEver
            h_n = self.heuristic.get(n, float("inf"))
            h_best = self.heuristic.get(best_ever, float("inf"))
            is_better = h_n < h_best

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Best-Neighbour-Search",
                    line_number=5,
                    line_pseudocode="if N is better than bestEver",
                    event_type="IMPROVEMENT_CHECK",
                    description=f"Checking improvement: h('{n}') = {h_n} {'<' if is_better else '>='} h('{best_ever}') = {h_best}",
                    current_node=n,
                )
            )
            step_idx += 1

            if is_better:
                # Line 6: bestEver ← N
                best_ever = n
                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Best-Neighbour-Search",
                        line_number=6,
                        line_pseudocode="bestEver ← N",
                        event_type="UPDATE_BEST",
                        description=f"Updated bestEver to '{best_ever}' (new best h = {h_n})",
                        current_node=best_ever,
                    )
                )
                step_idx += 1

            # Termination condition check: reached goal or step budget
            if best_ever == self.graph.goal_node:
                break

        # Line 7: return bestEver
        is_goal = best_ever == self.graph.goal_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Best-Neighbour-Search",
                line_number=7,
                line_pseudocode="return bestEver",
                event_type="RETURN_RESULT",
                description=f"Best-Neighbour-Search terminated after {iteration} steps. Returning bestEver = '{best_ever}'",
                current_node=best_ever,
                path=trajectory,
                is_terminal=True,
                terminal_status="SUCCESS" if is_goal else "BUDGET_REACHED",
                terminal_reason="GOAL_FOUND" if is_goal else "MAX_ITERATIONS",
            )
        )

        return SearchResult(
            algorithm="Best-Neighbour-Search",
            start_node=self.graph.start_node,
            goal_node=self.graph.goal_node,
            found_goal=is_goal,
            path=trajectory,
            total_steps=len(events),
            nodes_expanded=nodes_expanded,
            events=events,
            terminal_status="SUCCESS" if is_goal else "BUDGET_REACHED",
            terminal_reason="GOAL_FOUND" if is_goal else "MAX_ITERATIONS",
        )

    def run_iterated_hill_climbing(
        self,
        restarts: int = 5,
        candidate_seeds: Optional[List[str]] = None
    ) -> SearchResult:
        """
        Executes Iterated-Hill-Climbing strictly according to Week 3, Page 3, Lines 1–6.

        Iterated-Hill-Climbing(N)
        1   bestNode ← random candidate solution
        2   repeat N times
        3     currentBest ← Hill-Climbing(new random candidate solution)
        4     if h(currentBest) is better than h(bestNode)
        5       bestNode ← currentBest
        6   return bestNode
        """
        events: List[TraceEvent] = []
        step_idx = 0
        total_expanded = 0

        # Deterministic sequence of candidate seeds across restarts
        seeds = candidate_seeds or self.graph.nodes
        if not seeds:
            seeds = [self.graph.start_node]

        # Line 1: bestNode ← random candidate solution
        initial_seed = seeds[0]
        hc_initial = self.run_hill_climbing(start_node=initial_seed)
        total_expanded += hc_initial.nodes_expanded
        best_node = hc_initial.path[-1] if hc_initial.path else initial_seed

        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Iterated-Hill-Climbing",
                line_number=1,
                line_pseudocode="bestNode ← random candidate solution",
                event_type="INIT_RANDOM",
                description=f"Initial restart 1/{restarts} from seed '{initial_seed}' climbed to local optimum '{best_node}' (h = {self.heuristic.get(best_node, 0.0)}). Set bestNode = '{best_node}'.",
                current_node=best_node,
                current_parent=best_node,
                iteration=1,
            )
        )
        step_idx += 1

        # Line 2: repeat N times
        for i in range(1, restarts):
            seed = seeds[i % len(seeds)]
            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Iterated-Hill-Climbing",
                    line_number=2,
                    line_pseudocode=f"repeat N times (iteration {i + 1}/{restarts})",
                    event_type="REPEAT_LOOP",
                    description=f"Beginning restart {i + 1}/{restarts} from new candidate seed '{seed}'",
                    current_node=seed,
                    current_parent=best_node,
                    iteration=i + 1,
                )
            )
            step_idx += 1

            # Line 3: currentBest ← Hill-Climbing(new random candidate solution)
            hc_run = self.run_hill_climbing(start_node=seed)
            total_expanded += hc_run.nodes_expanded
            current_best = hc_run.path[-1] if hc_run.path else seed

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Iterated-Hill-Climbing",
                    line_number=3,
                    line_pseudocode="currentBest ← Hill-Climbing(new random candidate solution)",
                    event_type="RUN_RESTART",
                    description=f"Restart {i + 1}/{restarts} climbed to local optimum currentBest = '{current_best}' (h = {self.heuristic.get(current_best, 0.0)})",
                    current_node=current_best,
                    current_parent=best_node,
                    iteration=i + 1,
                )
            )
            step_idx += 1

            # Line 4: if h(currentBest) is better than h(bestNode)
            h_curr = self.heuristic.get(current_best, float("inf"))
            h_best = self.heuristic.get(best_node, float("inf"))
            is_better = h_curr < h_best

            events.append(
                TraceEvent(
                    step_index=step_idx,
                    algorithm="Iterated-Hill-Climbing",
                    line_number=4,
                    line_pseudocode="if h(currentBest) is better than h(bestNode)",
                    event_type="IMPROVEMENT_CHECK",
                    description=f"Evaluating restart improvement: h('{current_best}') = {h_curr} {'<' if is_better else '>='} h('{best_node}') = {h_best} -> {'NEW CHAMPION' if is_better else 'KEEP BEST'}",
                    current_node=current_best,
                    current_parent=best_node,
                    iteration=i + 1,
                )
            )
            step_idx += 1

            if is_better:
                # Line 5: bestNode ← currentBest
                best_node = current_best
                events.append(
                    TraceEvent(
                        step_index=step_idx,
                        algorithm="Iterated-Hill-Climbing",
                        line_number=5,
                        line_pseudocode="bestNode ← currentBest",
                        event_type="UPDATE_BEST",
                        description=f"Global champion updated to bestNode = '{best_node}' (new best h = {h_curr})",
                        current_node=best_node,
                        current_parent=best_node,
                        iteration=i + 1,
                    )
                )
                step_idx += 1

        # Line 6: return bestNode
        is_goal = best_node == self.graph.goal_node
        events.append(
            TraceEvent(
                step_index=step_idx,
                algorithm="Iterated-Hill-Climbing",
                line_number=6,
                line_pseudocode="return bestNode",
                event_type="RETURN_RESULT",
                description=f"Iterated Hill-Climbing completed {restarts} restarts. Returning champion state bestNode = '{best_node}' (h = {self.heuristic.get(best_node, 0.0)})",
                current_node=best_node,
                current_parent=best_node,
                iteration=restarts,
                path=[best_node],
                is_terminal=True,
                terminal_status="SUCCESS" if is_goal else "OPTIMAL_FOUND",
                terminal_reason="GOAL_FOUND" if is_goal else "RESTARTS_EXHAUSTED",
            )
        )

        return SearchResult(
            algorithm="Iterated-Hill-Climbing",
            start_node=self.graph.start_node,
            goal_node=self.graph.goal_node,
            found_goal=is_goal,
            path=[best_node],
            total_steps=len(events),
            nodes_expanded=total_expanded,
            events=events,
            terminal_status="SUCCESS" if is_goal else "OPTIMAL_FOUND",
            terminal_reason="GOAL_FOUND" if is_goal else "RESTARTS_EXHAUSTED",
        )

