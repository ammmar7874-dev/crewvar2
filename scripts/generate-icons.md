# App Icons and Splash Screens Generator

This script generates all required app icons and splash screens for iOS and Android.

## Required Sizes:

### iOS Icons:

- 20x20 (iPhone notification)
- 29x29 (iPhone settings)
- 40x40 (iPhone spotlight)
- 60x60 (iPhone app)
- 76x76 (iPad app)
- 83.5x83.5 (iPad Pro app)
- 1024x1024 (App Store)

### Android Icons:

- 48x48 (mdpi)
- 72x72 (hdpi)
- 96x96 (xhdpi)
- 144x144 (xxhdpi)
- 192x192 (xxxhdpi)

### Splash Screens:

- iOS: 1242x2688, 1125x2436, 828x1792
- Android: 1080x1920, 1440x2560

## Usage:

1. Place your source icon (1024x1024 PNG) in the root directory as `app-icon-source.png`
2. Run this script to generate all required sizes
3. Copy generated files to appropriate directories

## Source Icon Requirements:

- Format: PNG
- Size: 1024x1024 pixels
- Background: Transparent or solid color
- No rounded corners (will be added automatically)
- High quality, sharp edges



