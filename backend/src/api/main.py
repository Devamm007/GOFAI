import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.src.core.graph import Graph, generate_graph
from backend.src.core.search_engine import SearchEngine
from backend.src.core.types import SearchResult, TraceEvent
from backend.src.db.models import GraphRecord, RunRecord
from backend.src.db.session import SPEC_VERSION, TRACE_VERSION, get_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    try:
        init_db()
    except Exception as e:
        print(f"Database init warning: {e}")
    yield


app = FastAPI(
    title="Code-Faithful Search Algorithm Visualizer API",
    description="Backend engine for BFS, DFS, DFID-N, and DFID-C adhering strictly to AI SMPS 2023 specifications.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware: configurable origins with support for local dev, custom domains, and Vercel previews
raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
cors_regex = os.getenv("CORS_ORIGIN_REGEX", r"^https:\/\/.*\.vercel\.app$")

if raw_cors.strip() == "*":
    allow_origins = ["*"]
    allow_credentials = False
else:
    allow_origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=cors_regex if allow_credentials else None,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# API Request / Response Schemas
# ---------------------------------------------------------------------------

class GraphGenerateRequest(BaseModel):
    num_nodes: int = Field(default=7, ge=2, le=52)
    branching_factor: int = Field(default=2, ge=1, le=10)
    cycle_probability: float = Field(default=0.2, ge=0.0, le=1.0)
    disconnected_probability: float = Field(default=0.0, ge=0.0, le=1.0)
    seed: int = Field(default=42)
    custom_start: Optional[str] = None
    custom_goal: Optional[str] = None
    ensure_path_to_goal: bool = True


class SearchRunRequest(BaseModel):
    graph: Graph
    algorithm: str = Field(description="One of: 'BFS', 'DFS', 'DFID-N', 'DFID-C'")
    max_depth_bound: int = Field(default=50, ge=1, le=100)
    persist: bool = Field(default=True)
    name: Optional[str] = None


class SearchRunResponse(BaseModel):
    run_id: Optional[str] = None
    algorithm: str
    start_node: str
    goal_node: str
    found_goal: bool
    path: List[str]
    total_steps: int
    nodes_expanded: int
    terminal_status: str
    terminal_reason: str
    spec_version: str
    trace_version: str
    events: List[TraceEvent]


class RunSummaryResponse(BaseModel):
    id: str
    algorithm: str
    start_node: str
    goal_node: str
    found_goal: bool
    path: List[str]
    total_steps: int
    nodes_expanded: int
    terminal_status: str
    created_at: str


# ---------------------------------------------------------------------------
# Router Definition (handles both /api/* and /* for transparent Vercel routing)
# ---------------------------------------------------------------------------
api_router = APIRouter()


@api_router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "spec_version": SPEC_VERSION,
        "trace_version": TRACE_VERSION,
        "supported_algorithms": ["BFS", "DFS", "DFID-N", "DFID-C"],
    }


@api_router.post("/graph/generate", response_model=Graph)
def api_generate_graph(req: GraphGenerateRequest):
    try:
        graph = generate_graph(
            num_nodes=req.num_nodes,
            branching_factor=req.branching_factor,
            cycle_probability=req.cycle_probability,
            disconnected_probability=req.disconnected_probability,
            seed=req.seed,
            custom_start=req.custom_start,
            custom_goal=req.custom_goal,
            ensure_path_to_goal=req.ensure_path_to_goal,
        )
        return graph
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/graph/validate")
def api_validate_graph(graph: Graph):
    return {"valid": True, "graph": graph}


@api_router.post("/search/run", response_model=SearchRunResponse)
def api_run_search(req: SearchRunRequest, db: Session = Depends(get_db)):
    algo = req.algorithm.strip().upper()
    valid_algos = {"BFS", "DFS", "DFID-N", "DFID-C"}
    if algo not in valid_algos:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported algorithm '{req.algorithm}'. Must be one of {valid_algos}",
        )

    # Initialize independent search engine
    engine = SearchEngine(req.graph)

    if algo == "BFS":
        result = engine.run_bfs()
    elif algo == "DFS":
        result = engine.run_dfs()
    elif algo == "DFID-N":
        result = engine.run_dfid_n(max_depth_bound=req.max_depth_bound)
    elif algo == "DFID-C":
        result = engine.run_dfid_c(max_depth_bound=req.max_depth_bound)

    run_id: Optional[str] = None
    if req.persist:
        try:
            # Store in DB
            run_rec = RunRecord(
                algorithm=result.algorithm,
                start_node=result.start_node,
                goal_node=result.goal_node,
                found_goal=result.found_goal,
                path=result.path,
                total_steps=result.total_steps,
                nodes_expanded=result.nodes_expanded,
                terminal_status=result.terminal_status,
                terminal_reason=result.terminal_reason,
                spec_version=SPEC_VERSION,
                trace_version=TRACE_VERSION,
                graph_snapshot=req.graph.to_dict(),
                events_json=[ev.model_dump() for ev in result.events],
            )
            db.add(run_rec)
            db.commit()
            db.refresh(run_rec)
            run_id = run_rec.id
        except Exception as e:
            # Rollback and log, do not fail search execution
            db.rollback()
            print(f"Warning: Failed to persist run record: {e}")

    return SearchRunResponse(
        run_id=run_id,
        algorithm=result.algorithm,
        start_node=result.start_node,
        goal_node=result.goal_node,
        found_goal=result.found_goal,
        path=result.path,
        total_steps=result.total_steps,
        nodes_expanded=result.nodes_expanded,
        terminal_status=result.terminal_status,
        terminal_reason=result.terminal_reason,
        spec_version=SPEC_VERSION,
        trace_version=TRACE_VERSION,
        events=result.events,
    )


@api_router.get("/runs", response_model=List[RunSummaryResponse])
def api_list_runs(limit: int = 50, db: Session = Depends(get_db)):
    try:
        runs = (
            db.query(RunRecord)
            .order_by(RunRecord.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            RunSummaryResponse(
                id=r.id,
                algorithm=r.algorithm,
                start_node=r.start_node,
                goal_node=r.goal_node,
                found_goal=r.found_goal,
                path=r.path,
                total_steps=r.total_steps,
                nodes_expanded=r.nodes_expanded,
                terminal_status=r.terminal_status,
                created_at=r.created_at.isoformat() if r.created_at else "",
            )
            for r in runs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/runs/{run_id}")
def api_get_run(run_id: str, db: Session = Depends(get_db)):
    run_rec = db.query(RunRecord).filter(RunRecord.id == run_id).first()
    if not run_rec:
        raise HTTPException(status_code=404, detail="Run not found")
    return {
        "id": run_rec.id,
        "algorithm": run_rec.algorithm,
        "start_node": run_rec.start_node,
        "goal_node": run_rec.goal_node,
        "found_goal": run_rec.found_goal,
        "path": run_rec.path,
        "total_steps": run_rec.total_steps,
        "nodes_expanded": run_rec.nodes_expanded,
        "terminal_status": run_rec.terminal_status,
        "terminal_reason": run_rec.terminal_reason,
        "spec_version": run_rec.spec_version,
        "trace_version": run_rec.trace_version,
        "graph_snapshot": run_rec.graph_snapshot,
        "events": run_rec.events_json,
        "created_at": run_rec.created_at.isoformat() if run_rec.created_at else "",
    }


# Mount router: enables both direct /api/* and transparent Vercel serverless /* calls
app.include_router(api_router, prefix="/api")
app.include_router(api_router)
