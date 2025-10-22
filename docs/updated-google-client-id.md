# Updated Google Client ID Configuration

## ✅ **Updated Configuration**

I've successfully updated the Google Client ID for Android APK to use the new ID you provided.

## 📱 **Current Google Client IDs:**

### **For Android APK:**

```
1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com
```

- **Source**: Capacitor config (`capacitor.config.ts`)
- **Usage**: Automatically used when running in Capacitor/Android
- **Redirect URI**: `com.crewvar.app:/auth/google-callback`

### **For Web Browser:**

```
Currently: NOT SET (will fallback to Firebase API key)
```

- **Source**: Environment variables (`VITE_GOOGLE_CLIENT_ID` or `VITE_FIREBASE_API_KEY`)
- **Current Status**: Neither `VITE_GOOGLE_CLIENT_ID` nor `VITE_FIREBASE_API_KEY` is set
- **Redirect URI**: `http://localhost:5173/auth/google-callback` (or your domain)

## 🔧 **Files Updated:**

1. **`capacitor.config.ts`** - Updated serverClientId
2. **`src/components/auth/GoogleAuthWebView.tsx`** - Updated serverClientId constant
3. **`src/pages/auth/OAuthDebug.tsx`** - Updated serverClientId state
4. **`docs/android-google-oauth-setup.md`** - Updated documentation

## 📋 **Google Cloud Console Setup Required:**

You need to add these redirect URIs to your **NEW** Google OAuth client (`1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com`):

### **For Android APK:**

```
com.crewvar.app:/auth/google-callback
```

### **For Web Development:**

```
http://localhost:5173/auth/google-callback
```

### **For Production (if applicable):**

```
https://yourdomain.com/auth/google-callback
```

## 🧪 **Testing:**

1. **Debug Page**: Visit `/auth/oauth-debug` to verify the new Client ID is being used
2. **Console Logs**: Check browser console for the updated debug information
3. **Android APK**: Build and test the APK with the new Client ID

## ⚠️ **Important Notes:**

- Make sure the **NEW** Client ID (`1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com`) is properly configured in Google Cloud Console
- Add the correct redirect URIs to the new Client ID
- The old Client ID (`1022590083211-v161e3ces8g76aj4gsf69psbm1ugsuu7.apps.googleusercontent.com`) is no longer used

**The Android APK will now use the new Google Client ID!** 🚀
