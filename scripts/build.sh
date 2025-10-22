#!/bin/bash

# Build script for CrewVar with proper environment handling
# This script ensures environment variables are properly handled for both web and APK builds

set -e

echo "🚀 Starting CrewVar build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to check if environment variables are set
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    if [ -f ".env.local" ]; then
        echo "✅ .env.local file found"
        source .env.local
    else
        echo "⚠️  .env.local file not found"
    fi
    
    # Check required variables for web build
    if [ -z "$VITE_FIREBASE_API_KEY" ]; then
        echo "⚠️  VITE_FIREBASE_API_KEY not set"
    else
        echo "✅ VITE_FIREBASE_API_KEY is set"
    fi
    
    if [ -z "$VITE_GOOGLE_CLIENT_ID" ]; then
        echo "⚠️  VITE_GOOGLE_CLIENT_ID not set"
    else
        echo "✅ VITE_GOOGLE_CLIENT_ID is set"
    fi
    
    if [ -z "$VITE_GOOGLE_CLIENT_SECRET" ]; then
        echo "⚠️  VITE_GOOGLE_CLIENT_SECRET not set"
    else
        echo "✅ VITE_GOOGLE_CLIENT_SECRET is set"
    fi
}

# Function to build web app
build_web() {
    echo "🌐 Building web application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Web build completed successfully"
    else
        echo "❌ Web build failed"
        exit 1
    fi
}

# Function to build Android APK
build_android() {
    echo "📱 Building Android APK..."
    
    # Check if Android directory exists
    if [ ! -d "android" ]; then
        echo "❌ Android directory not found. Run 'npm run cap:add:android' first."
        exit 1
    fi
    
    # Sync Capacitor
    echo "🔄 Syncing Capacitor..."
    npx cap sync android
    
    if [ $? -eq 0 ]; then
        echo "✅ Capacitor sync completed"
    else
        echo "❌ Capacitor sync failed"
        exit 1
    fi
    
    # Open Android Studio
    echo "🔧 Opening Android Studio..."
    npx cap open android
    
    echo "📝 Please build the APK in Android Studio:"
    echo "   1. Select 'Build' > 'Build Bundle(s) / APK(s)' > 'Build APK(s)'"
    echo "   2. Or select 'Build' > 'Generate Signed Bundle / APK' for release"
    echo "   3. The APK will be generated in android/app/build/outputs/apk/"
}

# Function to build iOS app
build_ios() {
    echo "🍎 Building iOS app..."
    
    # Check if iOS directory exists
    if [ ! -d "ios" ]; then
        echo "❌ iOS directory not found. Run 'npm run cap:add:ios' first."
        exit 1
    fi
    
    # Sync Capacitor
    echo "🔄 Syncing Capacitor..."
    npx cap sync ios
    
    if [ $? -eq 0 ]; then
        echo "✅ Capacitor sync completed"
    else
        echo "❌ Capacitor sync failed"
        exit 1
    fi
    
    # Open Xcode
    echo "🔧 Opening Xcode..."
    npx cap open ios
    
    echo "📝 Please build the app in Xcode:"
    echo "   1. Select your target device or simulator"
    echo "   2. Press Cmd+B to build"
    echo "   3. Press Cmd+R to run"
}

# Function to show help
show_help() {
    echo "CrewVar Build Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  web       Build web application only"
    echo "  android   Build Android APK"
    echo "  ios       Build iOS app"
    echo "  all       Build web + Android + iOS"
    echo "  check     Check environment variables only"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 web        # Build web app"
    echo "  $0 android    # Build Android APK"
    echo "  $0 all        # Build everything"
}

# Main script logic
case "${1:-help}" in
    "web")
        check_env_vars
        build_web
        ;;
    "android")
        check_env_vars
        build_web
        build_android
        ;;
    "ios")
        check_env_vars
        build_web
        build_ios
        ;;
    "all")
        check_env_vars
        build_web
        build_android
        build_ios
        ;;
    "check")
        check_env_vars
        ;;
    "help"|*)
        show_help
        ;;
esac

echo "🎉 Build process completed!"

