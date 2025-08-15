import { supabase } from "@/lib/supabase";
import { Tracker } from "@/types/tracker";

export interface Workspace {
  id: string;
  unique_code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export class WorkspaceManager {
  private static currentWorkspace: Workspace | null = null;
  private static workspaceCode: string | null = null;

  static async createWorkspace(
    name: string,
    customCode?: string,
    codeLength: number = 6
  ): Promise<{ workspace: Workspace; code: string }> {
    // Generate or use custom code
    let code: string;

    if (customCode) {
      // Validate custom code format
      const cleanCode = customCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (cleanCode.length < 3 || cleanCode.length > 8) {
        throw new Error("Code must be between 3 and 8 alphanumeric characters");
      }

      // Check if code already exists
      const { data: existingWorkspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("unique_code", cleanCode)
        .single();

      if (existingWorkspace) {
        throw new Error(
          "This code is already taken. Please choose a different one."
        );
      }

      code = cleanCode;
    } else {
      // Generate unique code with specified length
      code = await this.generateUniqueCode(codeLength);
    }

    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        unique_code: code,
        name: name,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workspace: ${error.message}`);
    }

    this.currentWorkspace = data;
    this.workspaceCode = code;

    // Store in localStorage for persistence (browser only)
    if (typeof window !== "undefined") {
      localStorage.setItem("stride-workspace-code", code);
      localStorage.setItem("stride-workspace", JSON.stringify(data));
    }

    return { workspace: data, code };
  }

  static async joinWorkspace(code: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from("workspaces")
      .select()
      .eq("unique_code", code.toUpperCase())
      .single();

    if (error || !data) {
      throw new Error(
        "Workspace not found. Please check your code and try again."
      );
    }

    this.currentWorkspace = data;
    this.workspaceCode = code.toUpperCase();

    // Store in localStorage for persistence (browser only)
    if (typeof window !== "undefined") {
      localStorage.setItem("stride-workspace-code", code.toUpperCase());
      localStorage.setItem("stride-workspace", JSON.stringify(data));
    }

    return data;
  }

  static getCurrentWorkspace(): Workspace | null {
    if (this.currentWorkspace) {
      return this.currentWorkspace;
    }

    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      return null;
    }

    // Try to load from localStorage
    const stored = localStorage.getItem("stride-workspace");
    const storedCode = localStorage.getItem("stride-workspace-code");

    if (stored && storedCode) {
      this.currentWorkspace = JSON.parse(stored);
      this.workspaceCode = storedCode;
      return this.currentWorkspace;
    }

    return null;
  }

  static getCurrentWorkspaceCode(): string | null {
    if (this.workspaceCode) {
      return this.workspaceCode;
    }

    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem("stride-workspace-code");
    if (stored) {
      this.workspaceCode = stored;
      return stored;
    }

    return null;
  }

  static leaveWorkspace(): void {
    this.currentWorkspace = null;
    this.workspaceCode = null;

    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      localStorage.removeItem("stride-workspace-code");
      localStorage.removeItem("stride-workspace");
      localStorage.removeItem("stride-trackers"); // Clear local trackers too
    }
  }

  private static async generateUniqueCode(length: number = 6): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure length is between 3 and 8
    const codeLength = Math.max(3, Math.min(8, length));

    while (attempts < maxAttempts) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < codeLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if this code already exists
      const { data } = await supabase
        .from("workspaces")
        .select("id")
        .eq("unique_code", result)
        .single();

      if (!data) {
        return result; // Code is unique
      }

      attempts++;
    }

    throw new Error("Unable to generate unique code. Please try again.");
  }

  static async syncTrackers(localTrackers: Tracker[]): Promise<Tracker[]> {
    const workspace = this.getCurrentWorkspace();
    if (!workspace) {
      throw new Error("No workspace selected");
    }

    try {
      // First, get all remote trackers
      const { data: remoteTrackers, error: fetchError } = await supabase
        .from("trackers")
        .select("*")
        .eq("workspace_id", workspace.id);

      if (fetchError) {
        console.error("Error fetching remote trackers:", fetchError);
        return localTrackers; // Return local if fetch fails
      }

      // Convert remote trackers to local format
      const convertedRemoteTrackers: Tracker[] = (remoteTrackers || []).map(
        (rt) => ({
          id: rt.id,
          title: rt.title,
          description: rt.description,
          timeEstimate: rt.time_estimate,
          deadline: rt.deadline ? new Date(rt.deadline) : undefined,
          subtasks: rt.subtasks || [],
          createdAt: new Date(rt.created_at),
          progress: rt.progress,
          completed: rt.completed,
          celebrated: rt.celebrated || false,
          group: rt.group || undefined,
        })
      );

      // Create a map of remote trackers by ID for efficient lookup
      const remoteMap = new Map(convertedRemoteTrackers.map((t) => [t.id, t]));

      // ALWAYS push local changes to remote (local is source of truth when syncing)
      for (const localTracker of localTrackers) {
        const remoteTracker = remoteMap.get(localTracker.id);

        if (!remoteTracker) {
          // Local tracker doesn't exist remotely, insert it
          await this.insertTracker(workspace.id, localTracker);
        } else {
          // Check if there are actual differences before updating
          const hasChanges =
            localTracker.title !== remoteTracker.title ||
            localTracker.description !== remoteTracker.description ||
            localTracker.timeEstimate !== remoteTracker.timeEstimate ||
            localTracker.completed !== remoteTracker.completed ||
            localTracker.progress !== remoteTracker.progress ||
            localTracker.celebrated !== remoteTracker.celebrated ||
            localTracker.group !== remoteTracker.group ||
            JSON.stringify(localTracker.subtasks) !==
              JSON.stringify(remoteTracker.subtasks) ||
            (localTracker.deadline?.getTime() || 0) !==
              (remoteTracker.deadline?.getTime() || 0);

          if (hasChanges) {
            // Only update if there are actual changes
            await this.updateTracker(localTracker);
          }
        }
      }

      // Handle deletions: remove remote trackers that don't exist locally
      for (const remoteTracker of convertedRemoteTrackers) {
        const localExists = localTrackers.find(
          (lt) => lt.id === remoteTracker.id
        );
        if (!localExists) {
          await this.deleteTracker(remoteTracker.id);
        }
      }

      // Return local trackers as they are the source of truth
      return localTrackers;
    } catch (error) {
      console.error("Error syncing trackers:", error);
      return localTrackers; // Return local on error
    }
  }

  static async insertTracker(
    workspaceId: string,
    tracker: Tracker
  ): Promise<void> {
    const { error } = await supabase.from("trackers").insert({
      id: tracker.id,
      workspace_id: workspaceId,
      title: tracker.title,
      description: tracker.description,
      time_estimate: tracker.timeEstimate,
      deadline: tracker.deadline?.toISOString() || null,
      subtasks: tracker.subtasks,
      progress: tracker.progress,
      completed: tracker.completed,
      celebrated: tracker.celebrated || false,
      group: tracker.group || null,
      created_at: tracker.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inserting tracker:", error);
    }
  }

  static async updateTracker(tracker: Tracker): Promise<void> {
    const { error } = await supabase
      .from("trackers")
      .update({
        title: tracker.title,
        description: tracker.description,
        time_estimate: tracker.timeEstimate,
        deadline: tracker.deadline?.toISOString() || null,
        subtasks: tracker.subtasks,
        progress: tracker.progress,
        completed: tracker.completed,
        celebrated: tracker.celebrated || false,
        group: tracker.group || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tracker.id);

    if (error) {
      console.error("Error updating tracker:", error);
    }
  }

  static async deleteTracker(trackerId: string): Promise<void> {
    const { error } = await supabase
      .from("trackers")
      .delete()
      .eq("id", trackerId);

    if (error) {
      console.error("Error deleting tracker:", error);
    }
  }

  static async addTracker(tracker: Tracker): Promise<void> {
    const workspace = this.getCurrentWorkspace();
    if (!workspace) {
      throw new Error("No workspace selected");
    }

    await this.insertTracker(workspace.id, tracker);
  }
}
