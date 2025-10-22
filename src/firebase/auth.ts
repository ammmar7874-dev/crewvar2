/**
 * Firebase Authentication Module
 *
 * Provides authentication functions and user management utilities
 * for the CrewVar application.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  // COMMENTED OUT FOR APK BUILD - Email verification disabled
  // sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  // UserCredential type available but not used in current implementation
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { signInWithCustomToken, getAuth } from "firebase/auth";
import { auth, db } from "./config";

// APK BUILD - Set Firebase auth persistence based on platform
const setAuthPersistence = async () => {
  try {
    // Check if we're in a Capacitor environment (APK)
    const isCapacitor = (window as any).Capacitor;

    if (isCapacitor) {
      // For APK builds, use session persistence and handle storage manually
      console.log(
        "🔧 APK Build detected - Using session persistence with custom storage"
      );
      await setPersistence(auth, browserLocalPersistence);
    } else {
      // For web builds, use local persistence
      console.log("🌐 Web Build detected - Using local persistence");
      await setPersistence(auth, browserLocalPersistence);
    }
  } catch (error) {
    console.error("Error setting auth persistence:", error);
  }
};

setAuthPersistence();
// UserProfile is defined locally in this file

// Re-export auth for convenience
export { auth };

// Re-export getUserProfile from firestore
export { getUserProfile } from "./firestore";

/**
 * User profile interface for Firestore documents
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePhoto?: string;
  photos?: string[];
  bio?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
  website?: string;
  departmentId?: string;
  roleId?: string;
  currentShipId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isOnline?: boolean;
  isAdmin: boolean;
  isBanned?: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  isDeleted?: boolean;
  deleteReason?: string;
  deletedAt?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Listen to authentication state changes
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Sign in with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated user
 * @throws Firebase auth error if sign-in fails
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userRef = doc(db, "users", userCredential.user.uid);
    await updateDoc(userRef, {
      isOnline: true,
      updatedAt: new Date(),
    });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign up with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @param displayName - User's display name
 * @param additionalData - Optional additional user data
 * @returns Promise resolving to the authenticated user
 * @throws Firebase auth error if sign-up fails
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  additionalData?: {
    departmentId?: string;
    roleId?: string;
    currentShipId?: string;
  }
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // COMMENTED OUT FOR APK BUILD - Email verification disabled
    // Send email verification with custom action URL
    // Use web URL for cross-device compatibility
    // The web page will detect if it's opened in the app and redirect accordingly
    // const actionCodeSettings = {
    //   url: `${window.location.origin}/auth/verification-pending`,
    //   handleCodeInApp: false, // Always use web for cross-device compatibility
    // };

    // console.log(
    //   "🔍 Sending email verification with settings:",
    //   actionCodeSettings
    // );
    // console.log("🔍 Current origin:", window.location.origin);

    // await sendEmailVerification(user, actionCodeSettings);
    // console.log("✅ Email verification sent successfully");

    // Create user document in Firestore
    const userData: Partial<UserProfile> = {
      id: user.uid,
      email: user.email!,
      displayName,
      isEmailVerified: false, // APK BUILD - Keep false for proper flow
      isActive: true,
      isAdmin: false,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add optional fields if they have values
    if (additionalData?.departmentId) {
      userData.departmentId = additionalData.departmentId;
    }
    if (additionalData?.roleId) {
      userData.roleId = additionalData.roleId;
    }
    if (additionalData?.currentShipId) {
      userData.currentShipId = additionalData.currentShipId;
    }

    // Filter out undefined, null, and empty string values
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(
        ([_, value]) => value !== undefined && value !== "" && value !== null
      )
    );

    await setDoc(doc(db, "users", user.uid), cleanUserData);

    // APK BUILD - Sign out user immediately after signup to prevent auto-login
    await signOut(auth);
    console.log("✅ User signed out after signup");

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with Google OAuth using webview implementation
 * This function is called by the webview component after successful OAuth
 *
 * @param idToken - Google ID token from OAuth flow
 * @param accessToken - Google access token from OAuth flow
 * @returns Promise resolving to the authenticated user
 * @throws Firebase auth error if sign-in fails
 */
// Google authentication via OAuth tokens (used by WebView/deep link flow)
export const signInWithGoogleTokens = async (
  idToken: string,
  accessToken: string
): Promise<User> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    // Ensure user document exists
    const userRefDoc = doc(db, "users", user.uid);
    const existing = await (await import("firebase/firestore")).getDoc(userRefDoc);
    if (!existing.exists()) {
      const userData: Partial<UserProfile> = {
        id: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        isEmailVerified: true,
        isActive: true,
        isAdmin: false,
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (user.photoURL) userData.profilePhoto = user.photoURL;
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      await setDoc(userRefDoc, cleanUserData);
    }

    await updateDoc(userRefDoc, { isOnline: true, updatedAt: new Date() });
    return user;
  } catch (error) {
    console.error("Google authentication error:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 *
 * @throws Firebase auth error if sign-out fails
 */
export const signOutUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline: false,
      updatedAt: new Date(),
    });
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Send password reset email
 *
 * @param email - Email address to send reset link to
 * @throws Firebase auth error if email sending fails
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile in Firestore
 *
 * @param userId - User ID to update
 * @param updates - Partial user profile data to update
 * @throws Firebase error if update fails
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

export const requestEmailOtp = async (email: string): Promise<void> => {
  const functions = getFunctions();
  const callable = httpsCallable(functions, "requestOtp");
  await callable({ email });
};

export const verifyEmailOtpAndLogin = async (
  email: string,
  code: string
): Promise<void> => {
  const functions = getFunctions();
  const callable = httpsCallable(functions, "verifyOtp");
  const res: any = await callable({ email, code });
  const token = res?.data?.token;
  if (!token) {
    throw new Error("No token returned");
  }
  const a = getAuth();
  await signInWithCustomToken(a, token);
};

export const signInWithGooglePopup = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const userRefDoc = doc(db, "users", user.uid);
  const existing = await getDoc(userRefDoc);
  if (!existing.exists()) {
    const userData: Partial<UserProfile> = {
      id: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      isEmailVerified: true,
      isActive: true,
      isAdmin: false,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (user.photoURL) (userData as any).profilePhoto = user.photoURL;
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    await setDoc(userRefDoc, cleanUserData);
  } else {
    await updateDoc(userRefDoc, { updatedAt: new Date(), isOnline: true });
  }
  return user;
};
