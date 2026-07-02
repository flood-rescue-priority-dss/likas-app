@echo off
echo Starting LIKAS Decision Support System...

echo Starting Python Scoring Microservice on port 8000...
start cmd /k "cd likas-python && venv\Scripts\activate 2>nul || echo Virtual env not found, relying on global Python... && python -m uvicorn main:app --reload --port 8000"

echo Starting Node.js Backend on port 5000...
start cmd /k "cd likas-backend && npm run dev"

echo Starting Frontend on port 5173...
start cmd /k "cd likas-frontend && npm run dev"

echo All services started! You can close this window now.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000/api/health
echo Python: http://localhost:8000
