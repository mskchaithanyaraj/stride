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
          category: string | null;
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
          category?: string | null;
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
          category?: string | null;
          in_progress?: boolean;
        };
      };
      custom_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
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
