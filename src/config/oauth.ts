/**
 * OAuth Configuration for Web and Mobile
 *
 * This file handles OAuth configuration for both web and APK builds.
 * For APK builds, we use hardcoded values since environment variables
 * are not available in Capacitor builds.
 */

import { Capacitor } from "@capacitor/core";

// Google OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = {
  // Client ID for Android APK (from google-services.json)
  ANDROID_CLIENT_ID:
    "1022590083211-bgo955fc9sdia6v57k2n89cje1m6a10s.apps.googleusercontent.com",

  // Client Secret for Android APK (you need to get this from Google Console)
  ANDROID_CLIENT_SECRET: "GOCSPX-your_android_client_secret_here",

  // Web Client ID (from environment or fallback)
  WEB_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1022590083211-v161e3ces8g76aj4gsf69psbm1ugsuu7.apps.googleusercontent.com",

  // Web Client Secret (from environment)
  WEB_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",

  // Redirect URIs
  ANDROID_REDIRECT_URI: "com.crewvar.app:/auth/google-callback",
  WEB_REDIRECT_URI:
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/google-callback`
      : "http://localhost:5173/auth/google-callback",
};

/**
 * Get OAuth configuration based on platform
 */
export const getOAuthConfig = () => {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Use Android OAuth client config with custom scheme redirect
    return {
      clientId: GOOGLE_OAUTH_CONFIG.ANDROID_CLIENT_ID,
      clientSecret: GOOGLE_OAUTH_CONFIG.ANDROID_CLIENT_SECRET,
      redirectUri: GOOGLE_OAUTH_CONFIG.ANDROID_REDIRECT_URI,
      platform: "android",
    };
  } else {
    // For web builds, use environment variables with fallbacks
    return {
      clientId: GOOGLE_OAUTH_CONFIG.WEB_CLIENT_ID,
      clientSecret: GOOGLE_OAUTH_CONFIG.WEB_CLIENT_SECRET,
      redirectUri: GOOGLE_OAUTH_CONFIG.WEB_REDIRECT_URI,
      platform: "web",
    };
  }
};

/**
 * Validate OAuth configuration
 */
export const validateOAuthConfig = (
  config: ReturnType<typeof getOAuthConfig>
) => {
  const errors: string[] = [];

  // Skip validation for disabled mobile builds
  if (config.platform === "mobile_disabled") {
    return {
      isValid: true,
      errors: [],
    };
  }

  if (!config.clientId) {
    errors.push("Client ID is missing");
  }

  if (!config.clientSecret) {
    errors.push("Client Secret is missing");
  }

  if (!config.redirectUri) {
    errors.push("Redirect URI is missing");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Debug OAuth configuration
 */
export const debugOAuthConfig = () => {
  const config = getOAuthConfig();
  const validation = validateOAuthConfig(config);

  console.log("=== OAuth Configuration Debug ===");
  console.log("Platform:", config.platform);

  if (config.platform === "mobile_disabled") {
    console.log("Google Auth:", "❌ Disabled for mobile builds");
  } else {
    console.log("Client ID:", config.clientId ? "✅ Set" : "❌ Missing");
    console.log(
      "Client Secret:",
      config.clientSecret ? "✅ Set" : "❌ Missing"
    );
    console.log("Redirect URI:", config.redirectUri);
  }

  console.log("Validation:", validation.isValid ? "✅ Valid" : "❌ Invalid");
  if (!validation.isValid) {
    console.log("Errors:", validation.errors);
  }
  console.log("================================");

  return { config, validation };
};
