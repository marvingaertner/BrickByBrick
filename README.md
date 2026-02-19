# BrickByBrick

Application for tracking construction expenses.

## Project Structure

- `backend/`: FastAPI application
- `frontend/`: React + Vite application

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python main.py
   # OR with uvicorn directly (auto-reload)
   uvicorn main:app --reload
   ```

   The backend API will run at `http://localhost:8000`.
   API Documentation is available at `http://localhost:8000/docs`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend application will run at `http://localhost:5173`.
