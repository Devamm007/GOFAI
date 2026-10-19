# Formal Specification & Algorithm Fidelity Analysis — Week 3

## 1. Authoritative Source Documents
- **`symbols.pdf`**: Version 0.3 (prepared by S. Baskaran) — Authoritative definitions of operators, lists, tuples, cons (`:`), list concatenation (`++`), pattern matching, `head`, `tail`, `take n`, `first`, `second`, `third`.
- **`algorithms_week2.pdf`**: AI SMPS 2023 Week 2 (prepared by S. Baskaran) — Authoritative pseudocode and foundational ancillary functions: `MoveGen`, `RemoveSeen`, `MakePairs`, `ReconstructPath`, `SkipTo`.
- **`algorithms_week3.pdf`**: AI SMPS 2023 Week 3 Algorithms (Ver. 2, prepared by S. Baskaran) — Authoritative pseudocode for informed search, local search, beam search, and TSP heuristics:
  - **Node Order & Tie-Breaking Specification** (Pages 1 & 2)
  - **Best-First-Search** (Page 3, Lines 1–13)
  - **Hill-Climbing** (Page 3, Lines 1–5)
  - **Variable-Neighbourhood-Descent** (Page 3, Lines 1–6)
  - **Best-Neighbour-Search** (Page 3, Lines 1–7)
  - **Iterated-Hill-Climbing** (Page 3, Lines 1–6)
  - **Beam-Search** (Page 3, Lines 1–10)
  - Ancillary procedure: **`Move-Gen(OPEN)`** (Page 3, Lines 1–4)
  - Operator definition: **`take n LIST`** (Page 3)
  - **TSP Heuristics**: Nearest-Neighbour, Greedy, and Savings Heuristic (Page 4)

---

## 2. Core Symbols, Conventions & Data Structures

### A. Primitive Notation & Operators
| Symbol / Operator | Source PDF Definition | Meaning / Implementation |
|---|---|---|
| `▷` | Right pointing triangle (LASY10 0x3) | Line comment |
| `=` | Equality-test operator | Equality test (e.g., `GoalTest(N) = TRUE`) |
| `←` | Assignment operator (CMSY10 0x2190) | Value assignment / pattern matching |
| `:` | Cons operator (MSAM10 0x5) | Prepend element to list: `x : xs` |
| `++` | List concatenation operator | Concatenate two lists: `xs ++ ys` |
| `null` | Null value | `None` in Python |
| `[]` | Empty list | Empty list `[]` |
| `head` | Returns head of list | First element of non-empty list |
| `tail` | Returns tail of list | All elements after the head |
| `take n` | Returns at most n values | Slice `list[:n]` |
| `_` | Wildcard / ignore pattern | Unused tuple field pattern match |
| `sort_h` | Heuristic sorting function | Sorts from best to worst $h$-value |

### B. Tie-Breaking Rule (Authoritative — Page 2)
> "When multiple nodes have the same (best) cost, sort those nodes in alphabetical order of node label and select nodes from the head of the sorted list."

This rule governs `sort_h` throughout Week 3. If two candidates have identical heuristic evaluation values $h(u) = h(v)$, their relative ordering is determined by alphabetical comparison of their node labels (`u < v`).

### C. State Representation & Tuples
- **For Best-First-Search**:
  - Elements in `OPEN` and `CLOSED` are 3-tuples: `(node_label, parent_label, h_value)`.
  - Start node: `(S, null, h(S))`.
  - Pattern unpacking: `(N, _, _) ← nodePair` (Line 5).
  - Path reconstruction: Reuses the parent link in each 3-tuple stored in `CLOSED`.
- **For Beam Search**:
  - Elements in `OPEN` are node labels: `OPEN ← S : []`.
  - Successor collection: `Move-Gen(OPEN)` accumulates `Move-Gen(X)` across all `X ∈ OPEN` preserving duplicate visits.

---

## 3. Detailed Algorithm Semantics & Line-by-Line Breakdown

### Algorithm 1: Best-First Search (Best-First-Search) — Page 3
```
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
```

**Key Operational Characteristics:**
- **Goal Test Timing**: Evaluated at node expansion time (Line 6) when popped from `head OPEN`, NOT at neighbor generation time.
- **Node Representation**: Stored as triples `(node, parent, h(node))`.
- **Node Filtering (Line 10)**: `RemoveSeen(neighbours, OPEN, CLOSED)` checks membership against both `OPEN` and `CLOSED`. If a neighbor is already present in either list, it is discarded.
- **Queue Construction (Line 12)**: `newPairs ++ tail OPEN` combines newly generated triples with the unexpanded tail of `OPEN`, which is then sorted by `sort_h`.
- **Sorting & Tie-Breaking (Line 12)**: `sort_h` sorts all candidate triples from lowest $h$ to highest $h$ (assuming minimization; or best to worst according to domain). Equal $h$-values are sorted alphabetically by node label.
- **Path Reconstruction (Line 7)**: Calls `ReconstructPath(nodePair, CLOSED)`, tracking parent links through `CLOSED` back to `(S, null, h(S))`.

---

