import { useState, useRef, useEffect } from "react";
import { Tracker } from "@/types/tracker";
import { ProgressBar } from "./ProgressBar";
import { formatDeadlineForInput } from "@/utils/dateUtils";

interface TrackerCardProps {
  tracker: Tracker;
  onToggleSubtask: (subtaskId: string) => void;
  onToggleMain: () => void;
  onDelete: () => void;
  onInlineEdit?: (updates: Partial<Tracker>) => void;
  onToggleInProgress?: () => void;
  onToggleSubtaskInProgress?: (subtaskId: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
}

export function TrackerCard({
  tracker,
  onToggleSubtask,
  onToggleMain,
  onDelete,
  onInlineEdit,
  onToggleInProgress,
  onToggleSubtaskInProgress,
  isSelected,
  onSelect,
  onEdit,
}: TrackerCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [titleDraft, setTitleDraft] = useState(tracker.title);
  const [timeDraft, setTimeDraft] = useState<number>(tracker.timeEstimate);
  const [deadlineDraft, setDeadlineDraft] = useState(
    tracker.deadline ? formatDeadlineForInput(tracker.deadline) : ""
  );

  const truncateText = (text: string, maxLength: number = 40): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const isOverdue = tracker.deadline && tracker.deadline < new Date();

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const commitTitle = () => {
    setEditingTitle(false);
    if (onInlineEdit && titleDraft.trim() && titleDraft !== tracker.title) {
      onInlineEdit({ title: titleDraft.trim() });
    }
  };

  const commitDeadline = () => {
    setEditingDeadline(false);
    if (onInlineEdit) {
      const newDeadline = deadlineDraft ? new Date(deadlineDraft) : undefined;
      if (newDeadline?.getTime() !== tracker.deadline?.getTime()) {
        onInlineEdit({ deadline: newDeadline });
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select if clicking on interactive elements
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLButtonElement
    ) {
      return;
    }
    onSelect?.();
  };

  const handleEditTrigger = () => {
    setEditingTitle(true);
    onEdit?.();
  };

  return (
    <div
      className={`border rounded-lg shadow-sm p-5 transition-colors cursor-pointer ${
        isSelected
          ? "border-[var(--foreground)] bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface)]"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3 gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
          <input
            type="checkbox"
            checked={tracker.completed}
            onChange={onToggleMain}
            className="mt-1 w-4 h-4 rounded-full border-[var(--border)] bg-transparent text-[var(--foreground)] focus:ring-0 focus:outline-none"
          />
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitle();
                  if (e.key === "Escape") {
                    setTitleDraft(tracker.title);
                    setEditingTitle(false);
                  }
                }}
                className="w-full bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none text-base font-semibold"
              />
            ) : (
              <h3
                onClick={handleEditTrigger}
                className={`text-base font-semibold cursor-pointer hover:text-[var(--muted)] ${
                  tracker.completed ? "line-through text-[var(--muted-2)]" : ""
                } ${
                  tracker.inProgress
                    ? "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                    : ""
                }`}
                title={tracker.title} // Show full title on hover
              >
                {truncateText(tracker.title, 35)}
              </h3>
            )}
            {tracker.description && (
              <p className="text-sm text-[var(--muted)] line-clamp-3 mt-1">
                {tracker.description}
              </p>
            )}
            {/* In Progress Toggle */}
            <button
              onClick={onToggleInProgress}
              className={`mt-1 px-2 py-1 text-xs rounded border transition-colors ${
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
          </div>
        </label>
        <button
          onClick={handleDelete}
          className={`shrink-0 ml-2 px-2 py-1 text-sm rounded border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-colors`}
        >
          {showDeleteConfirm ? "Confirm" : "×"}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Progress
          </span>
          <span className="text-sm font-medium">{tracker.progress}%</span>
        </div>
        <ProgressBar progress={tracker.progress} />
      </div>

      <div className="space-y-2 mb-4">
        {tracker.subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 mb-1">
            <label className="flex items-center gap-2 cursor-pointer group flex-1">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggleSubtask(subtask.id)}
                className="w-4 h-4 rounded-full border-[var(--border)] bg-transparent text-[var(--foreground)] focus:ring-0 focus:outline-none"
              />
              <span
                className={`text-sm transition-colors ${
                  subtask.completed
                    ? "line-through text-[var(--muted-2)]"
                    : subtask.inProgress
                    ? "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium"
                    : "text-[var(--foreground)] group-hover:text-[var(--muted)]"
                }`}
              >
                {subtask.text}
              </span>
            </label>
            {/* Subtask In Progress Toggle */}
            <button
              onClick={() => onToggleSubtaskInProgress?.(subtask.id)}
              className={`px-1 py-0.5 text-xs rounded border transition-colors ${
                subtask.inProgress
                  ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white border-blue-500"
                  : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              }`}
              title={subtask.inProgress ? "Stop work" : "Start work"}
            >
              {subtask.inProgress ? "◼" : "▶"}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1">
          <span>Time</span>
          <input
            type="number"
            value={timeDraft}
            min={1}
            onChange={(e) => setTimeDraft(Number(e.target.value))}
            onBlur={() => onInlineEdit?.({ timeEstimate: timeDraft })}
            className="ml-1 w-16 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none"
          />
          <span>min</span>
        </span>
        {tracker.deadline && (
          <span className={isOverdue ? "font-medium" : ""}>
            {editingDeadline ? (
              <input
                autoFocus
                type="datetime-local"
                value={deadlineDraft}
                onChange={(e) => setDeadlineDraft(e.target.value)}
                onBlur={commitDeadline}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitDeadline();
                  if (e.key === "Escape") {
                    setDeadlineDraft(
                      tracker.deadline
                        ? formatDeadlineForInput(tracker.deadline)
                        : ""
                    );
                    setEditingDeadline(false);
                  }
                }}
                className="bg-transparent text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none"
              />
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDeadline(true);
                }}
                className="cursor-pointer hover:text-[var(--foreground)]"
              >
                Due {formatDeadline(tracker.deadline)}
              </span>
            )}
          </span>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="mt-3 p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-[var(--muted)]">
          Click &quot;Confirm&quot; again to delete this tracker permanently.
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="ml-2 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
