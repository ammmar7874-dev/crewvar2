# Google OAuth Client ID Setup for Android APK

## ✅ **Your Current Configuration**

Based on your `capacitor.config.ts`, you already have the correct Google OAuth Client ID configured:

```typescript
plugins: {
  GoogleAuth: {
    scopes: ["profile", "email"],
    serverClientId: "1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com",
    forceCodeForRefreshToken: true,
  },
},
```

## 🔧 **What I Fixed**

I've updated the OAuth implementation to automatically use the correct client ID based on the platform:

### **For Android APK (Mobile):**

- Uses: `1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com`
- This is your **serverClientId** from Capacitor config
- Automatically detected when running in Capacitor/Android

### **For Web Browser:**

- Uses: `VITE_GOOGLE_CLIENT_ID` or `VITE_FIREBASE_API_KEY` from environment variables
- Fallback to environment variables for web development

## 📱 **Android APK Setup Verification**

### 1. **Google Cloud Console Setup**

Make sure your OAuth 2.0 Client ID (`1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com`) has:

- **Application type**: Web application
- **Authorized redirect URIs**:
  - `http://localhost:5173/auth/google-callback` (for development)
  - `https://yourdomain.com/auth/google-callback` (for production)
  - `https://your-app-domain.com/auth/google-callback` (if you have a custom domain)

### 2. **Android Package Name**

In Google Cloud Console, make sure your OAuth client includes:

- **Package name**: `com.crewvar.app` (from your Capacitor config)
- **SHA-1 certificate fingerprint**: Your app's signing certificate

### 3. **Debug Your Setup**

Visit: `http://localhost:5173/auth/oauth-debug`

This will show you:

- Current platform (Mobile/Capacitor vs Web Browser)
- Which client ID is being used
- Generated OAuth URL
- All environment variables

## 🧪 **Testing Steps**

### **For Android APK:**

1. Build your Android APK
2. Install on device
3. Open the app
4. Try Google Sign-In
5. Check console logs for debug info

### **For Web Development:**

1. Visit `/auth/oauth-debug`
2. Check which client ID is being used
3. Test the OAuth URL
4. Verify redirect URI is correct

## 🔍 **Debug Information**

The app now logs detailed information:

```
=== Google OAuth Debug Info ===
Platform: Mobile/Capacitor (or Web Browser)
Client ID: 1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com
Server Client ID: 1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com
Redirect URI: http://localhost:5173/auth/google-callback
Final OAuth URL: https://accounts.google.com/o/oauth2/v2/auth?...
===============================
```

## ⚠️ **Important Notes**

1. **Client ID Type**: Make sure you're using the **OAuth 2.0 Client ID**, not the Firebase API key
2. **Redirect URI**: Must match exactly what's configured in Google Cloud Console
3. **Package Name**: Must match your Android package name (`com.crewvar.app`)
4. **SHA-1 Fingerprint**: Required for Android APK authentication

## 🚀 **Next Steps**

1. **Test the debug page**: Visit `/auth/oauth-debug` to verify configuration
2. **Check Google Cloud Console**: Ensure redirect URIs are correct
3. **Build Android APK**: Test the authentication flow
4. **Monitor console logs**: Look for the debug information

Your Google Client ID is already correctly configured for Android APK! The issue should now be resolved.
