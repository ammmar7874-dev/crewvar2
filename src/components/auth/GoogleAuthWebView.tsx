import React, { useState, useEffect } from "react";
import { signInWithGoogleTokens } from "../../firebase/auth";
import {
  getOAuthConfig,
  validateOAuthConfig,
  debugOAuthConfig,
} from "../../config/oauth";

interface GoogleAuthWebViewProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const GoogleAuthWebView: React.FC<GoogleAuthWebViewProps> = ({
  onSuccess,
  onError,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Generate a unique state parameter for security
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Store state in sessionStorage for verification
  useEffect(() => {
    sessionStorage.setItem("google_auth_state", state);

    // Check if we're on mobile
    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(mobileCheck);
  }, [state]);

  // Listen for messages from the callback page and deep link authentication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        const { idToken, accessToken } = event.data;
        handleGoogleAuthSuccess(idToken, accessToken);
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        onError(event.data.error || "Authentication failed");
        setIsLoading(false);
      }
    };

    // Check if we're in Capacitor and listen for authentication success
    const isCapacitor =
      typeof window !== "undefined" &&
      (window as any).Capacitor?.isNativePlatform();

    // For mobile, the GlobalDeepLinkHandler will process the authentication
    // We just need to wait for the redirect to complete
    if (isCapacitor) {
      console.log(
        "Capacitor detected - GlobalDeepLinkHandler will process authentication"
      );

      // Simple timeout to close popup after redirect
      const timeout = setTimeout(() => {
        console.log("Mobile redirect timeout - closing popup");
        setIsLoading(false);
        onSuccess();
      }, 8000); // 8 seconds timeout

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("message", handleMessage);
      };
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onError]);

  const handleGoogleAuthSuccess = async (
    idToken: string,
    accessToken: string
  ) => {
    try {
      setIsLoading(true);

      // Use the new function from firebase/auth.ts
      const result = await signInWithGoogleTokens(idToken, accessToken);

      console.log("Google authentication successful:", result);

      // Clean up session storage
      sessionStorage.removeItem("google_auth_state");

      onSuccess();
    } catch (error: any) {
      console.error("Google authentication error:", error);
      onError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get OAuth configuration
      const oauthConfig = getOAuthConfig();
      const validation = validateOAuthConfig(oauthConfig);

      // Debug OAuth configuration
      debugOAuthConfig();

      // Check if Google auth is disabled for mobile
      if (oauthConfig.platform === "mobile_disabled") {
        throw new Error("Google authentication is disabled for mobile builds");
      }

      if (!validation.isValid) {
        throw new Error(
          `OAuth configuration invalid: ${validation.errors.join(", ")}`
        );
      }

      // Build OAuth URL with proper parameters
      const googleAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth"
      );

      googleAuthUrl.searchParams.set("client_id", oauthConfig.clientId);
      googleAuthUrl.searchParams.set("redirect_uri", oauthConfig.redirectUri);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("state", state);
      googleAuthUrl.searchParams.set("access_type", "offline");
      googleAuthUrl.searchParams.set("prompt", "select_account");
      googleAuthUrl.searchParams.set("include_granted_scopes", "true");

      const finalUrl = googleAuthUrl.toString();

      console.log("=== Google OAuth Debug Info ===");
      console.log("Platform:", oauthConfig.platform);
      console.log("Client ID:", oauthConfig.clientId);
      console.log(
        "Client Secret:",
        oauthConfig.clientSecret ? "***" : "MISSING"
      );
      console.log("Redirect URI:", oauthConfig.redirectUri);
      console.log("State:", state);
      console.log("Final OAuth URL:", finalUrl);
      console.log(
        "Validation:",
        validation.isValid ? "✅ Valid" : "❌ Invalid"
      );
      if (!validation.isValid) {
        console.log("Errors:", validation.errors);
      }
      console.log("===============================");

      if (isMobile) {
        // For mobile, redirect in the same window
        window.location.href = finalUrl;

        // Auto-close popup after redirect (mobile)
        setTimeout(() => {
          console.log("Auto-closing popup for mobile redirect");
          onSuccess();
        }, 8000); // Close after 8 seconds
      } else {
        // For desktop, use popup
        const popup = window.open(
          finalUrl,
          "googleAuth",
          "width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
        );

        if (!popup) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        // Check if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error opening Google auth:", error);
      setError(error.message || "Failed to open authentication window");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sign in with Google
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          {isLoading && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {isMobile
                  ? "Redirecting to Google Sign-In"
                  : "Opening Google Sign-In"}
              </h4>
              <p className="text-gray-600 mb-4">
                {isMobile
                  ? "You will be redirected to Google to complete the sign-in process."
                  : "Please complete the sign-in process in the popup window."}
              </p>

              {isMobile && (
                <div className="mt-4">
                  <button
                    onClick={onClose}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <>
              <div className="text-red-600 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Error
              </h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </>
          )}

          {!isLoading && !error && (
            <>
              <div className="text-blue-600 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Sign In
              </h4>
              <p className="text-gray-600 mb-4">
                {isMobile
                  ? "Click the button below to sign in with Google."
                  : "Click the button below to open Google Sign-In in a new window."}
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isMobile ? "Sign in with Google" : "Open Google Sign-In"}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            {isMobile
              ? "You will be redirected to Google and then back to the app after authentication."
              : "A popup window will open for Google authentication. Make sure to allow popups for this site."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthWebView;
