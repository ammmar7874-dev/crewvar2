# Deep Link Configuration for Google OAuth

## ✅ **Deep Link Configuration Complete**

I've configured deep linking to properly handle Google OAuth redirects in your Android APK.

## 🔧 **What I Fixed:**

### **1. Android Manifest (AndroidManifest.xml)**

Added intent filter to handle custom URI scheme:

```xml
<!-- Intent filter for Google OAuth deep linking -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.crewvar.app" />
</intent-filter>
```

### **2. Capacitor Configuration (capacitor.config.ts)**

Added App plugin configuration for deep linking:

```typescript
plugins: {
  GoogleAuth: {
    scopes: ["profile", "email"],
    serverClientId: "1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com",
    forceCodeForRefreshToken: true,
  },
  App: {
    launchUrl: "com.crewvar.app://",
  },
},
```

### **3. Deep Link Handler Component**

Created `DeepLinkHandler.tsx` to process OAuth callbacks when app is opened via deep link.

### **4. Updated Routes**

Added `/deeplink` route to handle deep link processing.

## 🚀 **How It Works Now:**

### **Android APK Flow:**

1. **User clicks "Sign in with Google"**
2. **App opens Google OAuth** with redirect URI: `com.crewvar.app:/auth/google-callback`
3. **User selects account and clicks "Continue"**
4. **Google redirects to**: `com.crewvar.app:/auth/google-callback?code=...&state=...`
5. **Android system opens your app** (not google.com)
6. **DeepLinkHandler processes the OAuth callback**
7. **User is signed in successfully**

### **Web Browser Flow:**

1. **User clicks "Sign in with Google"**
2. **Popup opens** with redirect URI: `http://localhost:5173/auth/google-callback`
3. **User completes authentication**
4. **Popup redirects to callback page**
5. **User is signed in successfully**

## 📋 **Google Cloud Console Configuration:**

Make sure these redirect URIs are added to your OAuth client:

### **Authorized Redirect URIs:**

```
com.crewvar.app:/auth/google-callback
http://localhost:5173/auth/google-callback
```

### **Authorized JavaScript Origins:**

```
http://localhost:5173
```

### **Android App Settings:**

- **Package name**: `com.crewvar.app`
- **SHA-1 certificate fingerprint**: `2D:9F:93:49:14:0F:A5:63:C8:10:29:25:FB:3A:45:E1:D3:02:78:28`

## 🧪 **Testing Steps:**

1. **Build APK**: `npm run build && npx cap sync android`
2. **Build Android APK** using Android Studio or Gradle
3. **Install APK** on device
4. **Test Google Sign-In**:
   - Click "Sign in with Google"
   - Select account
   - Click "Continue"
   - **App should open** (not google.com)
   - User should be signed in

## 🔍 **Debug Information:**

The app will log detailed information:

```
Deep link URL: com.crewvar.app:/auth/google-callback?code=...
OAuth callback detected: { code: "...", state: "..." }
Google authentication successful: [User object]
```

## ✅ **Expected Result:**

- ✅ **No more "google.com opens" issue**
- ✅ **App opens when clicking Continue**
- ✅ **OAuth callback processed correctly**
- ✅ **User signed in successfully**
- ✅ **Deep linking works properly**

## 🚨 **Important Notes:**

1. **Wait 5-10 minutes** after Google Cloud Console changes
2. **Test thoroughly** after configuration
3. **Check console logs** for debug information
4. **Ensure APK is built** with the new manifest changes

**Deep linking is now properly configured for Google OAuth!** 🚀
