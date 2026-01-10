"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export interface CustomCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export function useCustomCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        // If table doesn't exist, silently fail and use empty array
        if (
          error.code === "PGRST205" ||
          error.message.includes("schema cache")
        ) {
          console.warn(
            "Custom categories table not created yet. Please run the SQL migration."
          );
          setCategories([]);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      setCategories(
        data.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || undefined,
          color: cat.color || undefined,
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Don't show error toast if table doesn't exist
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (
    name: string,
    icon?: string,
    color?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to add categories");
      return false;
    }

    if (categories.length >= 5) {
      toast.error("Maximum 5 custom categories allowed");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("custom_categories")
        .insert({
          user_id: user.id,
          name,
          icon,
          color,
        })
        .select()
        .single();

      if (error) {
        if (
          error.code === "PGRST205" ||
          error.message.includes("schema cache")
        ) {
          toast.error(
            "Please run the database migration first. Check the SQL file."
          );
          return false;
        }
        throw error;
      }

      setCategories([
        ...categories,
        {
          id: data.id,
          name: data.name,
          icon: data.icon || undefined,
          color: data.color || undefined,
        },
      ]);

      toast.success(`Category "${name}" created!`);
      return true;
    } catch (error: unknown) {
      console.error("Error adding category:", error);
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.includes("unique")
      ) {
        toast.error("A category with this name already exists");
      } else {
        toast.error("Failed to create category");
      }
      return false;
    }
  };

  // Update a category
  const updateCategory = async (
    id: string,
    updates: { name?: string; icon?: string; color?: string }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("custom_categories")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setCategories(
        categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
      );

      toast.success("Category updated!");
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
      return false;
    }
  };

  // Delete a category
  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("custom_categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Category deleted!");
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
}
