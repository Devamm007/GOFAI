# Formal Specification & Algorithm Fidelity Analysis

## 1. Authoritative Source Documents
- **`symbols.pdf`**: Version 0.3 (prepared by S. Baskaran) — Authoritative definitions of operators, lists, tuples, cons (`:`), list concatenation (`++`), pattern matching, `head`, `tail`, `first`, `second`, `third`.
- **`algorithms.pdf`**: AI SMPS 2023 Week 2 (prepared by S. Baskaran) — Authoritative pseudocode, node ordering rules, and exact semantics for:
  - **BFS** (Page 4, Lines 1–13)
  - **DFS** (Page 4, Lines 1–13)
  - **DB-DFS** (Page 5, Lines 1–15)
  - **DFID-N** (Page 6, Lines 1–26)
  - **DFID-C** (Page 7, Lines 1–26)
  - Ancillary Functions: `Make-Pairs`, `Remove-Seen`, `Occurs-In`, `Reconstruct-Path`, `Skip-To` (Pages 4 & 8)

---

## 2. Core Symbols and Data Structures

### A. Primitive Notation & Operators
| Symbol / Operator | Source PDF Definition | Meaning / Implementation |
|---|---|---|
| `▷` | Right pointing triangle | Line comment |
| `=` | Equality-test operator | Equality test (e.g., `parent = first head nodePairs`) |
| `←` | Assignment operator | Assignment of values / pattern matching |
| `:` | Cons operator | Prepend element to list: `x : xs` |
| `++` | List concatenation operator | Concatenate two lists: `xs ++ ys` |
| `null` | Null value | `None` in Python |
| `[]` | Empty list | Empty list `[]` |
| `head` | Returns head of list | First element of non-empty list |
| `tail` | Returns tail of list | List of all elements after the head |
| `take n` | Returns at most n elements | Slice `list[:n]` |
| `first`, `second`, `third` | Tuple accessors | Element 0, 1, 2 of tuple |

### B. Node Representation & Tuples
- **For BFS / DFS**:
  - Elements in `OPEN` and `CLOSED` are 2-tuples (pairs): `(node_label, parent_label)`
  - Start node pair: `(S, null)`
- **For DB-DFS / DFID-N / DFID-C**:
  - Elements in `OPEN` and `CLOSED` are 3-tuples (triples): `(node_label, parent_label, depth)`
  - Start node triple: `(S, null, 0)`

---

## 3. Detailed Algorithm Semantics & Line-by-Line Breakdown

### Algorithm 1: Breadth-First Search (BFS) — Page 4
```
BFS(S)
1  OPEN ← (S, null) : []
2  CLOSED ← empty list
3  while OPEN is not empty
4    nodePair ← head OPEN
5    (N, _) ← nodePair
6    if GOALTEST(N) = TRUE
7      return RECONSTRUCTPATH(nodePair, CLOSED)
8    else CLOSED ← nodePair : CLOSED
9      neighbours ← MOVEGEN(N)
10     newNodes ← REMOVESEEN(neighbours, OPEN, CLOSED)
11     newPairs ← MAKEPAIRS(newNodes, N)
12     OPEN ← (tail OPEN) ++ newPairs
13 return empty list
```
**Key Operational Characteristics:**
- **Goal Test Timing**: Evaluated at node expansion time (line 6) when popped from `head OPEN`, NOT at neighbor generation time.
- **CLOSED Maintenance**: Prepending `nodePair : CLOSED` (line 8) means `CLOSED` is ordered most-recent first.
- **Node Filtering**: `REMOVESEEN` checks both `OPEN` and `CLOSED`. If a neighbor's label already appears in either list, it is pruned.
- **Successor Ordering**: `MAKEPAIRS` preserves the exact ordering of `newNodes`.
- **Queue Order**: `OPEN ← (tail OPEN) ++ newPairs` ensures FIFO queuing.

---

### Algorithm 2: Depth-First Search (DFS) — Page 4
```
DFS(S)
1  OPEN ← (S, null) : []
2  CLOSED ← empty list
3  while OPEN is not empty
4    nodePair ← head OPEN
5    (N, _) ← nodePair
6    if GOALTEST(N) = TRUE
7      return RECONSTRUCTPATH(nodePair, CLOSED)
8    else CLOSED ← nodePair : CLOSED
9      neighbours ← MOVEGEN(N)
10     newNodes ← REMOVESEEN(neighbours, OPEN, CLOSED)
11     newPairs ← MAKEPAIRS(newNodes, N)
12     OPEN ← newPairs ++ (tail OPEN)
13 return empty list
```
**Key Difference from BFS**:
- Only Line 12 differs: `OPEN ← newPairs ++ (tail OPEN)`.
- Newly generated pairs are placed at the front of `tail OPEN`, achieving LIFO stack ordering while preserving neighbor order among new pairs (the first neighbor in `newNodes` is at `head OPEN` on the next iteration).

---

