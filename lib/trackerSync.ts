import { supabase } from "@/lib/supabase";
import { Tracker, Subtask } from "@/types/tracker";
import { Database } from "@/types/database";

type TrackerRow = Database["public"]["Tables"]["trackers"]["Row"];
type TrackerInsert = Database["public"]["Tables"]["trackers"]["Insert"];
type TrackerUpdate = Database["public"]["Tables"]["trackers"]["Update"];

export class TrackerSyncService {
  // Convert database row to app Tracker format
  static dbToTracker(row: TrackerRow): Tracker {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      timeEstimate: row.time_estimate,
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      subtasks: (row.subtasks as unknown as Subtask[]) || [],
      createdAt: new Date(row.created_at),
      progress: row.progress,
      completed: row.completed,
      celebrated: row.celebrated || false,
      group: row.group_tags || undefined,
      inProgress: row.in_progress || false,
    };
  }

  // Convert app Tracker to database insert format
  static trackerToDbInsert(tracker: Tracker, userId: string): TrackerInsert {
    return {
      id: tracker.id,
      user_id: userId,
      title: tracker.title,
      description: tracker.description,
      time_estimate: tracker.timeEstimate,
      deadline: tracker.deadline?.toISOString() || null,
      subtasks:
        tracker.subtasks as unknown as Database["public"]["Tables"]["trackers"]["Row"]["subtasks"],
      created_at: tracker.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      progress: tracker.progress,
      completed: tracker.completed,
      celebrated: tracker.celebrated || false,
      group_tags: Array.isArray(tracker.group)
        ? tracker.group
        : tracker.group
        ? [tracker.group]
        : null,
      in_progress: tracker.inProgress || false,
    };
  }

  // Convert app Tracker to database update format
  static trackerToDbUpdate(tracker: Tracker): TrackerUpdate {
    return {
      title: tracker.title,
      description: tracker.description,
      time_estimate: tracker.timeEstimate,
      deadline: tracker.deadline?.toISOString() || null,
      subtasks:
        tracker.subtasks as unknown as Database["public"]["Tables"]["trackers"]["Row"]["subtasks"],
      updated_at: new Date().toISOString(),
      progress: tracker.progress,
      completed: tracker.completed,
      celebrated: tracker.celebrated || false,
      group_tags: Array.isArray(tracker.group)
        ? tracker.group
        : tracker.group
        ? [tracker.group]
        : null,
      in_progress: tracker.inProgress || false,
    };
  }

  // Fetch all trackers for a user
  static async fetchUserTrackers(userId: string): Promise<Tracker[]> {
    const { data, error } = await supabase
      .from("trackers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trackers:", error);
      throw new Error("Failed to fetch trackers from database");
    }

    return (data || []).map(this.dbToTracker);
  }

  // Save a tracker to database
  static async saveTracker(tracker: Tracker, userId: string): Promise<void> {
    const { error } = await supabase
      .from("trackers")
      .upsert(this.trackerToDbInsert(tracker, userId));

    if (error) {
      console.error("Error saving tracker:", error);
      throw new Error("Failed to save tracker to database");
    }
  }

  // Save multiple trackers to database
  static async saveTrackers(
    trackers: Tracker[],
    userId: string
  ): Promise<void> {
    if (trackers.length === 0) return;

    // Validate user ID
    if (!userId) {
      throw new Error("User ID is required for saving trackers");
    }

    const dbTrackers = trackers.map((tracker) =>
      this.trackerToDbInsert(tracker, userId)
    );

    const { error } = await supabase.from("trackers").upsert(dbTrackers);

    if (error) {
      console.error("Error saving trackers:", error);

      // Provide more specific error messages
      if (error.code === "42501") {
        throw new Error(
          "Permission denied: Please check your authentication or contact support"
        );
      } else if (error.code === "23505") {
        throw new Error("Duplicate tracker found");
      } else {
        throw new Error(`Failed to save trackers: ${error.message}`);
      }
    }
  }

  // Update a tracker in database
  static async updateTracker(
    trackerId: string,
    userId: string,
    updates: Partial<Tracker>
  ): Promise<void> {
    const dbUpdates = this.trackerToDbUpdate({ ...updates } as Tracker);

    const { error } = await supabase
      .from("trackers")
      .update(dbUpdates)
      .eq("id", trackerId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating tracker:", error);
      throw new Error("Failed to update tracker in database");
    }
  }

  // Delete a tracker from database
  static async deleteTracker(trackerId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("trackers")
      .delete()
      .eq("id", trackerId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting tracker:", error);
      throw new Error("Failed to delete tracker from database");
    }
  }

  // Clear all trackers for a user (for logout)
  static async clearUserTrackers(userId: string): Promise<void> {
    const { error } = await supabase
      .from("trackers")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing user trackers:", error);
      throw new Error("Failed to clear user trackers from database");
    }
  }
}
