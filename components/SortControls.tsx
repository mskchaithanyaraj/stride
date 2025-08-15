import { SortOption } from "@/types/tracker";

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  trackerCount: number;
}

export function SortControls({
  sortBy,
  onSortChange,
  trackerCount,
}: SortControlsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold">Your Trackers ({trackerCount})</h2>

      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--muted)]">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-1 border border-[var(--border)] rounded-md text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
        >
          <option value="createdAt">Created Date</option>
          <option value="deadline">Deadline</option>
          <option value="progress">Progress</option>
        </select>
      </div>
    </div>
  );
}
