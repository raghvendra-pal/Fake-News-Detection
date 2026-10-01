@echo off
echo ============================================================
echo Starting TruthLens Full-Stack Application
echo ============================================================
start "TruthLens Backend" cmd /k "call .\venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
start "TruthLens Frontend" cmd /k "cd frontend && npm run dev"
echo Both servers have been launched in separate windows!
echo Backend:  http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)
echo Frontend: http://localhost:5173
pause
