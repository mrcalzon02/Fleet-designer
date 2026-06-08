@echo off
setlocal
cd /d "%~dp0"

echo Starting Fleet Designer - Orbital Works...
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found on PATH. Install Node.js, then try again.
  goto fail
)

if not exist node_modules (
  echo Installing project dependencies. This may take a while the first time.
  call npm install
  if errorlevel 1 goto fail
)

echo Running runtime diagnostics...
call npm run diagnostics
if errorlevel 1 (
  echo.
  echo Runtime diagnostics failed. The app was not launched because required files or imports are broken.
  goto fail
)

echo.
echo Checking and repairing Electron runtime...
call npm run repair:electron
if errorlevel 1 (
  echo.
  echo Electron repair failed. Delete node_modules and package-lock.json, then run npm install again if this continues.
  goto fail
)

echo.
echo Diagnostics and Electron runtime passed. Building and launching desktop shell...
call npm run desktop
if errorlevel 1 goto fail

exit /b 0

:fail
echo.
echo Fleet Designer failed to start. Check the error above.
echo Suggested hard reset if Electron is corrupted:
echo   rmdir /s /q node_modules
echo   del package-lock.json
echo   npm install
echo   npm run desktop
pause
exit /b 1
