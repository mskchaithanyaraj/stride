"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/contexts/AuthContext";

export default function Overview() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    const { error: googleError } = await signInWithGoogle();

    if (googleError) {
      toast.error(
        googleError.message ||
          "Failed to sign in with Google. Please try again."
      );
      setIsGoogleLoading(false);
    }
    // Note: For OAuth, the user will be redirected, so we don't need to handle success here
  };

  return (
    <RouteGuard requireAuth={false} redirectTo="/home">
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <div className="absolute top-6 left-6">
          <div className="text-2xl font-bold text-red-500">Stride</div>
        </div>

        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Logo */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-wider">
            <span className="text-red-500">S</span>
            <span className="text-[var(--foreground)]">tride</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[var(--muted)] mb-4">
            Simplify • Track • Reach • Improve • Deliver • Everyday
          </p>

          {/* Tagline */}
          <p className="text-base md:text-lg text-[var(--muted)] max-w-xl mx-auto mb-12 leading-relaxed">
            Your modern task management companion designed to help you achieve
            your goals with style and efficiency.
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-[var(--surface)] text-gray-800 dark:text-[var(--foreground)] rounded-full font-semibold text-lg border-2 border-[var(--border)] hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="w-6 h-6 border-2 border-gray-800 dark:border-[var(--foreground)] border-t-transparent rounded-full animate-spin mr-3"></div>
            ) : (
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Simple Feature List */}
          <div className="mt-16 text-sm text-[var(--muted)]">
            Track tasks • Set deadlines • Stay organized
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 left-0 right-0 text-center text-sm text-[var(--muted)]">
          <p>&copy; 2025 Stride. Built with passion for productivity.</p>
        </footer>
      </div>
    </RouteGuard>
  );
}
