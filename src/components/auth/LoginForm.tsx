import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContextFirebase";
import { toast } from "react-toastify";
// Google authentication imports commented out for mobile builds
// import { FcGoogle } from "react-icons/fc";
// import GoogleAuthWebView from "./GoogleAuthWebView";
import { HiEye, HiEyeSlash } from "react-icons/hi2";
import {
  saveRememberedCredentials,
  getRememberedCredentials,
  clearRememberedCredentials,
} from "../../utils/rememberCredentials";
// import { signInWithGooglePopup } from "../../firebase/auth";

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Google WebView state commented out for mobile builds
  // const [showGoogleWebView, setShowGoogleWebView] = useState(false);

  // APK BUILD - Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // APK BUILD - Remember me functionality
  const [rememberMe, setRememberMe] = useState(false);

  // No OTP state (removed)

  // APK BUILD - Load remembered credentials on component mount
  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const credentials = await getRememberedCredentials();
        if (credentials) {
          setEmail(credentials.email);
          setPassword(credentials.password);
          setRememberMe(credentials.rememberMe);
          console.log("✅ Remembered credentials loaded");
        }
      } catch (error) {
        console.error("Error loading remembered credentials:", error);
      }
    };

    loadRememberedCredentials();
  }, []);

  // No OTP countdown (removed)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);

      // APK BUILD - Save credentials if remember me is checked
      await saveRememberedCredentials(email, password, rememberMe);

      console.log("Login successful!");
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
      // Navigate to dashboard, OnboardingGuard will redirect to onboarding if needed
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different types of errors with user-friendly messages
      let userFriendlyMessage = "Login failed. Please try again.";

      if (error.response?.status === 401) {
        userFriendlyMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (
        error.response?.status === 403 &&
        error.response?.data?.requiresVerification
      ) {
        // COMMENTED OUT FOR APK BUILD - Email verification disabled
        // Handle email verification required
        // userFriendlyMessage =
        //   "Please verify your email address before logging in.";
        // toast.error(userFriendlyMessage, {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        // });

        // // Redirect to verification pending page
        // navigate("/auth/verification-pending", {
        //   state: { email: email },
        // });
        // return;

        // APK BUILD - Treat verification error as regular login error
        userFriendlyMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.response?.status === 404) {
        userFriendlyMessage =
          "Account not found. Please check your email address or create a new account.";
      } else if (error.response?.status === 429) {
        userFriendlyMessage =
          "Too many login attempts. Please wait a moment and try again.";
      } else if (error.response?.status >= 500) {
        userFriendlyMessage = "Server error. Please try again later.";
      } else if (
        error.message?.includes("Network Error") ||
        error.code === "NETWORK_ERROR"
      ) {
        userFriendlyMessage =
          "Connection error. Please check your internet connection and try again.";
      } else if (error.response?.data?.error) {
        // Use backend error message if it's user-friendly
        const backendError = error.response.data.error.toLowerCase();
        if (
          backendError.includes("invalid") ||
          backendError.includes("incorrect")
        ) {
          userFriendlyMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (
          backendError.includes("not found") ||
          backendError.includes("does not exist")
        ) {
          userFriendlyMessage =
            "Account not found. Please check your email address or create a new account.";
        } else {
          userFriendlyMessage = error.response.data.error;
        }
      }

      toast.error(userFriendlyMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In: use deep-link auth on native, popup on web
  // const handleGoogleLogin = async () => {
  //   const isNative = typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.();
  //   if (isNative) {
  //     setShowGoogleWebView(true);
  //     return;
  //   }
  //   try {
  //     setIsLoading(true);
  //     await signInWithGooglePopup();
  //     toast.success("Login successful!", { autoClose: 2500 });
  //     navigate("/dashboard");
  //   } catch (e: any) {
  //     toast.error(e?.message || "Google login failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // No OTP handlers (removed)

  // Google WebView handlers commented out for mobile builds
  // const handleGoogleWebViewSuccess = () => {
  //   setShowGoogleWebView(false);
  //   toast.success("🎉 Google login successful!", {
  //     position: "top-right",
  //     autoClose: 3000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: false,
  //     draggable: false,
  //   });
  //   // Navigate to dashboard, OnboardingGuard will redirect to onboarding if needed
  //   navigate("/dashboard");
  // };

  // const handleGoogleWebViewError = (error: string) => {
  //   setShowGoogleWebView(false);
  //   toast.error(`Google login failed: ${error}`, {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: false,
  //     draggable: false,
  //   });
  // };

  // const handleGoogleWebViewClose = () => {
  //   setShowGoogleWebView(false);
  // };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* {showGoogleWebView && (
        <GoogleAuthWebView
          onSuccess={() => {
            setShowGoogleWebView(false);
            toast.success("Login successful!", { autoClose: 2500 });
            navigate("/dashboard");
          }}
          onError={(error) => {
            setShowGoogleWebView(false);
            toast.error(`Google login failed: ${error}`);
          }}
          onClose={() => setShowGoogleWebView(false)}
        />
      )} */}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email Address"
            className="w-full px-4 py-3 rounded-lg bg-gray-200 border focus:border-primary focus:bg-white focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-200 border focus:border-primary focus:bg-white focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <HiEyeSlash className="h-5 w-5" />
              ) : (
                <HiEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* APK BUILD - Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#069B93] bg-gray-100 border-gray-300 rounded focus:ring-[#069B93] focus:ring-2"
            />
            <span className="text-sm text-gray-700 font-medium">
              Remember Email & Password
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold text-sm bg-dark text-white transition hover:bg-opacity-90 rounded-xl py-3 px-4 disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/**
      <div className="my-6 text-center text-sm text-gray-500">or</div>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center font-semibold text-sm bg-gray-100 text-dark transition-colors hover:bg-gray-200 rounded-xl py-3 px-4 mb-4 disabled:opacity-50"
      >
        <FcGoogle className="mr-2 w-6 h-6" />
        Sign in with Google
      </button>
      */}

      {/* Google Sign-In disabled for mobile builds */}
      {/* <hr className="my-6 border-gray-300 w-full" />
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center font-semibold text-sm bg-gray-100 text-dark transition-colors hover:bg-gray-200 rounded-xl py-3 px-4 mb-4 disabled:opacity-50"
      >
        <FcGoogle className="mr-2 w-6 h-6" />
        Sign in with Google
      </button> */}

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm">
          Need an account?{" "}
          <Link
            className="font-semibold text-primary transition-colors hover:text-dark"
            to="/auth/signup"
          >
            Create an account
          </Link>
        </p>

        {/* APK BUILD - Clear Stored Credentials */}
        <div>
          <button
            type="button"
            onClick={async () => {
              await clearRememberedCredentials();
              setEmail("");
              setPassword("");
              setRememberMe(false);
              toast.success("Stored credentials cleared!", {
                position: "top-right",
                autoClose: 2000,
              });
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear Stored Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
