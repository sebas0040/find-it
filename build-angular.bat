@echo off
cd /d "d:\DELL\Downloads\find-it\frontend\app"
call npm run build
echo Build completed with exit code: %ERRORLEVEL%
