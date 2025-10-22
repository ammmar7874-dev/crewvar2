import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContextFirebase";
import { auth } from "../../firebase/config";

const AuthDebugPage: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authState, setAuthState] = useState<string>("");

  useEffect(() => {
    // Get Firebase auth state
    setFirebaseUser(auth.currentUser);

    // Check session storage
    const googleAuthState = sessionStorage.getItem("google_auth_state");
    setAuthState(googleAuthState || "No auth state");

    // Listen for auth changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  const testAuth = async () => {
    try {
      const user = auth.currentUser;
      console.log("Current Firebase user:", user);

      if (user) {
        console.log("✅ User is authenticated");
        console.log("Email:", user.email);
        console.log("UID:", user.uid);
        console.log("Display Name:", user.displayName);
      } else {
        console.log("❌ No user authenticated");
      }
    } catch (error) {
      console.error("Auth test error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

        <div className="space-y-4">
          {/* Auth Context Status */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Auth Context Status:</h2>
            <p>
              <strong>Loading:</strong> {loading ? "Yes" : "No"}
            </p>
            <p>
              <strong>Current User:</strong>{" "}
              {currentUser ? currentUser.email : "None"}
            </p>
            <p>
              <strong>User Profile:</strong>{" "}
              {userProfile ? "Loaded" : "Not loaded"}
            </p>
            <p>
              <strong>User ID:</strong> {currentUser?.uid || "None"}
            </p>
          </div>

          {/* Firebase Auth Status */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">
              Firebase Auth Status:
            </h2>
            <p>
              <strong>Firebase User:</strong>{" "}
              {firebaseUser ? firebaseUser.email : "None"}
            </p>
            <p>
              <strong>Email Verified:</strong>{" "}
              {firebaseUser?.emailVerified ? "Yes" : "No"}
            </p>
            <p>
              <strong>Display Name:</strong>{" "}
              {firebaseUser?.displayName || "None"}
            </p>
            <p>
              <strong>Photo URL:</strong> {firebaseUser?.photoURL || "None"}
            </p>
          </div>

          {/* Session Storage */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Session Storage:</h2>
            <p>
              <strong>Google Auth State:</strong> {authState}
            </p>
          </div>

          {/* Platform Info */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Platform Info:</h2>
            <p>
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
            <p>
              <strong>Is Capacitor:</strong>{" "}
              {typeof window !== "undefined" &&
              (window as any).Capacitor?.isNativePlatform()
                ? "Yes"
                : "No"}
            </p>
            <p>
              <strong>Platform:</strong>{" "}
              {(window as any).Capacitor?.getPlatform() || "Web"}
            </p>
          </div>

          {/* Test Button */}
          <div className="mt-6">
            <button
              onClick={testAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Authentication
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">How to Use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open this page in your APK</li>
              <li>Try Google Sign-In</li>
              <li>Check the status above</li>
              <li>Look for console logs in Android Studio Logcat</li>
              <li>Use "Test Authentication" button to check Firebase auth</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
