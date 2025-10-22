@echo off
REM CrewVar Mobile App Build Script for Windows
REM This script builds and prepares the app for both Android and iOS

setlocal enabledelayedexpansion

echo 🚀 Starting CrewVar Mobile App Build Process...

REM Check if required tools are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npx is not installed. Please install npx first.
    exit /b 1
)

echo [SUCCESS] All dependencies are installed

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Build web app
echo [INFO] Building web application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build web application
    exit /b 1
)
echo [SUCCESS] Web application built successfully

REM Sync Capacitor
echo [INFO] Syncing Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo [ERROR] Failed to sync Capacitor
    exit /b 1
)
echo [SUCCESS] Capacitor synced successfully

REM Build Android
echo [INFO] Building Android app...
if not exist "android" (
    echo [INFO] Adding Android platform...
    call npx cap add android
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to add Android platform
        exit /b 1
    )
)

call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Failed to sync Android
    exit /b 1
)
echo [SUCCESS] Android app prepared successfully
echo [INFO] Run 'npm run cap:open:android' to open in Android Studio

REM Build iOS (only if on macOS)
echo [INFO] Checking for iOS build...
where xcodebuild >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Building iOS app...
    if not exist "ios" (
        echo [INFO] Adding iOS platform...
        call npx cap add ios
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to add iOS platform
            exit /b 1
        )
    )
    
    call npx cap sync ios
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to sync iOS
        exit /b 1
    )
    echo [SUCCESS] iOS app prepared successfully
    echo [INFO] Run 'npm run cap:open:ios' to open in Xcode
) else (
    echo [WARNING] Xcode not found. Skipping iOS build.
)

echo [SUCCESS] Build process completed!
echo [INFO] Next steps:
echo [INFO] 1. For Android: npm run cap:open:android
echo [INFO] 2. For iOS: npm run cap:open:ios
echo [INFO] 3. Test on device/emulator

pause


