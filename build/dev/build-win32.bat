@echo off
echo DEV BUILD
echo Building Pulse Media...
npx electron-builder --win portable --x64 --config ../../electron-builder.json || (
    echo.
    echo Build failed!
    pause
    exit /b
)
echo.
echo Build complete! Press Enter to exit.
pause >nul