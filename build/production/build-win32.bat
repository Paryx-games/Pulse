@echo off
echo PRODUCTION BUILD
echo Building Pulse Media...
npx electron-builder --win nsis msi || (
    echo.
    echo Build failed!
    pause
    exit /b
)
echo.
echo Build complete! Press Enter to exit.
pause >nul