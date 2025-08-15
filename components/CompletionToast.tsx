"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface CompletionToastProps {
  isVisible: boolean;
  taskTitle: string;
  onClose: () => void;
}

export function CompletionToast({
  isVisible,
  taskTitle,
  onClose,
}: CompletionToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show confetti immediately
      setShowConfetti(true);

      // Auto-hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);

      // Auto-hide toast after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={150}
          recycle={false}
          gravity={0.2}
        />
      )}

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-sm">Task completed</h3>
              <p className="text-xs text-[var(--muted)] truncate max-w-[200px]">
                {taskTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
