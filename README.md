# Code-Faithful Search Algorithm Visualizer

A complete, full-stack, code-faithful state-space search algorithm visualizer implementing **BFS**, **DFS**, **DFID-N**, and **DFID-C** with strict fidelity to the course specification (*AI SMPS 2023 Week 2* by S. Baskaran, IIT Madras).

---

## 🌟 Key Features

- **Strict Specification Fidelity**:
  - Direct translation of symbols, operators, lists, and tuples defined in `symbols.pdf`.
  - Line-by-line pseudocode execution matching `algorithms.pdf` for:
    - **BFS** (Page 4, Lines 1–13)
    - **DFS** (Page 4, Lines 1–13)
    - **DFID-N** (Page 6, Lines 1–26)
    - **DFID-C** (Page 7, Lines 1–26)
    - Ancillary Functions: `MakePairs`, `RemoveSeen`, `OccursIn`, `ReconstructPath`, `SkipTo` (Pages 4 & 8)
- **Deterministic Event Trace Engine**:
  - Records step index, algorithm ID, line number, event type, descriptions.
  - Snapshots `OPEN` and `CLOSED` lists before/after each operation.
  - Calculates exact list sizes at every step.
  - Captures raw successors, filtered successors, current inspected node, depth bound, and iteration index.
- **Modern Interactive Frontend**:
  - Built with React, TypeScript, Vite, and `@xyflow/react` (React Flow).
  - Rich dark-mode glassmorphic aesthetics with glowing node states (`START`, `GOAL`, `INSPECTED`, `FRONTIER`, `CLOSED`, `PATH`).
  - Directed edges with clear arrowheads and alphabetical neighbour ordering for intuitive tracing.
  - Step timeline scrubber, play/pause, step forward/backward, restart, jump to end, and adjustable playback speeds (`0.5x` to `4x`).
  - Real-time highlighted pseudocode panel mapping each operation to its source line.
  - Live execution trace event log with instant step jumping.
- **Persistence & Replay**:
  - Powered by FastAPI, SQLAlchemy, and NeonDB / PostgreSQL (with automatic SQLite fallback for zero-config local development).
  - Database migrations managed via Alembic.
  - Persists full graph snapshots, parameters, specification version, trace version, and replayable events.
  - Run History modal allows instant loading and replay of any saved execution.
- **Deterministic Graph Generator**:
  - Configurable node count, branching factor, cycle probability, disconnected components, and reproducible random seeds.
  - Handcrafted presets for classic scenarios (Diamond Multiple Paths, Bidirectional Cycles, Deep Trees, Disconnected Graphs, Start Equals Goal).
  - Custom JSON/Text graph editor with real-time schema validation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn |
| **ORM & Migrations** | SQLAlchemy 2.0, Alembic |
| **Database** | NeonDB (PostgreSQL) / SQLite fallback via `psycopg` & `psycopg2-binary` |
| **Frontend** | React 19, TypeScript, Vite |
| **Visualization** | `@xyflow/react` (React Flow v12), `lucide-react`, `canvas-confetti` |
| **Testing** | Pytest, HTTPX TestClient |

---

## 📦 Setup & Installation

### 1. Prerequisites
- Python 3.12+
- `uv` (Fast Python package manager)
- Node.js v18+ and `npm`

### 2. Backend Setup
```bash
# Initialize uv virtual environment (if not already created)
uv venv

# Install backend dependencies
uv pip install -r requirements.txt

# Run database migrations
uv run alembic upgrade head
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## ⚙️ Environment Variables

Configure environment variables in `.env` in the project root:

```bash
# Database connection string (NeonDB or PostgreSQL)
# Example: postgresql+psycopg://user:password@ep-xyz.neon.tech/neondb?sslmode=require
DATABASE_URL=sqlite:///./visualizer.db
```

> **Note**: If `DATABASE_URL` is omitted, the application automatically defaults to `sqlite:///./visualizer.db`.

---

## 🚀 Running the Application

### Start the Backend Server:
```bash
uv run uvicorn backend.src.api.main:app --host 127.0.0.1 --port 8000
```
- API Documentation: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### Start the Frontend Dev Server:
```bash
cd frontend
npm run dev
```
- Open `http://127.0.0.1:5173/` in your browser.

---

## 🧪 Automated Test Suite

Run all automated unit, algorithm fidelity, graph generation, and API integration tests:

```bash
uv run pytest -v
```

The test suite validates:
1. Ancillary functions (`occurs_in`, `remove_seen`, `make_pairs`, `skip_to`, `reconstruct_path`).
2. Edge cases (Start equals Goal, unreachable goal, cycles, multiple paths).
3. Search ordering divergence between BFS and DFS.
4. Reopening behavior difference between DFID-N (prunes closed nodes) and DFID-C (reopens closed nodes).
5. Exact OPEN/CLOSED calculated sizes and snapshots at every event step.
6. Deterministic graph generation across seeds.
7. API endpoints, validation, and database persistence.

---

## 📖 Authoritative Algorithm Traceability

| Algorithm | Source Document | Key Semantics |
|---|---|---|
| **BFS** | `algorithms.pdf` (p. 4) | Queue FIFO: `OPEN ← (tail OPEN) ++ newPairs`. Prunes seen nodes in OPEN or CLOSED. |
| **DFS** | `algorithms.pdf` (p. 4) | Stack LIFO: `OPEN ← newPairs ++ (tail OPEN)`. Prunes seen nodes in OPEN or CLOSED. |
| **DFID-N** | `algorithms.pdf` (p. 6, 8) | Line 21: `RemoveSeen(neighbours, OPEN, CLOSED)`. Never reopens nodes in CLOSED. Terminates when `previousCount == count`. |
| **DFID-C** | `algorithms.pdf` (p. 7, 8) | Line 21: `RemoveSeen(neighbours, OPEN, [])`. Reopens nodes present in CLOSED and not in OPEN. |
