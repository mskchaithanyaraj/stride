"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface KeyboardManagerProps {
  shortcuts: KeyboardShortcut[];
  onShowHelp: () => void;
  selectedTaskId?: string;
  onTaskAction?: (action: "toggle" | "edit" | "delete", taskId: string) => void;
  onShowTodayOverlay?: () => void;
}

export function KeyboardManager({
  shortcuts,
  onShowHelp,
  selectedTaskId: _selectedTaskId,
  onTaskAction: _onTaskAction,
  onShowTodayOverlay,
}: KeyboardManagerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't interfere with typing in inputs, except for specific shortcuts
      const isInputFocused =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      // Help overlay (works everywhere)
      if (e.key === "h" && e.ctrlKey) {
        e.preventDefault();
        onShowHelp();
        return;
      }

      // Ctrl+Space: Show today's tasks overlay (works everywhere)
      if (e.key === " " && e.ctrlKey) {
        e.preventDefault();
        onShowTodayOverlay?.();
        return;
      }

      // Don't process other shortcuts when typing in inputs
      if (isInputFocused) {
        return;
      }

      // Global shortcuts
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey;
        const shiftMatch = !!shortcut.shiftKey === e.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, onShowHelp, onShowTodayOverlay]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null; // This component only handles events
}

export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, "action">[] = [
  { key: " ", ctrlKey: true, description: "Show today's tasks overlay" },
  { key: "h", ctrlKey: true, description: "Show keyboard shortcuts" },
];
