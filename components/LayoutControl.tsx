"use client";

import { useState, useRef, useEffect } from "react";
import {
  RectangleVertical,
  Columns2,
  Columns3,
  Columns4,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
} from "lucide-react";

interface LayoutControlProps {
  layoutColumns: 1 | 2 | 3 | 4;
  onLayoutChange: (columns: 1 | 2 | 3 | 4) => void;
  selectedColumns: string[];
  onColumnSelectionChange: (columns: string[]) => void;
  showColumnSelector: boolean;
  onShowColumnSelector: (show: boolean) => void;
}

const columnOptions = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "month", label: "This Month", icon: CalendarDays },
  { id: "year", label: "This Year", icon: CalendarRange },
  { id: "custom", label: "Later this Year", icon: Clock },
];

export function LayoutControl({
  layoutColumns,
  onLayoutChange,
  selectedColumns,
  onColumnSelectionChange,
  showColumnSelector,
  onShowColumnSelector,
}: LayoutControlProps) {
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const columnSelectorRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layoutRef.current &&
        !layoutRef.current.contains(event.target as Node)
      ) {
        setShowLayoutOptions(false);
      }
      if (
        columnSelectorRef.current &&
        !columnSelectorRef.current.contains(event.target as Node)
      ) {
        onShowColumnSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onShowColumnSelector]);

  // Handle hover with delay
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowLayoutOptions(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowLayoutOptions(false);
    }, 200); // 200ms delay before hiding
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getLayoutIcon = () => {
    switch (layoutColumns) {
      case 1:
        return <RectangleVertical className="w-4 h-4" />;
      case 2:
        return <Columns2 className="w-4 h-4" />;
      case 3:
        return <Columns3 className="w-4 h-4" />;
      case 4:
        return <Columns4 className="w-4 h-4" />;
    }
  };

  const handleLayoutChange = (columns: 1 | 2 | 3 | 4) => {
    onLayoutChange(columns);
    setShowLayoutOptions(false);

    // Auto-select columns based on layout
    if (columns === 1) {
      onColumnSelectionChange(["today"]);
      onShowColumnSelector(true);
    } else if (columns === 2) {
      onColumnSelectionChange(["today", "month"]);
      onShowColumnSelector(true);
    } else if (columns === 3) {
      onColumnSelectionChange(["today", "month", "year"]);
      onShowColumnSelector(false);
    } else if (columns === 4) {
      onColumnSelectionChange(["today", "month", "year", "custom"]);
      onShowColumnSelector(false);
    }
  };

  const handleColumnToggle = (columnId: string) => {
    const maxColumns = layoutColumns;
    let newSelection = [...selectedColumns];

    if (newSelection.includes(columnId)) {
      newSelection = newSelection.filter((id) => id !== columnId);
    } else if (newSelection.length < maxColumns) {
      newSelection.push(columnId);
    }

    onColumnSelectionChange(newSelection);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Layout Selector */}
      <div className="relative" ref={layoutRef}>
        <button
          type="button"
          className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all duration-200 flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setShowLayoutOptions(!showLayoutOptions)}
        >
          {getLayoutIcon()}
        </button>

        {/* Layout Options */}
        {showLayoutOptions && (
          <div
            className="absolute top-full left-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-2 z-50 flex gap-1 animate-in slide-in-from-top-2 duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={`p-2 rounded hover:bg-[var(--surface-hover)] transition-colors flex flex-col items-center gap-1 ${
                layoutColumns === 1 ? "bg-[var(--surface-hover)]" : ""
              }`}
              onClick={() => handleLayoutChange(1)}
              title="Single View"
            >
              <RectangleVertical className="w-4 h-4" />
              <span className="text-[10px] text-[var(--muted)]">Single</span>
            </button>
            <button
              type="button"
              className={`p-2 rounded hover:bg-[var(--surface-hover)] transition-colors flex flex-col items-center gap-1 ${
                layoutColumns === 2 ? "bg-[var(--surface-hover)]" : ""
              }`}
              onClick={() => handleLayoutChange(2)}
              title="Split View"
            >
              <Columns2 className="w-4 h-4" />
              <span className="text-[10px] text-[var(--muted)]">Split</span>
            </button>
            <button
              type="button"
              className={`p-2 rounded hover:bg-[var(--surface-hover)] transition-colors flex flex-col items-center gap-1 ${
                layoutColumns === 3 ? "bg-[var(--surface-hover)]" : ""
              }`}
              onClick={() => handleLayoutChange(3)}
              title="Triple View"
            >
              <Columns3 className="w-4 h-4" />
              <span className="text-[10px] text-[var(--muted)]">Triple</span>
            </button>
            <button
              type="button"
              className={`p-2 rounded hover:bg-[var(--surface-hover)] transition-colors flex flex-col items-center gap-1 ${
                layoutColumns === 4 ? "bg-[var(--surface-hover)]" : ""
              }`}
              onClick={() => handleLayoutChange(4)}
              title="Four Column View"
            >
              <Columns4 className="w-4 h-4" />
              <span className="text-[10px] text-[var(--muted)]">four</span>
            </button>
          </div>
        )}
      </div>

      {/* Column Selector for 1-3 columns */}
      {layoutColumns <= 3 && (
        <div className="relative" ref={columnSelectorRef}>
          <button
            type="button"
            className="px-3 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
            onClick={() => onShowColumnSelector(!showColumnSelector)}
          >
            Columns ({selectedColumns.length}/{layoutColumns})
          </button>

          {showColumnSelector && (
            <div className="absolute top-full left-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 z-50 min-w-[200px] animate-in slide-in-from-top-2 duration-200">
              <div className="text-xs font-medium text-[var(--muted)] mb-2">
                Select up to {layoutColumns} column
                {layoutColumns > 1 ? "s" : ""}:
              </div>
              <div className="space-y-2">
                {columnOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-hover)] p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(option.id)}
                        onChange={() => handleColumnToggle(option.id)}
                        disabled={
                          !selectedColumns.includes(option.id) &&
                          selectedColumns.length >= layoutColumns
                        }
                        className="rounded border-[var(--border)] text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <IconComponent className="w-3 h-3" />
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