### Algorithm 2: Hill Climbing (Hill-Climbing) — Page 3
```
Hill-Climbing(S)
1   N ← S
2   do bestEver ← N
3      N ← head sort_h MoveGen(bestEver)
4   while h(N) is better than h(bestEver)
5   return bestEver
```

**Key Operational Characteristics:**
- **Local Greediness**: Strictly checks whether the best single-step neighbor is strictly better than `bestEver`.
- **Termination**: Terminates as soon as no neighbor improves upon the current state (local optimum, plateau, or peak).
- **Return Value**: Returns `bestEver`, the best state reached before stagnation.

---

### Algorithm 3: Variable Neighbourhood Descent (Variable-Neighbourhood-Descent) — Page 3
```
Variable-Neighbourhood-Descent(S)
1   MoveGenList ← MoveGen_1 : MoveGen_2 : · · · : MoveGen_n : []
2   bestNode ← S
3   while MoveGenList is not empty
4     bestNode ← Hill-Climbing(bestNode, head MoveGenList)
5     MoveGenList ← tail MoveGenList
6   return bestNode
```

**Key Operational Characteristics:**
- Iterates through a succession of increasingly expansive or different neighborhood generators `MoveGen_i`.
- Runs `Hill-Climbing` on `bestNode` using the current neighborhood structure `head MoveGenList`.
- Advances through the neighborhood list until exhausted.

---

### Algorithm 4: Best Neighbour Search (Best-Neighbour-Search) — Page 3
```
Best-Neighbour-Search(S)
1   N ← S
2   bestEver ← S
3   until some termination condition
4     N ← best Move-Gen(N)
5     if N is better than bestEver
6       bestEver ← N
7   return bestEver
```

**Key Operational Characteristics:**
- Continues transitioning to the best neighbor generated by `Move-Gen(N)` regardless of whether it improves upon `bestEver` (allowing exploration beyond local optima), while tracking the global `bestEver`.
- Stops upon an external termination condition (e.g., step budget or time limit).

---

### Algorithm 5: Iterated Hill Climbing (Iterated-Hill-Climbing) — Page 3
```
Iterated-Hill-Climbing(N)
1   bestNode ← random candidate solution
2   repeat N times
3     currentBest ← Hill-Climbing(new random candidate solution)
4     if h(currentBest) is better than h(bestNode)
5       bestNode ← currentBest
6   return bestNode
```

**Key Operational Characteristics:**
- Restarts local hill climbing from $N$ randomly generated initial configurations to escape local optima.
- Tracks and returns the best solution discovered across all restarts.

---

### Algorithm 6: Beam Search (Beam-Search) — Page 3
```
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
```

**Key Operational Characteristics:**
- **Layer-wise Beam Maintenance**: `OPEN` holds at most $w$ candidate nodes at each depth layer.
- **Successor Expansion (Line 6)**: Calls `Move-Gen(OPEN)`, generating the combined neighbors of all nodes in `OPEN`.
- **Pruning (Line 7)**: Sorts all generated neighbors by $h$ and retains the top $w$ using `take w`.
- **Termination**: Terminates if a goal node is found in `OPEN`, or when the best node in the new layer fails to improve upon `bestEver`.

---

### Ancillary Procedure: Move-Gen on OPEN List — Page 3
```
Move-Gen(OPEN)
1   neighbours ← []
2   for each X in OPEN
3      neighbours ← neighbours ++ Move-Gen(X)
4   return neighbours   ▷ the list preserves duplicates
```

**Key Characteristics:**
- Iterates through `OPEN` in list order.
- Concatenates the neighbor lists in order using `++`.
- Explicitly documents that duplicate state labels are preserved across branches.

---

### Ancillary Operator: take n LIST — Page 3
```
(take n LIST) returns at most n values from the beginning of LIST.
   [o, u, t] = take 3 [o, u, t, r, u, n]
   [a, t]    = take 3 [a, t]
   [a]       = take 3 [a]
   []        = take 3 []
```

---

### Traveling Salesperson Problem (TSP) Heuristics — Page 4

#### Algorithm 8: Nearest Neighbour Heuristic
```
Nearest-Neighbour-Heuristic
1   Compute the cost of all the edges
2   Start at some city
3   repeat
4     Move to the nearest neighbour which does not:
        close the loop prematurely
        or form branches/forks
```

#### Algorithm 9: Greedy Heuristic
```
Greedy-Heuristic
1   Compute the cost of all the edges
2   Sort the edges by cost
3   repeat
4     Add the shortest available edge which does not:
        close the loop prematurely
        or form branches/forks
```

#### Algorithm 10: Savings Heuristic (Clarke-Wright)
```
Savings-Heuristic
1   n ← select a base city from N cities   ▷ base city
2   construct (N – 1) sub-tours, each of length 2 anchored at n
3   savingsList ← empty list
4   for each non base city a
5     for each non base city b, if b > a   ▷ ignores inverse edge
6       savings ← cost(n, a) + cost(n, b) – cost(a, b)
7       savingsList ← (a, b, savings) : savingsList
8   sort savingsList in descending order of savings
9   for each tuple (a, b, _) in savingsList
10    if edges (n, a) and (n, b) are in two different tours   ▷ merge the two tours
11      remove edges (n, a) and (n, b)
12      insert the edge (a, b)
13  return the final tour
```
