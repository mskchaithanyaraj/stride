"use client";

import { useState, useEffect, useMemo, useRef } from "react";
// (moved inside Home component)
import { useTrackers } from "@/hooks/useTrackers";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CompletionToast } from "@/components/CompletionToast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoIcon } from "@/components/InfoIcon";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { TodayOverlay } from "@/components/TodayOverlay";
import { KeyboardManager } from "@/components/KeyboardManager";
import { HelpOverlay } from "@/components/HelpOverlay";
import { TaskColumn } from "@/components/TaskColumn";
import { EditTrackerModal } from "@/components/EditTrackerModal";
import { LayoutControl } from "@/components/LayoutControl";
import { Tracker } from "@/types/tracker";

export default function Home() {
  const {
    trackers,
    addTracker,
    deleteTracker,
    updateTracker,
    toggleSubtask,
    toggleTrackerCompleted,
    toggleTrackerInProgress,
    toggleSubtaskInProgress,
    completeAllSubtasks,
    resetAllSubtasks,
  } = useTrackers();

  const [completionToast, setCompletionToast] = useState<{
    isVisible: boolean;
    taskTitle: string;
    trackerId: string;
  }>({
    isVisible: false,
    taskTitle: "",
    trackerId: "",
  });

  // EditTrackerModal state
  const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [showAcronym, setShowAcronym] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // State for showing overdue tasks overlay
  const [showOverdueOverlay, setShowOverdueOverlay] = useState(false);
  const [showTodayOverlay, setShowTodayOverlay] = useState(false);
  const [showPastCompletedOverlay, setShowPastCompletedOverlay] =
    useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Layout control state with localStorage persistence
  const [layoutColumns, setLayoutColumns] = useLocalStorage<1 | 2 | 3 | 4>(
    "stride-layout-columns",
    3
  );
  const [selectedColumns, setSelectedColumns] = useLocalStorage<string[]>(
    "stride-selected-columns",
    ["today", "month", "year"]
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const celebratedTasksRef = useRef<Set<string>>(new Set());

  // Handle responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsLargeScreen(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Set responsive defaults only once on mount
  useEffect(() => {
    const width = window.innerWidth;

    // Only set responsive defaults if not already customized by user
    // Check if layoutColumns is still default (3) and selectedColumns is default
    const isDefaultLayout =
      layoutColumns === 3 &&
      selectedColumns.length === 3 &&
      selectedColumns.includes("today") &&
      selectedColumns.includes("month") &&
      selectedColumns.includes("year");

    if (isDefaultLayout) {
      if (width < 768) {
        // mobile
        setLayoutColumns(1);
        setSelectedColumns(["today"]);
      } else if (width < 1024) {
        // tablet
        setLayoutColumns(2);
        setSelectedColumns(["today", "month"]);
      }
      // Large screen keeps default 3 columns
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load celebrated tasks from localStorage on mount
  useEffect(() => {
    try {
      const storedCelebratedTasks = localStorage.getItem("celebrated-tasks");
      if (storedCelebratedTasks) {
        const taskIds = JSON.parse(storedCelebratedTasks);
        celebratedTasksRef.current = new Set(taskIds);
      }
    } catch (error) {
      console.warn("Failed to load celebrated tasks from localStorage:", error);
    }
  }, []);

  // Hide acronym after 4 seconds with smooth transition
  useEffect(() => {
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true);
      // Start fade out after 3.5 seconds
    }, 8000);

    const hideTimer = setTimeout(() => {
      setShowAcronym(false);
      setIsTransitioning(false);
      // Complete transition after 4 seconds
    }, 8500);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Save celebrated tasks to localStorage whenever the set changes
  const addCelebratedTask = (taskId: string) => {
    celebratedTasksRef.current.add(taskId);
    try {
      localStorage.setItem(
        "celebrated-tasks",
        JSON.stringify(Array.from(celebratedTasksRef.current))
      );
    } catch (error) {
      console.warn("Failed to save celebrated tasks to localStorage:", error);
    }
  };

  // Remove celebrated task from localStorage
  const removeCelebratedTask = (taskId: string) => {
    celebratedTasksRef.current.delete(taskId);
    try {
      localStorage.setItem(
        "celebrated-tasks",
        JSON.stringify(Array.from(celebratedTasksRef.current))
      );
    } catch (error) {
      console.warn("Failed to save celebrated tasks to localStorage:", error);
    }
  };

  // Filter trackers by search query (includes title, description, and group)
  const filteredTrackers = useMemo(() => {
    if (searchQuery === "") return trackers;

    const query = searchQuery.toLowerCase();
    return trackers.filter((tracker) => {
      const groupText = Array.isArray(tracker.group)
        ? tracker.group.join(" ").toLowerCase()
        : tracker.group?.toLowerCase() || "";

      return (
        tracker.title.toLowerCase().includes(query) ||
        tracker.description.toLowerCase().includes(query) ||
        groupText.includes(query)
      );
    });
  }, [trackers, searchQuery]);

  // Organize tasks into columns based on deadlines, and separate overdue tasks
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
    const overdueTasks: Tracker[] = [];
    const monthTasks: Tracker[] = [];
    const yearTasks: Tracker[] = [];
    const customTasks: Tracker[] = [];
    const pastCompletedTasks: Tracker[] = [];

    filteredTrackers.forEach((tracker) => {
      if (!tracker.deadline) {
        customTasks.push(tracker);
        return;
      }

      const deadline = new Date(tracker.deadline);

      if (tracker.completed && deadline < today) {
        pastCompletedTasks.push(tracker);
      } else if (deadline < today) {
        overdueTasks.push(tracker);
      } else if (deadline <= endOfToday) {
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
    overdueTasks.sort(sortByDeadline);
    monthTasks.sort(sortByDeadline);
    yearTasks.sort(sortByDeadline);
    customTasks.sort(sortByDeadline);

    return {
      today: todayTasks,
      overdue: overdueTasks,
      month: monthTasks,
      year: yearTasks,
      custom: customTasks,
      pastCompleted: pastCompletedTasks,
    };
  }, [filteredTrackers]);

  // Effect to watch for task completion and trigger toast
  useEffect(() => {
    const completedTracker = trackers.find(
      (tracker) =>
        tracker.progress === 100 &&
        tracker.completed &&
        !completionToast.isVisible &&
        !celebratedTasksRef.current.has(tracker.id)
    );

    if (completedTracker) {
      setCompletionToast({
        isVisible: true,
        taskTitle: completedTracker.title,
        trackerId: completedTracker.id,
      });
      // Mark this task as celebrated in this session and persist it
      addCelebratedTask(completedTracker.id);
    }
  }, [trackers, completionToast.isVisible]);

  // Clean up celebrated tasks when they're unchecked
  useEffect(() => {
    trackers.forEach((tracker) => {
      if (!tracker.completed && celebratedTasksRef.current.has(tracker.id)) {
        removeCelebratedTask(tracker.id);
      }
    });
  }, [trackers]);

  const handleToggleSubtask = (trackerId: string, subtaskId: string) => {
    toggleSubtask(trackerId, subtaskId);
  };

  const handleDeleteTracker = (trackerId: string) => {
    deleteTracker(trackerId);
  };

  const handleEditTracker = (tracker: Tracker) => {
    setEditingTracker(tracker);
    setIsEditModalOpen(true);
  };

  const handleSaveTrackerEdit = (updates: Partial<Tracker>) => {
    if (editingTracker) {
      updateTracker(editingTracker.id, updates);
    }
    setIsEditModalOpen(false);
    setEditingTracker(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTracker(null);
  };

  const handleLayoutChange = (columns: 1 | 2 | 3 | 4) => {
    setLayoutColumns(columns);
  };

  const handleColumnSelectionChange = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  const handleShowColumnSelector = (show: boolean) => {
    setShowColumnSelector(show);
  };

  // Calculate responsive grid columns
  const getGridColumns = () => {
    const columnCount = selectedColumns.length || 1;

    if (isLargeScreen) {
      return Math.min(columnCount, layoutColumns);
    } else {
      // For tablets and mobile, use CSS classes instead
      return columnCount;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-5 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2 w-full">
          <div className="flex-shrink-0">
            <h1 className="font-bold tracking-wider">
              {showAcronym ? (
                /* Full STRIDE Acronym */
                <div
                  className={`${
                    isTransitioning ? "animate-fade-out" : "animate-fade-in"
                  }`}
                >
                  <span className="text-3xl text-red-500 animate-letter-s">
                    S
                  </span>
                  <span className="text-[12px] font-sans italic animate-word animate-word-s">
                    <span className="sub-letter sub-letter-1">i</span>
                    <span className="sub-letter sub-letter-2">m</span>
                    <span className="sub-letter sub-letter-3">p</span>
                    <span className="sub-letter sub-letter-4">l</span>
                    <span className="sub-letter sub-letter-5">i</span>
                    <span className="sub-letter sub-letter-6">f</span>
                    <span className="sub-letter sub-letter-7">y</span>{" "}
                  </span>
                  <span className="text-3xl text-red-500 animate-letter-t">
                    T
                  </span>
                  <span className="text-[12px] font-sans italic animate-word animate-word-t">
                    <span className="sub-letter sub-letter-1">r</span>
                    <span className="sub-letter sub-letter-2">a</span>
                    <span className="sub-letter sub-letter-3">c</span>
                    <span className="sub-letter sub-letter-4">k</span>{" "}
                  </span>
                  <span className="text-3xl text-red-500 animate-letter-r">
                    R
                  </span>
                  <span className="text-[12px] font-sans italic animate-word animate-word-r">
                    <span className="sub-letter sub-letter-1">e</span>
                    <span className="sub-letter sub-letter-2">a</span>
                    <span className="sub-letter sub-letter-3">c</span>
                    <span className="sub-letter sub-letter-4">h</span>{" "}
                  </span>
                  <span className="text-3xl text-red-500 animate-letter-i">
                    I
                  </span>
                  <span className="text-[12px] font-sans italic animate-word animate-word-i">
                    <span className="sub-letter sub-letter-1">m</span>
                    <span className="sub-letter sub-letter-2">p</span>
                    <span className="sub-letter sub-letter-3">r</span>
                    <span className="sub-letter sub-letter-4">o</span>
                    <span className="sub-letter sub-letter-5">v</span>
                    <span className="sub-letter sub-letter-6">e</span>{" "}
                  </span>
                  <span className="text-3xl text-red-500 animate-letter-d">
                    D
                  </span>
                  <span className="text-[12px] font-sans italic animate-word animate-word-d">
                    <span className="sub-letter sub-letter-1">e</span>
                    <span className="sub-letter sub-letter-2">l</span>
                    <span className="sub-letter sub-letter-3">i</span>
                    <span className="sub-letter sub-letter-4">v</span>
                    <span className="sub-letter sub-letter-5">e</span>
                    <span className="sub-letter sub-letter-6">r</span>{" "}
                  </span>
                  <span className="text-3xl text-red-500 animate-letter-e">
                    E
                  </span>
                  <span className="text-[12px] font-sans italic animate-word animate-word-e">
                    <span className="sub-letter sub-letter-1">v</span>
                    <span className="sub-letter sub-letter-2">e</span>
                    <span className="sub-letter sub-letter-3">r</span>
                    <span className="sub-letter sub-letter-4">y</span>
                    <span className="sub-letter sub-letter-5">d</span>
                    <span className="sub-letter sub-letter-6">a</span>
                    <span className="sub-letter sub-letter-7">y</span>
                  </span>
                </div>
              ) : (
                /* Simple Stride Logo */
                <div className="text-3xl animate-fade-in">
                  <span className="text-red-500">S</span>
                  <span className="text-[var(--foreground)]">tride</span>
                </div>
              )}
            </h1>
          </div>

          {/* Search Bar - Center for large screens */}
          <div
            className={`${
              isLargeScreen
                ? "order-2 flex-1 max-w-md mx-8"
                : "order-3 w-full mt-2"
            }`}
          >
            <input
              type="text"
              placeholder="Search tasks & groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div
            className={`flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0 ${
              isLargeScreen ? "order-3" : "order-2"
            }`}
          >
            {organizedTasks.overdue.length > 0 && (
              <button
                className="px-2 py-1 rounded border border-[var(--border)] bg-transparent text-[var(--foreground)] text-xs font-medium hover:bg-[var(--surface)] focus:outline-none transition cursor-pointer flex items-center gap-1"
                onClick={() => setShowOverdueOverlay(true)}
                type="button"
                style={{ touchAction: "manipulation" }}
              >
                <span>Overdue Tasks</span>
                <span className="ml-1 inline-block min-w-[20px] text-center rounded-full bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                  {organizedTasks.overdue.length}
                </span>
              </button>
            )}
            {organizedTasks.pastCompleted.length > 0 && (
              <button
                className="px-2 py-1 rounded border border-[var(--border)] bg-transparent text-[var(--foreground)] text-xs font-medium hover:bg-[var(--surface)] focus:outline-none transition cursor-pointer flex items-center gap-1"
                onClick={() => setShowPastCompletedOverlay(true)}
                type="button"
                style={{ touchAction: "manipulation" }}
              >
                <span>Past Completed</span>
                <span className="ml-1 inline-block min-w-[20px] text-center rounded-full bg-[var(--border)] text-[var(--foreground)] text-[10px] px-1.5 py-0.5">
                  {organizedTasks.pastCompleted.length}
                </span>
              </button>
            )}
            {/* Past Completed Tasks Overlay */}
            {showPastCompletedOverlay && (
              <TodayOverlay
                isVisible={showPastCompletedOverlay}
                onClose={() => setShowPastCompletedOverlay(false)}
                todayTasks={organizedTasks.pastCompleted}
                onToggleTask={(taskId) => toggleTrackerCompleted(taskId)}
                onDeleteTask={handleDeleteTracker}
                onEditTask={handleEditTracker}
                isOverdueOverlay={false}
                isPastCompletedOverlay={true}
              />
            )}
            <LayoutControl
              layoutColumns={layoutColumns}
              onLayoutChange={handleLayoutChange}
              selectedColumns={selectedColumns}
              onColumnSelectionChange={handleColumnSelectionChange}
              showColumnSelector={showColumnSelector}
              onShowColumnSelector={handleShowColumnSelector}
            />
            <HeaderAddButton onCreateTask={addTracker} />
            <InfoIcon onShowHelp={() => setShowHelp(true)} />
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Column Layout */}
        <div
          className={`grid gap-3 sm:gap-5 min-h-[calc(100vh-200px)] overflow-y-auto ${
            !isLargeScreen ? "grid-cols-1 md:grid-cols-2" : ""
          }`}
          style={
            isLargeScreen
              ? {
                  gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
                }
              : undefined
          }
        >
          {/* Today's Tasks Column */}
          {selectedColumns.includes("today") && (
            <TaskColumn
              title="Today"
              category="today"
              tasks={organizedTasks.today}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onToggleInProgress={toggleTrackerInProgress}
              onToggleSubtaskInProgress={toggleSubtaskInProgress}
              onCompleteAllSubtasks={completeAllSubtasks}
              onResetAllSubtasks={resetAllSubtasks}
              onEditTask={handleEditTracker}
              emptyMessage={
                organizedTasks.today.length === 0
                  ? "No tasks for today"
                  : undefined
              }
            />
          )}
          {/* Overdue Tasks Overlay */}
          {showOverdueOverlay && (
            <TodayOverlay
              isVisible={showOverdueOverlay}
              onClose={() => setShowOverdueOverlay(false)}
              todayTasks={organizedTasks.overdue}
              onToggleTask={(taskId) => toggleTrackerCompleted(taskId)}
              onDeleteTask={handleDeleteTracker}
              onEditTask={handleEditTracker}
              isOverdueOverlay={true}
            />
          )}

          {/* This Month Column */}
          {selectedColumns.includes("month") && (
            <TaskColumn
              title="This Month"
              category="month"
              tasks={organizedTasks.month}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onToggleInProgress={toggleTrackerInProgress}
              onToggleSubtaskInProgress={toggleSubtaskInProgress}
              onCompleteAllSubtasks={completeAllSubtasks}
              onResetAllSubtasks={resetAllSubtasks}
              onEditTask={handleEditTracker}
              emptyMessage="No tasks this month"
            />
          )}

          {/* This Year Column */}
          {selectedColumns.includes("year") && (
            <TaskColumn
              title="This Year"
              category="year"
              tasks={organizedTasks.year}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onToggleInProgress={toggleTrackerInProgress}
              onToggleSubtaskInProgress={toggleSubtaskInProgress}
              onCompleteAllSubtasks={completeAllSubtasks}
              onResetAllSubtasks={resetAllSubtasks}
              onEditTask={handleEditTracker}
              emptyMessage="No tasks this year"
            />
          )}

          {/* Later this Year Column */}
          {selectedColumns.includes("custom") && (
            <TaskColumn
              title="Later this Year"
              category="custom"
              tasks={organizedTasks.custom}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onToggleInProgress={toggleTrackerInProgress}
              onToggleSubtaskInProgress={toggleSubtaskInProgress}
              onCompleteAllSubtasks={completeAllSubtasks}
              onResetAllSubtasks={resetAllSubtasks}
              onEditTask={handleEditTracker}
              emptyMessage="No tasks for later this year"
            />
          )}

          {/* Show message when no tasks exist and no columns selected */}
          {selectedColumns.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold mb-2">
                No columns selected
              </h3>
              <p className="text-[var(--muted)] mb-6">
                Please select at least one column to display your tasks.
              </p>
            </div>
          )}
        </div>

        {/* Completion Toast */}
        <CompletionToast
          isVisible={completionToast.isVisible}
          taskTitle={completionToast.taskTitle}
          onClose={() =>
            setCompletionToast({
              isVisible: false,
              taskTitle: "",
              trackerId: "",
            })
          }
          onDelete={() => {
            if (completionToast.trackerId) {
              deleteTracker(completionToast.trackerId);
            }
            setCompletionToast({
              isVisible: false,
              taskTitle: "",
              trackerId: "",
            });
          }}
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
          onDeleteTask={handleDeleteTracker}
          onEditTask={handleEditTracker}
          isOverdueOverlay={false}
        />

        {/* Help Overlay */}
        {showHelp && (
          <HelpOverlay
            isVisible={showHelp}
            onClose={() => setShowHelp(false)}
          />
        )}

        {/* Edit Tracker Modal */}
        {editingTracker && (
          <EditTrackerModal
            tracker={editingTracker}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSave={handleSaveTrackerEdit}
          />
        )}
      </div>
    </div>
  );
}
