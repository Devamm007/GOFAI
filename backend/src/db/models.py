import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from backend.src.db.session import Base

# Universal JSON column type supporting both PostgreSQL (JSONB) and SQLite (JSON)
JsonType = JSON().with_variant(JSONB, "postgresql")


class GraphRecord(Base):
    __tablename__ = "graphs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=True)
    nodes = Column(JsonType, nullable=False)
    edges = Column(JsonType, nullable=False)
    start_node = Column(String(50), nullable=False)
    goal_node = Column(String(50), nullable=False)
    metadata_json = Column(JsonType, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RunRecord(Base):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    graph_id = Column(String(36), ForeignKey("graphs.id"), nullable=True)
    algorithm = Column(String(20), nullable=False)
    start_node = Column(String(50), nullable=False)
    goal_node = Column(String(50), nullable=False)
    found_goal = Column(Boolean, nullable=False)
    path = Column(JsonType, nullable=False)
    total_steps = Column(Integer, nullable=False)
    nodes_expanded = Column(Integer, nullable=False)
    terminal_status = Column(String(50), nullable=False)
    terminal_reason = Column(Text, nullable=False)
    spec_version = Column(String(50), nullable=False)
    trace_version = Column(String(50), nullable=False)
    graph_snapshot = Column(JsonType, nullable=False)
    events_json = Column(JsonType, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
