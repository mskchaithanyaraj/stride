"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Trash2, CheckCircle } from "lucide-react";

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
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  const truncateText = (text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {/* Border Confetti Effect */}
      {showConfetti && (
        <>
          {/* Top Border Confetti */}
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
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
              w: windowDimensions.width,
              h: 10,
            }}
          />

          {/* Bottom Border Confetti */}
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
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
              y: windowDimensions.height - 10,
              w: windowDimensions.width,
              h: 10,
            }}
          />

          {/* Left Border Confetti */}
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
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
              h: windowDimensions.height,
            }}
          />

          {/* Right Border Confetti */}
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
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
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <div className="bg-[var(--background)] border-2 border-[var(--border)] rounded-lg shadow-xl px-6 py-3 min-w-80 max-w-md animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--foreground)] text-sm mb-1">
                  Task Completed!
                </h3>
                <p
                  className="text-[var(--muted)] text-xs truncate"
                  title={taskTitle}
                >
                  &quot;{truncateText(taskTitle, 35)}&quot;
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onDelete}
              className="flex items-center gap-1 cursor-pointer px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-red-500 text-xs font-medium transition-colors hover:border-red-500/50 flex-shrink-0"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
