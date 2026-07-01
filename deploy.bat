@echo off
cd /d "%~dp0"
npx --yes wrangler pages deploy . --project-name gelex-mindmap-rm
pause
