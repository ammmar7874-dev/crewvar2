#!/bin/bash

# CrewVar Mobile App Build Script
# This script builds and prepares the app for both Android and iOS

set -e

echo "🚀 Starting CrewVar Mobile App Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed. Please install npx first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Build web app
build_web() {
    print_status "Building web application..."
    npm run build
    print_success "Web application built successfully"
}

# Sync Capacitor
sync_capacitor() {
    print_status "Syncing Capacitor..."
    npx cap sync
    print_success "Capacitor synced successfully"
}

# Build Android
build_android() {
    print_status "Building Android app..."
    
    if [ ! -d "android" ]; then
        print_status "Adding Android platform..."
        npx cap add android
    fi
    
    npx cap sync android
    print_success "Android app prepared successfully"
    print_status "Run 'npm run cap:open:android' to open in Android Studio"
}

# Build iOS
build_ios() {
    print_status "Building iOS app..."
    
    if [ ! -d "ios" ]; then
        print_status "Adding iOS platform..."
        npx cap add ios
    fi
    
    npx cap sync ios
    print_success "iOS app prepared successfully"
    print_status "Run 'npm run cap:open:ios' to open in Xcode"
}

# Main build function
main() {
    case "${1:-all}" in
        "android")
            check_dependencies
            install_dependencies
            build_web
            build_android
            ;;
        "ios")
            check_dependencies
            install_dependencies
            build_web
            build_ios
            ;;
        "web")
            check_dependencies
            install_dependencies
            build_web
            ;;
        "all")
            check_dependencies
            install_dependencies
            build_web
            sync_capacitor
            build_android
            build_ios
            ;;
        *)
            echo "Usage: $0 [android|ios|web|all]"
            echo "  android - Build Android app only"
            echo "  ios     - Build iOS app only"
            echo "  web     - Build web app only"
            echo "  all     - Build all platforms (default)"
            exit 1
            ;;
    esac
    
    print_success "Build process completed!"
    print_status "Next steps:"
    print_status "1. For Android: npm run cap:open:android"
    print_status "2. For iOS: npm run cap:open:ios"
    print_status "3. Test on device/emulator"
}

# Run main function
main "$@"


