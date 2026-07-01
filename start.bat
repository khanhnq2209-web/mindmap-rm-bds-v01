@echo off
cd /d "%~dp0"
set PORT=3456
start "" cmd /c "ping -n 3 127.0.0.1 >nul && start http://127.0.0.1:%PORT%/"
python -m http.server %PORT% 2>nul || py -m http.server %PORT% 2>nul || npx --yes serve . -p %PORT% -n
