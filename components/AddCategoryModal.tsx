"use client";

import { useState } from "react";
import { X, Home, Briefcase, ShoppingCart, Heart, Zap } from "lucide-react";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, icon?: string) => Promise<boolean>;
}

const availableIcons = [
  { id: "home", icon: Home, label: "Home" },
  { id: "work", icon: Briefcase, label: "Work" },
  { id: "shopping", icon: ShoppingCart, label: "Shopping" },
  { id: "health", icon: Heart, label: "Health" },
  { id: "energy", icon: Zap, label: "Energy" },
];

export function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("home");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await onAdd(name.trim(), selectedIcon);
    setIsSubmitting(false);

    if (success) {
      setName("");
      setSelectedIcon("home");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Custom Category</h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] rounded-full transition-all duration-200"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., House Chores, Gym, Projects"
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--foreground)]"
              maxLength={20}
              autoFocus
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              {name.length}/20 characters
            </p>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Choose an Icon
            </label>
            <div className="grid grid-cols-5 gap-3">
              {availableIcons.map((iconOption) => {
                const Icon = iconOption.icon;
                return (
                  <button
                    key={iconOption.id}
                    type="button"
                    onClick={() => setSelectedIcon(iconOption.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedIcon === iconOption.id
                        ? "border-red-500 bg-red-500/10"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover)]"
                    }`}
                    title={iconOption.label}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        selectedIcon === iconOption.id
                          ? "text-red-500"
                          : "text-[var(--muted)]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] font-medium hover:bg-[var(--hover)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>

        <p className="text-xs text-[var(--muted)] text-center mt-4">
          You can create up to 5 custom categories
        </p>
      </div>
    </div>
  );
}
