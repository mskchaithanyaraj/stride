"use client";

import { useState } from "react";
import { Tracker } from "@/types/tracker";

interface UniversalCreateBarProps {
  onCreateTask: (
    task: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
  ) => void;
}

export function UniversalCreateBar({ onCreateTask }: UniversalCreateBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [deadlineType, setDeadlineType] = useState<
    "today" | "month" | "year" | "custom"
  >("today");
  const [customDeadline, setCustomDeadline] = useState("");
  const [subtasks, setSubtasks] = useState<Array<{ text: string }>>([]);
  const [newSubtask, setNewSubtask] = useState("");

  const getDefaultTimeEstimate = (type: typeof deadlineType): number => {
    switch (type) {
      case "today":
        return 30; // minutes
      case "month":
        return 7; // days
      case "year":
        return 30; // days
      case "custom":
        return 30; // minutes
      default:
        return 30;
    }
  };

  const getTimeLabel = (type: typeof deadlineType): string => {
    switch (type) {
      case "today":
        return "Time Estimate (minutes)";
      case "month":
        return "Time Estimate (days)";
      case "year":
        return "Time Estimate (days)";
      case "custom":
        return "Time Estimate (minutes)";
      default:
        return "Time Estimate (minutes)";
    }
  };

  const getDeadlineFromType = (type: typeof deadlineType): Date => {
    const now = new Date();
    switch (type) {
      case "today":
        const today = new Date(now);
        today.setHours(23, 59, 59, 999);
        return today;
      case "month":
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );
        lastDayOfMonth.setHours(23, 59, 59, 999);
        return lastDayOfMonth;
      case "year":
        const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
        lastDayOfYear.setHours(23, 59, 59, 999);
        return lastDayOfYear;
      case "custom":
        return customDeadline ? new Date(customDeadline) : now;
      default:
        return now;
    }
  };

  const handleDeadlineTypeChange = (newType: typeof deadlineType) => {
    setDeadlineType(newType);
    setTimeEstimate(getDefaultTimeEstimate(newType));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const deadline = getDeadlineFromType(deadlineType);

    const newTracker = {
      title: title.trim(),
      description: "", // Always empty as per requirement
      timeEstimate,
      deadline,
      subtasks: subtasks.map((st) => ({
        id: crypto.randomUUID(),
        text: st.text,
        completed: false,
      })),
    };

    onCreateTask(newTracker);

    // Reset form
    setTitle("");
    setTimeEstimate(getDefaultTimeEstimate(deadlineType));
    setCustomDeadline("");
    setSubtasks([]);
    setNewSubtask("");
    setIsExpanded(false);
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { text: newSubtask.trim() }]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input Row */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What would you like to accomplish?"
            className="flex-1 px-4 py-3 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
          />

          {/* Deadline Type Selector */}
          <select
            value={deadlineType}
            onChange={(e) =>
              handleDeadlineTypeChange(e.target.value as typeof deadlineType)
            }
            className="px-3 py-3 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date</option>
          </select>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-3 text-xs text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover)] transition-colors"
          >
            {isExpanded ? "Less" : "More"}
          </button>

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-3 text-sm bg-[var(--foreground)] text-[var(--background)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Add Task
          </button>
        </div>

        {/* Custom Deadline Input (shown when custom is selected) */}
        {deadlineType === "custom" && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-[var(--muted)] min-w-fit">
              Custom deadline:
            </label>
            <input
              type="datetime-local"
              value={customDeadline}
              onChange={(e) => setCustomDeadline(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
            />
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            {/* Time Estimate */}
            <div>
              <label className="block text-sm text-[var(--muted)] mb-2">
                {getTimeLabel(deadlineType)}
              </label>
              <input
                type="number"
                value={timeEstimate}
                onChange={(e) =>
                  setTimeEstimate(
                    parseInt(e.target.value) ||
                      getDefaultTimeEstimate(deadlineType)
                  )
                }
                min="1"
                max={deadlineType === "today" ? "480" : "365"}
                className="w-32 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
              />
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-sm text-[var(--muted)] mb-2">
                Subtasks (optional)
              </label>

              {/* Existing Subtasks */}
              {subtasks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm">
                        {subtask.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(index)}
                        className="px-2 py-2 text-sm text-[var(--muted)] hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  disabled={!newSubtask.trim()}
                  className="px-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
