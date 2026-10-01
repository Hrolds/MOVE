@echo off
title HRIS Local Database Auto-Sync Engine
cd /d "%~dp0"
echo ======================================================================
echo    HRIS Local Database Auto-Sync Engine - City Government of Baguio
echo ======================================================================
echo.
echo Database File: ALL MALES MARIED WITH TRAINING.xls
echo.
echo [1/2] Starting Auto-Sync Server in background (Port 8765)...
start "" /B python sync_server.py
timeout /t 1 >nul
echo [2/2] Opening Interactive System in your Browser...
start "" "index.html"
echo.
echo [OK] Auto-Sync Engine is active and connected!
echo Whenever you click 'Save to ALL MALES MARIED WITH TRAINING.xls',
echo it will write your changes directly as a new sheet in the file!
echo.
echo (Keep this window open while working. Press any key to stop the server.)
pause >nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq HRIS*" >nul 2>&1
