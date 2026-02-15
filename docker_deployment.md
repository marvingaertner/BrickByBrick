# Docker Deployment Guide

This guide explains how to build and run the BrickByBrick application using Docker. The application is packaged into a single container that serves both the React frontend and the FastAPI backend.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (optional but recommended for easier management).

## Build the Image

Open a terminal in the root directory of the project (where the `Dockerfile` is located) and run:

```bash
docker build -t brickbybrick .
```

This process may take a few minutes as it compiles the frontend and installs backend dependencies.

## Run the Container

To start the application, run:

```bash
docker run -p 8000:8000 brickbybrick
```

- The application will be accessible at: [http://localhost:8000](http://localhost:8000)
- The API documentation is available at: [http://localhost:8000/docs](http://localhost:8000/docs)

## Data Persistence

By default, the database is stored inside the container and will be lost if the container is removed. To persist the data, you should mount the database file to your host machine.

The database file is located at `/app/brickbybrick.db` inside the container.

To run with persistence:

**On Windows (PowerShell):**
```powershell
docker run -p 8000:8000 -v ${PWD}/brickbybrick.db:/app/brickbybrick.db brickbybrick
```

**On Linux/Mac:**
```bash
docker run -p 8000:8000 -v $(pwd)/brickbybrick.db:/app/brickbybrick.db brickbybrick
```

*(Note: Ensure an empty `brickbybrick.db` file exists or let the application create it if mounting a directory).*

## Troubleshooting

- **Port Conflict**: If port 8000 is already in use, you can map to a different port:
  ```bash
  docker run -p 8080:8000 brickbybrick
  ```
  Then access at `http://localhost:8080`.

- **Frontend Connection**: The frontend is configured to connect to the backend relative to the current domain. This ensures it works regardless of the port or domain you deploy to.
