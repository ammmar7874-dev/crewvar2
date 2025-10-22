# Fix "Custom URI Scheme Not Enabled" Error

## 🔧 **Complete Solution**

The error "Custom URI scheme is not enabled for your Android client" occurs because Google Cloud Console doesn't recognize your custom URI scheme. Here's how to fix it:

## 📋 **Step-by-Step Google Cloud Console Configuration**

### **Step 1: Go to Google Cloud Console**

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **Credentials**

### **Step 2: Find Your OAuth Client**

Look for: `1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com`

### **Step 3: Configure Web Application Settings**

**In the "Authorized redirect URIs" section, add:**

```
com.crewvar.app:/auth/google-callback
http://localhost:5173/auth/google-callback
```

**In the "Authorized JavaScript origins" section, add:**

```
http://localhost:5173
```

### **Step 4: Configure Android App Settings**

**In the "Android" section, add:**

- **Package name**: `com.crewvar.app`
- **SHA-1 certificate fingerprint**: `2D:9F:93:49:14:0F:A5:63:C8:10:29:25:FB:3A:45:E1:D3:02:78:28`

## 🔑 **Your Certificate Information**

**Debug Certificate (for testing):**

- **SHA-1**: `2D:9F:93:49:14:0F:A5:63:C8:10:29:25:FB:3A:45:E1:D3:02:78:28`
- **SHA-256**: `A9:AA:84:AB:27:47:D1:27:6A:C3:07:75:99:A3:E9:84:E0:C1:87:07:A1:B0:3B:2C:38:A0:89:B8:44:A9:49:AA`
- **Valid until**: Thursday, October 7, 2055

## ⚠️ **Important Notes**

### **For Production APK:**

When you build a production APK, you'll need to:

1. **Generate a release keystore**
2. **Get the SHA-1 fingerprint** from your release certificate
3. **Add the release SHA-1** to Google Cloud Console

### **For Testing:**

The debug certificate SHA-1 above is sufficient for testing with debug APKs.

## 🧪 **Testing Steps**

1. **Update Google Cloud Console** with the settings above
2. **Wait 5-10 minutes** for changes to propagate
3. **Build APK**: `npm run build && npx cap build android`
4. **Install APK** on device
5. **Test Google Sign-In**

## 🔍 **Verification Checklist**

✅ **OAuth Client ID**: `1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com`
✅ **Redirect URI**: `com.crewvar.app:/auth/google-callback`
✅ **Package Name**: `com.crewvar.app`
✅ **SHA-1 Fingerprint**: `2D:9F:93:49:14:0F:A5:63:C8:10:29:25:FB:3A:45:E1:D3:02:78:28`
✅ **JavaScript Origins**: `http://localhost:5173`

## 🚀 **Expected Result**

After completing these steps:

- ✅ No more "Custom URI scheme not enabled" error
- ✅ Google authentication should work in Android APK
- ✅ User can sign in with Google successfully

## 📞 **If Still Having Issues**

1. **Double-check** all settings in Google Cloud Console
2. **Wait 10-15 minutes** for changes to propagate
3. **Clear app data** and try again
4. **Check console logs** for detailed error information

The custom URI scheme error should be resolved after these configuration changes!
