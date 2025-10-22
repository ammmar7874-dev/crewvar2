import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContextFirebase";
import { toast } from "react-toastify";
import {
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
} from "firebase/auth";
import { auth, db } from "../../firebase/config";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export const VerificationPendingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Get email from location state or use placeholder
  const email = location.state?.email || "your email address";

  // Check if we have verification parameters from email link
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  // Debug: Log all search parameters
  useEffect(() => {
    console.log(
      "🔍 VerificationPending - All search params:",
      Object.fromEntries(searchParams.entries())
    );
    console.log("🔍 VerificationPending - oobCode:", oobCode);
    console.log("🔍 VerificationPending - mode:", mode);
    console.log("🔍 VerificationPending - Current URL:", window.location.href);
  }, [searchParams, oobCode, mode]);

  // Auto-verify if we have the parameters from email link
  useEffect(() => {
    if (oobCode && mode === "verifyEmail") {
      console.log("🔍 VerificationPending - Starting auto-verification");
      handleEmailVerification();
    } else if (!oobCode && !mode) {
      // If no verification parameters, check if user is already verified
      console.log(
        "🔍 VerificationPending - No verification params, checking if user is already verified"
      );
      checkIfAlreadyVerified();
    }
  }, [oobCode, mode]);

  const checkIfAlreadyVerified = async () => {
    try {
      if (auth.currentUser && auth.currentUser.emailVerified) {
        console.log(
          "🔍 VerificationPending - User email is already verified, updating Firestore"
        );
        // User is already verified in Firebase Auth, update Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", auth.currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userId = userDoc.id;

          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            isEmailVerified: true,
            updatedAt: new Date(),
          });

          console.log("✅ Firestore updated - user is verified");
          toast.success("Email verified successfully!");

          // Redirect to onboarding
          navigate("/onboarding", {
            state: {
              message:
                "Email verified successfully! Please complete your profile.",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const handleEmailVerification = async () => {
    if (!oobCode || mode !== "verifyEmail") {
      return;
    }

    setIsVerifying(true);
    try {
      console.log("🔍 VerificationPending - Starting email verification");
      console.log("🔍 VerificationPending - oobCode:", oobCode);
      console.log("🔍 VerificationPending - mode:", mode);

      // Get the email from the verification code
      const actionCodeInfo = await checkActionCode(auth, oobCode);
      const emailFromCode = actionCodeInfo.data.email;
      console.log("📧 Email from verification code:", emailFromCode);

      if (!emailFromCode) {
        console.error("❌ Could not get email from verification code");
        toast.error("Invalid verification link");
        return;
      }

      // Apply the email verification code
      await applyActionCode(auth, oobCode);
      console.log("✅ Email verification applied successfully");

      // Find user in Firestore by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailFromCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("❌ No user found with email:", emailFromCode);
        toast.error("User not found. Please sign up again.");
        return;
      }

      // Get the user document
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      console.log("👤 Found user ID:", userId);

      // Update Firestore with isEmailVerified: true
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isEmailVerified: true,
        updatedAt: new Date(),
      });
      console.log(
        "✅ Firestore updated successfully - isEmailVerified set to true"
      );

      toast.success("Email verified successfully!");

      // Check if we're in Android APK for deep link handling
      const isAndroidAPK =
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isNativePlatform() &&
        (window as any).Capacitor?.getPlatform() === "android";

      if (isAndroidAPK) {
        // For Android APK, redirect back to app using deep link
        console.log("🔗 Android APK detected - redirecting to app dashboard");
        window.location.href = "com.crewvar.app://dashboard";
      } else {
        // For web or cross-device, show success message with instructions
        console.log("🌐 Web/cross-device verification - showing success page");

        // Show a success page with instructions to return to the app
        setTimeout(() => {
          // Redirect to a success page that tells user to return to their mobile app
          window.location.href = `${window.location.origin}/auth/verification-success`;
        }, 2000);
      }
    } catch (error: any) {
      console.error("❌ Email verification failed:", error);
      toast.error("Email verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);

    try {
      if (auth.currentUser) {
        const actionCodeSettings = {
          // Use web URL for cross-device compatibility
          url: `${window.location.origin}/auth/verification-pending`,
          handleCodeInApp: false, // Always use web for cross-device compatibility
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        toast.success("Verification email sent! Check your inbox.");
      } else {
        toast.error("No user logged in. Please sign in again.");
        navigate("/auth/login");
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/auth/login");
  };

  // Show loading state if verifying
  if (isVerifying) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#B9F3DF" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#069B93] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#B9F3DF" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verification Required
              </h1>
              <p className="text-gray-600">
                Please verify your email address to access all features.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">ℹ</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Check Your Email
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      We've sent a verification link to <strong>{email}</strong>
                      . Click the link to verify your account and unlock all
                      features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">⚠</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900">
                      Limited Access
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Until your email is verified, you cannot explore ships or
                      view profiles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-yellow-800">
                    Important: Check Your Spam Folder!
                  </p>
                </div>
                <p className="text-sm text-yellow-700">
                  Gmail often sends Firebase verification emails to spam. Please
                  check your spam/junk folder and mark the email as "Not Spam"
                  to receive future emails.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Still having trouble? Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
