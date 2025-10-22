import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContextFirebase";
import { LoadingPage } from "../components/ui";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/verify-email",
    "/auth/verification-pending",
    "/auth/forgot-password",
    "/auth/google-callback",
    "/auth/oauth-debug",
    "/auth/debug",
    "/deeplink",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/")
  );

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If not authenticated and trying to access protected route
    if (!currentUser && !isPublicRoute) {
      console.log("🔒 AuthGuard - Redirecting to login, no user found");
      navigate("/auth/login", {
        replace: true,
        state: { from: location.pathname },
      });
    } else if (currentUser && isPublicRoute && location.pathname === "/") {
      // If user is authenticated and on home page, redirect to dashboard
      console.log(
        "🔒 AuthGuard - User authenticated, redirecting to dashboard"
      );
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, loading, isPublicRoute, location.pathname, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return <LoadingPage message="Checking authentication..." showLogo={true} />;
  }

  // If not authenticated and on public route, allow access
  if (!currentUser && isPublicRoute) {
    return <>{children}</>;
  }

  // If not authenticated and on protected route, show loading (redirect will happen)
  if (!currentUser && !isPublicRoute) {
    return <LoadingPage message="Redirecting to login..." showLogo={true} />;
  }

  // User is authenticated, allow access
  return <>{children}</>;
};
