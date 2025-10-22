#!/bin/bash

# Android Authentication Debug Script
# This script helps you monitor authentication logs in your Android APK

echo "🔍 Android Authentication Debug Tool"
echo "=================================="
echo ""

echo "📱 Available Commands:"
echo "1. Monitor all authentication logs"
echo "2. Monitor Google OAuth specific logs"
echo "3. Monitor Firebase authentication logs"
echo "4. Monitor app-specific logs"
echo "5. Clear logs and start fresh"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "🔍 Monitoring all authentication logs..."
        echo "Press Ctrl+C to stop"
        adb logcat | grep -i "authentication\|google\|firebase\|oauth\|login\|signin"
        ;;
    2)
        echo "🔍 Monitoring Google OAuth logs..."
        echo "Press Ctrl+C to stop"
        adb logcat | grep -i "google\|oauth\|auth"
        ;;
    3)
        echo "🔍 Monitoring Firebase authentication logs..."
        echo "Press Ctrl+C to stop"
        adb logcat | grep -i "firebase\|auth"
        ;;
    4)
        echo "🔍 Monitoring app-specific logs..."
        echo "Press Ctrl+C to stop"
        adb logcat | grep -i "crewvar\|app"
        ;;
    5)
        echo "🧹 Clearing logs..."
        adb logcat -c
        echo "✅ Logs cleared!"
        ;;
    *)
        echo "❌ Invalid option. Please run the script again."
        ;;
esac
