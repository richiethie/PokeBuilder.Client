import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthHydrating, openAuthModal } = useAuth();

  useEffect(() => {
    if (!isAuthHydrating && !user) openAuthModal("signin");
  }, [isAuthHydrating, user, openAuthModal]);

  // Wait for session restore before making an auth decision.
  if (isAuthHydrating) return null;

  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
}
