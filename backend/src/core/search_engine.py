from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from backend.src.core.graph import Graph
from backend.src.core.types import SearchResult, TraceEvent


# ---------------------------------------------------------------------------
# AUTHORITATIVE PSEUDOCODE REFERENCES (algorithms.pdf)
# ---------------------------------------------------------------------------

BFS_PSEUDOCODE = {
    1: "OPEN ← (S, null) : []",
    2: "CLOSED ← empty list",
    3: "while OPEN is not empty",
    4: "  nodePair ← head OPEN",
    5: "  (N, _) ← nodePair",
    6: "  if GoalTest(N) = TRUE",
    7: "    return ReconstructPath(nodePair, CLOSED)",
    8: "  else CLOSED ← nodePair : CLOSED",
    9: "    neighbours ← MoveGen(N)",
    10: "    newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)",
    11: "    newPairs ← MakePairs(newNodes, N)",
    12: "    OPEN ← (tail OPEN) ++ newPairs",
    13: "return empty list",
}

DFS_PSEUDOCODE = {
    1: "OPEN ← (S, null) : []",
    2: "CLOSED ← empty list",
    3: "while OPEN is not empty",
    4: "  nodePair ← head OPEN",
    5: "  (N, _) ← nodePair",
    6: "  if GoalTest(N) = TRUE",
    7: "    return ReconstructPath(nodePair, CLOSED)",
    8: "  else CLOSED ← nodePair : CLOSED",
    9: "    neighbours ← MoveGen(N)",
    10: "    newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)",
    11: "    newPairs ← MakePairs(newNodes, N)",
    12: "    OPEN ← newPairs ++ (tail OPEN)",
    13: "return empty list",
}

DFID_N_PSEUDOCODE = {
    1: "count ← -1",
    2: "path ← empty list",
    3: "depthBound ← 0",
    4: "repeat",
    5: "  previousCount ← count",
    6: "  (count, path) ← DB-DFS-N(S, depthBound)",
    7: "  depthBound ← depthBound + 1",
    8: "until (path is not empty) or (previousCount = count)",
    9: "return path",
    10: "DB-DFS-N: count ← 0",
    11: "DB-DFS-N: OPEN ← (S, null, 0) : []",
    12: "DB-DFS-N: CLOSED ← empty list",
    13: "DB-DFS-N: while OPEN is not empty",
    14: "DB-DFS-N:   nodePair ← head OPEN",
    15: "DB-DFS-N:   (N, _, depth) ← nodePair",
    16: "DB-DFS-N:   if GoalTest(N) = TRUE",
    17: "DB-DFS-N:     return (count, ReconstructPath(nodePair, CLOSED))",
    18: "DB-DFS-N:   else CLOSED ← nodePair : CLOSED",
    19: "DB-DFS-N:     if depth < depthBound",
    20: "DB-DFS-N:       neighbours ← MoveGen(N)",
    21: "DB-DFS-N:       newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)",
    22: "DB-DFS-N:       newPairs ← MakePairs(newNodes, N, depth + 1)",
    23: "DB-DFS-N:       OPEN ← newPairs ++ tail OPEN",
    24: "DB-DFS-N:       count ← count + length newPairs",
    25: "DB-DFS-N:     else OPEN ← tail OPEN",
    26: "DB-DFS-N: return (count, empty list)",
}

DFID_C_PSEUDOCODE = {
    1: "count ← -1",
    2: "path ← empty list",
    3: "depthBound ← 0",
    4: "repeat",
    5: "  previousCount ← count",
    6: "  (count, path) ← DB-DFS-C(S, depthBound)",
    7: "  depthBound ← depthBound + 1",
    8: "until (path is not empty) or (previousCount = count)",
    9: "return path",
    10: "DB-DFS-C: count ← 0",
    11: "DB-DFS-C: OPEN ← (S, null, 0) : []",
    12: "DB-DFS-C: CLOSED ← empty list",
    13: "DB-DFS-C: while OPEN is not empty",
    14: "DB-DFS-C:   nodePair ← head OPEN",
    15: "DB-DFS-C:   (N, _, depth) ← nodePair",
    16: "DB-DFS-C:   if GoalTest(N) = TRUE",
    17: "DB-DFS-C:     return (count, ReconstructPath(nodePair, CLOSED))",
    18: "DB-DFS-C:   else CLOSED ← nodePair : CLOSED",
    19: "DB-DFS-C:     if depth < depthBound",
    20: "DB-DFS-C:       neighbours ← MoveGen(N)",
    21: "DB-DFS-C:       newNodes ← RemoveSeen(neighbours, OPEN, [])",
    22: "DB-DFS-C:       newPairs ← MakePairs(newNodes, N, depth + 1)",
    23: "DB-DFS-C:       OPEN ← newPairs ++ tail OPEN",
    24: "DB-DFS-C:       count ← count + length newPairs",
    25: "DB-DFS-C:     else OPEN ← tail OPEN",
    26: "DB-DFS-C: return (count, empty list)",
}


# ---------------------------------------------------------------------------
# ANCILLARY FUNCTIONS IMPLEMENTED FAITHFULLY FROM algorithms.pdf
# ---------------------------------------------------------------------------

def occurs_in(node: str, node_pairs: List[Any]) -> bool:
    """Authoritative Occurs-In (Page 4):
    1 if nodePairs is empty return FALSE
    3 else if node = first head nodePairs return TRUE
    5 else return Occurs-In(node, tail nodePairs)
    """
    for item in node_pairs:
        # first element of pair or triple is the node label
        if item[0] == node:
            return True
    return False


def remove_seen(node_list: List[str], open_list: List[Any], closed_list: List[Any]) -> List[str]:
    """Authoritative Remove-Seen (Page 4):
    1 if nodeList is empty return empty list
    3 else node ← head nodeList
    4   if Occurs-In(node, OPEN) or Occurs-In(node, CLOSED)
    5     return Remove-Seen(tail nodeList, OPEN, CLOSED)
    6   else return node : Remove-Seen(tail nodeList, OPEN, CLOSED)
    """
    result = []
    for node in node_list:
        if not (occurs_in(node, open_list) or occurs_in(node, closed_list)):
            result.append(node)
    return result


