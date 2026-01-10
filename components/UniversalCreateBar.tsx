"use client";

import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Tracker } from "@/types/tracker";

interface UniversalCreateBarProps {
  onCreateTask: (
    task: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
  ) => void;
  isModal?: boolean;
  activeCategory?: string;
}

export function UniversalCreateBar({
  onCreateTask,
  isModal = false,
  activeCategory,
}: UniversalCreateBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");

  // Initialize groups with activeCategory if it's a custom category
  const getInitialGroups = () => {
    if (
      !activeCategory ||
      activeCategory === "all" ||
      activeCategory === "urgent" ||
      activeCategory === "completed" ||
      activeCategory === "in-progress" ||
      activeCategory === "not-started"
    ) {
      return [];
    }
    return [activeCategory];
  };

  const [groups, setGroups] = useState<string[]>(getInitialGroups());
  const [newGroup, setNewGroup] = useState("");
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [subtasks, setSubtasks] = useState<Array<{ text: string }>>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    deadline?: string;
  }>({});

  // Calculate time estimate in minutes from hours, minutes
  const calculateTimeEstimate = (): number => {
    return hours * 60 + minutes;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    const newErrors: { title?: string; deadline?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Task name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const deadlineDate = deadline ? new Date(deadline) : undefined;
    const finalTimeEstimate = calculateTimeEstimate();

    const newTracker = {
      title: title.trim(),
      description: "",
      timeEstimate: finalTimeEstimate,
      deadline: deadlineDate,
      subtasks: subtasks.map((st) => ({
        id: crypto.randomUUID(),
        text: st.text,
        completed: false,
      })),
      group: groups.length > 0 ? groups : undefined,
    };

    onCreateTask(newTracker);

    // Reset form
    setTitle("");
    setGroups([]);
    setNewGroup("");
    setShowGroupInput(false);
    setHours(0);
    setMinutes(0);
    setDeadline("");
    setSubtasks([]);
    setNewSubtask("");
    setErrors({});
    setIsExpanded(false);
  };

  const addGroup = () => {
    if (
      newGroup.trim() &&
      groups.length < 3 &&
      !groups.includes(newGroup.trim())
    ) {
      setGroups([...groups, newGroup.trim()]);
      setNewGroup("");
      setShowGroupInput(false);
    }
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
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
    <div className={isModal ? "space-y-6" : "mb-4"}>
      {!isModal && !isExpanded ? (
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
        <div
          className={`${
            isModal ? "max-h-[70vh]" : "max-h-[80vh]"
          } overflow-y-auto`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.2) transparent",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Name */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                placeholder="What would you like to accomplish?"
                className={`w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 focus:outline-none transition-colors ${
                  errors.title
                    ? "border-red-500 placeholder-red-300"
                    : "border-[var(--border)] focus:border-red-500 placeholder-[var(--muted)]"
                }`}
                autoFocus
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-2">{errors.title}</p>
              )}
            </div>

            {/* Tags and Timeline Row */}
            <div className="flex items-center justify-between">
              {/* Group Tags */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Existing Group Tags */}
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Tag size={12} />
                    <span>{group}</span>
                    <button
                      type="button"
                      onClick={() => removeGroup(index)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-1"
                      title="Remove group"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Add New Group Button */}
                {groups.length < 3 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowGroupInput(!showGroupInput)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full transition-all bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]"
                      title="Add group label"
                    >
                      <Tag size={14} />
                      <span className="text-sm">Add Group</span>
                    </button>
                    {showGroupInput && (
                      <div
                        className="absolute top-full left-0 mt-2 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl p-4 z-20 w-64"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <input
                          type="text"
                          placeholder="personal, work, gmail..."
                          value={newGroup}
                          onChange={(e) => setNewGroup(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addGroup();
                            }
                          }}
                          onBlur={() =>
                            setTimeout(() => setShowGroupInput(false), 200)
                          }
                          className="w-full px-3 py-2 text-sm bg-transparent border-0 border-b border-[var(--border)] focus:outline-none focus:border-red-500"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              addGroup();
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGroup("");
                              setShowGroupInput(false);
                            }}
                            className="px-3 py-1 border border-[var(--border)] rounded text-xs hover:bg-[var(--hover)] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="mt-3 text-xs text-[var(--muted)]">
                          Try: personal, work, gmail, shopping, health
                          {groups.length >= 3 && (
                            <div className="text-red-500 mt-1">
                              Maximum 3 groups allowed
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Deadline Calendar Input */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[var(--foreground)] whitespace-nowrap">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    if (errors.deadline) {
                      setErrors({ ...errors, deadline: undefined });
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                {!isModal && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Time Estimate - Optional */}
            {deadline && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Time Estimate (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                      min="0"
                      max="23"
                      className="w-16 px-3 py-2 text-center bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-sm text-[var(--muted)]">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) =>
                        setMinutes(parseInt(e.target.value) || 0)
                      }
                      min="0"
                      max="59"
                      className="w-16 px-3 py-2 text-center bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-sm text-[var(--muted)]">minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">Subtasks</span>
                <span className="text-xs text-[var(--muted)]">(optional)</span>
              </div>

              {/* Add New Subtask - AT TOP */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-[var(--border)] focus:outline-none focus:border-red-500 text-sm placeholder-[var(--muted)]"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  disabled={!newSubtask.trim()}
                  className="px-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Existing Subtasks - BELOW input */}
              <div
                className={`space-y-2 ${
                  subtasks.length > 4 ? "max-h-40 overflow-y-auto pr-1" : ""
                }`}
                style={
                  subtasks.length > 4
                    ? {
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(0,0,0,0.2) transparent",
                      }
                    : {}
                }
              >
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm">
                      {subtask.text}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-red-500 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
