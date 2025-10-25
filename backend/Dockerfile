FROM python:3.12-slim

# Prevent Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for GeoDjango + PostGIS
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    gdal-bin \
    libproj-dev \
    libgdal-dev \
    libgeos-dev \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency list and install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

# Copy project code
COPY . /app/

# Optional: explicitly tell Django where GDAL/GEOS are (for extra safety)
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

# Run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
