"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Trash2 } from "lucide-react";

interface CompletionToastProps {
  isVisible: boolean;
  taskTitle: string;
  onClose: () => void;
  onDelete: () => void;
}

export function CompletionToast({
  isVisible,
  taskTitle,
  onClose,
  onDelete,
}: CompletionToastProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Always show confetti when task is completed
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
      {/* Border Confetti Effect */}
      {showConfetti && (
        <>
          {/* Top Border Confetti */}
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={150}
            recycle={false}
            gravity={0.3}
            initialVelocityY={20}
            initialVelocityX={10}
            colors={[
              "#ff6b6b",
              "#4ecdc4",
              "#45b7d1",
              "#96ceb4",
              "#feca57",
              "#ff9ff3",
              "#54a0ff",
              "#5f27cd",
              "#00d2d3",
              "#ff9f43",
              "#ff6348",
              "#2ed573",
              "#3742fa",
              "#f368e0",
              "#feca57",
              "#48dbfb",
              "#0abde3",
              "#006ba6",
              "#ee5a24",
              "#009432",
              "#9c88ff",
              "#ffc048",
              "#ff3838",
              "#7bed9f",
              "#70a1ff",
            ]}
            confettiSource={{
              x: 0,
              y: 0,
              w: window.innerWidth,
              h: 10,
            }}
          />

          {/* Bottom Border Confetti */}
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={150}
            recycle={false}
            gravity={0.1}
            initialVelocityY={-20}
            initialVelocityX={10}
            colors={[
              "#ff6b6b",
              "#4ecdc4",
              "#45b7d1",
              "#96ceb4",
              "#feca57",
              "#ff9ff3",
              "#54a0ff",
              "#5f27cd",
              "#00d2d3",
              "#ff9f43",
              "#ff6348",
              "#2ed573",
              "#3742fa",
              "#f368e0",
              "#feca57",
              "#48dbfb",
              "#0abde3",
              "#006ba6",
              "#ee5a24",
              "#009432",
              "#9c88ff",
              "#ffc048",
              "#ff3838",
              "#7bed9f",
              "#70a1ff",
            ]}
            confettiSource={{
              x: 0,
              y: window.innerHeight - 10,
              w: window.innerWidth,
              h: 10,
            }}
          />

          {/* Left Border Confetti */}
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={150}
            recycle={false}
            gravity={0.2}
            initialVelocityY={5}
            initialVelocityX={20}
            colors={[
              "#ff6b6b",
              "#4ecdc4",
              "#45b7d1",
              "#96ceb4",
              "#feca57",
              "#ff9ff3",
              "#54a0ff",
              "#5f27cd",
              "#00d2d3",
              "#ff9f43",
              "#ff6348",
              "#2ed573",
              "#3742fa",
              "#f368e0",
              "#feca57",
              "#48dbfb",
              "#0abde3",
              "#006ba6",
              "#ee5a24",
              "#009432",
              "#9c88ff",
              "#ffc048",
              "#ff3838",
              "#7bed9f",
              "#70a1ff",
            ]}
            confettiSource={{
              x: 0,
              y: 0,
              w: 10,
              h: window.innerHeight,
            }}
          />

          {/* Right Border Confetti */}
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={150}
            recycle={false}
            gravity={0.2}
            initialVelocityY={5}
            initialVelocityX={-20}
            colors={[
              "#ff6b6b",
              "#4ecdc4",
              "#45b7d1",
              "#96ceb4",
              "#feca57",
              "#ff9ff3",
              "#54a0ff",
              "#5f27cd",
              "#00d2d3",
              "#ff9f43",
              "#ff6348",
              "#2ed573",
              "#3742fa",
              "#f368e0",
              "#feca57",
              "#48dbfb",
              "#0abde3",
              "#006ba6",
              "#ee5a24",
              "#009432",
              "#9c88ff",
              "#ffc048",
              "#ff3838",
              "#7bed9f",
              "#70a1ff",
            ]}
            confettiSource={{
              x: window.innerWidth - 10,
              y: 0,
              w: 10,
              h: window.innerHeight,
            }}
          />
        </>
      )}

      {/* Improved Toast */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-[var(--background)] border-2 border-[var(--border)] rounded-lg shadow-xl p-4 max-w-sm animate-slide-up">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎉</span>
              <h3 className="font-semibold text-[var(--foreground)] text-sm">
                Task Completed!
              </h3>
            </div>
            <p className="text-[var(--muted)] text-xs pl-8 line-clamp-2">
              &quot;{taskTitle}&quot;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pl-8">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-600 text-xs font-medium transition-colors hover:border-red-300"
            >
              <Trash2 size={14} />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
