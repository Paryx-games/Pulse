@echo off
echo DEV BUILD
echo Building Pulse Media...
npx electron-packager ../ "Pulse Media" --platform=linux --arch=x64 --out=../dist --overwrite

    echo.
    echo Build failed!
    pause
    exit /b
)
echo.
echo Build complete! Press Enter to exit.
pause >nul