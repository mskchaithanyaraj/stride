import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          unique_code: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unique_code: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unique_code?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trackers: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          description: string;
          time_estimate: number;
          deadline: string | null;
          subtasks: Record<string, unknown>[];
          progress: number;
          completed: boolean;
          celebrated: boolean;
          group: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          description: string;
          time_estimate: number;
          deadline?: string | null;
          subtasks?: Record<string, unknown>[];
          progress?: number;
          completed?: boolean;
          celebrated?: boolean;
          group?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          description?: string;
          time_estimate?: number;
          deadline?: string | null;
          subtasks?: Record<string, unknown>[];
          progress?: number;
          completed?: boolean;
          celebrated?: boolean;
          group?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
