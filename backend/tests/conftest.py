import os

# Configure in-memory database before any database or app modules load
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
