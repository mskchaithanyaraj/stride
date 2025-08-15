"use client";

import { useEffect, useState } from "react";

interface CelebrationToastProps {
  isVisible: boolean;
  trackerTitle: string;
  onKeep: () => void;
  onDelete: () => void;
}

export function CelebrationToast({
  isVisible,
  trackerTitle,
  onKeep,
  onDelete,
}: CelebrationToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Delay unmounting for animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">🎉</div>
          <div>
            <h3 className="font-medium text-sm">Task Completed!</h3>
            <p className="text-xs text-[var(--muted)] truncate">
              &ldquo;{trackerTitle}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onKeep}
            className="flex-1 px-3 py-2 text-xs bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 transition-opacity"
          >
            Keep
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded hover:bg-[var(--hover)] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
