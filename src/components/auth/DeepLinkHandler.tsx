import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogleTokens } from "../../firebase/auth";
import {
  getOAuthConfig,
  validateOAuthConfig,
  debugOAuthConfig,
} from "../../config/oauth";

const DeepLinkHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDeepLink = async () => {
      try {
        // Check if we're in a Capacitor environment
        if (
          typeof window !== "undefined" &&
          (window as any).Capacitor?.isNativePlatform()
        ) {
          // Get the current URL (deep link)
          const currentUrl = window.location.href;
          console.log("Deep link URL:", currentUrl);

          // Check if this is a Google OAuth callback
          if (currentUrl.includes("/auth/google-callback")) {
            const url = new URL(currentUrl);
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");
            const error = url.searchParams.get("error");

            console.log("OAuth callback detected:", { code, state, error });

            if (error) {
              console.error("OAuth error:", error);
              navigate("/auth/login?error=" + encodeURIComponent(error));
              return;
            }

            if (!code) {
              console.error("No authorization code received");
              navigate("/auth/login?error=No authorization code received");
              return;
            }

            // Verify state parameter
            const storedState = sessionStorage.getItem("google_auth_state");
            if (!state || state !== storedState) {
              console.error("Invalid state parameter");
              navigate("/auth/login?error=Invalid state parameter");
              return;
            }

            // Get OAuth configuration
            const oauthConfig = getOAuthConfig();
            const validation = validateOAuthConfig(oauthConfig);

            // Debug OAuth configuration
            debugOAuthConfig();

            if (!validation.isValid) {
              throw new Error(
                `OAuth configuration invalid: ${validation.errors.join(", ")}`
              );
            }

            // Exchange code for tokens
            const tokenResponse = await fetch(
              "https://oauth2.googleapis.com/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  client_id: oauthConfig.clientId,
                  client_secret: oauthConfig.clientSecret,
                  code: code,
                  grant_type: "authorization_code",
                  redirect_uri: oauthConfig.redirectUri,
                }),
              }
            );

            if (!tokenResponse.ok) {
              throw new Error("Failed to exchange code for tokens");
            }

            const tokens = await tokenResponse.json();
            const { id_token, access_token } = tokens;

            if (!id_token) {
              throw new Error("No ID token received");
            }

            // Sign in with Firebase using the tokens
            const result = await signInWithGoogleTokens(id_token, access_token);
            console.log("Google authentication successful:", result);

            // Clear the state
            sessionStorage.removeItem("google_auth_state");

            // Send success message to parent window (if in popup)
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "GOOGLE_AUTH_SUCCESS",
                  idToken: id_token,
                  accessToken: access_token,
                },
                window.location.origin
              );
              window.close();
            } else {
              // For deep link, redirect to dashboard using window.location
              console.log(
                "Deep link authentication successful, redirecting to dashboard"
              );
              window.location.href = "/dashboard";
            }
          }
        }
      } catch (error: any) {
        console.error("Deep link handling error:", error);
        navigate(
          "/auth/login?error=" +
            encodeURIComponent(error.message || "Authentication failed")
        );
      }
    };

    handleDeepLink();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we complete your Google sign-in...
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeepLinkHandler;