### Algorithm 3: Depth-First Iterative Deepening — New Only (DFID-N) — Page 6
```
DFID-N(S)
1 count ← – 1
2 path ← empty list
3 depthBound ← 0
4 repeat
5   previousCount ← count
6   (count, path) ← DB-DFS-N(S, depthBound)
7   depthBound ← depthBound + 1
8 until (path is not empty) or (previousCount = count)
9 return path

DB-DFS-N(S, depthBound)
10 count ← 0
11 OPEN ← (S, null, 0) : []
12 CLOSED ← empty list
13 while OPEN is not empty
14   nodePair ← head OPEN
15   (N, _, depth) ← nodePair
16   if GOALTEST(N) = TRUE
17     return (count, RECONSTRUCTPATH(nodePair, CLOSED))
18   else CLOSED ← nodePair : CLOSED
19     if depth < depthBound
20       neighbours ← MOVEGEN(N)
21       newNodes ← REMOVESEEN(neighbours, OPEN, CLOSED)
22       newPairs ← MAKEPAIRS(newNodes, N, depth + 1)
23       OPEN ← newPairs ++ tail OPEN
24       count ← count + length newPairs
25     else OPEN ← tail OPEN
26 return (count, empty list)
```
**Key Semantics:**
- In Line 21, `RemoveSeen(neighbours, OPEN, CLOSED)` prunes any node already in `OPEN` OR `CLOSED`.
- Does NOT reopen any closed nodes.
- `count` tallies the cumulative number of new pairs pushed to `OPEN` across the DB-DFS-N run.
- Outer loop terminates when goal path is found OR when `previousCount == count` (meaning an increase in depth bound yielded zero additional node discoveries across the entire graph).

---

### Algorithm 4: Depth-First Iterative Deepening — CLOSED Reopening (DFID-C) — Page 7
```
DFID-C(S)
1 count ← – 1
2 path ← empty list
3 depthBound ← 0
4 repeat
5   previousCount ← count
6   (count, path) ← DB-DFS-C(S, depthBound)
7   depthBound ← depthBound + 1
8 until (path is not empty) or (previousCount = count)
9 return path

DB-DFS-C(S, depthBound)
10 count ← 0
11 OPEN ← (S, null, 0) : []
12 CLOSED ← empty list
13 while OPEN is not empty
14   nodePair ← head OPEN
15   (N, _, depth) ← nodePair
16   if GOALTEST(N) = TRUE
17     return (count, RECONSTRUCTPATH(nodePair, CLOSED))
18   else CLOSED ← nodePair : CLOSED
19     if depth < depthBound
20       neighbours ← MOVEGEN(N)
21       newNodes ← REMOVESEEN(neighbours, OPEN, [])
22       newPairs ← MAKEPAIRS(newNodes, N, depth + 1)
23       OPEN ← newPairs ++ tail OPEN
24       count ← count + length newPairs
25     else OPEN ← tail OPEN
26 return (count, empty list)
```
**Critical Distinction (Line 21)**:
- Line 21 passes `[]` instead of `CLOSED` to `RemoveSeen`: `newNodes ← RemoveSeen(neighbours, OPEN, [])`.
- Therefore, states already in `CLOSED` are NOT filtered out and ARE reopened by being pushed to `OPEN`, provided they are not currently in `OPEN`.
- `CLOSED` is not cleared when reopening; previous visits remain in `CLOSED`.

---

### Ancillary Functions (Pages 4 & 8)

#### Path Reconstruction (DFS & BFS)
```
Reconstruct-Path(nodePair, CLOSED)
  (node, parent) ← nodePair
  path ← node : []
  while parent is not null
    path ← parent : path
    CLOSED ← Skip-To(parent, CLOSED)
    (_, parent) ← head CLOSED
  return path

Skip-To(parent, nodePairs)
  if parent = first head nodePairs
    return nodePairs
  else return Skip-To(parent, tail nodePairs)
```

#### Path Reconstruction (DFID-N & DFID-C)
```
ReconstructPath(nodePair, CLOSED)
  (node, parent, depth) ← nodePair
  path ← node : []
  while parent is not null
    path ← parent : path
    CLOSED ← SkipTo(parent, CLOSED, depth – 1)
    (_, parent, depth) ← head CLOSED
  return path

SkipTo(parent, nodePairs, depth)
  if (parent, _, depth) = head nodePairs
    return nodePairs
  else return SkipTo(parent, tail nodePairs, depth)
```
Note: In DFID, matching `(parent, _, depth)` ensures that in DFID-C, where a state might exist multiple times in `CLOSED` at different depths, the path reconstructor precisely matches the instance corresponding to `depth - 1`.

---

## 4. Execution Trace Event Schema

Each step recorded in the deterministic trace includes:
- `step_index` (int): 0-indexed execution step counter.
- `algorithm` (str): `"BFS"`, `"DFS"`, `"DFID-N"`, `"DFID-C"`.
- `line_number` (int): Source pseudocode line number.
- `event_type` (str): e.g., `"INIT"`, `"LOOP_CHECK"`, `"SELECT_HEAD"`, `"GOAL_TEST"`, `"ADD_CLOSED"`, `"DEPTH_CHECK"`, `"MOVE_GEN"`, `"REMOVE_SEEN"`, `"MAKE_PAIRS"`, `"UPDATE_OPEN"`, `"PRUNE_DEPTH"`, `"GOAL_FOUND"`, `"PATH_RECONSTRUCTION"`, `"TERMINATE_FAILURE"`, `"DFID_ITERATION_START"`, `"DFID_ITERATION_END"`.
- `description` (str): Human-readable operational explanation.
- `current_node` (Optional[str]): Inspected node label.
- `current_pair` (Optional[tuple]): `(node, parent)` or `(node, parent, depth)`.
- `open_before` & `open_after`: Ordered snapshots of `OPEN`.
- `closed_before` & `closed_after`: Ordered snapshots of `CLOSED`.
- `open_size` & `closed_size`: Explicit computed integer sizes after the event.
- `depth`: Current node depth (or None).
- `depth_bound`: Current depth bound (for DFID).
- `iteration`: Current iteration count (for DFID).
- `generated_nodes`: List of raw successors from MoveGen.
- `filtered_nodes`: Successors after RemoveSeen.
- `path`: Final path if goal reached, or None.
- `is_terminal` (bool): True if run is complete.
- `termination_reason` (Optional[str]): `"GOAL_FOUND"`, `"OPEN_EMPTY"`, `"COUNT_STAGNATION"`, `"MAX_DEPTH_REACHED"`.
