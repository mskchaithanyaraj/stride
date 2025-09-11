import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Tracker, Subtask, SortOption } from "@/types/tracker";
import { useLocalStorage } from "./useLocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import { TrackerSyncService } from "@/lib/trackerSync";
import toast from "react-hot-toast";

export function useTrackersWithSync() {
  const { user, session } = useAuth();
  const [localTrackers, setLocalTrackers] = useLocalStorage<Tracker[]>(
    "stride-trackers",
    []
  );
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Track sync state
  const hasInitialSync = useRef(false);
  const lastSyncTime = useRef<number>(0);
  const isCurrentlySync = useRef(false);

  // Data conflict handling
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<{
    local: Tracker[];
    cloud: Tracker[];
  } | null>(null);

  const calculateProgress = useCallback(
    (subtasks: Subtask[], completed: boolean = false): number => {
      if (subtasks.length === 0) return completed ? 100 : 0;
      const completedSubtasks = subtasks.filter(
        (task) => task.completed
      ).length;
      return Math.round((completedSubtasks / subtasks.length) * 100);
    },
    []
  );

  // Merge function to combine local and cloud data intelligently
  const mergeTrackers = useCallback(
    (local: Tracker[], cloud: Tracker[]): Tracker[] => {
      const mergedMap = new Map<string, Tracker>();

      // Add all cloud trackers first
      cloud.forEach((tracker) => {
        mergedMap.set(tracker.id, tracker);
      });

      // Add local trackers, preferring newer ones based on creation time
      local.forEach((localTracker) => {
        const cloudTracker = mergedMap.get(localTracker.id);
        if (!cloudTracker) {
          // New local tracker not in cloud
          mergedMap.set(localTracker.id, localTracker);
        } else {
          // Compare modification times and keep the newer one
          const localTime = localTracker.createdAt.getTime();
          const cloudTime = cloudTracker.createdAt.getTime();
          if (localTime > cloudTime) {
            mergedMap.set(localTracker.id, localTracker);
          }
        }
      });

      return Array.from(mergedMap.values());
    },
    []
  );

  // Initial sync when user logs in
  const performInitialSync = useCallback(async () => {
    if (!user || !session || hasInitialSync.current) return;

    setIsSyncing(true);
    setSyncError(null);
    isCurrentlySync.current = true; // Mark that we're syncing

    try {
      const cloudTrackers = await TrackerSyncService.fetchUserTrackers(user.id);

      // Simple sync strategy - avoid repeated conflicts
      if (cloudTrackers.length > 0) {
        // Use cloud data if it exists
        setTrackers(cloudTrackers);
        setLocalTrackers(cloudTrackers);
      } else if (localTrackers.length > 0) {
        // Sync local to cloud if cloud is empty
        await TrackerSyncService.saveTrackers(localTrackers, user.id);
        setTrackers(localTrackers);
      } else {
        // Both are empty, start fresh
        setTrackers([]);
      }

      hasInitialSync.current = true;
      lastSyncTime.current = Date.now();
    } catch (error) {
      console.error("Sync error:", error);
      setSyncError(error instanceof Error ? error.message : "Sync failed");
      toast.error("Failed to sync with cloud. Using local data.");
      setTrackers(localTrackers);
    } finally {
      setIsSyncing(false);
      isCurrentlySync.current = false; // Mark sync complete
    }
  }, [user, session, localTrackers, setLocalTrackers]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback(
    async (resolution: "local" | "cloud" | "merge") => {
      if (!conflictData || !user) return;

      setIsSyncing(true);
      try {
        let finalTrackers: Tracker[];

        switch (resolution) {
          case "local":
            finalTrackers = conflictData.local;
            await TrackerSyncService.saveTrackers(finalTrackers, user.id);
            break;
          case "cloud":
            finalTrackers = conflictData.cloud;
            break;
          case "merge":
            finalTrackers = mergeTrackers(
              conflictData.local,
              conflictData.cloud
            );
            await TrackerSyncService.saveTrackers(finalTrackers, user.id);
            break;
          default:
            throw new Error("Invalid resolution option");
        }

        setTrackers(finalTrackers);
        setLocalTrackers(finalTrackers);
        hasInitialSync.current = true;
        lastSyncTime.current = Date.now();
      } catch (error) {
        console.error("Conflict resolution error:", error);
        toast.error("Failed to resolve conflict. Using local data.");
        setTrackers(conflictData.local);
      } finally {
        setIsSyncing(false);
        setShowConflictModal(false);
        setConflictData(null);
      }
    },
    [conflictData, user, mergeTrackers, setLocalTrackers]
  );

  // Sync to cloud after local changes
  const syncToCloud = useCallback(
    async (updatedTrackers: Tracker[]) => {
      if (!user || !hasInitialSync.current) return;

      try {
        setIsSyncing(true);
        isCurrentlySync.current = true; // Prevent celebrations during sync

        await TrackerSyncService.saveTrackers(updatedTrackers, user.id);
        lastSyncTime.current = Date.now();
      } catch (error) {
        console.error("Cloud sync error:", error);
        // Don't show error toast for background sync failures
      } finally {
        setIsSyncing(false);
        isCurrentlySync.current = false; // Re-enable celebrations
      }
    },
    [user]
  );

  // Clear data on logout
  const clearSyncData = useCallback(() => {
    setTrackers([]);
    setLocalTrackers([]);
    hasInitialSync.current = false;
    lastSyncTime.current = 0;
    setSyncError(null);
  }, [setLocalTrackers]);

  // Update trackers with sync
  const updateTrackersWithSync = useCallback(
    (updatedTrackers: Tracker[]) => {
      setTrackers(updatedTrackers);
      setLocalTrackers(updatedTrackers);

      // Debounced cloud sync
      if (user && hasInitialSync.current) {
        setTimeout(() => syncToCloud(updatedTrackers), 1000);
      }
    },
    [user, setLocalTrackers, syncToCloud]
  );

  // Initial sync effect
  useEffect(() => {
    if (user && session && !hasInitialSync.current) {
      performInitialSync();
    } else if (!user && hasInitialSync.current) {
      clearSyncData();
    }
  }, [user, session, performInitialSync, clearSyncData]);

  // Load local data when not logged in
  useEffect(() => {
    if (!user && !hasInitialSync.current) {
      setTrackers(localTrackers);
    }
  }, [user, localTrackers]);

  const addTracker = useCallback(
    (
      newTracker: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
    ) => {
      const tracker: Tracker = {
        ...newTracker,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        progress: calculateProgress(newTracker.subtasks, false),
        completed: false,
        celebrated: false,
      };

      const updatedTrackers = [...trackers, tracker];
      updateTrackersWithSync(updatedTrackers);
      return tracker;
    },
    [trackers, calculateProgress, updateTrackersWithSync]
  );

  const updateTracker = useCallback(
    (id: string, updates: Partial<Tracker>) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id === id) {
          const updated = { ...tracker, ...updates };
          if (updates.subtasks) {
            updated.progress = calculateProgress(
              updates.subtasks,
              updated.completed
            );
          }
          return updated;
        }
        return tracker;
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, calculateProgress, updateTrackersWithSync]
  );

  const deleteTracker = useCallback(
    async (id: string) => {
      // Delete from cloud first if user is logged in
      if (user && hasInitialSync.current) {
        try {
          await TrackerSyncService.deleteTracker(id, user.id);
        } catch (error) {
          console.error("Failed to delete tracker from database:", error);
          // Continue with local deletion even if cloud delete fails
        }
      }

      const updatedTrackers = trackers.filter((tracker) => tracker.id !== id);
      setTrackers(updatedTrackers);
      setLocalTrackers(updatedTrackers);
    },
    [trackers, user, setLocalTrackers]
  );

  const toggleTrackerCompleted = useCallback(
    (trackerId: string) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id !== trackerId) return tracker;
        const newCompleted = !tracker.completed;
        const updatedSubtasks = tracker.subtasks.map((s) => ({
          ...s,
          completed: newCompleted ? true : s.completed,
        }));
        const finalSubtasks = newCompleted
          ? tracker.subtasks.map((s) => ({ ...s, completed: true }))
          : updatedSubtasks;
        return {
          ...tracker,
          completed: newCompleted,
          subtasks: finalSubtasks,
          progress: calculateProgress(finalSubtasks, newCompleted),
          celebrated: newCompleted ? tracker.celebrated : false,
          inProgress: newCompleted ? false : tracker.inProgress,
        };
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, calculateProgress, updateTrackersWithSync]
  );

  const toggleSubtask = useCallback(
    (trackerId: string, subtaskId: string) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id === trackerId) {
          const updatedSubtasks = tracker.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? {
                  ...subtask,
                  completed: !subtask.completed,
                  inProgress: !subtask.completed ? false : subtask.inProgress,
                }
              : subtask
          );
          const newProgress = calculateProgress(updatedSubtasks, false);
          return {
            ...tracker,
            subtasks: updatedSubtasks,
            progress: newProgress,
            completed: newProgress === 100,
            celebrated: newProgress === 100 ? tracker.celebrated : false,
            inProgress: newProgress === 100 ? false : tracker.inProgress,
          };
        }
        return tracker;
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, calculateProgress, updateTrackersWithSync]
  );

  // Additional methods (abbreviated for space, but follow same pattern)
  const toggleTrackerInProgress = useCallback(
    (trackerId: string) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id === trackerId) {
          return { ...tracker, inProgress: !tracker.inProgress };
        }
        return tracker;
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, updateTrackersWithSync]
  );

  const toggleSubtaskInProgress = useCallback(
    (trackerId: string, subtaskId: string) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id === trackerId) {
          const updatedSubtasks = tracker.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, inProgress: !subtask.inProgress }
              : subtask
          );
          const hasInProgressSubtask = updatedSubtasks.some(
            (subtask) => subtask.inProgress
          );
          return {
            ...tracker,
            subtasks: updatedSubtasks,
            inProgress: hasInProgressSubtask || tracker.inProgress,
          };
        }
        return tracker;
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, updateTrackersWithSync]
  );

  const completeAllSubtasks = useCallback(
    (trackerId: string) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id === trackerId) {
          const completedSubtasks = tracker.subtasks.map((subtask) => ({
            ...subtask,
            completed: true,
            inProgress: false,
          }));
          return {
            ...tracker,
            subtasks: completedSubtasks,
            progress: 100,
            completed: true,
            celebrated: false,
            inProgress: false,
          };
        }
        return tracker;
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, updateTrackersWithSync]
  );

  const resetAllSubtasks = useCallback(
    (trackerId: string) => {
      const updatedTrackers = trackers.map((tracker) => {
        if (tracker.id === trackerId) {
          const resetSubtasks = tracker.subtasks.map((subtask) => ({
            ...subtask,
            completed: false,
          }));
          return {
            ...tracker,
            subtasks: resetSubtasks,
            progress: 0,
            completed: false,
            celebrated: false,
          };
        }
        return tracker;
      });
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, updateTrackersWithSync]
  );

  const markCelebrated = useCallback(
    (id: string) => {
      const updatedTrackers = trackers.map((t) =>
        t.id === id ? { ...t, celebrated: true } : t
      );
      updateTrackersWithSync(updatedTrackers);
    },
    [trackers, updateTrackersWithSync]
  );

  // Sorting and grouping (same as original)
  const sortedTrackers = [...trackers].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      case "progress":
        return b.progress - a.progress;
      case "createdAt":
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const groups = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(now);
    const day = endOfWeek.getDay();
    const diffToSunday = 6 - day;
    endOfWeek.setDate(endOfWeek.getDate() + diffToSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const result = {
      today: [] as Tracker[],
      week: [] as Tracker[],
      month: [] as Tracker[],
      later: [] as Tracker[],
    };

    for (const t of sortedTrackers) {
      const due = t.deadline;
      if (!due) {
        result.later.push(t);
      } else if (due <= endOfToday) {
        result.today.push(t);
      } else if (due <= endOfWeek) {
        result.week.push(t);
      } else if (due <= endOfMonth) {
        result.month.push(t);
      } else {
        result.later.push(t);
      }
    }

    const sorter = (a: Tracker, b: Tracker) => {
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    };

    result.today.sort(sorter);
    result.week.sort(sorter);
    result.month.sort(sorter);
    result.later.sort(sorter);

    return result;
  }, [sortedTrackers, sortBy]);

  return {
    trackers: sortedTrackers,
    addTracker,
    updateTracker,
    deleteTracker,
    toggleSubtask,
    toggleTrackerCompleted,
    toggleTrackerInProgress,
    toggleSubtaskInProgress,
    completeAllSubtasks,
    resetAllSubtasks,
    sortBy,
    setSortBy,
    groups,
    markCelebrated,
    // Sync-specific properties
    isSyncing,
    syncError,
    showConflictModal,
    conflictData,
    onResolveConflict: handleConflictResolution,
    onCancelConflict: () => {
      setShowConflictModal(false);
      setConflictData(null);
      setTrackers(localTrackers);
    },
    lastSyncTime: lastSyncTime.current,
    isLoggedIn: !!user,
    isCurrentlySync: isCurrentlySync.current, // Add sync flag
  };
}
