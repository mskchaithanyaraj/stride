"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link
          href="/home"
          className="text-2xl font-bold text-red-500 hover:opacity-80 transition-opacity"
        >
          Stride
        </Link>
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Error Content */}
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] p-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.182 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-[var(--muted)] mb-8">
            There was an error during the authentication process. This might be
            due to an expired or invalid link.
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 inline-block"
            >
              Try Again
            </Link>

            <Link
              href="/overview"
              className="w-full py-3 px-4 border border-[var(--border)] text-[var(--foreground)] rounded-lg font-semibold hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
