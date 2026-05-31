FROM python:3.12-slim-bookworm

WORKDIR /app

# Python/runtime defaults
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CPLUS_INCLUDE_PATH=/usr/include/gdal \
    C_INCLUDE_PATH=/usr/include/gdal \
    GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so

# Install native dependencies required by GeoDjango, PostGIS and GDAL.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    binutils \
    curl \
    gcc \
    gdal-bin \
    libgdal-dev \
    libpq-dev \
    libproj-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY backend/ .
COPY infra/docker/backend/entrypoint.sh /entrypoint.sh

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media /app/logs \
    && chmod +x /entrypoint.sh

# Expose port
EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]

