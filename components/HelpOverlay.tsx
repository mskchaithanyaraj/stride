"use client";

import { DEFAULT_SHORTCUTS } from "./KeyboardManager";

interface HelpOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export function HelpOverlay({ isVisible, onClose }: HelpOverlayProps) {
  if (!isVisible) return null;

  const formatShortcut = (shortcut: (typeof DEFAULT_SHORTCUTS)[0]) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.shiftKey) parts.push("Shift");
    parts.push(shortcut.key === " " ? "Space" : shortcut.key);
    return parts.join(" + ");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {DEFAULT_SHORTCUTS.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">
                {shortcut.description}
              </span>
              <code className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono">
                {formatShortcut(shortcut)}
              </code>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded text-sm hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
