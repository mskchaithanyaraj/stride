import { useState, useCallback, useMemo } from "react";
import { Tracker, Subtask, SortOption } from "@/types/tracker";
import { useLocalStorage } from "./useLocalStorage";

export function useTrackers() {
  const [trackers, setTrackers] = useLocalStorage<Tracker[]>(
    "stride-trackers",
    []
  );
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");

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
      setTrackers((prev) => [...prev, tracker]);
      return tracker;
    },
    [setTrackers, calculateProgress]
  );

  const updateTracker = useCallback(
    (id: string, updates: Partial<Tracker>) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
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
        })
      );
    },
    [setTrackers, calculateProgress]
  );

  const deleteTracker = useCallback(
    (id: string) => {
      setTrackers((prev) => prev.filter((tracker) => tracker.id !== id));
    },
    [setTrackers]
  );

  const toggleTrackerCompleted = useCallback(
    (trackerId: string) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          if (tracker.id !== trackerId) return tracker;
          const newCompleted = !tracker.completed;
          const updatedSubtasks = tracker.subtasks.map((s) => ({
            ...s,
            completed: newCompleted ? true : s.completed,
          }));
          // If marking completed, mark all subtasks completed; if unchecking, keep existing subtasks states
          const finalSubtasks = newCompleted
            ? tracker.subtasks.map((s) => ({ ...s, completed: true }))
            : updatedSubtasks;
          return {
            ...tracker,
            completed: newCompleted,
            subtasks: finalSubtasks,
            progress: calculateProgress(finalSubtasks, newCompleted),
            celebrated: newCompleted ? tracker.celebrated : false,
          };
        })
      );
    },
    [setTrackers, calculateProgress]
  );

  const toggleSubtask = useCallback(
    (trackerId: string, subtaskId: string) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          if (tracker.id === trackerId) {
            const updatedSubtasks = tracker.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            );
            const newProgress = calculateProgress(updatedSubtasks, false);
            return {
              ...tracker,
              subtasks: updatedSubtasks,
              progress: newProgress,
              completed: newProgress === 100,
              celebrated: newProgress === 100 ? tracker.celebrated : false,
            };
          }
          return tracker;
        })
      );
    },
    [setTrackers, calculateProgress]
  );

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

  // Grouping helpers: Today, Weekly, Monthly
  const groups = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(now);
    const day = endOfWeek.getDay(); // 0 Sun .. 6 Sat
    const diffToSunday = 6 - day; // end of week as Saturday 23:59 (adjust as needed)
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

  const markCelebrated = useCallback(
    (id: string) => {
      setTrackers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, celebrated: true } : t))
      );
    },
    [setTrackers]
  );

  const completeAllSubtasks = useCallback(
    (trackerId: string) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          if (tracker.id === trackerId) {
            // Mark all subtasks as completed
            const completedSubtasks = tracker.subtasks.map((subtask) => ({
              ...subtask,
              completed: true,
            }));

            return {
              ...tracker,
              subtasks: completedSubtasks,
              progress: 100,
              completed: true,
              celebrated: false, // Reset celebration for newly completed task
            };
          }
          return tracker;
        })
      );
    },
    [setTrackers]
  );

  const resetAllSubtasks = useCallback(
    (trackerId: string) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          if (tracker.id === trackerId) {
            // Mark all subtasks as uncompleted
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
        })
      );
    },
    [setTrackers]
  );

  const toggleTrackerInProgress = useCallback(
    (trackerId: string) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          if (tracker.id === trackerId) {
            return {
              ...tracker,
              inProgress: !tracker.inProgress,
            };
          }
          return tracker;
        })
      );
    },
    [setTrackers]
  );

  const toggleSubtaskInProgress = useCallback(
    (trackerId: string, subtaskId: string) => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          if (tracker.id === trackerId) {
            const updatedSubtasks = tracker.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, inProgress: !subtask.inProgress }
                : subtask
            );
            return {
              ...tracker,
              subtasks: updatedSubtasks,
            };
          }
          return tracker;
        })
      );
    },
    [setTrackers]
  );

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
  };
}
