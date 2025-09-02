# SmartEats - Production Docker Build
# Fixed for current project structure

FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies with specific versions (no requirements.txt dependency)
RUN pip install --no-cache-dir \
    flask==2.3.3 \
    flask-sqlalchemy==3.0.5 \
    flask-jwt-extended==4.5.2 \
    flask-cors==4.0.0 \
    werkzeug==2.3.7 \
    sqlalchemy==2.0.21 \
    gunicorn==21.2.0 \
    redis==4.6.0 \
    psycopg2-binary==2.9.7 \
    prometheus-client==0.17.1

# Copy all application files (current structure)
COPY . .

# Create entrypoint script
RUN echo '#!/bin/bash' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "🚀 Starting SmartEats Application..."' >> /app/entrypoint.sh && \
    echo 'if [ -f "production_backend_fixed.py" ]; then' >> /app/entrypoint.sh && \
    echo '    echo "✅ Using fixed production backend"' >> /app/entrypoint.sh && \
    echo '    exec gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 production_backend_fixed:app' >> /app/entrypoint.sh && \
    echo 'elif [ -f "app.py" ]; then' >> /app/entrypoint.sh && \
    echo '    echo "✅ Using main app.py"' >> /app/entrypoint.sh && \
    echo '    exec gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '    echo "❌ No suitable backend found!"' >> /app/entrypoint.sh && \
    echo '    exit 1' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash smarteats && \
    chown -R smarteats:smarteats /app
USER smarteats

# Expose port
EXPOSE 5000

# Health check (updated endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api || exit 1

# Start command
CMD ["/app/entrypoint.sh"]
