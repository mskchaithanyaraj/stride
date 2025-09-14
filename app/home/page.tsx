"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useTrackersWithSync } from "@/hooks/useTrackersWithSync";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CompletionToast } from "@/components/CompletionToast";
import { TodayOverlay } from "@/components/TodayOverlay";
import { KeyboardManager } from "@/components/KeyboardManager";
import { HelpOverlay } from "@/components/HelpOverlay";
import { TaskColumn } from "@/components/TaskColumn";
import { EditTrackerModal } from "@/components/EditTrackerModal";
import { RouteGuard } from "@/components/RouteGuard";
import { DataConflictModal } from "@/components/DataConflictModal";
import { Navbar } from "@/components/Navbar";
import { Tracker } from "@/types/tracker";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
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
    // Sync-specific properties
    isSyncing,
    syncError,
    showConflictModal,
    conflictData,
    onResolveConflict,
    onCancelConflict,
    isLoggedIn,
    isCurrentlySync,
  } = useTrackersWithSync();

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
  const [dismissedSyncError, setDismissedSyncError] = useState(false);
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

  const celebratedTasksRef = useRef<Set<string>>(new Set());

  // Check for welcome parameter (from OAuth redirect) and show welcome toast
  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (welcome === "true") {
      // Remove the welcome parameter from URL without refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

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

  // Track if this is the initial load to prevent celebrating existing completed tasks
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  // Set initial load flag after trackers are first loaded
  useEffect(() => {
    if (trackers.length > 0 && !hasLoadedInitially) {
      // Mark all existing completed tasks as already celebrated to prevent initial celebrations
      trackers.forEach((tracker) => {
        if (tracker.completed && tracker.progress === 100) {
          celebratedTasksRef.current.add(tracker.id);
        }
      });

      // Set flag after a short delay to allow sync to complete
      const timer = setTimeout(() => {
        setHasLoadedInitially(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trackers, hasLoadedInitially]);

  // Effect to watch for task completion and trigger toast
  useEffect(() => {
    // Don't trigger celebrations during sync operations or initial load
    if (isCurrentlySync || !hasLoadedInitially) return;

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
  }, [
    trackers,
    completionToast.isVisible,
    isCurrentlySync,
    hasLoadedInitially,
  ]);

  // Clean up celebrated tasks when they're unchecked
  useEffect(() => {
    trackers.forEach((tracker) => {
      if (!tracker.completed && celebratedTasksRef.current.has(tracker.id)) {
        removeCelebratedTask(tracker.id);
      }
    });
  }, [trackers]);

  // Reset dismissed sync error when sync error changes
  useEffect(() => {
    if (syncError) {
      setDismissedSyncError(false);
    }
  }, [syncError]);

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
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-5 relative">
          {/* Header */}
          <Navbar
            showAcronym={showAcronym}
            isTransitioning={isTransitioning}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            overdueCount={organizedTasks.overdue.length}
            pastCompletedCount={organizedTasks.pastCompleted.length}
            onShowOverdue={() => setShowOverdueOverlay(true)}
            onShowPastCompleted={() => setShowPastCompletedOverlay(true)}
            isSyncing={isSyncing}
            isLoggedIn={isLoggedIn}
            layoutColumns={layoutColumns}
            onLayoutChange={handleLayoutChange}
            selectedColumns={selectedColumns}
            onColumnSelectionChange={handleColumnSelectionChange}
            onCreateTask={addTracker}
            onShowHelp={() => setShowHelp(true)}
            isLargeScreen={isLargeScreen}
          />

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

          {/* Data Conflict Modal */}
          <DataConflictModal
            isOpen={showConflictModal}
            localTrackers={conflictData?.local || []}
            cloudTrackers={conflictData?.cloud || []}
            onKeepLocal={() => onResolveConflict("local")}
            onKeepCloud={() => onResolveConflict("cloud")}
            onMerge={() => onResolveConflict("merge")}
            onClose={onCancelConflict}
          />

          {/* Sync Error Indicator */}
          {syncError && !dismissedSyncError && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white rounded-lg px-4 py-3 shadow-lg max-w-sm z-40">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 text-sm">
                  <div className="font-medium">Cloud sync unavailable</div>
                  {syncError.includes("Permission denied") ? (
                    <div className="text-xs opacity-90 mt-1">
                      Database permissions issue. Your data is saved locally.
                    </div>
                  ) : (
                    <div className="text-xs opacity-90 mt-1">
                      Using local storage only. Your data is safe.
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDismissedSyncError(true)}
                  className="flex-shrink-0 ml-2 hover:bg-red-600 rounded p-1 transition-colors"
                  title="Dismiss"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
