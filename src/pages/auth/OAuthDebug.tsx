import React, { useState, useEffect } from "react";

const OAuthDebugPage: React.FC = () => {
  const [oauthUrl, setOauthUrl] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [redirectUri, setRedirectUri] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCapacitor, setIsCapacitor] = useState<boolean>(false);
  const [serverClientId] = useState<string>(
    "1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com"
  );

  useEffect(() => {
    try {
      // Check if running in Capacitor
      const capacitorCheck =
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isNativePlatform();
      setIsCapacitor(capacitorCheck);

      // Generate state parameter
      const state =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Get client ID
      const id = capacitorCheck
        ? serverClientId
        : import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          import.meta.env.VITE_FIREBASE_API_KEY;

      setClientId(id || "NOT_FOUND");

      if (!id) {
        setError(
          "No Google Client ID found. Please set VITE_GOOGLE_CLIENT_ID or VITE_FIREBASE_API_KEY in your environment variables."
        );
        return;
      }

      // Build OAuth URL
      const redirectUriValue = capacitorCheck
        ? "com.crewvar.app:/auth/google-callback"
        : window.location.origin + "/auth/google-callback";
      setRedirectUri(redirectUriValue);

      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

      url.searchParams.set("client_id", id);
      url.searchParams.set("redirect_uri", redirectUriValue);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "openid email profile");
      url.searchParams.set("state", state);
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "select_account");
      url.searchParams.set("include_granted_scopes", "true");

      setOauthUrl(url.toString());
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const testOAuthUrl = () => {
    if (oauthUrl) {
      window.open(oauthUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Google OAuth Debug Page</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Platform & Client ID Info:
            </h2>
            <div className="bg-gray-100 p-3 rounded">
              <p>
                <strong>Platform:</strong>{" "}
                {isCapacitor ? "Mobile/Capacitor (Android)" : "Web Browser"}
              </p>
              <p>
                <strong>Android Server Client ID:</strong> {serverClientId}
              </p>
              <p>
                <strong>Used Client ID:</strong> {clientId}
              </p>
              <p>
                <strong>Redirect URI:</strong> {redirectUri}
              </p>
              <p>
                <strong>VITE_GOOGLE_CLIENT_ID:</strong>{" "}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID || "NOT_SET"}
              </p>
              <p>
                <strong>VITE_FIREBASE_API_KEY:</strong>{" "}
                {import.meta.env.VITE_FIREBASE_API_KEY || "NOT_SET"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Generated OAuth URL:</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p className="break-all text-sm">{oauthUrl}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={testOAuthUrl}
              disabled={!oauthUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Test OAuth URL
            </button>

            <button
              onClick={() => (window.location.href = "/auth/login")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Login
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Make sure you have set <code>VITE_GOOGLE_CLIENT_ID</code> in
                your <code>.env.local</code> file
              </li>
              <li>
                The Client ID should be from Google Cloud Console &gt; APIs
                &amp; Services &gt; Credentials &gt; OAuth 2.0 Client ID
              </li>
              <li>
                Make sure the redirect URI{" "}
                <code>{window.location.origin}/auth/google-callback</code> is
                added to your OAuth client
              </li>
              <li>Click "Test OAuth URL" to verify the URL works</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthDebugPage;
