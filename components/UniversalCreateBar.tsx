"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Tracker } from "@/types/tracker";

interface UniversalCreateBarProps {
  onCreateTask: (
    task: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
  ) => void;
  isModal?: boolean;
}

export function UniversalCreateBar({
  onCreateTask,
  isModal = false,
}: UniversalCreateBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [deadlineType, setDeadlineType] = useState<
    "today" | "month" | "year" | "custom"
  >("today");
  const [customDeadline, setCustomDeadline] = useState("");
  const [subtasks, setSubtasks] = useState<Array<{ text: string }>>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    customDeadline?: string;
  }>({});

  // Calculate time estimate in minutes from hours, minutes, seconds
  const calculateTimeEstimate = (): number => {
    if (deadlineType === "custom") {
      return hours * 60 + minutes + Math.round(seconds / 60);
    }
    return 0; // No time estimate for today/month/year
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
    // Reset time inputs when changing deadline type
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate required fields
    const newErrors: { title?: string; customDeadline?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Task name is required";
    }

    if (deadlineType === "custom" && !customDeadline) {
      newErrors.customDeadline = "Custom deadline is required";
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const deadline = getDeadlineFromType(deadlineType);
    const finalTimeEstimate = calculateTimeEstimate();

    const newTracker = {
      title: title.trim(),
      description: "", // Always empty as per requirement
      timeEstimate: finalTimeEstimate,
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
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setCustomDeadline("");
    setSubtasks([]);
    setNewSubtask("");
    setErrors({});
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Auto-focus on title input when expanding
      setTimeout(() => {
        const titleInput = document.querySelector(
          'input[placeholder="What would you like to accomplish?"]'
        ) as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
        }
      }, 100);
    }
  };

  return (
    <div className={isModal ? "space-y-4" : "mb-4"}>
      {!isModal && !isExpanded ? (
        /* Compact Add Button - only show when not in modal */
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200 group cursor-pointer"
        >
          <Plus
            size={18}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-sm">Add Todo</span>
        </button>
      ) : (
        /* Animated Expanded Form */
        <div
          className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 ${
            !isModal ? "animate-slide-down" : ""
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Task Name
                <span className="text-[var(--foreground)] ml-1">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  // Clear error when user starts typing
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                placeholder="What would you like to accomplish?"
                className={`w-full px-3 py-2 text-sm bg-[var(--background)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20 ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[var(--border)]"
                }`}
                autoFocus
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Timeline
                <span className="text-[var(--foreground)] ml-1">*</span>
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={deadlineType}
                  onChange={(e) =>
                    handleDeadlineTypeChange(
                      e.target.value as typeof deadlineType
                    )
                  }
                  className="flex-1 px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                >
                  <option value="today">Today</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Date</option>
                </select>

                <button
                  type="button"
                  onClick={() => (isModal ? null : setIsExpanded(false))}
                  className={`p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] rounded transition-colors cursor-pointer ${
                    isModal ? "hidden" : ""
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Custom Deadline Input (shown when custom is selected) */}
            {deadlineType === "custom" && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Custom deadline
                  <span className="text-[var(--foreground)] ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={customDeadline}
                  onChange={(e) => {
                    setCustomDeadline(e.target.value);
                    // Clear error when user selects a date
                    if (errors.customDeadline) {
                      setErrors({ ...errors, customDeadline: undefined });
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm bg-[var(--background)] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20 ${
                    errors.customDeadline
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[var(--border)]"
                  }`}
                />
                {errors.customDeadline && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customDeadline}
                  </p>
                )}
              </div>
            )}

            {/* Always Show Subtasks and Time Estimate */}
            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              {/* Time Estimate - Only for custom deadlines */}
              {deadlineType === "custom" && (
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">
                    Time Estimate
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={hours}
                        onChange={(e) =>
                          setHours(parseInt(e.target.value) || 0)
                        }
                        min="0"
                        max="23"
                        className="w-16 px-2 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                      />
                      <span className="text-sm text-[var(--muted)]">hrs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={minutes}
                        onChange={(e) =>
                          setMinutes(parseInt(e.target.value) || 0)
                        }
                        min="0"
                        max="59"
                        className="w-16 px-2 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                      />
                      <span className="text-sm text-[var(--muted)]">min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={seconds}
                        onChange={(e) =>
                          setSeconds(parseInt(e.target.value) || 0)
                        }
                        min="0"
                        max="59"
                        className="w-16 px-2 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-opacity-20"
                      />
                      <span className="text-sm text-[var(--muted)]">sec</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtasks */}
              <div>
                <label className="block text-sm text-[var(--muted)] mb-2">
                  Subtasks (optional)
                </label>

                {/* Existing Subtasks */}
                {subtasks.length > 0 && (
                  <div className="mb-3">
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
                      {subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm">
                            {subtask.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSubtask(index)}
                            className="p-1 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer flex-shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {subtasks.length > 5 && (
                      <p className="text-xs text-[var(--muted)] mt-2 italic">
                        {subtasks.length} subtasks • Scroll to view all
                      </p>
                    )}
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
                    className="px-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
              <button
                type="submit"
                className="px-8 py-2.5 text-sm font-medium bg-[var(--foreground)] text-[var(--background)] rounded-lg hover:opacity-90 transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
