"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useTrackersWithSync } from "@/hooks/useTrackersWithSync";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { CompletionToast } from "@/components/CompletionToast";
import { TodayOverlay } from "@/components/TodayOverlay";
import { KeyboardManager } from "@/components/KeyboardManager";
import { HelpOverlay } from "@/components/HelpOverlay";
import { TaskColumn } from "@/components/TaskColumn";
import { EditTrackerModal } from "@/components/EditTrackerModal";
import { RouteGuard } from "@/components/RouteGuard";
import { DataConflictModal } from "@/components/DataConflictModal";
import { Navbar } from "@/components/Navbar";
import { CategoryBar, CategoryType } from "@/components/CategoryBar";
import { AddCategoryModal } from "@/components/AddCategoryModal";
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
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const { categories, addCategory, deleteCategory } = useCustomCategories();

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

  // Filter tasks based on active category
  const filteredTasks = useMemo(() => {
    switch (activeCategory) {
      case "all":
        return trackers;
      case "urgent":
        // Tasks with "urgent" tag only
        return trackers.filter((tracker) => {
          const hasUrgentTag = Array.isArray(tracker.group)
            ? tracker.group.some((g) => g.toLowerCase() === "urgent")
            : tracker.group?.toLowerCase() === "urgent";
          return hasUrgentTag;
        });
      case "completed":
        return trackers.filter((tracker) => tracker.completed);
      case "in-progress":
        return trackers.filter((tracker) => tracker.inProgress);
      case "not-started":
        return trackers.filter(
          (tracker) => !tracker.completed && !tracker.inProgress
        );
      default:
        // Custom category filter
        return trackers.filter((tracker) => {
          const groups = Array.isArray(tracker.group)
            ? tracker.group
            : tracker.group
            ? [tracker.group]
            : [];
          return groups.some(
            (g) => g.toLowerCase() === activeCategory.toLowerCase()
          );
        });
    }
  }, [trackers, activeCategory]);

  // Organize tasks for overlays (overdue and past completed)
  const organizedTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const overdueTasks: Tracker[] = [];
    const pastCompletedTasks: Tracker[] = [];

    trackers.forEach((tracker) => {
      if (!tracker.deadline) {
        return;
      }

      const deadline = new Date(tracker.deadline);

      if (tracker.completed && deadline < today) {
        pastCompletedTasks.push(tracker);
      } else if (deadline < today && !tracker.completed) {
        overdueTasks.push(tracker);
      }
    });

    // Sort tasks by deadline (earliest first)
    const sortByDeadline = (a: Tracker, b: Tracker) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    };

    overdueTasks.sort(sortByDeadline);
    pastCompletedTasks.sort(sortByDeadline);

    return {
      overdue: overdueTasks,
      pastCompleted: pastCompletedTasks,
    };
  }, [trackers]);

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

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-5 relative">
          {/* Header */}
          <Navbar
            showAcronym={showAcronym}
            isTransitioning={isTransitioning}
            overdueCount={organizedTasks.overdue.length}
            pastCompletedCount={organizedTasks.pastCompleted.length}
            onShowOverdue={() => setShowOverdueOverlay(true)}
            onShowPastCompleted={() => setShowPastCompletedOverlay(true)}
            isSyncing={isSyncing}
            isLoggedIn={isLoggedIn}
            onCreateTask={addTracker}
            onShowHelp={() => setShowHelp(true)}
            isLargeScreen={isLargeScreen}
            activeCategory={activeCategory}
          />

          {/* All Tasks Layout - Simple single column view for now */}
          <div className="grid gap-3 sm:gap-5 min-h-[calc(100vh-200px)] overflow-y-auto pb-24">
            {/* All Tasks - combined view */}
            <TaskColumn
              title={
                activeCategory === "all"
                  ? "All Tasks"
                  : activeCategory.charAt(0).toUpperCase() +
                    activeCategory.slice(1)
              }
              category="today"
              tasks={filteredTasks}
              onDeleteTask={handleDeleteTracker}
              onToggleSubtask={handleToggleSubtask}
              onToggleCompleted={toggleTrackerCompleted}
              onToggleInProgress={toggleTrackerInProgress}
              onToggleSubtaskInProgress={toggleSubtaskInProgress}
              onCompleteAllSubtasks={completeAllSubtasks}
              onResetAllSubtasks={resetAllSubtasks}
              onEditTask={handleEditTracker}
              emptyMessage="No tasks yet. Create one to get started!"
            />
          </div>

          {/* Category Bar */}
          <CategoryBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            customCategories={categories}
            position="bottom"
            onAddCategory={() => setShowAddCategoryModal(true)}
          />

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
            todayTasks={trackers.filter((t) => {
              if (!t.deadline) return false;
              const deadline = new Date(t.deadline);
              const now = new Date();
              const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              const endOfToday = new Date(today);
              endOfToday.setHours(23, 59, 59, 999);
              return deadline >= today && deadline <= endOfToday;
            })}
            onToggleTask={(taskId: string) => toggleTrackerCompleted(taskId)}
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
              onToggleTask={(taskId: string) => toggleTrackerCompleted(taskId)}
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
              onToggleTask={(taskId: string) => toggleTrackerCompleted(taskId)}
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

          {/* Add Category Modal */}
          <AddCategoryModal
            isOpen={showAddCategoryModal}
            onClose={() => setShowAddCategoryModal(false)}
            onAdd={addCategory}
          />

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
