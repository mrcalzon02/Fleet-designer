@echo off
setlocal
cd /d "%~dp0"

echo Starting Fleet Designer - Orbital Works...

if not exist node_modules (
  echo Installing project dependencies. This may take a while the first time.
  call npm install
  if errorlevel 1 goto fail
)

call npm run desktop
if errorlevel 1 goto fail

exit /b 0

:fail
echo.
echo Fleet Designer failed to start. Check the error above.
pause
exit /b 1
