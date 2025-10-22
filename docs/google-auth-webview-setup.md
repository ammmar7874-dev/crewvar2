# Google Sign-In WebView Implementation

This implementation provides a webview-based Google Sign-In solution that keeps the authentication process within the app, avoiding external browser redirects that can cause routing issues on mobile devices.

## Features

- **In-App Authentication**: Uses a popup window instead of external browser redirects
- **Mobile-Friendly**: Works seamlessly on both web and mobile platforms
- **Secure**: Implements proper state parameter validation and origin verification
- **User-Friendly**: Provides clear loading states and error handling

## Setup Instructions

### 1. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" > "Credentials"
4. Create or edit your OAuth 2.0 Client ID
5. **Important**: Make sure you're using the **OAuth 2.0 Client ID**, not the Firebase API key
6. Add the following authorized redirect URIs:
   - `http://localhost:5173/auth/google-callback` (for development)
   - `https://yourdomain.com/auth/google-callback` (for production)
7. Copy the **Client ID** and **Client Secret** from the OAuth 2.0 Client ID credentials

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Firebase Configuration (already existing)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Google OAuth Configuration (new - REQUIRED)
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Important Notes:**

- `VITE_GOOGLE_CLIENT_ID` should be the OAuth 2.0 Client ID from Google Cloud Console
- `VITE_GOOGLE_CLIENT_SECRET` should be the OAuth 2.0 Client Secret from Google Cloud Console
- These are different from the Firebase API key and are specifically for OAuth authentication

### 3. Firebase Configuration

Ensure your Firebase project has Google Sign-In enabled:

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Google" provider
3. Add your domain to authorized domains if needed

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"**

   - Opens a popup window with Google OAuth URL
   - Generates a unique state parameter for security

2. **Google OAuth Process**

   - User completes authentication in the popup
   - Google redirects to `/auth/google-callback` with authorization code

3. **Token Exchange**

   - Callback page exchanges authorization code for access and ID tokens
   - Creates Firebase credential from the tokens

4. **Firebase Authentication**

   - Signs in user with Firebase using the credential
   - Creates or updates user profile in Firestore

5. **App Integration**
   - Sends success message to parent window
   - Closes popup and navigates to dashboard

### Security Features

- **State Parameter Validation**: Prevents CSRF attacks
- **Origin Verification**: Ensures messages come from trusted sources
- **Session Storage Cleanup**: Removes sensitive data after use
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Components

### GoogleAuthWebView

- Main component that handles the popup window
- Manages loading states and error handling
- Communicates with callback page via postMessage

### GoogleAuthCallback

- Handles the OAuth redirect from Google
- Exchanges authorization code for tokens
- Performs Firebase authentication
- Communicates results back to parent window

### Updated LoginForm & SignupForm

- Integrate the webview component
- Handle success/error callbacks
- Provide seamless user experience

## Testing

### Development Testing

1. Start your development server
2. Navigate to login/signup page
3. Click "Sign in with Google"
4. Complete authentication in popup
5. Verify successful login and navigation

### Mobile Testing

1. Build and deploy your app
2. Test on mobile device
3. Verify popup opens correctly
4. Complete authentication flow
5. Confirm proper navigation after login

## Troubleshooting

### Common Issues

1. **Popup Blocked**

   - Ensure popups are allowed for your domain
   - Check browser popup blocker settings

2. **CORS Errors**

   - Verify redirect URIs are correctly configured
   - Check that domains match exactly

3. **Invalid Client Secret**

   - Ensure `VITE_GOOGLE_CLIENT_SECRET` is set correctly
   - Verify the secret matches your OAuth client

4. **State Parameter Mismatch**
   - Check that sessionStorage is working
   - Verify state parameter generation

### Debug Mode

Enable debug logging by adding to your browser console:

```javascript
localStorage.setItem("debug", "true");
```

## Benefits

- **No External Browser**: Keeps users within your app
- **Better UX**: Seamless authentication experience
- **Mobile Optimized**: Works consistently across platforms
- **Secure**: Implements OAuth 2.0 best practices
- **Maintainable**: Clean, modular code structure

## Future Enhancements

- Add support for other OAuth providers (Facebook, Apple, etc.)
- Implement biometric authentication for mobile
- Add offline authentication support
- Enhance error recovery mechanisms
