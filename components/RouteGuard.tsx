"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires authentication, false = requires no authentication
  redirectTo?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  redirectTo,
}: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (requireAuth && !user) {
      // User must be authenticated but isn't - redirect to login
      router.push(redirectTo || "/login");
    } else if (!requireAuth && user) {
      // User must NOT be authenticated but is - redirect to home
      router.push(redirectTo || "/home");
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user should be redirected
  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
