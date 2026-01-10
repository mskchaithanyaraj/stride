"use client";

import { useState, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  Trash2,
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
  onDeleteCategory?: (categoryId: string) => void;
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
  onDeleteCategory,
}: CategoryBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allCategories = [
    ...defaultCategories,
    ...customCategories.map((cat) => ({
      id: cat.name,
      label: cat.name,
      icon: cat.icon ? iconMap[cat.icon] || Home : Home,
      isCustom: true,
      customId: cat.id,
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

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const isHorizontal = position === "top" || position === "bottom";

  return (
    <div
      className={`fixed z-40 ${getPositionClasses()}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Mobile Scroll Indicators */}
      {isHorizontal && (
        <>
          <button
            onClick={() => scroll("left")}
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-50 p-2 bg-[var(--background)]/90 backdrop-blur-sm border border-[var(--border)] rounded-full shadow-lg hover:bg-[var(--hover)] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--foreground)]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-50 p-2 bg-[var(--background)]/90 backdrop-blur-sm border border-[var(--border)] rounded-full shadow-lg hover:bg-[var(--hover)] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-[var(--foreground)]" />
          </button>
        </>
      )}

      <div
        ref={scrollContainerRef}
        className={`flex ${
          isHorizontal
            ? "flex-row overflow-x-auto scrollbar-hide"
            : "flex-col overflow-y-auto scrollbar-hide"
        } gap-1.5 p-2 bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-lg transition-all duration-300 ${
          isExpanded ? "scale-105" : ""
        } ${
          isHorizontal ? "max-w-[calc(100vw-2rem)]" : "max-h-[calc(100vh-2rem)]"
        }`}
      >
        {allCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <div key={category.id} className="relative group/category">
              <button
                onClick={() => onCategoryChange(category.id as CategoryType)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
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
                    isExpanded
                      ? "max-w-[120px] opacity-100"
                      : "max-w-0 opacity-0"
                  }`}
                >
                  {category.label}
                </span>
              </button>

              {/* Delete button for custom categories */}
              {category.isCustom && onDeleteCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.customId!);
                  }}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover/category:opacity-100 hover:bg-red-600 transition-opacity shadow-md"
                  title="Delete category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
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
