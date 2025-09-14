"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoIcon } from "@/components/InfoIcon";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { LayoutControl } from "@/components/LayoutControl";
import { useAuth } from "@/contexts/AuthContext";
import { Tracker } from "@/types/tracker";

interface NavbarProps {
  // Logo animation props
  showAcronym: boolean;
  isTransitioning: boolean;

  // Search props
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Task counts for quick action buttons
  overdueCount: number;
  pastCompletedCount: number;
  onShowOverdue: () => void;
  onShowPastCompleted: () => void;

  // Sync status props
  isSyncing: boolean;
  isLoggedIn: boolean;

  // Layout control props
  layoutColumns: 1 | 2 | 3 | 4;
  onLayoutChange: (columns: 1 | 2 | 3 | 4) => void;
  selectedColumns: string[];
  onColumnSelectionChange: (columns: string[]) => void;

  // Action handlers
  onCreateTask: (
    task: Omit<Tracker, "id" | "createdAt" | "progress" | "completed">
  ) => void;
  onShowHelp: () => void;

  // Responsive state
  isLargeScreen: boolean;
}

export function Navbar({
  showAcronym,
  isTransitioning,
  searchQuery,
  onSearchChange,
  overdueCount,
  pastCompletedCount,
  onShowOverdue,
  onShowPastCompleted,
  isSyncing,
  isLoggedIn,
  layoutColumns,
  onLayoutChange,
  selectedColumns,
  onColumnSelectionChange,
  onCreateTask,
  onShowHelp,
  isLargeScreen,
}: NavbarProps) {
  const { signOut } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2 w-full">
      <div className="flex-shrink-0">
        <Link href="/home" className="inline-block">
          <h1 className="font-bold tracking-wider hover:opacity-80 transition-opacity">
            {showAcronym ? (
              /* Full STRIDE Acronym */
              <div
                className={`${
                  isTransitioning ? "animate-fade-out" : "animate-fade-in"
                }`}
              >
                <span className="text-3xl text-red-500 animate-letter-s">
                  S
                </span>
                <span className="text-[12px] font-sans italic animate-word animate-word-s">
                  <span className="sub-letter sub-letter-1">i</span>
                  <span className="sub-letter sub-letter-2">m</span>
                  <span className="sub-letter sub-letter-3">p</span>
                  <span className="sub-letter sub-letter-4">l</span>
                  <span className="sub-letter sub-letter-5">i</span>
                  <span className="sub-letter sub-letter-6">f</span>
                  <span className="sub-letter sub-letter-7">y</span>{" "}
                </span>
                <span className="text-3xl text-red-500 animate-letter-t">
                  T
                </span>
                <span className="text-[12px] font-sans italic animate-word animate-word-t">
                  <span className="sub-letter sub-letter-1">r</span>
                  <span className="sub-letter sub-letter-2">a</span>
                  <span className="sub-letter sub-letter-3">c</span>
                  <span className="sub-letter sub-letter-4">k</span>{" "}
                </span>
                <span className="text-3xl text-red-500 animate-letter-r">
                  R
                </span>
                <span className="text-[12px] font-sans italic animate-word animate-word-r">
                  <span className="sub-letter sub-letter-1">e</span>
                  <span className="sub-letter sub-letter-2">a</span>
                  <span className="sub-letter sub-letter-3">c</span>
                  <span className="sub-letter sub-letter-4">h</span>{" "}
                </span>
                <span className="text-3xl text-red-500 animate-letter-i">
                  I
                </span>
                <span className="text-[12px] font-sans italic animate-word animate-word-i">
                  <span className="sub-letter sub-letter-1">m</span>
                  <span className="sub-letter sub-letter-2">p</span>
                  <span className="sub-letter sub-letter-3">r</span>
                  <span className="sub-letter sub-letter-4">o</span>
                  <span className="sub-letter sub-letter-5">v</span>
                  <span className="sub-letter sub-letter-6">e</span>{" "}
                </span>
                <span className="text-3xl text-red-500 animate-letter-d">
                  D
                </span>
                <span className="text-[12px] font-sans italic animate-word animate-word-d">
                  <span className="sub-letter sub-letter-1">e</span>
                  <span className="sub-letter sub-letter-2">l</span>
                  <span className="sub-letter sub-letter-3">i</span>
                  <span className="sub-letter sub-letter-4">v</span>
                  <span className="sub-letter sub-letter-5">e</span>
                  <span className="sub-letter sub-letter-6">r</span>{" "}
                </span>
                <span className="text-3xl text-red-500 animate-letter-e">
                  E
                </span>
                <span className="text-[12px] font-sans italic animate-word animate-word-e">
                  <span className="sub-letter sub-letter-1">v</span>
                  <span className="sub-letter sub-letter-2">e</span>
                  <span className="sub-letter sub-letter-3">r</span>
                  <span className="sub-letter sub-letter-4">y</span>
                  <span className="sub-letter sub-letter-5">d</span>
                  <span className="sub-letter sub-letter-6">a</span>
                  <span className="sub-letter sub-letter-7">y</span>
                </span>
              </div>
            ) : (
              /* Simple Stride Logo */
              <div className="text-3xl animate-fade-in">
                <span className="text-red-500">S</span>
                <span className="text-[var(--foreground)]">tride</span>
              </div>
            )}
          </h1>
        </Link>
      </div>

      {/* Search Bar - Center for large screens */}
      <div
        className={`${
          isLargeScreen ? "order-2 flex-1 max-w-md mx-8" : "order-3 w-full mt-2"
        }`}
      >
        <input
          type="text"
          placeholder="Search tasks & groups..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div
        className={`flex flex-wrap items-center gap-1 sm:gap-2 flex-shrink-0 ${
          isLargeScreen ? "order-3" : "order-2"
        }`}
      >
        {/* Quick action buttons for overdue/completed tasks */}
        <div className="flex items-center gap-1">
          {overdueCount > 0 && (
            <button
              className="px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1"
              onClick={onShowOverdue}
              type="button"
              title={`${overdueCount} overdue tasks`}
            >
              <span className="hidden sm:inline">Overdue</span>
              <span className="inline-block min-w-[16px] text-center rounded-full bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                {overdueCount}
              </span>
            </button>
          )}
          {pastCompletedCount > 0 && (
            <button
              className="px-2 py-1 rounded border border-[var(--border)] bg-transparent text-[var(--muted)] text-xs font-medium hover:bg-[var(--surface)] transition-colors flex items-center gap-1"
              onClick={onShowPastCompleted}
              type="button"
              title={`${pastCompletedCount} past completed tasks`}
            >
              <span className="hidden sm:inline">Past</span>
              <span className="inline-block min-w-[16px] text-center rounded-full bg-[var(--border)] text-[var(--foreground)] text-[10px] px-1.5 py-0.5">
                {pastCompletedCount}
              </span>
            </button>
          )}
        </div>

        {/* Core controls - More compact */}
        <div className="flex items-center gap-1">
          {/* Sync Status with Text */}
          {isLoggedIn && (
            <div className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-medium">
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  <svg
                    className="h-3 w-3 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span className="text-blue-600 dark:text-blue-400">
                    Syncing
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-3 w-3 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <svg
                    className="h-2 w-2 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-600 dark:text-green-400">
                    Synced
                  </span>
                </>
              )}
            </div>
          )}
          {/* Combined Layout & Column Control */}
          <LayoutControl
            layoutColumns={layoutColumns}
            onLayoutChange={onLayoutChange}
            selectedColumns={selectedColumns}
            onColumnSelectionChange={onColumnSelectionChange}
          />
          <HeaderAddButton onCreateTask={onCreateTask} />
          <InfoIcon onShowHelp={onShowHelp} />
          <ThemeToggle />

          {/* Sign Out - Last with label on larger screens */}
          <button
            onClick={async () => {
              await signOut();
              // Router will automatically redirect via AuthContext
            }}
            className="flex items-center gap-1 px-2 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-red-500 hover:border-red-500 transition-all duration-200 text-sm font-medium"
            title="Sign Out"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden lg:inline text-xs">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
