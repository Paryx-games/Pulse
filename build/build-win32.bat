@echo off
echo Building Pulse Media...
npx electron-packager ../ "Pulse Media" --platform=win32 --arch=x64 --icon=../assets/icon/pulse.ico --out=../dist --overwrite || (
    echo.
    echo Build failed!
    pause
    exit /b
)
echo.
echo Build complete! Press Enter to exit.
pause >nul