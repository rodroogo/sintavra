@echo off
setlocal
cd /d "%~dp0"
echo Aplicando upgrade de Sintavra...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0aplicar-sintavra.ps1"
echo.
pause
