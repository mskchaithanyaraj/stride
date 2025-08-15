"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <div className="px-3 py-2 border border-[var(--border)] rounded text-sm text-[var(--muted)] w-[100px] h-[36px]"></div>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
      className="px-3 py-2 border border-[var(--border)] rounded text-sm text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {currentTheme === "light" ? "Dark" : "Light"} mode
    </button>
  );
}
