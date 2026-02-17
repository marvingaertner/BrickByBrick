import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .main import app

# Remove the existing root route to allow serving index.html at /
# We filter out the route that matches path '/' and method 'GET'
new_routes = []
for route in app.routes:
    if getattr(route, "path", "") == "/" and "GET" in getattr(route, "methods", set()):
        continue
    new_routes.append(route)
app.router.routes = new_routes

# Define paths to frontend build artifacts
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

# Check if dist directory exists (it should in the container)
if os.path.exists(DIST_DIR):
    # Mount assets folder
    # Vite typically puts assets in 'assets' folder
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")
    
    # Catch-all route for SPA
    # We place this after all other routes so API routes take precedence
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if specific file exists first (e.g. favicon.ico, etc.)
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for React routing
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    print(f"WARNING: Frontend build directory not found at {DIST_DIR}. Serving API only.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
