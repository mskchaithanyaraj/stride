"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Edit3 } from "lucide-react";
import { Tracker } from "@/types/tracker";

interface TaskCardProps {
  tracker: Tracker;
  onDelete: (id: string) => void;
  onToggleSubtask: (trackerId: string, subtaskId: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleInProgress?: (id: string) => void;
  onToggleSubtaskInProgress?: (trackerId: string, subtaskId: string) => void;
  onCompleteAllSubtasks: (trackerId: string) => void;
  onResetAllSubtasks: (trackerId: string) => void;
  onEdit?: (tracker: Tracker) => void;
}

export function TaskCard({
  tracker,
  onDelete,
  onToggleSubtask,
  onToggleCompleted,
  onToggleInProgress,
  onToggleSubtaskInProgress,
  onCompleteAllSubtasks,
  onResetAllSubtasks,
  onEdit,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUncheckedWarning, setShowUncheckedWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "No deadline";
    const now = new Date();
    const deadline = new Date(date);

    // Check if it's today
    if (deadline.toDateString() === now.toDateString()) {
      return `Today ${deadline.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Check if it's this year
    if (deadline.getFullYear() === now.getFullYear()) {
      return deadline.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return deadline.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleContainerToggle = () => {
    // If task is currently completed and has subtasks with progress, show warning
    if (
      tracker.completed &&
      tracker.subtasks.length > 0 &&
      tracker.progress > 0
    ) {
      setShowUncheckedWarning(true);
      return;
    }

    if (tracker.subtasks.length > 0) {
      // If has subtasks, complete all subtasks too
      onCompleteAllSubtasks(tracker.id);
    } else {
      // If no subtasks, just toggle the main task
      onToggleCompleted(tracker.id);
    }
  };

  const handleConfirmUncheck = () => {
    // Use the dedicated function to reset all subtasks and main task at once
    onResetAllSubtasks(tracker.id);
    setShowUncheckedWarning(false);
  };

  const handleConfirmDelete = () => {
    onDelete(tracker.id);
    setShowDeleteWarning(false);
  };

  const getStatusTag = (): { label: string; className: string } => {
    if (tracker.completed || tracker.progress === 100) {
      return {
        label: "Completed",
        className:
          "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]",
      };
    }

    if (tracker.deadline) {
      const now = new Date();
      const deadline = new Date(tracker.deadline);

      if (deadline < now) {
        return {
          label: "Overdue",
          className:
            "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] font-medium",
        };
      }

      return {
        label: "Pending",
        className:
          "bg-[var(--hover)] text-[var(--muted)] border-[var(--border)]",
      };
    }

    return {
      label: "No deadline",
      className:
        "bg-[var(--surface)] text-[var(--muted-2)] border-[var(--border)]",
    };
  };

  const statusTag = getStatusTag();

  // Determine if we should show container-level checkbox (always show now)
  const hasSubtasks = tracker.subtasks.length > 0;

  return (
    <>
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:shadow-sm transition-shadow">
        {/* Header with Checkbox (always present), Title, and Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 flex items-start gap-3">
            {/* Container-level checkbox - always present */}
            <input
              type="checkbox"
              checked={tracker.completed}
              onChange={(e) => {
                e.stopPropagation();
                handleContainerToggle();
              }}
              className="w-4 h-4 mt-0.5 rounded-full border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--foreground)] focus:ring-opacity-20 cursor-pointer"
            />

            <div className="flex-1">
              <h3
                className={`font-medium text-sm leading-tight mb-2 ${
                  tracker.completed 
                    ? "line-through text-[var(--muted)]" 
                    : tracker.inProgress
                    ? "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                    : "text-[var(--foreground)]"
                }`}
                title={tracker.title} // Show full title on hover
              >
                {isExpanded ? tracker.title : truncateText(tracker.title, 40)}
              </h3>

              {/* In Progress Toggle - Only show if task is not completed */}
              {!tracker.completed && (
                <button
                  onClick={() => onToggleInProgress?.(tracker.id)}
                  className={`mb-2 px-2 py-1 text-xs rounded border transition-colors ${
                    tracker.inProgress
                      ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white border-blue-500"
                      : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                  title={
                    tracker.inProgress
                      ? "Mark as not in progress"
                      : "Mark as in progress"
                  }
                >
                  {tracker.inProgress ? "In Progress" : "Start Work"}
                </button>
              )}

              {/* Tags Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date Tag */}
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                  Due: {formatDate(tracker.deadline)}
                </span>

                {/* Status Tag */}
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border ${statusTag.className}`}
                >
                  {statusTag.label}
                </span>

                {/* Group Tags */}
                {tracker.group && (
                  <>
                    {Array.isArray(tracker.group) ? (
                      tracker.group.map((group, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700 rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700 rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {tracker.group.charAt(0).toUpperCase() +
                          tracker.group.slice(1)}
                      </span>
                    )}
                  </>
                )}

                {/* Time Estimate Tag - Only show for custom deadlines with time estimate */}
                {tracker.timeEstimate > 0 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--muted)]">
                    {(() => {
                      const totalMinutes = tracker.timeEstimate;
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;

                      if (hours > 0) {
                        return `${hours}h ${minutes}m`;
                      } else if (minutes > 0) {
                        return `${minutes}m`;
                      } else {
                        return "< 1m";
                      }
                    })()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] rounded transition-colors cursor-pointer"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tracker);
                }}
                className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] rounded transition-colors cursor-pointer"
                title="Edit task"
              >
                <Edit3 size={16} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteWarning(true);
              }}
              className="p-1 text-[var(--muted)] hover:text-red-500 rounded transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar - only show for tasks with subtasks when expanded */}
        {hasSubtasks && isExpanded && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
              <span>Progress</span>
              <span>{tracker.progress}%</span>
            </div>
            <div className="w-full bg-[var(--surface)] rounded-full h-2">
              <div
                className="bg-[var(--foreground)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${tracker.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtasks - only show when expanded */}
        {hasSubtasks && isExpanded && (
          <div className="space-y-2">
            <h4 className="text-xs text-[var(--muted)] font-medium">
              Subtasks
            </h4>
            {tracker.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(tracker.id, subtask.id)}
                  className="w-4 h-4 rounded-full border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--foreground)] focus:ring-opacity-20 cursor-pointer"
                />
                <span
                  className={`text-sm flex-1 ${
                    subtask.completed
                      ? "line-through text-[var(--muted)]"
                      : subtask.inProgress
                      ? "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {subtask.text}
                </span>
                {/* Subtask In Progress Toggle - Only show if subtask is not completed */}
                {!subtask.completed && (
                  <button
                    onClick={() =>
                      onToggleSubtaskInProgress?.(tracker.id, subtask.id)
                    }
                    className={`px-1 py-0.5 text-xs rounded border transition-colors ${
                      subtask.inProgress
                        ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white border-blue-500"
                        : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    }`}
                    title={subtask.inProgress ? "Stop work" : "Start work"}
                  >
                    {subtask.inProgress ? "◼" : "▶"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Expanded Details - Remove description since it's not preferred */}
      </div>

      {/* Warning Modal for Unchecking Task with Progress */}
      {showUncheckedWarning && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[var(--background)]/95 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Reset Task Progress?
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  This will uncheck the main task and reset all subtask
                  progress. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowUncheckedWarning(false)}
                  className="px-4 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUncheck}
                  className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for Deleting Task */}
      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[var(--background)]/95 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <Trash2
                    size={24}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Delete Task?
                </h3>
                <p className="text-sm text-[var(--muted)] mb-2">
                  Are you sure you want to delete the task:
                </p>
                <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                  &ldquo;{truncateText(tracker.title, 35)}&rdquo;
                </p>
                <p className="text-sm text-[var(--muted)]">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteWarning(false)}
                  className="px-4 py-2 text-sm bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
