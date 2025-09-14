"use client";

import { Tracker } from "@/types/tracker";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  title: string;
  category: "today" | "month" | "year" | "custom";
  tasks: Tracker[];
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (trackerId: string, subtaskId: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleInProgress?: (id: string) => void;
  onToggleSubtaskInProgress?: (trackerId: string, subtaskId: string) => void;
  onCompleteAllSubtasks: (trackerId: string) => void;
  onResetAllSubtasks: (trackerId: string) => void;
  onEditTask?: (tracker: Tracker) => void;
  emptyMessage?: string;
}

export function TaskColumn({
  title,
  category,
  tasks,
  onDeleteTask,
  onToggleSubtask,
  onToggleCompleted,
  onToggleInProgress,
  onToggleSubtaskInProgress,
  onCompleteAllSubtasks,
  onResetAllSubtasks,
  onEditTask,
  emptyMessage,
}: TaskColumnProps) {
  const getTaskCount = () => {
    const completed = tasks.filter(
      (t) => t.completed || t.progress === 100
    ).length;
    const total = tasks.length;
    return { completed, total };
  };

  const getDateInfo = () => {
    const now = new Date();
    switch (category) {
      case "today":
        return now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "month":
        return now.toLocaleDateString("en-US", {
          month: "long",
        });
      case "year":
        return now.getFullYear().toString();
      default:
        return null;
    }
  };

  const { completed, total } = getTaskCount();
  const dateInfo = getDateInfo();

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          {dateInfo && (
            <span className="text-xs text-[var(--muted)] opacity-60 font-normal">
              ({dateInfo})
            </span>
          )}
        </div>
        <div className="text-sm text-[var(--muted)]">
          {total === 0 ? "No tasks" : `${completed} of ${total} completed`}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center text-[var(--muted)] text-sm py-12">
            <p className="mb-1">
              {emptyMessage || "No tasks in this timeline"}
            </p>
            <p className="text-xs">Use the creation bar above to add tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              tracker={task}
              onDelete={onDeleteTask}
              onToggleSubtask={onToggleSubtask}
              onToggleCompleted={onToggleCompleted}
              onToggleInProgress={onToggleInProgress}
              onToggleSubtaskInProgress={onToggleSubtaskInProgress}
              onCompleteAllSubtasks={onCompleteAllSubtasks}
              onResetAllSubtasks={onResetAllSubtasks}
              onEdit={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
