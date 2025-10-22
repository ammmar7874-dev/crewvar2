import React, { useEffect, useState } from "react";
import { signInWithGoogleTokens } from "../../firebase/auth";
import {
  getOAuthConfig,
  validateOAuthConfig,
  debugOAuthConfig,
} from "../../config/oauth";

const GoogleAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const error = urlParams.get("error");

        // Check for errors
        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        // Verify state parameter
        const storedState = sessionStorage.getItem("google_auth_state");
        if (!state || state !== storedState) {
          throw new Error("Invalid state parameter");
        }

        if (!code) {
          throw new Error("No authorization code received");
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

        // Create credential and sign in
        const result = await signInWithGoogleTokens(id_token, access_token);

        console.log("Google authentication successful:", result);

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_SUCCESS",
              idToken: id_token,
              accessToken: access_token,
            },
            window.location.origin
          );

          setStatus("success");
          setMessage("Authentication successful! You can close this window.");

          // Close the window after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // If not opened in popup (mobile redirect), redirect to dashboard
          setStatus("success");
          setMessage("Authentication successful! Redirecting to dashboard...");

          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      } catch (error: any) {
        console.error("Google authentication callback error:", error);

        setStatus("error");
        setMessage(error.message || "Authentication failed");

        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_ERROR",
              error: error.message || "Authentication failed",
            },
            window.location.origin
          );

          // Close the window after showing error
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          // If not opened in popup (mobile redirect), redirect to login with error
          setTimeout(() => {
            window.location.href =
              "/auth/login?error=" +
              encodeURIComponent(error.message || "Authentication failed");
          }, 3000);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Authentication
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-green-600 mb-4">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "error" && (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
