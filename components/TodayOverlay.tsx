"use client";

import { Tracker } from "@/types/tracker";

interface TodayOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  todayTasks: Tracker[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isOverdueOverlay?: boolean;
  isPastCompletedOverlay?: boolean;
}

export function TodayOverlay({
  isVisible,
  onClose,
  todayTasks,
  onToggleTask,
  onDeleteTask,
  isOverdueOverlay = false,
  isPastCompletedOverlay = false,
}: TodayOverlayProps) {
  if (!isVisible) return null;

  const completedTasks = todayTasks.filter((task) => task.completed);
  const pendingTasks = todayTasks.filter((task) => !task.completed);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">
            {isPastCompletedOverlay
              ? "Past Completed Tasks"
              : isOverdueOverlay
              ? "Overdue Tasks"
              : "Today's Tasks"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">
              <p>
                {isPastCompletedOverlay
                  ? "No past completed tasks!"
                  : isOverdueOverlay
                  ? "No overdue tasks!"
                  : "No tasks for today yet."}
              </p>
              <p className="text-sm mt-2">
                {isPastCompletedOverlay
                  ? "All completed tasks for previous days have been deleted."
                  : isOverdueOverlay
                  ? "You're all caught up on deadlines."
                  : "Create one to get started!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      Pending
                    </span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      {pendingTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded"
                      >
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="w-4 h-4 border border-[var(--border)] rounded flex-shrink-0 hover:bg-[var(--hover)]"
                          title="Toggle Complete"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-[var(--muted)] truncate">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--muted)]">
                              {task.progress}% complete
                            </span>
                            {task.deadline && (
                              <span className="text-xs text-[var(--muted)]">
                                Due:{" "}
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200"
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      Completed
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {completedTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded opacity-60"
                      >
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="w-4 h-4 bg-[var(--foreground)] border border-[var(--border)] rounded flex-shrink-0 flex items-center justify-center"
                          title="Toggle Complete"
                        >
                          <span className="text-[var(--background)] text-xs">
                            ✓
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate line-through">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-[var(--muted)] truncate line-through">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200"
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded text-sm hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
