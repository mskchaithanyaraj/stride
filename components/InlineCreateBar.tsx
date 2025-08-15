"use client";

import { useState } from "react";
import { Tracker } from "@/types/tracker";

interface InlineCreateBarProps {
  category: "today" | "month" | "year" | "custom";
  onCreateTask: (
    task: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
  ) => void;
}

export function InlineCreateBar({
  category,
  onCreateTask,
}: InlineCreateBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [customDeadline, setCustomDeadline] = useState("");
  const [subtasks, setSubtasks] = useState<Array<{ text: string }>>([]);
  const [newSubtask, setNewSubtask] = useState("");

  const getDefaultDeadline = (): Date => {
    const now = new Date();
    switch (category) {
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
      default:
        return now;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const deadline =
      category === "custom" && customDeadline
        ? new Date(customDeadline)
        : getDefaultDeadline();

    const newTracker = {
      title: title.trim(),
      description: description.trim(),
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
    setDescription("");
    setTimeEstimate(30);
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

  const getCategoryLabel = () => {
    switch (category) {
      case "today":
        return "Today's Tasks";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        return "Custom Timeline";
      default:
        return "Tasks";
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title Input - Always Visible */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Add task to ${getCategoryLabel()}...`}
            className="flex-1 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded hover:bg-[var(--hover)] transition-colors"
          >
            {isExpanded ? "- details" : "+ details"}
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 text-xs bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Add
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20 resize-none"
            />

            {/* Time Estimate & Custom Deadline */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[var(--muted)] mb-1">
                  Time Estimate (minutes)
                </label>
                <input
                  type="number"
                  value={timeEstimate}
                  onChange={(e) =>
                    setTimeEstimate(parseInt(e.target.value) || 30)
                  }
                  min="5"
                  max="480"
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                />
              </div>

              {category === "custom" && (
                <div className="flex-1">
                  <label className="block text-xs text-[var(--muted)] mb-1">
                    Custom Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={customDeadline}
                    onChange={(e) => setCustomDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                  />
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-xs text-[var(--muted)] mb-2">
                Subtasks (optional)
              </label>

              {/* Existing Subtasks */}
              {subtasks.length > 0 && (
                <div className="space-y-1 mb-2">
                  {subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="flex-1 px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded">
                        {subtask.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(index)}
                        className="px-2 py-1 text-xs text-[var(--muted)] hover:text-red-500 transition-colors"
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
                  placeholder="Add subtask..."
                  className="flex-1 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
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
                  className="px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] rounded hover:bg-[var(--hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