def make_pairs_2(node_list: List[str], parent: str) -> List[Tuple[str, Optional[str]]]:
    """Authoritative Make-Pairs for BFS/DFS (Page 4):
    1 if nodeList is empty return empty list
    3 else return (head nodeList, parent) : Make-Pairs(tail nodeList, parent)
    """
    return [(node, parent) for node in node_list]


def make_pairs_3(node_list: List[str], parent: str, depth: int) -> List[Tuple[str, Optional[str], int]]:
    """Authoritative MakePairs for DB-DFS (Page 8):
    1 if nodeList is empty return empty list
    3 else nodePair ← (head nodeList, parent, depth)
    4 return nodePair : MakePairs(tail nodeList, parent, depth)
    """
    return [(node, parent, depth) for node in node_list]


def skip_to_2(parent: str, closed_list: List[Tuple[str, Optional[str]]]) -> List[Tuple[str, Optional[str]]]:
    """Authoritative Skip-To for BFS/DFS (Page 4):
    1 Skip-To(parent, nodePairs)
    2   if parent = first head nodePairs return nodePairs
    4   else return Skip-To(parent, tail nodePairs)
    """
    for idx in range(len(closed_list)):
        if closed_list[idx][0] == parent:
            return closed_list[idx:]
    return []


def reconstruct_path_2(node_pair: Tuple[str, Optional[str]], closed_list: List[Tuple[str, Optional[str]]]) -> List[str]:
    """Authoritative Reconstruct-Path for BFS/DFS (Page 4):
    5 (node, parent) ← nodePair
    6 path ← node : []
    7 while parent is not null
    8   path ← parent : path
    9   CLOSED ← Skip-To(parent, CLOSED)
    10  (_, parent) ← head CLOSED
    11 return path
    """
    node, parent = node_pair
    path = [node]
    current_closed = list(closed_list)
    while parent is not null_val():
        path.insert(0, parent)
        current_closed = skip_to_2(parent, current_closed)
        if not current_closed:
            break
        head = current_closed[0]
        parent = head[1]
    return path


def skip_to_3(parent: str, closed_list: List[Tuple[str, Optional[str], int]], depth: int) -> List[Tuple[str, Optional[str], int]]:
    """Authoritative SkipTo for DFID (Page 8):
    1 SkipTo(parent, nodePairs, depth)
    2   if (parent, _, depth) = head nodePairs return nodePairs
    4   else return SkipTo(parent, tail nodePairs, depth)
    """
    for idx in range(len(closed_list)):
        entry = closed_list[idx]
        if entry[0] == parent and entry[2] == depth:
            return closed_list[idx:]
    return []


def reconstruct_path_3(node_pair: Tuple[str, Optional[str], int], closed_list: List[Tuple[str, Optional[str], int]]) -> List[str]:
    """Authoritative ReconstructPath for DFID (Page 8):
    5 (node, parent, depth) ← nodePair
    6 path ← node : []
    7 while parent is not null
    8   path ← parent : path
    9   CLOSED ← SkipTo(parent, CLOSED, depth - 1)
    10  (_, parent, depth) ← head CLOSED
    11 return path
    """
    node, parent, depth = node_pair
    path = [node]
    current_closed = list(closed_list)
    while parent is not null_val():
        path.insert(0, parent)
        current_closed = skip_to_3(parent, current_closed, depth - 1)
        if not current_closed:
            break
        head = current_closed[0]
        parent = head[1]
        depth = head[2]
    return path


def null_val():
    return None


def serialize_tuple(t: Any) -> Any:
    """Helper to convert tuples into JSON-serializable list format."""
    if isinstance(t, tuple):
        return [serialize_tuple(x) for x in t]
    return t


def serialize_list(lst: List[Any]) -> List[Any]:
    return [serialize_tuple(item) for item in lst]


# ---------------------------------------------------------------------------
# AUTHORITATIVE ALGORITHM EXECUTION ENGINE
# ---------------------------------------------------------------------------

