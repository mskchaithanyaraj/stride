"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme on component mount
  useEffect(() => {
    const loadTheme = () => {
      try {
        const saved = localStorage.getItem("stride-theme") as
          | "light"
          | "dark"
          | null;

        if (saved) {
          setTheme(saved);
        } else {
          // If no saved theme, honor OS preference
          const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          setTheme(prefersDark ? "dark" : "light");
        }
      } catch {
        // Fallback if localStorage is not available
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
      setIsLoaded(true);
    };

    loadTheme();
  }, []);

  // Apply theme to document when theme changes
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Keep Tailwind's `dark:` variants in sync
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem("stride-theme", theme);
    } catch {}
  }, [theme, isLoaded]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="px-3 py-2 border border-[var(--border)] rounded text-sm text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? "Dark" : "Light"} mode
    </button>
  );
}
