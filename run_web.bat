@echo off
setlocal
cd /d "%~dp0"
"C:\Users\USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" web_server.py
echo.
pause