class SearchEngine:
    def __init__(self, graph: Graph):
        self.graph = graph

    def run_bfs(self) -> SearchResult:
        """Execute Breadth First Search faithfully to algorithms.pdf Page 4."""
        events: List[TraceEvent] = []
        step = 0
        nodes_expanded = 0

        # Line 1: OPEN ← (S, null) : []
        open_list: List[Tuple[str, Optional[str]]] = [(self.graph.start_node, None)]
        # Line 2: CLOSED ← empty list
        closed_list: List[Tuple[str, Optional[str]]] = []

        events.append(
            TraceEvent(
                step_index=step,
                algorithm="BFS",
                line_number=1,
                line_pseudocode=BFS_PSEUDOCODE[1],
                event_type="INIT_OPEN",
                description=f"Initialize OPEN with start node pair ({self.graph.start_node}, null)",
                open_before=[],
                open_after=serialize_list(open_list),
                open_size_before=0,
                open_size_after=len(open_list),
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step += 1

        events.append(
            TraceEvent(
                step_index=step,
                algorithm="BFS",
                line_number=2,
                line_pseudocode=BFS_PSEUDOCODE[2],
                event_type="INIT_CLOSED",
                description="Initialize CLOSED as empty list []",
                open_before=serialize_list(open_list),
                open_after=serialize_list(open_list),
                open_size_before=len(open_list),
                open_size_after=len(open_list),
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step += 1

        while True:
            # Line 3: while OPEN is not empty
            is_open_non_empty = len(open_list) > 0
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=3,
                    line_pseudocode=BFS_PSEUDOCODE[3],
                    event_type="CHECK_OPEN",
                    description=f"Check if OPEN is not empty: {is_open_non_empty} (size={len(open_list)})",
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if not is_open_non_empty:
                # Line 13: return empty list
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm="BFS",
                        line_number=13,
                        line_pseudocode=BFS_PSEUDOCODE[13],
                        event_type="TERMINATE_EMPTY_LIST",
                        description="OPEN is empty. Goal not found. Return empty list []",
                        open_before=[],
                        open_after=[],
                        open_size_before=0,
                        open_size_after=0,
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                        is_terminal=True,
                        terminal_status="FAILURE",
                        terminal_reason="Goal unreachable: OPEN is empty",
                        path=[],
                    )
                )
                return SearchResult(
                    algorithm="BFS",
                    start_node=self.graph.start_node,
                    goal_node=self.graph.goal_node,
                    found_goal=False,
                    path=[],
                    total_steps=len(events),
                    nodes_expanded=nodes_expanded,
                    events=events,
                    terminal_status="FAILURE",
                    terminal_reason="Goal unreachable: OPEN is empty",
                )

            # Line 4: nodePair ← head OPEN
            node_pair = open_list[0]
            # Line 5: (N, _) ← nodePair
            n = node_pair[0]

            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=4,
                    line_pseudocode=BFS_PSEUDOCODE[4] + " ; " + BFS_PSEUDOCODE[5],
                    event_type="SELECT_HEAD",
                    description=f"Select head of OPEN: nodePair=({node_pair[0]}, {node_pair[1] if node_pair[1] else 'null'}), inspecting N='{n}'",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 6: if GoalTest(N) === true
            is_goal = (n == self.graph.goal_node)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=6,
                    line_pseudocode=BFS_PSEUDOCODE[6],
                    event_type="GOAL_TEST",
                    description=f"GoalTest('{n}') evaluated to {is_goal}",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if is_goal:
                # Line 7: return ReconstructPath(nodePair, CLOSED)
                path = reconstruct_path_2(node_pair, closed_list)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm="BFS",
                        line_number=7,
                        line_pseudocode=BFS_PSEUDOCODE[7],
                        event_type="RECONSTRUCT_PATH",
                        description=f"Goal reached! Reconstructed path: {path}",
                        current_node=n,
                        current_parent=node_pair[1],
                        path=path,
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                        is_terminal=True,
                        terminal_status="SUCCESS",
                        terminal_reason=f"Goal node '{n}' found",
                    )
                )
                return SearchResult(
                    algorithm="BFS",
                    start_node=self.graph.start_node,
                    goal_node=self.graph.goal_node,
                    found_goal=True,
                    path=path,
                    total_steps=len(events),
                    nodes_expanded=nodes_expanded,
                    events=events,
                    terminal_status="SUCCESS",
                    terminal_reason=f"Goal node '{n}' found",
                )

            # Line 8: else CLOSED ← nodePair : CLOSED
            closed_before = list(closed_list)
            closed_list.insert(0, node_pair)
            nodes_expanded += 1

            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=8,
                    line_pseudocode=BFS_PSEUDOCODE[8],
                    event_type="ADD_TO_CLOSED",
                    description=f"Prepend nodePair ({node_pair[0]}, {node_pair[1] if node_pair[1] else 'null'}) to CLOSED",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_before),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_before),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 9: neighbours ← MoveGen(N)
            neighbours = self.graph.move_gen(n)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=9,
                    line_pseudocode=BFS_PSEUDOCODE[9],
                    event_type="MOVE_GEN",
                    description=f"MoveGen('{n}') generated neighbours: {neighbours}",
                    current_node=n,
                    current_parent=node_pair[1],
                    raw_neighbours=neighbours,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 10: newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)
            new_nodes = remove_seen(neighbours, open_list, closed_list)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=10,
                    line_pseudocode=BFS_PSEUDOCODE[10],
                    event_type="REMOVE_SEEN",
                    description=f"RemoveSeen filtered neighbours {neighbours} to newNodes: {new_nodes}",
                    current_node=n,
                    current_parent=node_pair[1],
                    raw_neighbours=neighbours,
                    filtered_nodes=new_nodes,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 11: newPairs ← MakePairs(newNodes, N)
            new_pairs = make_pairs_2(new_nodes, n)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=11,
                    line_pseudocode=BFS_PSEUDOCODE[11],
                    event_type="MAKE_PAIRS",
                    description=f"MakePairs created: {serialize_list(new_pairs)}",
                    current_node=n,
                    current_parent=node_pair[1],
                    filtered_nodes=new_nodes,
                    new_pairs=serialize_list(new_pairs),
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 12: OPEN ← (tail OPEN) ++ newPairs
            open_before = list(open_list)
            open_list = open_list[1:] + new_pairs
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="BFS",
                    line_number=12,
                    line_pseudocode=BFS_PSEUDOCODE[12],
                    event_type="UPDATE_OPEN_QUEUE",
                    description=f"Update OPEN with (tail OPEN) ++ newPairs. Tail had {len(open_before)-1} items; appended {len(new_pairs)} new pairs.",
                    current_node=n,
                    current_parent=node_pair[1],
                    new_pairs=serialize_list(new_pairs),
                    open_before=serialize_list(open_before),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_before),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

    def run_dfs(self) -> SearchResult:
        """Execute Depth First Search faithfully to algorithms.pdf Page 4."""
        events: List[TraceEvent] = []
        step = 0
        nodes_expanded = 0

        # Line 1: OPEN ← (S, null) : []
        open_list: List[Tuple[str, Optional[str]]] = [(self.graph.start_node, None)]
        # Line 2: CLOSED ← empty list
        closed_list: List[Tuple[str, Optional[str]]] = []

        events.append(
            TraceEvent(
                step_index=step,
                algorithm="DFS",
                line_number=1,
                line_pseudocode=DFS_PSEUDOCODE[1],
                event_type="INIT_OPEN",
                description=f"Initialize OPEN with start node pair ({self.graph.start_node}, null)",
                open_before=[],
                open_after=serialize_list(open_list),
                open_size_before=0,
                open_size_after=len(open_list),
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step += 1

        events.append(
            TraceEvent(
                step_index=step,
                algorithm="DFS",
                line_number=2,
                line_pseudocode=DFS_PSEUDOCODE[2],
                event_type="INIT_CLOSED",
                description="Initialize CLOSED as empty list []",
                open_before=serialize_list(open_list),
                open_after=serialize_list(open_list),
                open_size_before=len(open_list),
                open_size_after=len(open_list),
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step += 1

        while True:
            # Line 3: while OPEN is not empty
            is_open_non_empty = len(open_list) > 0
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=3,
                    line_pseudocode=DFS_PSEUDOCODE[3],
                    event_type="CHECK_OPEN",
                    description=f"Check if OPEN is not empty: {is_open_non_empty} (size={len(open_list)})",
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if not is_open_non_empty:
                # Line 13: return empty list
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm="DFS",
                        line_number=13,
                        line_pseudocode=DFS_PSEUDOCODE[13],
                        event_type="TERMINATE_EMPTY_LIST",
                        description="OPEN is empty. Goal not found. Return empty list []",
                        open_before=[],
                        open_after=[],
                        open_size_before=0,
                        open_size_after=0,
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                        is_terminal=True,
                        terminal_status="FAILURE",
                        terminal_reason="Goal unreachable: OPEN is empty",
                        path=[],
                    )
                )
                return SearchResult(
                    algorithm="DFS",
                    start_node=self.graph.start_node,
                    goal_node=self.graph.goal_node,
                    found_goal=False,
                    path=[],
                    total_steps=len(events),
                    nodes_expanded=nodes_expanded,
                    events=events,
                    terminal_status="FAILURE",
                    terminal_reason="Goal unreachable: OPEN is empty",
                )

            # Line 4: nodePair ← head OPEN
            node_pair = open_list[0]
            # Line 5: (N, _) ← nodePair
            n = node_pair[0]

            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=4,
                    line_pseudocode=DFS_PSEUDOCODE[4] + " ; " + DFS_PSEUDOCODE[5],
                    event_type="SELECT_HEAD",
                    description=f"Select head of OPEN: nodePair=({node_pair[0]}, {node_pair[1] if node_pair[1] else 'null'}), inspecting N='{n}'",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 6: if GoalTest(N) === true
            is_goal = (n == self.graph.goal_node)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=6,
                    line_pseudocode=DFS_PSEUDOCODE[6],
                    event_type="GOAL_TEST",
                    description=f"GoalTest('{n}') evaluated to {is_goal}",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if is_goal:
                # Line 7: return ReconstructPath(nodePair, CLOSED)
                path = reconstruct_path_2(node_pair, closed_list)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm="DFS",
                        line_number=7,
                        line_pseudocode=DFS_PSEUDOCODE[7],
                        event_type="RECONSTRUCT_PATH",
                        description=f"Goal reached! Reconstructed path: {path}",
                        current_node=n,
                        current_parent=node_pair[1],
                        path=path,
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                        is_terminal=True,
                        terminal_status="SUCCESS",
                        terminal_reason=f"Goal node '{n}' found",
                    )
                )
                return SearchResult(
                    algorithm="DFS",
                    start_node=self.graph.start_node,
                    goal_node=self.graph.goal_node,
                    found_goal=True,
                    path=path,
                    total_steps=len(events),
                    nodes_expanded=nodes_expanded,
                    events=events,
                    terminal_status="SUCCESS",
                    terminal_reason=f"Goal node '{n}' found",
                )

            # Line 8: else CLOSED ← nodePair : CLOSED
            closed_before = list(closed_list)
            closed_list.insert(0, node_pair)
            nodes_expanded += 1

            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=8,
                    line_pseudocode=DFS_PSEUDOCODE[8],
                    event_type="ADD_TO_CLOSED",
                    description=f"Prepend nodePair ({node_pair[0]}, {node_pair[1] if node_pair[1] else 'null'}) to CLOSED",
                    current_node=n,
                    current_parent=node_pair[1],
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_before),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_before),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 9: neighbours ← MoveGen(N)
            neighbours = self.graph.move_gen(n)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=9,
                    line_pseudocode=DFS_PSEUDOCODE[9],
                    event_type="MOVE_GEN",
                    description=f"MoveGen('{n}') generated neighbours: {neighbours}",
                    current_node=n,
                    current_parent=node_pair[1],
                    raw_neighbours=neighbours,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 10: newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)
            new_nodes = remove_seen(neighbours, open_list, closed_list)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=10,
                    line_pseudocode=DFS_PSEUDOCODE[10],
                    event_type="REMOVE_SEEN",
                    description=f"RemoveSeen filtered neighbours {neighbours} to newNodes: {new_nodes}",
                    current_node=n,
                    current_parent=node_pair[1],
                    raw_neighbours=neighbours,
                    filtered_nodes=new_nodes,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 11: newPairs ← MakePairs(newNodes, N)
            new_pairs = make_pairs_2(new_nodes, n)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=11,
                    line_pseudocode=DFS_PSEUDOCODE[11],
                    event_type="MAKE_PAIRS",
                    description=f"MakePairs created: {serialize_list(new_pairs)}",
                    current_node=n,
                    current_parent=node_pair[1],
                    filtered_nodes=new_nodes,
                    new_pairs=serialize_list(new_pairs),
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 12: OPEN ← newPairs ++ (tail OPEN)
            open_before = list(open_list)
            open_list = new_pairs + open_list[1:]
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFS",
                    line_number=12,
                    line_pseudocode=DFS_PSEUDOCODE[12],
                    event_type="UPDATE_OPEN_STACK",
                    description=f"Update OPEN with newPairs ++ (tail OPEN). Prepended {len(new_pairs)} new pairs to tail OPEN.",
                    current_node=n,
                    current_parent=node_pair[1],
                    new_pairs=serialize_list(new_pairs),
                    open_before=serialize_list(open_before),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_before),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

    def run_dfid_n(self, max_depth_bound: int = 50) -> SearchResult:
        """Execute DFID-N faithfully to algorithms.pdf Page 6."""
        events: List[TraceEvent] = []
        step = 0
        total_expanded = 0

        # Line 1: count ← -1
        count = -1
        # Line 2: path ← empty list
        path: List[str] = []
        # Line 3: depthBound ← 0
        depth_bound = 0

        last_db_open: List[Tuple[str, Optional[str], int]] = []
        last_db_closed: List[Tuple[str, Optional[str], int]] = []

        events.append(
            TraceEvent(
                step_index=step,
                algorithm="DFID-N",
                line_number=1,
                line_pseudocode=DFID_N_PSEUDOCODE[1] + " ; " + DFID_N_PSEUDOCODE[2] + " ; " + DFID_N_PSEUDOCODE[3],
                event_type="DFID_INIT",
                description="Initialize DFID-N: count ← -1, path ← [], depthBound ← 0",
                count=count,
                depth_bound=depth_bound,
                open_before=[],
                open_after=[],
                open_size_before=0,
                open_size_after=0,
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step += 1

        iteration = 0
        while True:
            # Line 4: repeat
            # Line 5: previousCount ← count
            previous_count = count
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFID-N",
                    line_number=5,
                    line_pseudocode=DFID_N_PSEUDOCODE[5],
                    event_type="DFID_ITERATION_START",
                    description=f"DFID-N Iteration {iteration}: previousCount ← count ({previous_count}), depthBound={depth_bound}",
                    count=count,
                    previous_count=previous_count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(last_db_open),
                    open_after=serialize_list(last_db_open),
                    open_size_before=len(last_db_open),
                    open_size_after=len(last_db_open),
                    closed_before=serialize_list(last_db_closed),
                    closed_after=serialize_list(last_db_closed),
                    closed_size_before=len(last_db_closed),
                    closed_size_after=len(last_db_closed),
                )
            )
            step += 1

            # Line 6: (count, path) ← DB-DFS-N(S, depthBound)
            count, path, step, exp, last_db_open, last_db_closed = self._db_dfs(
                algorithm="DFID-N",
                depth_bound=depth_bound,
                is_dfid_c=False,
                events=events,
                start_step=step,
                iteration=iteration,
                initial_open=last_db_open,
                initial_closed=last_db_closed,
            )
            total_expanded += exp

            # Line 7: depthBound ← depthBound + 1
            next_depth_bound = depth_bound + 1
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFID-N",
                    line_number=7,
                    line_pseudocode=DFID_N_PSEUDOCODE[7],
                    event_type="DFID_INCREMENT_DEPTH",
                    description=f"depthBound ← depthBound + 1 (was {depth_bound}, now {next_depth_bound})",
                    count=count,
                    previous_count=previous_count,
                    depth_bound=next_depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(last_db_open),
                    open_after=serialize_list(last_db_open),
                    open_size_before=len(last_db_open),
                    open_size_after=len(last_db_open),
                    closed_before=serialize_list(last_db_closed),
                    closed_after=serialize_list(last_db_closed),
                    closed_size_before=len(last_db_closed),
                    closed_size_after=len(last_db_closed),
                )
            )
            step += 1

            # Line 8: until (path is not empty) or (previousCount = count)
            condition_met = (len(path) > 0) or (previous_count == count)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFID-N",
                    line_number=8,
                    line_pseudocode=DFID_N_PSEUDOCODE[8],
                    event_type="DFID_UNTIL_CHECK",
                    description=f"until condition check: (path is not empty => {len(path) > 0}) or (previousCount == count => {previous_count} == {count} => {previous_count == count}) -> {condition_met}",
                    count=count,
                    previous_count=previous_count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    path=path if path else None,
                    open_before=serialize_list(last_db_open),
                    open_after=serialize_list(last_db_open),
                    open_size_before=len(last_db_open),
                    open_size_after=len(last_db_open),
                    closed_before=serialize_list(last_db_closed),
                    closed_after=serialize_list(last_db_closed),
                    closed_size_before=len(last_db_closed),
                    closed_size_after=len(last_db_closed),
                )
            )
            step += 1

            depth_bound = next_depth_bound
            iteration += 1

            if condition_met:
                break

            if depth_bound > max_depth_bound:
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm="DFID-N",
                        line_number=8,
                        line_pseudocode="SAFETY_MAX_DEPTH_BOUND",
                        event_type="TERMINATE_SAFETY_BOUND",
                        description=f"Safety max depth bound ({max_depth_bound}) reached. Terminating DFID-N.",
                        depth_bound=depth_bound,
                        is_terminal=True,
                        terminal_status="MAX_DEPTH_REACHED",
                        terminal_reason=f"Exceeded max depth bound {max_depth_bound}",
                        path=[],
                        open_before=serialize_list(last_db_open),
                        open_after=serialize_list(last_db_open),
                        open_size_before=len(last_db_open),
                        open_size_after=len(last_db_open),
                        closed_before=serialize_list(last_db_closed),
                        closed_after=serialize_list(last_db_closed),
                        closed_size_before=len(last_db_closed),
                        closed_size_after=len(last_db_closed),
                    )
                )
                return SearchResult(
                    algorithm="DFID-N",
                    start_node=self.graph.start_node,
                    goal_node=self.graph.goal_node,
                    found_goal=False,
                    path=[],
                    total_steps=len(events),
                    nodes_expanded=total_expanded,
                    events=events,
                    terminal_status="MAX_DEPTH_REACHED",
                    terminal_reason=f"Exceeded max depth bound {max_depth_bound}",
                )

        # Line 9: return path
        found_goal = len(path) > 0
        terminal_status = "SUCCESS" if found_goal else "FAILURE"
        terminal_reason = f"Goal node found: path={path}" if found_goal else "Goal unreachable: count stagnation (previousCount == count)"
        events.append(
            TraceEvent(
                step_index=step,
                algorithm="DFID-N",
                line_number=9,
                line_pseudocode=DFID_N_PSEUDOCODE[9],
                event_type="DFID_TERMINATE",
                description=f"DFID-N terminates. Returning path: {path}",
                path=path,
                is_terminal=True,
                terminal_status=terminal_status,
                terminal_reason=terminal_reason,
                open_before=serialize_list(last_db_open),
                open_after=serialize_list(last_db_open),
                open_size_before=len(last_db_open),
                open_size_after=len(last_db_open),
                closed_before=serialize_list(last_db_closed),
                closed_after=serialize_list(last_db_closed),
                closed_size_before=len(last_db_closed),
                closed_size_after=len(last_db_closed),
            )
        )

        return SearchResult(
            algorithm="DFID-N",
            start_node=self.graph.start_node,
            goal_node=self.graph.goal_node,
            found_goal=found_goal,
            path=path,
            total_steps=len(events),
            nodes_expanded=total_expanded,
            events=events,
            terminal_status=terminal_status,
            terminal_reason=terminal_reason,
        )

    def run_dfid_c(self, max_depth_bound: int = 50) -> SearchResult:
        """Execute DFID-C faithfully to algorithms.pdf Page 7."""
        events: List[TraceEvent] = []
        step = 0
        total_expanded = 0

        # Line 1: count ← -1
        count = -1
        # Line 2: path ← empty list
        path: List[str] = []
        # Line 3: depthBound ← 0
        depth_bound = 0

        last_db_open: List[Tuple[str, Optional[str], int]] = []
        last_db_closed: List[Tuple[str, Optional[str], int]] = []

        events.append(
            TraceEvent(
                step_index=step,
                algorithm="DFID-C",
                line_number=1,
                line_pseudocode=DFID_C_PSEUDOCODE[1] + " ; " + DFID_C_PSEUDOCODE[2] + " ; " + DFID_C_PSEUDOCODE[3],
                event_type="DFID_INIT",
                description="Initialize DFID-C: count ← -1, path ← [], depthBound ← 0",
                count=count,
                depth_bound=depth_bound,
                open_before=[],
                open_after=[],
                open_size_before=0,
                open_size_after=0,
                closed_before=[],
                closed_after=[],
                closed_size_before=0,
                closed_size_after=0,
            )
        )
        step += 1

        iteration = 0
        while True:
            # Line 4: repeat
            # Line 5: previousCount ← count
            previous_count = count
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFID-C",
                    line_number=5,
                    line_pseudocode=DFID_C_PSEUDOCODE[5],
                    event_type="DFID_ITERATION_START",
                    description=f"DFID-C Iteration {iteration}: previousCount ← count ({previous_count}), depthBound={depth_bound}",
                    count=count,
                    previous_count=previous_count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(last_db_open),
                    open_after=serialize_list(last_db_open),
                    open_size_before=len(last_db_open),
                    open_size_after=len(last_db_open),
                    closed_before=serialize_list(last_db_closed),
                    closed_after=serialize_list(last_db_closed),
                    closed_size_before=len(last_db_closed),
                    closed_size_after=len(last_db_closed),
                )
            )
            step += 1

            # Line 6: (count, path) ← DB-DFS-C(S, depthBound)
            count, path, step, exp, last_db_open, last_db_closed = self._db_dfs(
                algorithm="DFID-C",
                depth_bound=depth_bound,
                is_dfid_c=True,
                events=events,
                start_step=step,
                iteration=iteration,
                initial_open=last_db_open,
                initial_closed=last_db_closed,
            )
            total_expanded += exp

            # Line 7: depthBound ← depthBound + 1
            next_depth_bound = depth_bound + 1
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFID-C",
                    line_number=7,
                    line_pseudocode=DFID_C_PSEUDOCODE[7],
                    event_type="DFID_INCREMENT_DEPTH",
                    description=f"depthBound ← depthBound + 1 (was {depth_bound}, now {next_depth_bound})",
                    count=count,
                    previous_count=previous_count,
                    depth_bound=next_depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(last_db_open),
                    open_after=serialize_list(last_db_open),
                    open_size_before=len(last_db_open),
                    open_size_after=len(last_db_open),
                    closed_before=serialize_list(last_db_closed),
                    closed_after=serialize_list(last_db_closed),
                    closed_size_before=len(last_db_closed),
                    closed_size_after=len(last_db_closed),
                )
            )
            step += 1

            # Line 8: until (path is not empty) or (previousCount = count)
            condition_met = (len(path) > 0) or (previous_count == count)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm="DFID-C",
                    line_number=8,
                    line_pseudocode=DFID_C_PSEUDOCODE[8],
                    event_type="DFID_UNTIL_CHECK",
                    description=f"until condition check: (path is not empty => {len(path) > 0}) or (previousCount == count => {previous_count} == {count} => {previous_count == count}) -> {condition_met}",
                    count=count,
                    previous_count=previous_count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    path=path if path else None,
                    open_before=serialize_list(last_db_open),
                    open_after=serialize_list(last_db_open),
                    open_size_before=len(last_db_open),
                    open_size_after=len(last_db_open),
                    closed_before=serialize_list(last_db_closed),
                    closed_after=serialize_list(last_db_closed),
                    closed_size_before=len(last_db_closed),
                    closed_size_after=len(last_db_closed),
                )
            )
            step += 1

            depth_bound = next_depth_bound
            iteration += 1

            if condition_met:
                break

            if depth_bound > max_depth_bound:
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm="DFID-C",
                        line_number=8,
                        line_pseudocode="SAFETY_MAX_DEPTH_BOUND",
                        event_type="TERMINATE_SAFETY_BOUND",
                        description=f"Safety max depth bound ({max_depth_bound}) reached. Terminating DFID-C.",
                        depth_bound=depth_bound,
                        is_terminal=True,
                        terminal_status="MAX_DEPTH_REACHED",
                        terminal_reason=f"Exceeded max depth bound {max_depth_bound} (preventing infinite reopening loop in cyclic graph)",
                        path=[],
                        open_before=serialize_list(last_db_open),
                        open_after=serialize_list(last_db_open),
                        open_size_before=len(last_db_open),
                        open_size_after=len(last_db_open),
                        closed_before=serialize_list(last_db_closed),
                        closed_after=serialize_list(last_db_closed),
                        closed_size_before=len(last_db_closed),
                        closed_size_after=len(last_db_closed),
                    )
                )
                return SearchResult(
                    algorithm="DFID-C",
                    start_node=self.graph.start_node,
                    goal_node=self.graph.goal_node,
                    found_goal=False,
                    path=[],
                    total_steps=len(events),
                    nodes_expanded=total_expanded,
                    events=events,
                    terminal_status="MAX_DEPTH_REACHED",
                    terminal_reason=f"Exceeded max depth bound {max_depth_bound} (cyclic graph / unreachable goal)",
                )

        # Line 9: return path
        found_goal = len(path) > 0
        terminal_status = "SUCCESS" if found_goal else "FAILURE"
        terminal_reason = f"Goal node found: path={path}" if found_goal else "Goal unreachable: count stagnation (previousCount == count)"
        events.append(
            TraceEvent(
                step_index=step,
                algorithm="DFID-C",
                line_number=9,
                line_pseudocode=DFID_C_PSEUDOCODE[9],
                event_type="DFID_TERMINATE",
                description=f"DFID-C terminates. Returning path: {path}",
                path=path,
                is_terminal=True,
                terminal_status=terminal_status,
                terminal_reason=terminal_reason,
                open_before=serialize_list(last_db_open),
                open_after=serialize_list(last_db_open),
                open_size_before=len(last_db_open),
                open_size_after=len(last_db_open),
                closed_before=serialize_list(last_db_closed),
                closed_after=serialize_list(last_db_closed),
                closed_size_before=len(last_db_closed),
                closed_size_after=len(last_db_closed),
            )
        )

        return SearchResult(
            algorithm="DFID-C",
            start_node=self.graph.start_node,
            goal_node=self.graph.goal_node,
            found_goal=found_goal,
            path=path,
            total_steps=len(events),
            nodes_expanded=total_expanded,
            events=events,
            terminal_status=terminal_status,
            terminal_reason=terminal_reason,
        )

    def _db_dfs(
        self,
        algorithm: str,
        depth_bound: int,
        is_dfid_c: bool,
        events: List[TraceEvent],
        start_step: int,
        iteration: int,
        initial_open: Optional[List[Tuple[str, Optional[str], int]]] = None,
        initial_closed: Optional[List[Tuple[str, Optional[str], int]]] = None,
    ) -> Tuple[int, List[str], int, int, List[Tuple[str, Optional[str], int]], List[Tuple[str, Optional[str], int]]]:
        """DB-DFS-N (Page 6) or DB-DFS-C (Page 7).
        Identical except for Line 21."""
        init_open = initial_open or []
        init_closed = initial_closed or []
        step = start_step
        nodes_expanded = 0
        pseudocode_map = DFID_C_PSEUDOCODE if is_dfid_c else DFID_N_PSEUDOCODE

        # Line 10: count ← 0
        count = 0
        # Line 11: OPEN ← (S, null, 0) : []
        open_list: List[Tuple[str, Optional[str], int]] = [(self.graph.start_node, None, 0)]
        # Line 12: CLOSED ← empty list
        closed_list: List[Tuple[str, Optional[str], int]] = []
        last_active_open: List[Tuple[str, Optional[str], int]] = list(open_list)

        events.append(
            TraceEvent(
                step_index=step,
                algorithm=algorithm,
                line_number=10,
                line_pseudocode=pseudocode_map[10],
                event_type="DB_DFS_INIT_COUNT",
                description=f"[{algorithm}] count ← 0 for depthBound={depth_bound}",
                count=count,
                depth_bound=depth_bound,
                iteration=iteration,
                open_before=serialize_list(init_open),
                open_after=serialize_list(init_open),
                open_size_before=len(init_open),
                open_size_after=len(init_open),
                closed_before=serialize_list(init_closed),
                closed_after=serialize_list(init_closed),
                closed_size_before=len(init_closed),
                closed_size_after=len(init_closed),
            )
        )
        step += 1

        events.append(
            TraceEvent(
                step_index=step,
                algorithm=algorithm,
                line_number=11,
                line_pseudocode=pseudocode_map[11] + " ; " + pseudocode_map[12],
                event_type="DB_DFS_INIT_LISTS",
                description=f"[{algorithm}] OPEN ← [({self.graph.start_node}, null, 0)], CLOSED ← []",
                count=count,
                depth_bound=depth_bound,
                iteration=iteration,
                open_before=serialize_list(init_open),
                open_after=serialize_list(open_list),
                open_size_before=len(init_open),
                open_size_after=len(open_list),
                closed_before=serialize_list(init_closed),
                closed_after=[],
                closed_size_before=len(init_closed),
                closed_size_after=0,
            )
        )
        step += 1

        while True:
            # Line 13: while OPEN is not empty
            is_open_non_empty = len(open_list) > 0
            if open_list:
                last_active_open = list(open_list)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm=algorithm,
                    line_number=13,
                    line_pseudocode=pseudocode_map[13],
                    event_type="DB_DFS_CHECK_OPEN",
                    description=f"[{algorithm}] Check OPEN not empty: {is_open_non_empty} (size={len(open_list)})",
                    count=count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if not is_open_non_empty:
                # Line 26: return (count, empty list)
                effective_open = open_list if open_list else last_active_open
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=26,
                        line_pseudocode=pseudocode_map[26],
                        event_type="DB_DFS_RETURN_EMPTY",
                        description=f"[{algorithm}] DB-DFS iteration completed for depthBound={depth_bound}. Return (count={count}, empty list []). OPEN frontier and CLOSED preserved for depthBound increment.",
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        open_before=serialize_list(effective_open),
                        open_after=serialize_list(effective_open),
                        open_size_before=len(effective_open),
                        open_size_after=len(effective_open),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1
                return count, [], step, nodes_expanded, effective_open, closed_list

            # Line 14: nodePair ← head OPEN
            node_triple = open_list[0]
            # Line 15: (N, _, depth) ← nodePair
            n, parent, depth = node_triple

            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm=algorithm,
                    line_number=14,
                    line_pseudocode=pseudocode_map[14] + " ; " + pseudocode_map[15],
                    event_type="DB_DFS_SELECT_HEAD",
                    description=f"[{algorithm}] Inspecting head: node='{n}', parent='{parent if parent else 'null'}', depth={depth}",
                    current_node=n,
                    current_parent=parent,
                    current_depth=depth,
                    count=count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 16: if GoalTest(N) === true
            is_goal = (n == self.graph.goal_node)
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm=algorithm,
                    line_number=16,
                    line_pseudocode=pseudocode_map[16],
                    event_type="DB_DFS_GOAL_TEST",
                    description=f"[{algorithm}] GoalTest('{n}') evaluated to {is_goal}",
                    current_node=n,
                    current_parent=parent,
                    current_depth=depth,
                    count=count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if is_goal:
                # Line 17: return (count, ReconstructPath(nodePair, CLOSED))
                path = reconstruct_path_3(node_triple, closed_list)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=17,
                        line_pseudocode=pseudocode_map[17],
                        event_type="DB_DFS_GOAL_FOUND",
                        description=f"[{algorithm}] Goal found! Path: {path}, count={count}",
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        path=path,
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1
                return count, path, step, nodes_expanded, open_list, closed_list

            # Line 18: else CLOSED ← nodePair : CLOSED
            closed_before = list(closed_list)
            closed_list.insert(0, node_triple)
            nodes_expanded += 1

            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm=algorithm,
                    line_number=18,
                    line_pseudocode=pseudocode_map[18],
                    event_type="DB_DFS_ADD_CLOSED",
                    description=f"[{algorithm}] Prepend ({n}, {parent if parent else 'null'}, {depth}) to CLOSED",
                    current_node=n,
                    current_parent=parent,
                    current_depth=depth,
                    count=count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_before),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_before),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            # Line 19: if depth < depthBound
            can_expand = depth < depth_bound
            events.append(
                TraceEvent(
                    step_index=step,
                    algorithm=algorithm,
                    line_number=19,
                    line_pseudocode=pseudocode_map[19],
                    event_type="DB_DFS_DEPTH_CHECK",
                    description=f"[{algorithm}] Check depth < depthBound: {depth} < {depth_bound} -> {can_expand}",
                    current_node=n,
                    current_parent=parent,
                    current_depth=depth,
                    count=count,
                    depth_bound=depth_bound,
                    iteration=iteration,
                    open_before=serialize_list(open_list),
                    open_after=serialize_list(open_list),
                    open_size_before=len(open_list),
                    open_size_after=len(open_list),
                    closed_before=serialize_list(closed_list),
                    closed_after=serialize_list(closed_list),
                    closed_size_before=len(closed_list),
                    closed_size_after=len(closed_list),
                )
            )
            step += 1

            if can_expand:
                # Line 20: neighbours ← MoveGen(N)
                neighbours = self.graph.move_gen(n)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=20,
                        line_pseudocode=pseudocode_map[20],
                        event_type="DB_DFS_MOVE_GEN",
                        description=f"[{algorithm}] MoveGen('{n}') generated neighbours: {neighbours}",
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        raw_neighbours=neighbours,
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1

                # Line 21: newNodes ← RemoveSeen(neighbours, OPEN, CLOSED) for DFID-N
                #          newNodes ← RemoveSeen(neighbours, OPEN, []) for DFID-C
                if is_dfid_c:
                    new_nodes = remove_seen(neighbours, open_list, [])
                    filter_desc = f"[{algorithm}] Line 21: RemoveSeen(neighbours, OPEN, []) -> newNodes: {new_nodes} (CLOSED ignored, reopened if not in OPEN)"
                else:
                    new_nodes = remove_seen(neighbours, open_list, closed_list)
                    filter_desc = f"[{algorithm}] Line 21: RemoveSeen(neighbours, OPEN, CLOSED) -> newNodes: {new_nodes} (not in OPEN or CLOSED)"

                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=21,
                        line_pseudocode=pseudocode_map[21],
                        event_type="DB_DFS_REMOVE_SEEN",
                        description=filter_desc,
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        raw_neighbours=neighbours,
                        filtered_nodes=new_nodes,
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1

                # Line 22: newPairs ← MakePairs(newNodes, N, depth + 1)
                new_pairs = make_pairs_3(new_nodes, n, depth + 1)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=22,
                        line_pseudocode=pseudocode_map[22],
                        event_type="DB_DFS_MAKE_PAIRS",
                        description=f"[{algorithm}] MakePairs with depth={depth + 1}: {serialize_list(new_pairs)}",
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        filtered_nodes=new_nodes,
                        new_pairs=serialize_list(new_pairs),
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1

                # Line 23: OPEN ← newPairs ++ tail OPEN
                open_before = list(open_list)
                open_list = new_pairs + open_list[1:]
                if open_list:
                    last_active_open = list(open_list)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=23,
                        line_pseudocode=pseudocode_map[23],
                        event_type="DB_DFS_UPDATE_OPEN",
                        description=f"[{algorithm}] OPEN ← newPairs ++ tail OPEN (prepended {len(new_pairs)} pairs to tail OPEN)",
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        new_pairs=serialize_list(new_pairs),
                        open_before=serialize_list(open_before),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_before),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1

                # Line 24: count ← count + length newPairs
                old_count = count
                count = count + len(new_pairs)
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=24,
                        line_pseudocode=pseudocode_map[24],
                        event_type="DB_DFS_UPDATE_COUNT",
                        description=f"[{algorithm}] count ← count + length newPairs ({old_count} + {len(new_pairs)} = {count})",
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        open_before=serialize_list(open_list),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_list),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1

            else:
                # Line 25: else OPEN ← tail OPEN
                open_before = list(open_list)
                open_list = open_list[1:]
                events.append(
                    TraceEvent(
                        step_index=step,
                        algorithm=algorithm,
                        line_number=25,
                        line_pseudocode=pseudocode_map[25],
                        event_type="DB_DFS_PRUNE_DEPTH",
                        description=f"[{algorithm}] depth {depth} >= depthBound {depth_bound}: Pruned without expanding. OPEN ← tail OPEN",
                        current_node=n,
                        current_parent=parent,
                        current_depth=depth,
                        count=count,
                        depth_bound=depth_bound,
                        iteration=iteration,
                        open_before=serialize_list(open_before),
                        open_after=serialize_list(open_list),
                        open_size_before=len(open_before),
                        open_size_after=len(open_list),
                        closed_before=serialize_list(closed_list),
                        closed_after=serialize_list(closed_list),
                        closed_size_before=len(closed_list),
                        closed_size_after=len(closed_list),
                    )
                )
                step += 1
