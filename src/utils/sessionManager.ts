/**
 * Session Management for APK Builds
 *
 * This module handles session persistence for Capacitor/APK builds
 * where Firebase Auth persistence doesn't work properly.
 *
 * Uses @capacitor/preferences for storage with additional security measures.
 */

import { Preferences } from "@capacitor/preferences";
import { User } from "firebase/auth";

const SESSION_KEY = "crewvar_user_session";
const USER_PROFILE_KEY = "crewvar_user_profile";
const SESSION_TIMESTAMP_KEY = "crewvar_session_timestamp";
const SECURITY_KEY = "crewvar_security_hash";

/**
 * Generate a simple hash for basic security validation
 */
const generateSecurityHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Validate session integrity
 */
const validateSessionIntegrity = async (
  session: StoredSession
): Promise<boolean> => {
  try {
    const sessionString = JSON.stringify(session);
    const expectedHash = generateSecurityHash(sessionString);

    const { value: storedHash } = await Preferences.get({ key: SECURITY_KEY });

    if (!storedHash) {
      console.warn("No security hash found for session");
      return false;
    }

    return expectedHash === storedHash;
  } catch (error) {
    console.error("Error validating session integrity:", error);
    return false;
  }
};

export interface StoredSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  accessToken?: string;
  refreshToken?: string;
  timestamp: number;
  expiresAt?: number;
  lastActivity: number;
}

export interface StoredUserProfile {
  id: string;
  email: string;
  displayName: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  profilePhoto?: string;
  departmentId?: string;
  roleId?: string;
  currentShipId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save user session to Capacitor Preferences
 */
export const saveUserSession = async (
  user: User,
  userProfile?: any
): Promise<void> => {
  try {
    console.log("💾 SessionManager - Saving session for user:", user.uid);

    const session: StoredSession = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };

    // Get Firebase Auth tokens if available
    try {
      const token = await user.getIdToken();
      session.accessToken = token;

      // Set token expiration (Firebase tokens typically expire in 1 hour)
      session.expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour from now

      console.log("💾 SessionManager - Got Firebase token");
    } catch (error) {
      console.warn("Could not get Firebase token:", error);
    }

    // Save session
    await Preferences.set({
      key: SESSION_KEY,
      value: JSON.stringify(session),
    });
    console.log("💾 SessionManager - Session saved to Preferences");

    // Save user profile if provided
    if (userProfile) {
      await Preferences.set({
        key: USER_PROFILE_KEY,
        value: JSON.stringify(userProfile),
      });
      console.log("💾 SessionManager - Profile saved to Preferences");
    }

    // Save session timestamp for activity tracking
    await Preferences.set({
      key: SESSION_TIMESTAMP_KEY,
      value: Date.now().toString(),
    });

    // Save security hash for integrity validation
    const sessionString = JSON.stringify(session);
    const securityHash = generateSecurityHash(sessionString);
    await Preferences.set({
      key: SECURITY_KEY,
      value: securityHash,
    });

    console.log("✅ User session saved to Capacitor storage");
  } catch (error) {
    console.error("Error saving user session:", error);
    throw error;
  }
};

/**
 * Get stored user session from Capacitor Preferences
 */
export const getUserSession = async (): Promise<StoredSession | null> => {
  try {
    console.log("🔍 SessionManager - Getting stored session...");
    const result = await Preferences.get({ key: SESSION_KEY });

    if (!result.value) {
      console.log("🔍 SessionManager - No session found in storage");
      return null;
    }

    const session: StoredSession = JSON.parse(result.value);
    console.log("🔍 SessionManager - Found session:", session);

    // Validate session integrity
    const isValid = await validateSessionIntegrity(session);
    if (!isValid) {
      console.log(
        "🔍 SessionManager - Session integrity validation failed, clearing..."
      );
      await clearUserSession();
      return null;
    }

    // Check if session is expired (30 days max, or token expired)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const isSessionExpired = session.timestamp < thirtyDaysAgo;
    const isTokenExpired = session.expiresAt && session.expiresAt < Date.now();

    if (isSessionExpired) {
      console.log("🔍 SessionManager - Session expired (30 days), clearing...");
      await clearUserSession();
      return null;
    }

    if (isTokenExpired) {
      console.log("🔍 SessionManager - Token expired, but session still valid");
      // Don't clear session, just note that token needs refresh
      session.accessToken = undefined;
      session.expiresAt = undefined;
    }

    console.log("🔍 SessionManager - Session is valid");
    return session;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
};

/**
 * Get stored user profile from Capacitor Preferences
 */
export const getUserProfile = async (): Promise<StoredUserProfile | null> => {
  try {
    console.log("🔍 SessionManager - Getting stored profile...");
    const result = await Preferences.get({ key: USER_PROFILE_KEY });

    if (!result.value) {
      console.log("🔍 SessionManager - No profile found in storage");
      return null;
    }

    const profile = JSON.parse(result.value);
    console.log("🔍 SessionManager - Found profile:", profile);
    return profile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

/**
 * Clear user session from Capacitor Preferences
 */
export const clearUserSession = async (): Promise<void> => {
  try {
    await Preferences.remove({ key: SESSION_KEY });
    await Preferences.remove({ key: USER_PROFILE_KEY });
    await Preferences.remove({ key: SESSION_TIMESTAMP_KEY });
    await Preferences.remove({ key: SECURITY_KEY });
    console.log("✅ User session cleared from Capacitor storage");
  } catch (error) {
    console.error("Error clearing user session:", error);
  }
};

/**
 * Check if user has a valid stored session
 */
export const hasValidSession = async (): Promise<boolean> => {
  const session = await getUserSession();
  return session !== null;
};

/**
 * Update session activity timestamp (call this on app activity)
 */
export const updateSessionTimestamp = async (): Promise<void> => {
  try {
    const session = await getUserSession();
    if (session) {
      session.lastActivity = Date.now();
      await Preferences.set({
        key: SESSION_KEY,
        value: JSON.stringify(session),
      });

      // Also update the separate timestamp key
      await Preferences.set({
        key: SESSION_TIMESTAMP_KEY,
        value: Date.now().toString(),
      });
    }
  } catch (error) {
    console.error("Error updating session timestamp:", error);
  }
};

/**
 * Refresh Firebase token for stored session
 */
export const refreshStoredToken = async (user: User): Promise<void> => {
  try {
    const session = await getUserSession();
    if (session && session.uid === user.uid) {
      const token = await user.getIdToken();
      session.accessToken = token;
      session.expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour from now
      session.lastActivity = Date.now();

      await Preferences.set({
        key: SESSION_KEY,
        value: JSON.stringify(session),
      });

      console.log("✅ Session token refreshed");
    }
  } catch (error) {
    console.error("Error refreshing stored token:", error);
  }
};

/**
 * Check if session needs token refresh
 */
export const needsTokenRefresh = async (): Promise<boolean> => {
  try {
    const session = await getUserSession();
    if (!session || !session.expiresAt) return false;

    // Refresh token 5 minutes before expiration
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return session.expiresAt < fiveMinutesFromNow;
  } catch (error) {
    console.error("Error checking token refresh need:", error);
    return false;
  }
};
