"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

type Props = {
  isActive: boolean;
  onComplete: () => void;
  trackerTitle: string;
  onDeleteOption: () => void;
};

export function ConfettiCelebration({
  isActive,
  onComplete,
  trackerTitle,
  onDeleteOption,
}: Props) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowOptions(true), 2000);
      return () => clearTimeout(timer);
    }
    setShowOptions(false);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={180}
        gravity={0.35}
      />
      {showOptions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Congratulations</h2>
            <p className="text-[var(--muted)] mb-6">
              You have completed &quot;{trackerTitle}&quot;.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onComplete}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded hover:bg-[var(--surface)] transition-colors"
              >
                Keep Tracker
              </button>
              <button
                onClick={onDeleteOption}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
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
