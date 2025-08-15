"use client";

import { useState } from "react";
import { Tracker } from "@/types/tracker";

interface TaskCardProps {
  tracker: Tracker;
  onDelete: (id: string) => void;
  onToggleSubtask: (trackerId: string, subtaskId: string) => void;
  onToggleCompleted: (id: string) => void;
  onCompleteAllSubtasks: (trackerId: string) => void;
}

export function TaskCard({
  tracker,
  onDelete,
  onToggleSubtask,
  onToggleCompleted,
  onCompleteAllSubtasks,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    if (tracker.subtasks.length > 0) {
      // If has subtasks, complete all subtasks too
      onCompleteAllSubtasks(tracker.id);
    } else {
      // If no subtasks, just toggle the main task
      onToggleCompleted(tracker.id);
    }
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
            className="w-4 h-4 mt-0.5 rounded border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--foreground)] focus:ring-opacity-20"
          />

          <div className="flex-1">
            <h3
              className={`font-medium text-sm leading-tight mb-2 ${
                tracker.completed ? "line-through text-[var(--muted)]" : ""
              }`}
            >
              {tracker.title}
            </h3>

            {/* Tags Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date Tag */}
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded">
                Due: {formatDate(tracker.deadline)}
              </span>

              {/* Status Tag */}
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${statusTag.className}`}
              >
                {statusTag.label}
              </span>

              {/* Time Estimate Tag */}
              {tracker.timeEstimate > 0 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--muted)]">
                  {tracker.timeEstimate}
                  {tracker.timeEstimate > 60 ? "d" : "min"}
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
              className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] rounded transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tracker.id);
            }}
            className="p-1 text-[var(--muted)] hover:text-red-500 rounded transition-colors"
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>

      {/* Progress Bar - only show for tasks with subtasks */}
      {hasSubtasks && (
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

      {/* Subtasks */}
      {hasSubtasks && (
        <div className="space-y-2">
          <h4 className="text-xs text-[var(--muted)] font-medium">Subtasks</h4>
          {tracker.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggleSubtask(tracker.id, subtask.id)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--foreground)] focus:ring-opacity-20"
              />
              <span
                className={`text-sm flex-1 ${
                  subtask.completed
                    ? "line-through text-[var(--muted)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {subtask.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Details - Remove description since it's not preferred */}
    </div>
  );
}
