# SmartEats - Multi-stage Docker Build
# Hackathon 2025 - SDG 2 & SDG 3 Solution

FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY *.html *.css *.js ./
COPY *.sql *.md *.py ./
COPY .env.example ./

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash smarteats
RUN chown -R smarteats:smarteats /app
USER smarteats

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start command
CMD ["python", "backend/app.py"]
