"use client";

import { useState } from "react";
import { DEFAULT_SHORTCUTS } from "./KeyboardManager";

interface InfoIconProps {
  onShowHelp: () => void;
}

export function InfoIcon({ onShowHelp }: InfoIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatShortcut = (shortcut: (typeof DEFAULT_SHORTCUTS)[0]) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.shiftKey) parts.push("Shift");

    let key = shortcut.key;
    if (key === " ") key = "Space";
    else if (key === "ArrowRight") key = "→";
    else if (key === "ArrowLeft") key = "←";

    parts.push(key);
    return parts.join(" + ");
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onShowHelp}
        className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] transition-all duration-200 cursor-pointer"
        aria-label="Show keyboard shortcuts"
      >
        ℹ
      </button>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute right-0 top-10 w-80 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg p-4 z-40">
          <h3 className="text-sm font-medium mb-3 text-[var(--foreground)]">
            Quick Shortcuts
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {DEFAULT_SHORTCUTS.slice(0, 6).map((shortcut, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-[var(--muted)] flex-1">
                  {shortcut.description}
                </span>
                <code className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded font-mono text-[var(--foreground)] ml-2">
                  {formatShortcut(shortcut)}
                </code>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
            <button
              onClick={onShowHelp}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Click on the icon for all shortcuts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
