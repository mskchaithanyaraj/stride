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

  const [showHelp, setShowHelp] = useState(false);
  const [showOverdueOverlay, setShowOverdueOverlay] = useState(false);
  const [showTodayOverlay, setShowTodayOverlay] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [dismissedSyncError, setDismissedSyncError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "name" | "date" | "deadline" | "overdue"
  >("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
    let tasks: Tracker[] = [];

    // First, filter by category
    switch (activeCategory) {
      case "all":
        // Show ALL tasks regardless of category
        tasks = trackers;
        break;
      case "completed":
        // Show all completed tasks regardless of category
        tasks = trackers.filter((tracker) => tracker.completed);
        break;
      case "in-progress":
        // Show all in-progress tasks regardless of category
        tasks = trackers.filter((tracker) => tracker.inProgress);
        break;
      case "not-started":
        // Show all not-started tasks regardless of category
        tasks = trackers.filter(
          (tracker) => !tracker.completed && !tracker.inProgress
        );
        break;
      case "urgent":
      default:
        // For urgent and custom categories, filter by category field
        tasks = trackers.filter(
          (tracker) =>
            tracker.category?.toLowerCase() === activeCategory.toLowerCase()
        );
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.subtasks?.some((st) => st.text.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sortedTasks = [...tasks];
    switch (sortBy) {
      case "name":
        sortedTasks.sort((a, b) => {
          const result = a.title.localeCompare(b.title);
          return sortOrder === "asc" ? result : -result;
        });
        break;
      case "date":
        sortedTasks.sort((a, b) => {
          const result =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return sortOrder === "asc" ? result : -result;
        });
        break;
      case "deadline":
        sortedTasks.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          const result =
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          return sortOrder === "asc" ? result : -result;
        });
        break;
      case "overdue":
        sortedTasks.sort((a, b) => {
          const now = new Date();
          const aOverdue =
            a.deadline && new Date(a.deadline) < now && !a.completed;
          const bOverdue =
            b.deadline && new Date(b.deadline) < now && !b.completed;
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          return 0;
        });
        break;
      default:
        // Keep default order
        break;
    }

    return sortedTasks;
  }, [trackers, activeCategory, searchQuery, sortBy, sortOrder]);

  // Organize tasks for overlays (overdue only)
  const organizedTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const overdueTasks: Tracker[] = [];

    trackers.forEach((tracker) => {
      if (!tracker.deadline) {
        return;
      }

      const deadline = new Date(tracker.deadline);

      if (deadline < today && !tracker.completed) {
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

    return {
      overdue: overdueTasks,
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
            overdueCount={organizedTasks.overdue.length}
            onShowOverdue={() => setShowOverdueOverlay(true)}
            isSyncing={isSyncing}
            isLoggedIn={isLoggedIn}
            onCreateTask={addTracker}
            onShowHelp={() => setShowHelp(true)}
            isLargeScreen={isLargeScreen}
            activeCategory={activeCategory}
            customCategories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Title with Search and Sort Controls */}
          <div className="mb-4 mt-4">
            {/* Desktop: Single row layout */}
            <div className="hidden md:flex items-center justify-between gap-4 mb-4">
              {/* Left: Title and Stats */}
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold">
                  {activeCategory === "all"
                    ? "All Tasks"
                    : activeCategory.charAt(0).toUpperCase() +
                      activeCategory.slice(1)}
                </h2>
                <span className="text-sm text-[var(--muted)]">
                  {filteredTasks.filter((t) => t.completed).length} of{" "}
                  {filteredTasks.length} completed
                </span>
              </div>

              {/* Right: Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)] mr-1">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  <option value="default">Default</option>
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="deadline">Deadline</option>
                  <option value="overdue">Overdue</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--hover)] transition-colors flex items-center gap-1"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  <span className="text-xs text-[var(--muted)]">
                    {sortOrder === "asc" ? "Asc" : "Desc"}
                  </span>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Mobile: Stacked layout */}
            <div className="md:hidden space-y-3">
              {/* Title, Stats, and Sort on same line */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold">
                    {activeCategory === "all"
                      ? "All Tasks"
                      : activeCategory.charAt(0).toUpperCase() +
                        activeCategory.slice(1)}
                  </h2>
                  <span className="text-sm text-[var(--muted)]">
                    {filteredTasks.filter((t) => t.completed).length} of{" "}
                    {filteredTasks.length} completed
                  </span>
                </div>

                {/* Sort Controls - Compact */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="default">Default</option>
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="deadline">Deadline</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs hover:bg-[var(--hover)] transition-colors"
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>

              {/* Search Bar - Mobile only (hidden on large screens since navbar has it) */}
              <div className="relative md:hidden">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-[var(--muted)]"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* All Tasks Layout - Simple single column view for now */}
          <div className="grid gap-3 sm:gap-5 min-h-[calc(100vh-200px)] overflow-y-auto pb-24">
            {/* All Tasks - combined view */}
            <TaskColumn
              title=""
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
