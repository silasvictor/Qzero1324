@echo off
echo ======================================================================
echo    Starting QueueZero (Q-Zero) Full-Stack Campus Printing Platform
echo ======================================================================
echo.

echo Starting Backend API Server (Port 5000)...
start "QueueZero Backend API" cmd /k "cd /d %~dp0backend && node dist/index.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend Web Application (Port 5173)...
start "QueueZero Frontend Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ======================================================================
echo  QueueZero Platform is LIVE!
echo  Frontend URL : http://localhost:5173
echo  Backend API  : http://localhost:5000/api
echo.
echo  Demo Accounts:
echo    - Student  : nischal@campus.edu  / password123
echo    - Admin    : admin@campus.edu    / admin123
echo    - Operator : operator@campus.edu / operator123
echo ======================================================================
echo.
pause
