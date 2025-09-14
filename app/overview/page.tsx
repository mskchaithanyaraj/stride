"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RouteGuard } from "@/components/RouteGuard";

export default function Overview() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <RouteGuard requireAuth={false} redirectTo="/home">
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)] text-[var(--foreground)] overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6">
          <div className="text-xl font-bold text-red-500">Stride</div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
          {/* Animated Logo */}
          <div
            className={`text-center mb-12 ${
              isLoaded ? "animate-fade-in" : "opacity-0"
            }`}
          >
            <div className="relative">
              {/* Main Logo */}
              <h1 className="text-8xl md:text-9xl font-bold mb-6 tracking-wider">
                <span className="inline-block text-red-500 animate-letter-bounce animation-delay-0">
                  S
                </span>
                <span className="inline-block text-[var(--foreground)] animate-letter-bounce animation-delay-200">
                  t
                </span>
                <span className="inline-block text-[var(--foreground)] animate-letter-bounce animation-delay-400">
                  r
                </span>
                <span className="inline-block text-[var(--foreground)] animate-letter-bounce animation-delay-600">
                  i
                </span>
                <span className="inline-block text-[var(--foreground)] animate-letter-bounce animation-delay-800">
                  d
                </span>
                <span className="inline-block text-[var(--foreground)] animate-letter-bounce animation-delay-1000">
                  e
                </span>
              </h1>

              {/* Animated Subtitle */}
              <div className="text-2xl md:text-3xl font-light text-[var(--muted)] mb-8 animate-fade-in-up animation-delay-1500">
                <span className="inline-block animate-type-writer">
                  Simplify • Track • Reach • Improve • Deliver • Everyday
                </span>
              </div>

              {/* Progress Line Animation */}
              <div className="w-64 h-1 bg-[var(--border)] mx-auto mb-8 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-purple-500 animate-progress-fill"></div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-2000">
              Your modern task management companion designed to help you achieve
              your goals with style and efficiency.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-6 ${
              isLoaded ? "animate-fade-in-up animation-delay-2500" : "opacity-0"
            }`}
          >
            <Link
              href="/"
              className="group relative px-8 py-4 bg-red-500 text-white rounded-full font-semibold text-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-xl hover:shadow-red-500/25"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="/login"
              className="group relative px-8 py-4 border-2 border-[var(--border)] text-[var(--foreground)] rounded-full font-semibold text-lg transition-all duration-300 hover:border-red-500 hover:text-red-500 hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10">Login</span>
            </Link>

            <Link
              href="/signup"
              className="group relative px-8 py-4 bg-[var(--surface)] text-[var(--foreground)] rounded-full font-semibold text-lg transition-all duration-300 hover:bg-[var(--border)] hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10">Sign Up</span>
            </Link>
          </div>

          {/* Feature Pills */}
          <div
            className={`mt-16 flex flex-wrap justify-center gap-4 max-w-4xl ${
              isLoaded ? "animate-fade-in-up animation-delay-3000" : "opacity-0"
            }`}
          >
            {[
              "Task Management",
              "Progress Tracking",
              "Deadline Organization",
              "Team Collaboration",
              "Mobile Responsive",
              "Dark Mode",
            ].map((feature, index) => (
              <div
                key={feature}
                className={`px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm text-[var(--muted)] animate-fade-in animation-delay-${
                  3200 + index * 100
                }`}
              >
                {feature}
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center p-6 text-[var(--muted)]">
          <p>&copy; 2025 Stride. Built with passion for productivity.</p>
        </footer>
      </div>
    </RouteGuard>
  );
}
