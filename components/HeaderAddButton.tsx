"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
        className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200 group cursor-pointer"
        title="Add new task"
      >
        <Plus
          size={16}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-sm hidden md:block">Add Todo</span>
      </button>

      {/* Modal Overlay for Expanded Form */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div className="bg-[var(--background)]/95 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add New Task</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] rounded-full transition-all duration-200 cursor-pointer"
                  title="Close"
                >
                  <X size={20} />
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
