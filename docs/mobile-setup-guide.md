# CrewVar Mobile App Setup Guide

## 🚀 Complete Mobile App Setup Instructions

### Prerequisites

#### For Android Development:

1. **Android Studio** (latest version)
2. **Java JDK 17** or higher
3. **Android SDK** (API level 23+)
4. **Android Emulator** or physical device

#### For iOS Development:

1. **macOS** (required for iOS development)
2. **Xcode** (latest version)
3. **iOS Simulator**
4. **Apple Developer Account** ($99/year)

#### General Requirements:

1. **Node.js 18+**
2. **npm** or **yarn**
3. **Git**

### Installation Steps

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Environment Setup

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your Firebase configuration
# Add your Firebase API keys and project details
```

#### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable Authentication, Firestore, Storage, and Functions
4. Get your Firebase configuration
5. Add the configuration to `.env.local`

#### 4. Build Web Application

```bash
npm run build
```

#### 5. Add Mobile Platforms

**For Android:**

```bash
npm run cap:add:android
```

**For iOS (macOS only):**

```bash
npm run cap:add:ios
```

#### 6. Sync Capacitor

```bash
npm run cap:sync
```

### Building and Running

#### Android

```bash
# Build and open in Android Studio
npm run cap:build:android

# Or just open Android Studio
npm run cap:open:android

# Run on device/emulator
npm run cap:run:android
```

#### iOS

```bash
# Build and open in Xcode
npm run cap:build:ios

# Or just open Xcode
npm run cap:open:ios

# Run on device/simulator
npm run cap:run:ios
```

### Testing

#### Android Testing

1. **Emulator Testing:**

   - Open Android Studio
   - Create/start an emulator
   - Run the app on emulator

2. **Physical Device Testing:**
   - Enable Developer Options on your Android device
   - Enable USB Debugging
   - Connect device via USB
   - Run the app on device

#### iOS Testing

1. **Simulator Testing:**

   - Open Xcode
   - Select iOS Simulator
   - Run the app on simulator

2. **Physical Device Testing:**
   - Connect iPhone/iPad via USB
   - Select device in Xcode
   - Run the app on device

### App Store Preparation

#### Android (Google Play Store)

1. **Create App Bundle:**

   ```bash
   # In Android Studio
   Build > Generate Signed Bundle/APK
   ```

2. **Required Files:**
   - App bundle (.aab file)
   - App icon (512x512 PNG)
   - Screenshots (phone and tablet)
   - Privacy policy
   - Terms of service

#### iOS (Apple App Store)

1. **Create Archive:**

   ```bash
   # In Xcode
   Product > Archive
   ```

2. **Required Files:**
   - App archive
   - App icon (1024x1024 PNG)
   - Screenshots (all device sizes)
   - Privacy policy
   - Terms of service

### Troubleshooting

#### Common Issues

1. **Build Errors:**

   ```bash
   # Clean and rebuild
   npm run build
   npx cap sync
   ```

2. **Permission Errors:**

   - Check Android permissions in `AndroidManifest.xml`
   - Verify iOS permissions in `Info.plist`

3. **Firebase Errors:**

   - Verify Firebase configuration
   - Check API keys in `.env.local`
   - Ensure Firebase services are enabled

4. **Capacitor Sync Issues:**
   ```bash
   # Force sync
   npx cap sync --force
   ```

### Development Workflow

#### Daily Development

1. Make changes to React code
2. Test in browser: `npm run dev`
3. Build: `npm run build`
4. Sync: `npx cap sync`
5. Test on device/emulator

#### Before Release

1. Update version in `package.json`
2. Update version in `capacitor.config.ts`
3. Build production: `npm run build`
4. Sync: `npx cap sync`
5. Test thoroughly on devices
6. Create release builds

### File Structure

```
crewvar/
├── android/                 # Android project
├── ios/                     # iOS project (after adding)
├── src/                     # React source code
├── dist/                    # Built web app
├── capacitor.config.ts      # Capacitor configuration
├── package.json             # Dependencies and scripts
├── .env.local              # Environment variables
└── docs/                    # Documentation
```

### Scripts Reference

| Script                      | Description              |
| --------------------------- | ------------------------ |
| `npm run dev`               | Start development server |
| `npm run build`             | Build for production     |
| `npm run cap:sync`          | Sync Capacitor           |
| `npm run cap:open:android`  | Open Android Studio      |
| `npm run cap:open:ios`      | Open Xcode               |
| `npm run cap:build:android` | Build and open Android   |
| `npm run cap:build:ios`     | Build and open iOS       |
| `npm run cap:run:android`   | Run on Android device    |
| `npm run cap:run:ios`       | Run on iOS device        |

### Support

For issues and questions:

- Check the troubleshooting section
- Review Capacitor documentation
- Check Firebase documentation
- Contact support: support@crewvar.com

### Next Steps

After setup:

1. Test all features on both platforms
2. Create app icons and splash screens
3. Prepare app store listings
4. Submit to app stores
5. Monitor and maintain



