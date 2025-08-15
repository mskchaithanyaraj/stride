"use client";

import { useState, useEffect, useMemo } from "react";
import { useTrackers } from "@/hooks/useTrackers";
import { CompletionToast } from "@/components/CompletionToast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoIcon } from "@/components/InfoIcon";
import { TodayOverlay } from "@/components/TodayOverlay";
import { KeyboardManager } from "@/components/KeyboardManager";
import { HelpOverlay } from "@/components/HelpOverlay";
import { TaskColumn } from "@/components/TaskColumn";
import { UniversalCreateBar } from "@/components/UniversalCreateBar";
import { Tracker } from "@/types/tracker";

export default function Home() {
  const {
    trackers,
    addTracker,
    deleteTracker,
    toggleSubtask,
    toggleTrackerCompleted,
    completeAllSubtasks,
    markCelebrated,
  } = useTrackers();

  const [completionToast, setCompletionToast] = useState<{
    isVisible: boolean;
    taskTitle: string;
  }>({
    isVisible: false,
    taskTitle: "",
  });

  const [showHelp, setShowHelp] = useState(false);
  const [showTodayOverlay, setShowTodayOverlay] = useState(false);

  // Organize tasks into columns based on deadlines
  const organizedTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const endOfYear = new Date(now.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    const todayTasks: Tracker[] = [];
    const monthTasks: Tracker[] = [];
    const yearTasks: Tracker[] = [];
    const customTasks: Tracker[] = [];

    trackers.forEach((tracker) => {
      if (!tracker.deadline) {
        customTasks.push(tracker);
        return;
      }

      const deadline = new Date(tracker.deadline);

      if (deadline <= endOfToday) {
        todayTasks.push(tracker);
      } else if (deadline <= endOfMonth) {
        monthTasks.push(tracker);
      } else if (deadline <= endOfYear) {
        yearTasks.push(tracker);
      } else {
        customTasks.push(tracker);
      }
    });

    // Sort tasks within each column by deadline (earliest first)
    const sortByDeadline = (a: Tracker, b: Tracker) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    };

    todayTasks.sort(sortByDeadline);
    monthTasks.sort(sortByDeadline);
    yearTasks.sort(sortByDeadline);
    customTasks.sort(sortByDeadline);

    return {
      today: todayTasks,
      month: monthTasks,
      year: yearTasks,
      custom: customTasks,
    };
  }, [trackers]);

  // Effect to watch for task completion and trigger toast
  useEffect(() => {
    const completedTracker = trackers.find(
      (tracker) =>
        tracker.progress === 100 &&
        tracker.completed &&
        !completionToast.isVisible &&
        !tracker.celebrated
    );

    if (completedTracker) {
      setCompletionToast({
        isVisible: true,
        taskTitle: completedTracker.title,
      });
      markCelebrated(completedTracker.id);
    }
  }, [trackers, completionToast.isVisible, markCelebrated]);

  const handleToggleSubtask = (trackerId: string, subtaskId: string) => {
    toggleSubtask(trackerId, subtaskId);
  };

  const handleDeleteTracker = (trackerId: string) => {
    deleteTracker(trackerId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Stride</h1>
            <p className="text-[var(--muted)] text-sm">
              Track your progress, one step at a time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <InfoIcon onShowHelp={() => setShowHelp(true)} />
            <ThemeToggle />
          </div>
        </header>

        {/* Universal Creation Bar */}
        <UniversalCreateBar onCreateTask={addTracker} />

        {/* 3-Column Layout */}
        <div
          className="grid gap-6 h-[calc(100vh-300px)]"
          style={{
            gridTemplateColumns: `repeat(${
              [
                organizedTasks.today.length > 0,
                organizedTasks.month.length > 0,
                organizedTasks.year.length > 0,
              ].filter(Boolean).length || 1
            }, 1fr)`,
          }}
        >
          {/* Today's Tasks Column */}
          {organizedTasks.today.length > 0 && (
            <TaskColumn
              title="Today"
              category="today"
              tasks={organizedTasks.today}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onCompleteAllSubtasks={completeAllSubtasks}
            />
          )}

          {/* This Month Column */}
          {organizedTasks.month.length > 0 && (
            <TaskColumn
              title="This Month"
              category="month"
              tasks={organizedTasks.month}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onCompleteAllSubtasks={completeAllSubtasks}
            />
          )}

          {/* This Year Column */}
          {organizedTasks.year.length > 0 && (
            <TaskColumn
              title="This Year"
              category="year"
              tasks={organizedTasks.year}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onCompleteAllSubtasks={completeAllSubtasks}
            />
          )}

          {/* Show message when no tasks exist */}
          {organizedTasks.today.length === 0 &&
            organizedTasks.month.length === 0 &&
            organizedTasks.year.length === 0 &&
            organizedTasks.custom.length === 0 && (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                <p className="text-[var(--muted)] mb-6">
                  Create your first task using the bar above!
                </p>
              </div>
            )}
        </div>

        {/* Custom Timeline Tasks (if any) */}
        {organizedTasks.custom.length > 0 && (
          <div className="mt-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              <TaskColumn
                title="Custom Timeline"
                category="custom"
                tasks={organizedTasks.custom}
                onDeleteTask={handleDeleteTracker}
                onToggleSubtask={handleToggleSubtask}
                onToggleCompleted={toggleTrackerCompleted}
                onCompleteAllSubtasks={completeAllSubtasks}
              />
            </div>
          </div>
        )}

        {/* Completion Toast */}
        <CompletionToast
          isVisible={completionToast.isVisible}
          taskTitle={completionToast.taskTitle}
          onClose={() =>
            setCompletionToast({ isVisible: false, taskTitle: "" })
          }
        />

        {/* Keyboard Shortcuts Manager */}
        <KeyboardManager
          shortcuts={[]}
          onShowHelp={() => setShowHelp(true)}
          onShowTodayOverlay={() => setShowTodayOverlay(true)}
        />

        {/* Today Tasks Overlay */}
        <TodayOverlay
          isVisible={showTodayOverlay}
          onClose={() => setShowTodayOverlay(false)}
          todayTasks={organizedTasks.today}
          onToggleTask={(taskId) => toggleTrackerCompleted(taskId)}
        />

        {/* Help Overlay */}
        {showHelp && (
          <HelpOverlay
            isVisible={showHelp}
            onClose={() => setShowHelp(false)}
          />
        )}
      </div>
    </div>
  );
}
