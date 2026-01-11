import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Tracker, Subtask } from "@/types/tracker";
import { DateTimePicker } from "./DateTimePicker";

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
  const [deadline, setDeadline] = useState<Date | undefined>(tracker.deadline);
  const [showExtendDeadline, setShowExtendDeadline] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(tracker.subtasks || []);
  const [inProgress, setInProgress] = useState(tracker.inProgress || false);
  const [isDaily, setIsDaily] = useState(tracker.isDaily || false);

  const handleSubtaskChange = (i: number, value: string) => {
    setSubtasks((subtasks) => {
      const next = [...subtasks];
      next[i].text = value;
      return next;
    });
  };

  const handleRemoveSubtask = (i: number) =>
    setSubtasks((subtasks) => subtasks.filter((_, idx) => idx !== i));

  const handleSave = () => {
    onSave({
      title: title.trim(),
      timeEstimate,
      deadline: deadline,
      subtasks,
      inProgress,
      isDaily,
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

          {/* Time Estimate and In Progress */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">Time:</span>
              <input
                type="number"
                min="0"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm text-[var(--muted)]">mins</span>
            </div>

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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-[var(--foreground)]">
                Daily Todo
              </span>
            </label>
          </div>

          {/* Deadline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                Deadline (optional)
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

            <DateTimePicker
              value={deadline}
              onChange={setDeadline}
              placeholder="No deadline set"
            />

            {/* Extended Deadline Options */}
            {showExtendDeadline && (
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-3">
                <h4 className="text-sm font-medium text-[var(--foreground)]">
                  Extend by:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = deadline ? new Date(deadline) : new Date();
                      current.setDate(current.getDate() + 1);
                      setDeadline(current);
                      setShowExtendDeadline(false);
                    }}
                    className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
                  >
                    +1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = deadline ? new Date(deadline) : new Date();
                      current.setDate(current.getDate() + 2);
                      setDeadline(current);
                      setShowExtendDeadline(false);
                    }}
                    className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
                  >
                    +2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = deadline ? new Date(deadline) : new Date();
                      current.setDate(current.getDate() + 7);
                      setDeadline(current);
                      setShowExtendDeadline(false);
                    }}
                    className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
                  >
                    +1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = deadline ? new Date(deadline) : new Date();
                      current.setMonth(current.getMonth() + 1);
                      setDeadline(current);
                      setShowExtendDeadline(false);
                    }}
                    className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
                  >
                    +1 Month
                  </button>
                </div>
                <div className="text-xs text-[var(--muted)]">
                  Or use the calendar above to set a custom deadline
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
