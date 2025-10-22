@echo off
REM Build script for CrewVar with proper environment handling (Windows)
REM This script ensures environment variables are properly handled for both web and APK builds

setlocal enabledelayedexpansion

echo 🚀 Starting CrewVar build process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Function to check environment variables
:check_env_vars
echo 🔍 Checking environment variables...

if exist ".env.local" (
    echo ✅ .env.local file found
    for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
        set "%%a=%%b"
    )
) else (
    echo ⚠️  .env.local file not found
)

REM Check required variables for web build
if defined VITE_FIREBASE_API_KEY (
    echo ✅ VITE_FIREBASE_API_KEY is set
) else (
    echo ⚠️  VITE_FIREBASE_API_KEY not set
)

if defined VITE_GOOGLE_CLIENT_ID (
    echo ✅ VITE_GOOGLE_CLIENT_ID is set
) else (
    echo ⚠️  VITE_GOOGLE_CLIENT_ID not set
)

if defined VITE_GOOGLE_CLIENT_SECRET (
    echo ✅ VITE_GOOGLE_CLIENT_SECRET is set
) else (
    echo ⚠️  VITE_GOOGLE_CLIENT_SECRET not set
)
goto :eof

REM Function to build web app
:build_web
echo 🌐 Building web application...
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Web build completed successfully
) else (
    echo ❌ Web build failed
    exit /b 1
)
goto :eof

REM Function to build Android APK
:build_android
echo 📱 Building Android APK...

REM Check if Android directory exists
if not exist "android" (
    echo ❌ Android directory not found. Run 'npm run cap:add:android' first.
    exit /b 1
)

REM Sync Capacitor
echo 🔄 Syncing Capacitor...
call npx cap sync android
if %errorlevel% equ 0 (
    echo ✅ Capacitor sync completed
) else (
    echo ❌ Capacitor sync failed
    exit /b 1
)

REM Open Android Studio
echo 🔧 Opening Android Studio...
call npx cap open android

echo 📝 Please build the APK in Android Studio:
echo    1. Select 'Build' ^> 'Build Bundle(s) / APK(s)' ^> 'Build APK(s)'
echo    2. Or select 'Build' ^> 'Generate Signed Bundle / APK' for release
echo    3. The APK will be generated in android/app/build/outputs/apk/
goto :eof

REM Function to build iOS app
:build_ios
echo 🍎 Building iOS app...

REM Check if iOS directory exists
if not exist "ios" (
    echo ❌ iOS directory not found. Run 'npm run cap:add:ios' first.
    exit /b 1
)

REM Sync Capacitor
echo 🔄 Syncing Capacitor...
call npx cap sync ios
if %errorlevel% equ 0 (
    echo ✅ Capacitor sync completed
) else (
    echo ❌ Capacitor sync failed
    exit /b 1
)

REM Open Xcode
echo 🔧 Opening Xcode...
call npx cap open ios

echo 📝 Please build the app in Xcode:
echo    1. Select your target device or simulator
echo    2. Press Cmd+B to build
echo    3. Press Cmd+R to run
goto :eof

REM Function to show help
:show_help
echo CrewVar Build Script (Windows)
echo.
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   web       Build web application only
echo   android   Build Android APK
echo   ios       Build iOS app
echo   all       Build web + Android + iOS
echo   check     Check environment variables only
echo   help      Show this help message
echo.
echo Examples:
echo   %0 web        # Build web app
echo   %0 android   # Build Android APK
echo   %0 all       # Build everything
goto :eof

REM Main script logic
if "%1"=="web" (
    call :check_env_vars
    call :build_web
) else if "%1"=="android" (
    call :check_env_vars
    call :build_web
    call :build_android
) else if "%1"=="ios" (
    call :check_env_vars
    call :build_web
    call :build_ios
) else if "%1"=="all" (
    call :check_env_vars
    call :build_web
    call :build_android
    call :build_ios
) else if "%1"=="check" (
    call :check_env_vars
) else (
    call :show_help
)

echo 🎉 Build process completed!

