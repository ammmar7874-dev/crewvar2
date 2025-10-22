/**
 * Remember Credentials Utility for APK Builds
 *
 * This module handles storing and retrieving email/password
 * for the "Remember Me" functionality in Capacitor/APK builds.
 */

import { Preferences } from "@capacitor/preferences";

const REMEMBERED_EMAIL_KEY = "crewvar_remembered_email";
const REMEMBERED_PASSWORD_KEY = "crewvar_remembered_password";
const REMEMBER_ME_KEY = "crewvar_remember_me";

export interface RememberedCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Save remembered credentials to Capacitor Preferences
 */
export const saveRememberedCredentials = async (
  email: string,
  password: string,
  rememberMe: boolean
): Promise<void> => {
  try {
    if (rememberMe) {
      // Save credentials
      await Preferences.set({
        key: REMEMBERED_EMAIL_KEY,
        value: email,
      });

      await Preferences.set({
        key: REMEMBERED_PASSWORD_KEY,
        value: password,
      });

      await Preferences.set({
        key: REMEMBER_ME_KEY,
        value: "true",
      });

      console.log("✅ Credentials saved for remember me");
    } else {
      // Clear credentials if remember me is unchecked
      await clearRememberedCredentials();
    }
  } catch (error) {
    console.error("Error saving remembered credentials:", error);
  }
};

/**
 * Get remembered credentials from Capacitor Preferences
 */
export const getRememberedCredentials =
  async (): Promise<RememberedCredentials | null> => {
    try {
      const [emailResult, passwordResult, rememberMeResult] = await Promise.all(
        [
          Preferences.get({ key: REMEMBERED_EMAIL_KEY }),
          Preferences.get({ key: REMEMBERED_PASSWORD_KEY }),
          Preferences.get({ key: REMEMBER_ME_KEY }),
        ]
      );

      const email = emailResult.value;
      const password = passwordResult.value;
      const rememberMe = rememberMeResult.value === "true";

      if (email && password && rememberMe) {
        console.log("🔍 Found remembered credentials");
        return {
          email,
          password,
          rememberMe,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting remembered credentials:", error);
      return null;
    }
  };

/**
 * Clear remembered credentials from Capacitor Preferences
 */
export const clearRememberedCredentials = async (): Promise<void> => {
  try {
    await Promise.all([
      Preferences.remove({ key: REMEMBERED_EMAIL_KEY }),
      Preferences.remove({ key: REMEMBERED_PASSWORD_KEY }),
      Preferences.remove({ key: REMEMBER_ME_KEY }),
    ]);

    console.log("✅ Remembered credentials cleared");
  } catch (error) {
    console.error("Error clearing remembered credentials:", error);
  }
};

/**
 * Check if remember me is enabled
 */
export const isRememberMeEnabled = async (): Promise<boolean> => {
  try {
    const result = await Preferences.get({ key: REMEMBER_ME_KEY });
    return result.value === "true";
  } catch (error) {
    console.error("Error checking remember me status:", error);
    return false;
  }
};



