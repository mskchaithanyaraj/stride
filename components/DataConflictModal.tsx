"use client";

import { useState } from "react";
import { Tracker } from "@/types/tracker";

interface DataConflictModalProps {
  isOpen: boolean;
  localTrackers: Tracker[];
  cloudTrackers: Tracker[];
  onKeepLocal: () => void;
  onKeepCloud: () => void;
  onMerge: () => void;
  onClose: () => void;
}

export function DataConflictModal({
  isOpen,
  localTrackers,
  cloudTrackers,
  onKeepLocal,
  onKeepCloud,
  onMerge,
  onClose,
}: DataConflictModalProps) {
  const [selectedOption, setSelectedOption] = useState<
    "local" | "cloud" | "merge"
  >("merge");

  if (!isOpen) return null;

  const handleConfirm = () => {
    switch (selectedOption) {
      case "local":
        onKeepLocal();
        break;
      case "cloud":
        onKeepCloud();
        break;
      case "merge":
        onMerge();
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Data Sync Conflict
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Warning Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Choose How to Handle Your Data
          </h3>
          <p className="text-[var(--muted)] mb-4">
            We found existing tasks in both your local storage and cloud
            account. How would you like to proceed?
          </p>

          {/* Data Summary */}
          <div className="bg-[var(--background)] rounded-lg p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2">
              <span>Local tasks:</span>
              <span className="font-semibold">{localTrackers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Cloud tasks:</span>
              <span className="font-semibold">{cloudTrackers.length}</span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="conflict-option"
              value="merge"
              checked={selectedOption === "merge"}
              onChange={(e) => setSelectedOption(e.target.value as "merge")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-[var(--foreground)]">
                Merge Both (Recommended)
              </div>
              <div className="text-sm text-[var(--muted)]">
                Combine local and cloud tasks. Duplicates will be avoided based
                on creation time.
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="conflict-option"
              value="cloud"
              checked={selectedOption === "cloud"}
              onChange={(e) => setSelectedOption(e.target.value as "cloud")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-[var(--foreground)]">
                Use Cloud Data
              </div>
              <div className="text-sm text-[var(--muted)]">
                Keep cloud tasks and discard local tasks. Local changes will be
                lost.
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="conflict-option"
              value="local"
              checked={selectedOption === "local"}
              onChange={(e) => setSelectedOption(e.target.value as "local")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-[var(--foreground)]">
                Use Local Data
              </div>
              <div className="text-sm text-[var(--muted)]">
                Keep local tasks and overwrite cloud data. Cloud changes will be
                lost.
              </div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:bg-[var(--hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
