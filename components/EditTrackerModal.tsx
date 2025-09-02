import { useState } from "react";
import { X, Tag, Calendar } from "lucide-react";
import { Tracker, Subtask } from "@/types/tracker";

interface EditTrackerModalProps {
  tracker: Tracker;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Tracker>) => void;
}

export function EditTrackerModal({
  tracker,
  isOpen,
  onClose,
  onSave,
}: EditTrackerModalProps) {
  const [title, setTitle] = useState(tracker.title);
  const [timeEstimate, setTimeEstimate] = useState(tracker.timeEstimate);
  const [deadline, setDeadline] = useState(
    tracker.deadline ? tracker.deadline.toISOString().slice(0, 16) : ""
  );
  const [showExtendDeadline, setShowExtendDeadline] = useState(false);
  const [extendedDeadline, setExtendedDeadline] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>(tracker.subtasks || []);
  const [groups, setGroups] = useState<string[]>(
    Array.isArray(tracker.group)
      ? tracker.group
      : tracker.group
      ? [tracker.group]
      : []
  );
  const [newGroup, setNewGroup] = useState("");
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [inProgress, setInProgress] = useState(tracker.inProgress || false);

  const handleSubtaskChange = (i: number, value: string) => {
    setSubtasks((subtasks) => {
      const next = [...subtasks];
      next[i].text = value;
      return next;
    });
  };

  const handleRemoveSubtask = (i: number) =>
    setSubtasks((subtasks) => subtasks.filter((_, idx) => idx !== i));

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

  const handleSave = () => {
    let finalDeadline: Date | undefined = undefined;

    // Use extended deadline if set, otherwise use original deadline
    if (extendedDeadline) {
      finalDeadline = new Date(extendedDeadline);
    } else if (deadline) {
      finalDeadline = new Date(deadline);
    }

    onSave({
      title: title.trim(),
      timeEstimate,
      deadline: finalDeadline,
      subtasks,
      group: groups.length > 0 ? groups : undefined,
      inProgress,
    });
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Edit Task
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Task Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to accomplish?"
              className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-[var(--border)] focus:outline-none focus:border-red-500 placeholder-[var(--muted)] transition-colors"
              autoFocus
            />
          </div>

          {/* Tags and Settings Row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Group Tags */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Existing Group Tags */}
              {groups.map((group, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-2 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 rounded-full text-sm"
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

            {/* Time Estimate */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">Time:</span>
              <input
                type="number"
                min={1}
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm text-[var(--muted)]">min</span>
            </div>

            {/* In Progress Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inProgress}
                onChange={(e) => setInProgress(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-[var(--foreground)]">
                In Progress
              </span>
            </label>
          </div>

          {/* Deadline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                Deadline
              </h3>
              <button
                type="button"
                onClick={() => setShowExtendDeadline(!showExtendDeadline)}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
              >
                <Calendar size={14} />
                <span>Extend Deadline</span>
              </button>
            </div>

            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {/* Extended Deadline Options */}
            {showExtendDeadline && (
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-3">
                <h4 className="text-sm font-medium text-[var(--foreground)]">
                  Extend to:
                </h4>
                <input
                  type="datetime-local"
                  value={extendedDeadline}
                  onChange={(e) => setExtendedDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Choose new deadline"
                />
                <div className="text-xs text-[var(--muted)]">
                  Select a new deadline to extend the current one
                </div>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                Subtasks
              </span>
              <span className="text-xs text-[var(--muted)]">(optional)</span>
            </div>

            {/* Add New Subtask - AT TOP */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    setSubtasks([
                      ...subtasks,
                      {
                        id: crypto.randomUUID(),
                        text: e.currentTarget.value.trim(),
                        completed: false,
                      },
                    ]);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget
                    .previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) {
                    setSubtasks([
                      ...subtasks,
                      {
                        id: crypto.randomUUID(),
                        text: input.value.trim(),
                        completed: false,
                      },
                    ]);
                    input.value = "";
                  }
                }}
                className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Existing Subtasks - BELOW input */}
            {subtasks.length > 0 && (
              <div className="space-y-2">
                {subtasks.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <input
                      value={s.text}
                      onChange={(e) => handleSubtaskChange(i, e.target.value)}
                      placeholder={`Subtask ${i + 1}`}
                      className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    {subtasks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(i)}
                        className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors"
                        title="Remove subtask"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
