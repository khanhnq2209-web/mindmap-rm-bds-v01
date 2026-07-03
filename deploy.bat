@echo off
cd /d "%~dp0"
npx --yes wrangler pages deploy . --project-name mindmap-rm-bds-v01
pause
