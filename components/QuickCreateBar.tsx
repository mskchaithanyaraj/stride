"use client";

import { useState, useRef, useEffect } from "react";
import { Subtask } from "@/types/tracker";

interface QuickCreateBarProps {
  category: "today" | "week" | "month" | "later";
  placeholder: string;
  defaultDeadline?: Date;
  onCreate: (tracker: {
    title: string;
    description: string;
    timeEstimate: number;
    deadline?: Date;
    subtasks: Subtask[];
  }) => void;
  isActive?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSave?: () => void; // Exposed save function for Ctrl+S
}

export function QuickCreateBar({
  category,
  placeholder,
  defaultDeadline,
  onCreate,
  isActive,
  onFocus,
  onBlur,
  onSave,
}: QuickCreateBarProps) {
  const [value, setValue] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState("");
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [customDeadline, setCustomDeadline] = useState("");
  const [indentLevel, setIndentLevel] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const reset = () => {
    setValue("");
    setSubtasks([]);
    setDescription("");
    setTimeEstimate(30);
    setCustomDeadline("");
    setIndentLevel(0);
    setShowAdvanced(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S: Save current task
    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSubmit();
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        if (indentLevel > 0) {
          // Add as subtask
          setSubtasks((prev) => [...prev, value.trim()]);
          setValue("");
        } else {
          // Create main task
          handleSubmit();
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: Un-indent
        setIndentLevel(Math.max(0, indentLevel - 1));
      } else {
        // Tab: Indent (create subtask)
        setIndentLevel(1);
      }
    } else if (e.key === "Escape") {
      reset();
      onBlur?.();
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;

    const deadline = customDeadline
      ? new Date(customDeadline)
      : defaultDeadline;

    const subtaskItems: Subtask[] = subtasks
      .filter((s) => s.trim())
      .map((s) => ({
        id: crypto.randomUUID(),
        text: s.trim(),
        completed: false,
      }));

    onCreate({
      title: value.trim(),
      description: description.trim(),
      timeEstimate,
      deadline,
      subtasks: subtaskItems,
    });

    reset();
    onSave?.(); // Call onSave when task is created

    // Auto-focus for next task
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "later":
        return "Later";
    }
  };

  return (
    <div
      ref={containerRef}
      className="mb-4 border border-[var(--border)] rounded-lg bg-[var(--background)] hover:bg-[var(--surface)] transition-colors"
    >
      <div className="flex items-center p-3">
        <div className="flex-1">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={() => {
              if (!showAdvanced && !value.trim() && subtasks.length === 0) {
                onBlur?.();
              }
            }}
            placeholder={placeholder}
            className={`w-full bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none ${
              indentLevel > 0 ? "ml-6 text-sm" : "text-base"
            }`}
            style={{
              marginLeft: indentLevel > 0 ? `${indentLevel * 24}px` : "0px",
            }}
          />

          {/* Subtasks list */}
          {subtasks.length > 0 && (
            <div className="mt-2 space-y-1">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 ml-6 text-sm text-[var(--muted)]"
                >
                  <span>•</span>
                  <span>{subtask}</span>
                  <button
                    onClick={() =>
                      setSubtasks((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-xs hover:text-[var(--foreground)]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {(value.trim() || subtasks.length > 0) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 border border-[var(--border)] rounded"
            >
              {showAdvanced ? "Less" : "More"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="px-3 py-1 text-sm bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 disabled:opacity-50"
            >
              Add to {getCategoryLabel()}
            </button>
          </div>
        )}
      </div>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="border-t border-[var(--border)] p-3 space-y-3">
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] border-b border-[var(--border)] focus:outline-none py-1 text-sm"
          />

          <div className="flex gap-4 items-center text-sm">
            <label className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Time:</span>
              <input
                type="number"
                min={1}
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(Number(e.target.value))}
                className="w-16 bg-transparent text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none"
              />
              <span className="text-[var(--muted)]">min</span>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Custom deadline:</span>
              <input
                type="datetime-local"
                value={customDeadline}
                onChange={(e) => setCustomDeadline(e.target.value)}
                className="bg-transparent text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none text-sm"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
