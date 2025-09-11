export interface Database {
  public: {
    Tables: {
      trackers: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          time_estimate: number;
          deadline: string | null;
          subtasks: Json;
          created_at: string;
          updated_at: string;
          progress: number;
          completed: boolean;
          celebrated: boolean;
          group_tags: string[] | null;
          in_progress: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          time_estimate: number;
          deadline?: string | null;
          subtasks: Json;
          created_at?: string;
          updated_at?: string;
          progress: number;
          completed: boolean;
          celebrated?: boolean;
          group_tags?: string[] | null;
          in_progress?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          time_estimate?: number;
          deadline?: string | null;
          subtasks?: Json;
          created_at?: string;
          updated_at?: string;
          progress?: number;
          completed?: boolean;
          celebrated?: boolean;
          group_tags?: string[] | null;
          in_progress?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
