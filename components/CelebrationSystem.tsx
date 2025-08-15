"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface CelebrationSystemProps {
  isActive: boolean;
  trackerTitle: string;
  onKeepTracker: () => void;
  onDeleteTracker: () => void;
}

export function CelebrationSystem({
  isActive,
  trackerTitle,
  onKeepTracker,
  onDeleteTracker,
}: CelebrationSystemProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Show confetti immediately
      setShowConfetti(true);
      // Show toast after a brief delay
      setTimeout(() => setShowToast(true), 500);

      // Auto-hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setShowConfetti(false);
      setShowToast(false);
    }
  }, [isActive]);

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

      {/* Minimal Toast in Bottom Right */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xl">🎉</div>
              <div>
                <h3 className="font-medium text-sm">Task Completed!</h3>
                <p className="text-xs text-[var(--muted)] truncate max-w-[200px]">
                  &ldquo;{trackerTitle}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onKeepTracker}
                className="flex-1 px-3 py-2 text-xs bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 transition-opacity"
              >
                Keep Tracker
              </button>
              <button
                onClick={onDeleteTracker}
                className="flex-1 px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded hover:bg-[var(--hover)] transition-colors"
              >
                Delete Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
