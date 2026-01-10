"use client";

import { X } from "lucide-react";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  taskCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCategoryModal({
  isOpen,
  categoryName,
  taskCount,
  onConfirm,
  onCancel,
}: DeleteCategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Delete Category?
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[var(--foreground)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-500">"{categoryName}"</span>
            ?
          </p>

          {taskCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-500 font-medium">
                ⚠️ Warning: This will affect {taskCount}{" "}
                {taskCount === 1 ? "task" : "tasks"}
              </p>
              <p className="text-sm text-[var(--muted)] mt-2">
                All tasks in this category will remain in your list but will no
                longer be associated with this category.
              </p>
            </div>
          )}

          {taskCount === 0 && (
            <p className="text-sm text-[var(--muted)]">
              This category has no tasks and can be safely deleted.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--hover)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
}
