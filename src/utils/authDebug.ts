/**
 * Authentication Debug Utilities
 *
 * This module provides debugging utilities for authentication flow
 * to help troubleshoot session persistence issues.
 */

import {
  getUserSession,
  getUserProfile,
  hasValidSession,
} from "./sessionManager";

export const debugAuthState = async () => {
  console.log("🔍 === AUTH DEBUG INFO ===");

  try {
    // Check if we're in Capacitor environment
    const isCapacitor = (window as any).Capacitor;
    console.log("📱 Environment:", isCapacitor ? "Capacitor (APK)" : "Web");

    // Check stored session
    const session = await getUserSession();
    console.log("🔐 Stored Session:", session ? "Found" : "Not found");
    if (session) {
      console.log("   - UID:", session.uid);
      console.log("   - Email:", session.email);
      console.log("   - Timestamp:", new Date(session.timestamp).toISOString());
      console.log(
        "   - Last Activity:",
        new Date(session.lastActivity).toISOString()
      );
      console.log("   - Has Token:", !!session.accessToken);
      console.log(
        "   - Token Expires:",
        session.expiresAt ? new Date(session.expiresAt).toISOString() : "N/A"
      );
    }

    // Check stored profile
    const profile = await getUserProfile();
    console.log("👤 Stored Profile:", profile ? "Found" : "Not found");
    if (profile) {
      console.log("   - ID:", profile.id);
      console.log("   - Email:", profile.email);
      console.log("   - Display Name:", profile.displayName);
      console.log("   - Is Active:", profile.isActive);
    }

    // Check session validity
    const isValid = await hasValidSession();
    console.log("✅ Session Valid:", isValid);

    // Check Firebase Auth state
    const { auth } = await import("../firebase/auth");
    const currentUser = auth.currentUser;
    console.log(
      "🔥 Firebase Auth User:",
      currentUser ? "Logged in" : "Not logged in"
    );
    if (currentUser) {
      console.log("   - UID:", currentUser.uid);
      console.log("   - Email:", currentUser.email);
      console.log("   - Email Verified:", currentUser.emailVerified);
    }
  } catch (error) {
    console.error("❌ Debug error:", error);
  }

  console.log("🔍 === END AUTH DEBUG ===");
};

export const clearAllAuthData = async () => {
  console.log("🗑️ Clearing all authentication data...");

  try {
    const { clearUserSession } = await import("./sessionManager");
    await clearUserSession();

    const { auth } = await import("../firebase/auth");
    await auth.signOut();

    console.log("✅ All authentication data cleared");
  } catch (error) {
    console.error("❌ Error clearing auth data:", error);
  }
};

// Make debug functions available globally in development
if (process.env.NODE_ENV === "development") {
  (window as any).debugAuth = debugAuthState;
  (window as any).clearAuth = clearAllAuthData;
}



