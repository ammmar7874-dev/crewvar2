import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithGoogleTokens } from "../../firebase/auth";
import {
  getOAuthConfig,
  validateOAuthConfig,
  debugOAuthConfig,
} from "../../config/oauth";

interface GlobalDeepLinkHandlerProps {
  children: React.ReactNode;
}

const GlobalDeepLinkHandler: React.FC<GlobalDeepLinkHandlerProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessingDeepLink, setIsProcessingDeepLink] = useState(false);
  const processedDeepLinkRef = useRef<string | null>(null);

  useEffect(() => {
    const handleDeepLink = async () => {
      try {
        // Check if we're in a Capacitor environment
        const isCapacitor =
          typeof window !== "undefined" &&
          (window as any).Capacitor?.isNativePlatform();

        if (!isCapacitor) {
          return; // Only handle deep links in mobile/Capacitor
        }

        // Get the current URL
        const currentUrl = window.location.href;
        console.log("🔗 Global Deep Link Handler - Current URL:", currentUrl);

        // Prevent duplicate processing of the same deep link
        if (processedDeepLinkRef.current === currentUrl) {
          console.log("🔗 Deep link already processed, skipping");
          return;
        }

        // Check if this is an email verification deep link
        if (currentUrl.includes("/auth/verification-pending")) {
          console.log("🔗 Email verification deep link detected");

          // Mark this deep link as being processed
          processedDeepLinkRef.current = currentUrl;
          setIsProcessingDeepLink(true);

          // Navigate to the verification pending page
          navigate("/auth/verification-pending", { replace: true });
          setIsProcessingDeepLink(false);
          return;
        }

        // Check if this is a Google OAuth callback
        if (currentUrl.includes("/auth/google-callback")) {
          console.log("🔗 OAuth callback detected in global handler");

          // Mark this deep link as being processed
          processedDeepLinkRef.current = currentUrl;
          setIsProcessingDeepLink(true);

          const url = new URL(currentUrl);
          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const error = url.searchParams.get("error");

          console.log("🔗 OAuth parameters:", { code: !!code, state, error });

          if (error) {
            console.error("🔗 OAuth error:", error);
            setIsProcessingDeepLink(false);
            navigate("/auth/login?error=" + encodeURIComponent(error));
            return;
          }

          if (!code) {
            console.error("🔗 No authorization code received");
            setIsProcessingDeepLink(false);
            navigate("/auth/login?error=No authorization code received");
            return;
          }

          // Verify state parameter
          const storedState = sessionStorage.getItem("google_auth_state");
          if (!state || state !== storedState) {
            console.error("🔗 Invalid state parameter");
            setIsProcessingDeepLink(false);
            navigate("/auth/login?error=Invalid state parameter");
            return;
          }

          // Get OAuth configuration
          const oauthConfig = getOAuthConfig();
          const validation = validateOAuthConfig(oauthConfig);

          // Debug OAuth configuration
          debugOAuthConfig();

          if (!validation.isValid) {
            console.error("🔗 OAuth configuration invalid:", validation.errors);
            setIsProcessingDeepLink(false);
            navigate("/auth/login?error=OAuth configuration invalid");
            return;
          }

          console.log("🔗 Exchanging code for tokens...");

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
            const errorText = await tokenResponse.text();
            console.error("🔗 Token exchange failed:", errorText);
            console.error("🔗 Request details:", {
              clientId: oauthConfig.clientId,
              clientSecret: oauthConfig.clientSecret ? "***" : "MISSING",
              redirectUri: oauthConfig.redirectUri,
              platform: oauthConfig.platform,
            });
            throw new Error(`Token exchange failed: ${errorText}`);
          }

          const tokens = await tokenResponse.json();
          const { id_token, access_token } = tokens;

          if (!id_token) {
            throw new Error("No ID token received");
          }

          console.log("🔗 Tokens received, signing in with Firebase...");

          // Sign in with Firebase using the tokens
          const result = await signInWithGoogleTokens(id_token, access_token);
          console.log("🔗 Google authentication successful:", result);

          // Clear the state
          sessionStorage.removeItem("google_auth_state");

          console.log(
            "🔗 Authentication complete, redirecting to dashboard..."
          );
          setIsProcessingDeepLink(false);

          // Navigate to dashboard
          navigate("/dashboard", { replace: true });
        }
      } catch (error: any) {
        console.error("🔗 Global deep link handling error:", error);
        setIsProcessingDeepLink(false);
        navigate(
          "/auth/login?error=" +
            encodeURIComponent(error.message || "Authentication failed"),
          { replace: true }
        );
      }
    };

    // Only process deep links if we're not already on a callback route
    if (
      !location.pathname.includes("/auth/google-callback") &&
      !location.pathname.includes("/auth/verification-pending")
    ) {
      handleDeepLink();
    }
  }, [navigate, location.pathname]);

  // Show loading state while processing deep link
  if (isProcessingDeepLink) {
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
  }

  return <>{children}</>;
};

export default GlobalDeepLinkHandler;
