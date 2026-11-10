@echo off
title MOVE Baguio Chapter — Unified HRIS System (SQLite)
cd /d "%~dp0"
echo ======================================================================
echo    MOVE Baguio Chapter — Modern Unified HRIS System
echo    Database: SQLite (data\move_hris.db)
echo ======================================================================
echo.

set "PY_EXE="
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not defined PY_EXE if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
if not defined PY_EXE if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
if not defined PY_EXE if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
if not defined PY_EXE (
    where python >nul 2>nul && set "PY_EXE=python"
)
if not defined PY_EXE (
    where py >nul 2>nul && set "PY_EXE=py"
)

if not defined PY_EXE (
    echo [ERROR] Python 3 was not detected on this computer!
    echo.
    echo Please install Python 3 from https://www.python.org/downloads/
    echo IMPORTANT: Make sure to check the box "Add python.exe to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo [1/2] Starting REST API Server in background (Port 8765)...
start "" /B "%PY_EXE%" backend\server.py
timeout /t 2 >nul
echo [2/2] Opening Modern Unified HRIS in your default browser...
start "" "http://127.0.0.1:8765"
echo.
echo [OK] System is online at http://127.0.0.1:8765
echo.
echo (Keep this window open while working. Press any key to stop the server.)
pause >nul
