"""
Code-faithful Traveling Salesperson Problem (TSP) Heuristics for AI SMPS 2023 Week 3.
Implements Nearest-Neighbour-Heuristic, Greedy-Heuristic, and Savings-Heuristic
strictly adhering to specifications in `algorithms_week3.pdf` (Page 4, prepared by S. Baskaran, IIT Madras).
"""

from typing import Any, Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, Field


class TSPTraceEvent(BaseModel):
    step_index: int
    algorithm: str
    line_number: int
    line_pseudocode: str
    event_type: str
    description: str
    current_city: Optional[str] = None
    candidate_edges: Optional[List[Any]] = None
    selected_edge: Optional[Any] = None
    current_tour: Optional[List[str]] = None
    sub_tours: Optional[List[List[str]]] = None
    savings_list: Optional[List[Tuple[str, str, float]]] = None
    total_cost: float = 0.0
    is_terminal: bool = False


class TSPResult(BaseModel):
    algorithm: str
    cities: List[str]
    tour: List[str]
    total_cost: float
    total_steps: int
    events: List[TSPTraceEvent]


class TSPEngine:
    """
    Execution engine for Week 3 TSP heuristics with deterministic line-by-line event traces.
    """

    def __init__(self, cities: List[str], costs: Dict[Tuple[str, str], float]):
        self.cities = sorted(cities)
        self.costs = {}
        for (u, v), c in costs.items():
            self.costs[(u, v)] = float(c)
            self.costs[(v, u)] = float(c)

    def cost(self, u: str, v: str) -> float:
        if u == v:
            return 0.0
        return self.costs.get((u, v), self.costs.get((v, u), float("inf")))

    def compute_all_edges(self) -> List[Tuple[str, str, float]]:
        """
        Computes cost of all unique undirected edges (a, b) where a < b.
        """
        edges = []
        n = len(self.cities)
        for i in range(n):
            for j in range(i + 1, n):
                a, b = self.cities[i], self.cities[j]
                edges.append((a, b, self.cost(a, b)))
        return edges

    def run_nearest_neighbour(self, start_city: Optional[str] = None) -> TSPResult:
        """
        Executes Nearest-Neighbour-Heuristic (Week 3, Page 4):
        1  Compute the cost of all the edges
        2  Start at some city
        3  repeat
        4    Move to the nearest neighbour which does not:
               close the loop prematurely
               or form branches/forks
        """
        events: List[TSPTraceEvent] = []
        step_idx = 0

        # Line 1: Compute the cost of all the edges
        all_edges = self.compute_all_edges()
        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Nearest-Neighbour-Heuristic",
                line_number=1,
                line_pseudocode="Compute the cost of all the edges",
                event_type="COMPUTE_EDGES",
                description=f"Computed costs for all {len(all_edges)} city edges",
                candidate_edges=[[e[0], e[1], e[2]] for e in all_edges],
            )
        )
        step_idx += 1

        # Line 2: Start at some city
        start = start_city if start_city in self.cities else self.cities[0]
        tour = [start]
        visited: Set[str] = {start}
        current = start
        total_cost = 0.0

        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Nearest-Neighbour-Heuristic",
                line_number=2,
                line_pseudocode="Start at some city",
                event_type="START_CITY",
                description=f"Started tour at city '{start}'",
                current_city=start,
                current_tour=list(tour),
                total_cost=total_cost,
            )
        )
        step_idx += 1

        # Line 3: repeat
        # Line 4: Move to the nearest neighbour which does not close loop or branch
        while len(visited) < len(self.cities):
            # Candidate unvisited neighbors
            unvisited = [c for c in self.cities if c not in visited]
            # Sort candidate edges by (cost, label) for deterministic tie-breaking
            candidates = sorted(
                [(current, c, self.cost(current, c)) for c in unvisited],
                key=lambda x: (x[2], x[1]),
            )

            chosen = candidates[0]
            next_city = chosen[1]
            edge_cost = chosen[2]

            total_cost += edge_cost
            tour.append(next_city)
            visited.add(next_city)
            current = next_city

            events.append(
                TSPTraceEvent(
                    step_index=step_idx,
                    algorithm="Nearest-Neighbour-Heuristic",
                    line_number=4,
                    line_pseudocode="Move to the nearest neighbour which does not close loop or branch",
                    event_type="MOVE_NEAREST",
                    description=f"Moved from '{chosen[0]}' to nearest unvisited neighbour '{next_city}' (cost: {edge_cost})",
                    current_city=next_city,
                    selected_edge=[chosen[0], chosen[1], edge_cost],
                    current_tour=list(tour),
                    total_cost=total_cost,
                )
            )
            step_idx += 1

        # Close the tour back to start
        return_cost = self.cost(current, start)
        total_cost += return_cost
        tour.append(start)

        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Nearest-Neighbour-Heuristic",
                line_number=4,
                line_pseudocode="Close the loop back to start city",
                event_type="CLOSE_TOUR",
                description=f"Closed tour back to start city '{start}' (cost: {return_cost}). Complete tour cost: {total_cost}",
                current_city=start,
                selected_edge=[current, start, return_cost],
                current_tour=list(tour),
                total_cost=total_cost,
                is_terminal=True,
            )
        )

        return TSPResult(
            algorithm="Nearest-Neighbour-Heuristic",
            cities=self.cities,
            tour=tour,
            total_cost=total_cost,
            total_steps=len(events),
            events=events,
        )

    def run_greedy_heuristic(self) -> TSPResult:
        """
        Executes Greedy-Heuristic (Week 3, Page 4):
        1  Compute the cost of all the edges
        2  Sort the edges by cost
        3  repeat
        4    Add the shortest available edge which does not:
               close the loop prematurely
               or form branches/forks
        """
        events: List[TSPTraceEvent] = []
        step_idx = 0

        # Line 1: Compute the cost of all the edges
        edges = self.compute_all_edges()
        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Greedy-Heuristic",
                line_number=1,
                line_pseudocode="Compute the cost of all the edges",
                event_type="COMPUTE_EDGES",
                description=f"Computed costs for all {len(edges)} unique edges",
            )
        )
        step_idx += 1

        # Line 2: Sort the edges by cost (tie-breaking: edge endpoints lexicographical)
        sorted_edges = sorted(edges, key=lambda e: (e[2], e[0], e[1]))
        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Greedy-Heuristic",
                line_number=2,
                line_pseudocode="Sort the edges by cost",
                event_type="SORT_EDGES",
                description=f"Sorted {len(sorted_edges)} edges ascending by cost",
                candidate_edges=[[e[0], e[1], e[2]] for e in sorted_edges],
            )
        )
        step_idx += 1

        # Line 3: repeat
        # Line 4: Add shortest available edge without branching or premature cycle
        selected_edges: List[Tuple[str, str, float]] = []
        degrees: Dict[str, int] = {c: 0 for c in self.cities}
        adj: Dict[str, List[str]] = {c: [] for c in self.cities}
        total_cost = 0.0
        n_cities = len(self.cities)

        def creates_cycle(u: str, v: str) -> bool:
            # BFS on adj to check if path exists between u and v
            visited = set()
            queue = [u]
            while queue:
                curr = queue.pop(0)
                if curr == v:
                    return True
                visited.add(curr)
                for nxt in adj[curr]:
                    if nxt not in visited:
                        queue.append(nxt)
            return False

        for edge in sorted_edges:
            u, v, c = edge
            # Cannot exceed degree 2
            if degrees[u] >= 2 or degrees[v] >= 2:
                continue

            # Cannot create premature loop before n_cities edges
            if len(selected_edges) < n_cities - 1 and creates_cycle(u, v):
                continue

            # Accept edge
            selected_edges.append(edge)
            degrees[u] += 1
            degrees[v] += 1
            adj[u].append(v)
            adj[v].append(u)
            total_cost += c

            events.append(
                TSPTraceEvent(
                    step_index=step_idx,
                    algorithm="Greedy-Heuristic",
                    line_number=4,
                    line_pseudocode="Add the shortest available edge which does not close loop or branch",
                    event_type="ADD_EDGE",
                    description=f"Added edge ({u}, {v}) with cost {c}. Selected {len(selected_edges)}/{n_cities} edges",
                    selected_edge=[u, v, c],
                    candidate_edges=[[e[0], e[1], e[2]] for e in selected_edges],
                    total_cost=total_cost,
                )
            )
            step_idx += 1

            if len(selected_edges) == n_cities:
                break

        # Reconstruct ordered tour from adjacency list
        start = self.cities[0]
        tour = [start]
        curr = start
        prev = None
        while len(tour) < n_cities + 1:
            nbrs = adj[curr]
            next_city = nbrs[0] if nbrs[0] != prev else (nbrs[1] if len(nbrs) > 1 else start)
            prev = curr
            curr = next_city
            tour.append(curr)
            if curr == start:
                break

        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Greedy-Heuristic",
                line_number=4,
                line_pseudocode="Completed tour construction",
                event_type="TOUR_COMPLETE",
                description=f"Tour completed with total cost: {total_cost}. Tour: {' -> '.join(tour)}",
                current_tour=list(tour),
                total_cost=total_cost,
                is_terminal=True,
            )
        )

        return TSPResult(
            algorithm="Greedy-Heuristic",
            cities=self.cities,
            tour=tour,
            total_cost=total_cost,
            total_steps=len(events),
            events=events,
        )

    def run_savings_heuristic(self, base_city: Optional[str] = None) -> TSPResult:
        """
        Executes Savings-Heuristic (Clarke-Wright) (Week 3, Page 4):
        1  n ← select a base city from N cities   ▷ base city
        2  construct (N – 1) sub-tours, each of length 2 anchored at n
        3  savingsList ← empty list
        4  for each non base city a
        5    for each non base city b, if b > a   ▷ ignores inverse edge
        6      savings ← cost(n, a) + cost(n, b) – cost(a, b)
        7      savingsList ← (a, b, savings) : savingsList
        8  sort savingsList in descending order of savings
        9  for each tuple (a, b, _) in savingsList
        10   if edges (n, a) and (n, b) are in two different tours   ▷ merge the two tours
        11     remove edges (n, a) and (n, b)
        12     insert the edge (a, b)
        13 return the final tour
        """
        events: List[TSPTraceEvent] = []
        step_idx = 0

        # Line 1: n ← select a base city from N cities
        n = base_city if base_city in self.cities else self.cities[0]
        non_base_cities = sorted([c for c in self.cities if c != n])

        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Savings-Heuristic",
                line_number=1,
                line_pseudocode="n ← select a base city from N cities   ▷ base city",
                event_type="SELECT_BASE_CITY",
                description=f"Selected base city n = '{n}'",
                current_city=n,
            )
        )
        step_idx += 1

        # Line 2: construct (N – 1) sub-tours, each of length 2 anchored at n
        # Represent each sub-tour as an ordered list of cities starting and ending at n: [n, a, n]
        sub_tours: List[List[str]] = [[n, c, n] for c in non_base_cities]
        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Savings-Heuristic",
                line_number=2,
                line_pseudocode="construct (N – 1) sub-tours, each of length 2 anchored at n",
                event_type="CONSTRUCT_SUBTOURS",
                description=f"Constructed {len(sub_tours)} sub-tours anchored at '{n}': {sub_tours}",
                sub_tours=[list(st) for st in sub_tours],
            )
        )
        step_idx += 1

        # Line 3: savingsList ← empty list
        savings_list: List[Tuple[str, str, float]] = []
        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Savings-Heuristic",
                line_number=3,
                line_pseudocode="savingsList ← empty list",
                event_type="INIT_SAVINGS_LIST",
                description="Initialized savingsList as empty list",
                savings_list=[],
            )
        )
        step_idx += 1

        # Lines 4-7: Compute savings for all pairs b > a and cons onto savingsList
        for a in non_base_cities:
            for b in non_base_cities:
                if b > a:  # Line 5: if b > a ignores inverse edge
                    # Line 6: savings ← cost(n, a) + cost(n, b) – cost(a, b)
                    s_val = self.cost(n, a) + self.cost(n, b) - self.cost(a, b)
                    # Line 7: savingsList ← (a, b, savings) : savingsList (prepends)
                    savings_list.insert(0, (a, b, s_val))

        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Savings-Heuristic",
                line_number=7,
                line_pseudocode="savingsList ← (a, b, savings) : savingsList",
                event_type="POPULATE_SAVINGS",
                description=f"Computed savings for {len(savings_list)} pairs",
                savings_list=list(savings_list),
                sub_tours=[list(st) for st in sub_tours],
            )
        )
        step_idx += 1

        # Line 8: sort savingsList in descending order of savings (tie-breaking: alphabetical (a, b))
        savings_list = sorted(savings_list, key=lambda x: (-x[2], x[0], x[1]))
        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Savings-Heuristic",
                line_number=8,
                line_pseudocode="sort savingsList in descending order of savings",
                event_type="SORT_SAVINGS",
                description="Sorted savingsList in descending order of savings",
                savings_list=list(savings_list),
                sub_tours=[list(st) for st in sub_tours],
            )
        )
        step_idx += 1

        # Lines 9-12: for each tuple (a, b, _) in savingsList
        for item in savings_list:
            a, b, s_val = item
            # Line 10: if edges (n, a) and (n, b) are in two different tours
            tour_a_idx = None
            tour_b_idx = None
            is_a_adjacent_to_n = False
            is_b_adjacent_to_n = False

            for idx, t in enumerate(sub_tours):
                if a in t:
                    tour_a_idx = idx
                    # Check if a is adjacent to n (at beginning or end of interior)
                    if t[1] == a or t[-2] == a:
                        is_a_adjacent_to_n = True
                if b in t:
                    tour_b_idx = idx
                    if t[1] == b or t[-2] == b:
                        is_b_adjacent_to_n = True

            if (
                tour_a_idx is not None
                and tour_b_idx is not None
                and tour_a_idx != tour_b_idx
                and is_a_adjacent_to_n
                and is_b_adjacent_to_n
            ):
                # Line 10-12: Merge the two tours
                t_a = sub_tours[tour_a_idx]
                t_b = sub_tours[tour_b_idx]

                # Orient t_a so a is at the end (before n)
                interior_a = t_a[1:-1]
                if interior_a[0] == a:
                    interior_a.reverse()

                # Orient t_b so b is at the beginning (after n)
                interior_b = t_b[1:-1]
                if interior_b[-1] == b:
                    interior_b.reverse()

                # Merge interior_a and interior_b: [n] + interior_a + interior_b + [n]
                new_sub_tour = [n] + interior_a + interior_b + [n]

                # Update sub_tours: remove old tours, add new merged tour
                first_idx = min(tour_a_idx, tour_b_idx)
                second_idx = max(tour_a_idx, tour_b_idx)
                sub_tours.pop(second_idx)
                sub_tours.pop(first_idx)
                sub_tours.append(new_sub_tour)

                events.append(
                    TSPTraceEvent(
                        step_index=step_idx,
                        algorithm="Savings-Heuristic",
                        line_number=10,
                        line_pseudocode="if edges (n, a) and (n, b) are in two different tours ▷ merge",
                        event_type="MERGE_SUBTOURS",
                        description=f"Merged tours containing '{a}' and '{b}' (savings: {s_val:.1f}). New sub-tour: {new_sub_tour}",
                        selected_edge=[a, b, s_val],
                        sub_tours=[list(st) for st in sub_tours],
                    )
                )
                step_idx += 1

                if len(sub_tours) == 1:
                    break

        # Line 13: return the final tour
        final_tour = sub_tours[0]
        # Compute total tour cost
        total_cost = 0.0
        for i in range(len(final_tour) - 1):
            total_cost += self.cost(final_tour[i], final_tour[i + 1])

        events.append(
            TSPTraceEvent(
                step_index=step_idx,
                algorithm="Savings-Heuristic",
                line_number=13,
                line_pseudocode="return the final tour",
                event_type="FINAL_TOUR",
                description=f"Returned final tour with cost {total_cost:.1f}: {' -> '.join(final_tour)}",
                current_tour=list(final_tour),
                total_cost=total_cost,
                is_terminal=True,
            )
        )

        return TSPResult(
            algorithm="Savings-Heuristic",
            cities=self.cities,
            tour=final_tour,
            total_cost=total_cost,
            total_steps=len(events),
            events=events,
        )
