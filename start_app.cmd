@echo off
echo Starting LumenRTC Application Stack...

:: Start Signaling Server
echo [1/3] Starting Signaling Server (Port 3000)...
start "LumenRTC Signaling" cmd /k "node signaling/server.js"
timeout /t 5 /nobreak >nul

:: Start Python Backend
echo [2/3] Starting Python Backend (AI Engine)...
start "LumenRTC AI Backend" cmd /k "python python_src/main.py"
timeout /t 5 /nobreak >nul

:: Start Frontend
echo [3/3] Starting React Frontend...
cd client-web
start "LumenRTC Frontend" cmd /k "npm run dev"

echo All services launched! Check the popped up windows.
echo Frontend will be running at http://localhost:5173 (or 5174/5175 if busy)
pause
