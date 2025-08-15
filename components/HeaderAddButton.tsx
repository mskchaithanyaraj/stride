"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UniversalCreateBar } from "./UniversalCreateBar";
import { Tracker } from "@/types/tracker";

interface HeaderAddButtonProps {
  onCreateTask: (
    task: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
  ) => void;
}

export function HeaderAddButton({ onCreateTask }: HeaderAddButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Compact Add Button */}
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200 group"
        title="Add new task"
      >
        <Plus
          size={16}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-sm">Add Todo</span>
      </button>

      {/* Modal Overlay for Expanded Form */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add New Task</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] rounded transition-colors"
                >
                  ×
                </button>
              </div>
              <UniversalCreateBar
                onCreateTask={(task) => {
                  onCreateTask(task);
                  setIsExpanded(false);
                }}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
