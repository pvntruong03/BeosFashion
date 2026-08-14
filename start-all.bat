@echo off
title UNIQLO Fullstack Platform Launcher
echo ========================================================
echo Launching UNIQLO E-Commerce Fullstack Platform...
echo 1. Backend:  http://localhost:8080 (Swagger: /swagger-ui.html)
echo 2. Frontend: http://localhost:5173
echo ========================================================

start "UNIQLO Backend (Port 8080)" "%~dp0run-backend.bat"
timeout /t 3 /nobreak >nul
start "UNIQLO Frontend (Port 5173)" "%~dp0run-frontend.bat"

echo.
echo Both services have been launched in separate windows!
echo Open http://localhost:5173 in your browser to view the application.
timeout /t 5
