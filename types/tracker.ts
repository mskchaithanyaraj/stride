export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  inProgress?: boolean;
}

export interface Tracker {
  id: string;
  title: string;
  description: string;
  timeEstimate: number; // in minutes
  deadline?: Date;
  subtasks: Subtask[];
  createdAt: Date;
  progress: number; // calculated from completed subtasks (0-100)
  completed: boolean; // main task completion (affects progress when no subtasks or when toggled)
  celebrated?: boolean; // prevents repeated celebrations when at 100%
  category?: string; // single category assignment (e.g., "urgent", "work", "personal")
  inProgress?: boolean; // indicates if this task is currently being worked on
  isDaily?: boolean; // if true, resets to incomplete at the start of each new day
}

export type SortOption = "deadline" | "progress" | "createdAt";
