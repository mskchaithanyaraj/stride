"use client";

import { useState } from "react";
import {
  Home,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Circle,
  Plus,
  Briefcase,
  ShoppingCart,
  Heart,
  Zap,
} from "lucide-react";

export type CategoryType =
  | "all"
  | "urgent"
  | "completed"
  | "in-progress"
  | "not-started"
  | string; // Custom categories

interface CategoryBarProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  customCategories?: Array<{ id: string; name: string; icon?: string }>;
  position?: "bottom" | "top" | "left" | "right";
  onAddCategory?: () => void;
}

const defaultCategories = [
  { id: "all", label: "All", icon: Home },
  { id: "urgent", label: "Urgent", icon: AlertCircle },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "in-progress", label: "In Progress", icon: PlayCircle },
  { id: "not-started", label: "Not Started", icon: Circle },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  work: Briefcase,
  shopping: ShoppingCart,
  health: Heart,
  energy: Zap,
};

export function CategoryBar({
  activeCategory,
  onCategoryChange,
  customCategories = [],
  position = "bottom",
  onAddCategory,
}: CategoryBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const allCategories = [
    ...defaultCategories,
    ...customCategories.map((cat) => ({
      id: cat.name,
      label: cat.name,
      icon: cat.icon ? iconMap[cat.icon] || Home : Home,
    })),
  ];

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "top-4 left-1/2 -translate-x-1/2 flex-row";
      case "bottom":
        return "bottom-4 left-1/2 -translate-x-1/2 flex-row";
      case "left":
        return "left-4 top-1/2 -translate-y-1/2 flex-col";
      case "right":
        return "right-4 top-1/2 -translate-y-1/2 flex-col";
      default:
        return "bottom-4 left-1/2 -translate-x-1/2 flex-row";
    }
  };

  const isHorizontal = position === "top" || position === "bottom";

  return (
    <div
      className={`fixed z-40 ${getPositionClasses()}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`flex ${
          isHorizontal ? "flex-row" : "flex-col"
        } gap-1.5 p-2 bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-lg transition-all duration-300 ${
          isExpanded ? "scale-105" : ""
        }`}
      >
        {allCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id as CategoryType)}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
              }`}
              title={category.label}
            >
              <Icon
                className={`${
                  isExpanded ? "w-5 h-5" : "w-5 h-5"
                } transition-all`}
              />
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all overflow-hidden ${
                  isExpanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {category.label}
              </span>
            </button>
          );
        })}

        {/* Add New Category Button */}
        {onAddCategory && customCategories.length < 5 && (
          <button
            onClick={onAddCategory}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--foreground)] transition-all duration-200"
            title="Add Category"
          >
            <Plus
              className={`${isExpanded ? "w-5 h-5" : "w-5 h-5"} transition-all`}
            />
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all overflow-hidden ${
                isExpanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              New List
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
