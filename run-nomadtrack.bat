@echo off
title NomadTrack Professional Launcher
color 0B

echo =========================================
echo           NOMADTRACK LAUNCHER
echo =========================================
echo.

REM -----------------------------
REM Check if Node.js is installed
REM -----------------------------
node -v >nul 2>&1
if %errorlevel% neq 0 (
echo Node.js is NOT installed!
echo Please install Node.js from https://nodejs.org
pause
exit
)

echo Node.js detected.
echo.

REM -----------------------------
REM Kill old ports
REM -----------------------------
echo Checking old running servers...

for /f "tokens=5" %%a in ('netstat -ano ^| find ":5000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| find ":5173"') do taskkill /F /PID %%a >nul 2>&1

echo Old ports cleared.
echo.

REM -----------------------------
REM Get project root path
REM -----------------------------
set ROOT=%~dp0

echo Project Path:
echo %ROOT%
echo.

REM -----------------------------
REM Install backend dependencies
REM -----------------------------
if not exist "%ROOT%backend\node_modules" (
echo Installing backend dependencies...
cd /d "%ROOT%backend"
npm install
)

REM -----------------------------
REM Install frontend dependencies
REM -----------------------------
if not exist "%ROOT%frontend\node_modules" (
echo Installing frontend dependencies...
cd /d "%ROOT%frontend"
npm install
)

echo.
echo Starting Backend Server...
start "NomadTrack Backend" cmd /k "cd /d %ROOT%backend && node server.js"

timeout /t 3 >nul

echo Starting Frontend Server...
start "NomadTrack Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

timeout /t 5 >nul

echo Opening NomadTrack in browser...
start http://localhost:5173

echo.
echo =========================================
echo      NOMADTRACK STARTED SUCCESSFULLY
echo =========================================
echo Backend  : http://localhost:5000
echo Frontend : http://localhost:5173
echo.
pause
