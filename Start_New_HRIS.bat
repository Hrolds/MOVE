@echo off
title MOVE Baguio Chapter — Unified HRIS System (SQLite)
cd /d "%~dp0"
echo ======================================================================
echo    MOVE Baguio Chapter — Modern Unified HRIS System
echo    Database: SQLite (data\move_hris.db)
echo ======================================================================
echo.
echo [1/2] Starting REST API Server in background (Port 8765)...

set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not exist "%PY_EXE%" set "PY_EXE=python"

start "" /B "%PY_EXE%" backend\server.py
timeout /t 2 >nul
echo [2/2] Opening Modern Unified HRIS in your default browser...
start "" "http://127.0.0.1:8765"
echo.
echo [OK] System is online at http://127.0.0.1:8765
echo.
echo (Keep this window open while working. Press any key to stop the server.)
pause >nul
