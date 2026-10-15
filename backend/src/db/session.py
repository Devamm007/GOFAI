import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Authoritative specification versions
SPEC_VERSION = "AI-SMPS-2023-W2"
TRACE_VERSION = "1.0.0"

# Support NEON variable, DATABASE_URL, or local SQLite fallback
raw_url = os.getenv("NEON") or os.getenv("DATABASE_URL") or "sqlite:///./visualizer.db"
DATABASE_URL = raw_url.strip().strip("'\"")

# Normalize postgres/postgresql urls for SQLAlchemy 2.0 with psycopg3
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# SQLite writable path check (for Serverless / Lambda / Vercel compatibility)
if DATABASE_URL.startswith("sqlite") and not DATABASE_URL.startswith("sqlite:///:memory:"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path) or "."
    if os.path.exists(db_dir) and not os.access(db_dir, os.W_OK):
        DATABASE_URL = "sqlite:////tmp/visualizer.db"

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
    "echo": os.getenv("DB_ECHO", "false").lower() in ("true", "1", "yes"),
}

is_serverless = os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    if ":memory:" in DATABASE_URL:
        from sqlalchemy.pool import StaticPool
        engine_kwargs["poolclass"] = StaticPool
elif is_serverless:
    # On Vercel / serverless, use NullPool so ephemeral lambda instances don't exhaust Neon connections
    from sqlalchemy.pool import NullPool
    engine_kwargs["poolclass"] = NullPool
else:
    # Production container / persistent server connection pooling
    engine_kwargs.update({
        "pool_size": int(os.getenv("DB_POOL_SIZE", "10")),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "20")),
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),
        "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
    })

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_db_initialized = False


def init_db():
    global _db_initialized
    Base.metadata.create_all(bind=engine)
    _db_initialized = True


def get_db():
    global _db_initialized
    if not _db_initialized:
        try:
            init_db()
        except Exception as e:
            print(f"Lazy DB init warning: {e}")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
