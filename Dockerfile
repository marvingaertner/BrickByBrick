# Stage 1: Build the Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Backend and Serve
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for sqlite)
# sqlite3 is usually included in python slim images

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose the API port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app

# Run the docker wrapper script
CMD ["python", "-m", "backend.docker_main"]
