@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0CREAR-EXE-SINTAVRA.ps1"
echo.
pause
