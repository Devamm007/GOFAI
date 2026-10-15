FROM python:3.12-slim

WORKDIR /app

# Install system libraries needed for psycopg and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY backend/ ./backend/
COPY alembic.ini .

# Set default environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

# Production ASGI server with Uvicorn worker
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "backend.src.api.main:app"]
