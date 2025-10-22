import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
// Google authentication imports commented out for mobile builds
// import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContextFirebase";
import { Spinner } from "../Elements/Spinner";
import { useState } from "react";
import { toast } from "react-toastify";
// import GoogleAuthWebView from "./GoogleAuthWebView";
import { HiEye, HiEyeSlash } from "react-icons/hi2";
// import { signInWithGooglePopup } from "../../firebase/auth";

const registerValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/^\S*$/, "Password cannot contain spaces"),
  password2: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Password confirmation is required"),
});
type SignupForm = yup.InferType<typeof registerValidationSchema>;

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Google WebView state commented out for mobile builds
  // const [showGoogleWebView, setShowGoogleWebView] = useState(false);

  // APK BUILD - Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: yupResolver<SignupForm>(registerValidationSchema),
  });
  const { signUp } = useAuth();

  const handleRegister = async (data: SignupForm) => {
    console.log("Form submitted with data:", data);
    try {
      setIsLoading(true);
      const displayName = data.email.split("@")[0]; // Use email prefix as display name

      console.log("Sending registration request:", {
        email: data.email,
        displayName,
      });
      await signUp(data.email.trim(), data.password, displayName);
      console.log("Registration successful");

      // APK BUILD - Navigate to login screen after signup
      toast.success("🎉 Registration successful! Please login to continue.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
      console.log("Navigating to login screen...");
      navigate("/auth/login");
    } catch (error: any) {
      console.error("Registration error:", error);

      let userFriendlyMessage = "Registration failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        userFriendlyMessage =
          "An account with this email already exists. Please use a different email or try logging in.";
      } else if (error.code === "auth/weak-password") {
        userFriendlyMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        userFriendlyMessage =
          "Invalid email address. Please check your email and try again.";
      }
      // else if (error.message) {
      //   userFriendlyMessage = error.message;
      // }

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
  //     toast.success("Signup successful!", { autoClose: 2500 });
  //     navigate("/dashboard");
  //   } catch (e: any) {
  //     toast.error(e?.message || "Google signup failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
    <>
      {/* {showGoogleWebView && (
        <GoogleAuthWebView
          onSuccess={() => {
            setShowGoogleWebView(false);
            toast.success("Signup successful!", { autoClose: 2500 });
            navigate("/dashboard");
          }}
          onError={(error) => {
            setShowGoogleWebView(false);
            toast.error(`Google signup failed: ${error}`);
          }}
          onClose={() => setShowGoogleWebView(false)}
        />
      )} */}

      <form className="w-full relative" onSubmit={handleSubmit(handleRegister)}>
        {isLoading && <Spinner />}
        <div className="flex flex-col mb-3">
          <label htmlFor="email" className="text-secondary">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            placeholder="Enter Email Address"
            className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-1 border focus:border-primary focus:bg-white focus:outline-none"
          />
          {
            <p className="text-red-500 font-semibold mt-1">
              {errors.email?.message}
            </p>
          }
        </div>
        <div className="flex flex-col w-full mb-3">
          <label htmlFor="password" className="text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter Password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-200 mt-1 border focus:border-primary focus:bg-white focus:outline-none"
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
          {
            <p className="text-red-500 font-semibold mt-1">
              {errors.password?.message}
            </p>
          }
        </div>
        <div className="flex flex-col w-full mb-3">
          <label htmlFor="password2" className="text-secondary">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("password2")}
              type={showConfirmPassword ? "text" : "password"}
              id="password2"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-200 mt-1 border focus:border-primary focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <HiEyeSlash className="h-5 w-5" />
              ) : (
                <HiEye className="h-5 w-5" />
              )}
            </button>
          </div>
          {
            <p className="text-red-500 font-semibold mt-1">
              {errors.password2?.message}
            </p>
          }
        </div>
        <button
          type="submit"
          className="w-full font-semibold text-sm bg-dark text-white transition hover:bg-opacity-90 rounded-xl py-3 px-4"
          onClick={() => console.log("Signup button clicked")}
        >
          Sign up
        </button>
      </form>
      {/* Google Sign-In */}
      {/**
      <hr className="my-6 border-gray-300 w-full" />
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center font-semibold text-sm bg-gray-100 text-dark transition-colors hover:bg-gray-200 rounded-xl py-3 px-4 mb-4 disabled:opacity-50"
      >
        <FcGoogle className="mr-2 w-6 h-6" />
        Sign up with Google
      </button>
      */}
      <p className="text-sm mt-6">
        Already have an account?{" "}
        <Link
          className="font-semibold text-primary transition-colors hover:text-dark"
          to="/auth/login"
        >
          Sign in
        </Link>
      </p>
    </>
  );
};

export default SignupForm;
