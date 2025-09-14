"use client";

import Link from "next/link";
import { useState } from "react";
import { CloudCheck, RefreshCcw, SearchX } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Sync Status Component (Google Docs style with Lucide icons)
  const SyncStatus = ({ className = "" }: { className?: string }) => {
    if (!isLoggedIn) return null;

    return (
      <div className={`flex items-center ${className}`}>
        {isSyncing ? (
          <>
            <RefreshCcw className="h-5 w-5 text-blue-500 mr-1.5 animate-spin" />
            <span className="text-xs text-blue-600 dark:text-blue-400 hidden sm:inline">
              Saving...
            </span>
          </>
        ) : (
          <>
            <CloudCheck className="h-5 w-5 text-green-500 mr-1.5" />
            <span className="text-xs text-green-600 dark:text-green-400 hidden sm:inline">
              All changes saved
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col w-full mb-5">
        <header className="flex items-center justify-between w-full relative">
          {/* Left side - Logo with Sync Status */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/home" className="inline-block">
              <h1 className="font-bold tracking-wider hover:opacity-80 transition-opacity">
                {showAcronym && isLargeScreen ? (
                  /* Full STRIDE Acronym - Only on large screens */
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
                  /* Simple Stride Logo - Always for mobile, conditionally for desktop */
                  <div
                    className={`text-3xl ${
                      isLargeScreen ? "animate-fade-in" : ""
                    }`}
                  >
                    <span className="text-red-500">S</span>
                    <span className="text-[var(--foreground)]">tride</span>
                  </div>
                )}
              </h1>
            </Link>

            {/* Sync Status - Next to logo */}
            <SyncStatus className="ml-2" />
          </div>

          {/* Search Bar - Center for large screens, hidden on mobile (replaced by icon) */}
          {isLargeScreen && (
            <div className="flex-1 max-w-md mx-8">
              <input
                type="text"
                placeholder="Search tasks & groups..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Right side - Desktop controls or Mobile controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Controls */}
            {isLargeScreen ? (
              <>
                {/* Quick action buttons */}
                <div className="flex items-center gap-2">
                  {overdueCount > 0 && (
                    <button
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
                      onClick={onShowOverdue}
                      type="button"
                      title={`${overdueCount} overdue tasks`}
                    >
                      <span>Overdue</span>
                      <span className="inline-block min-w-[18px] text-center rounded-full bg-red-500 text-white text-xs px-1.5 py-0.5">
                        {overdueCount}
                      </span>
                    </button>
                  )}
                  {pastCompletedCount > 0 && (
                    <button
                      className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-[var(--muted)] text-sm font-medium hover:bg-[var(--surface)] transition-colors flex items-center gap-2"
                      onClick={onShowPastCompleted}
                      type="button"
                      title={`${pastCompletedCount} past completed tasks`}
                    >
                      <span>Past</span>
                      <span className="inline-block min-w-[18px] text-center rounded-full bg-[var(--border)] text-[var(--foreground)] text-xs px-1.5 py-0.5">
                        {pastCompletedCount}
                      </span>
                    </button>
                  )}
                </div>

                {/* Core controls */}
                <div className="flex items-center gap-2">
                  <LayoutControl
                    layoutColumns={layoutColumns}
                    onLayoutChange={onLayoutChange}
                    selectedColumns={selectedColumns}
                    onColumnSelectionChange={onColumnSelectionChange}
                  />
                  <HeaderAddButton onCreateTask={onCreateTask} />
                  <InfoIcon onShowHelp={onShowHelp} />
                  <ThemeToggle />
                  <button
                    onClick={async () => {
                      await signOut();
                    }}
                    className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-red-500 hover:border-red-500 transition-all duration-200 text-sm font-medium"
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
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Mobile Search Icon */}
                <button
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className="p-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all duration-200"
                  title="Search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileSearchOpen ? (
                      <SearchX />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    )}
                  </svg>
                </button>

                {/* Quick Add Button - Always visible on mobile */}
                <HeaderAddButton onCreateTask={onCreateTask} />

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all duration-200"
                  title="Menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Mobile Search Bar - Expands below header when search icon is clicked */}
        {!isLargeScreen && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileSearchOpen
                ? "max-h-20 opacity-100 mt-3"
                : "max-h-0 opacity-0"
            }`}
          >
            <input
              type="text"
              placeholder="Search tasks & groups..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus={isMobileSearchOpen}
            />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {!isLargeScreen && (
        <div
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl transform transition-transform duration-300 ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
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

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Column Selection */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-3">
                    View Columns
                  </label>
                  <div className="space-y-2">
                    {/* All option */}
                    <button
                      onClick={() => {
                        const allColumns = ["today", "month", "year", "custom"];
                        if (selectedColumns.length === allColumns.length) {
                          // If all are selected, go to default (today only)
                          onColumnSelectionChange(["today"]);
                        } else {
                          // Select all
                          onColumnSelectionChange(allColumns);
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg border font-medium transition-colors flex items-center justify-between ${
                        selectedColumns.length === 4
                          ? "border-red-500 bg-red-500/10 text-red-500"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedColumns.length === 4
                              ? "border-red-500 bg-red-500"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {selectedColumns.length === 4 && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span>All Columns</span>
                      </div>
                    </button>

                    {/* Individual column options */}
                    {[
                      {
                        key: "today",
                        label: "Today",
                        badge: overdueCount > 0 ? overdueCount : null,
                      },
                      { key: "month", label: "This Month", badge: null },
                      { key: "year", label: "This Year", badge: null },
                      { key: "custom", label: "Later this Year", badge: null },
                    ].map((column) => (
                      <button
                        key={column.key}
                        onClick={() => {
                          const newSelection = selectedColumns.includes(
                            column.key
                          )
                            ? selectedColumns.filter(
                                (col) => col !== column.key
                              )
                            : [...selectedColumns, column.key];

                          // Ensure at least one column is always selected
                          if (newSelection.length === 0) {
                            onColumnSelectionChange(["today"]);
                          } else {
                            onColumnSelectionChange(newSelection);
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border font-medium transition-colors flex items-center justify-between ${
                          selectedColumns.includes(column.key)
                            ? "border-red-500 bg-red-500/10 text-red-500"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedColumns.includes(column.key)
                                ? "border-red-500 bg-red-500"
                                : "border-[var(--border)]"
                            }`}
                          >
                            {selectedColumns.includes(column.key) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span>{column.label}</span>
                        </div>
                        {column.badge && (
                          <span className="inline-block min-w-[24px] text-center rounded-full bg-red-500 text-white text-sm px-2 py-1">
                            {column.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                {(overdueCount > 0 || pastCompletedCount > 0) && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                      Quick Actions
                    </label>
                    <div className="space-y-2">
                      {overdueCount > 0 && (
                        <button
                          className="w-full px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors flex items-center justify-between"
                          onClick={() => {
                            onShowOverdue();
                            setIsMobileMenuOpen(false);
                          }}
                          type="button"
                        >
                          <span>View Overdue Tasks</span>
                          <span className="inline-block min-w-[24px] text-center rounded-full bg-red-500 text-white text-sm px-2 py-1">
                            {overdueCount}
                          </span>
                        </button>
                      )}
                      {pastCompletedCount > 0 && (
                        <button
                          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-medium hover:bg-[var(--border)]/50 transition-colors flex items-center justify-between"
                          onClick={() => {
                            onShowPastCompleted();
                            setIsMobileMenuOpen(false);
                          }}
                          type="button"
                        >
                          <span>View Past Completed</span>
                          <span className="inline-block min-w-[24px] text-center rounded-full bg-[var(--border)] text-[var(--foreground)] text-sm px-2 py-1">
                            {pastCompletedCount}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Menu Actions */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                    Actions
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onShowHelp();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-medium hover:bg-[var(--border)]/50 transition-colors flex items-center gap-3"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Help</span>
                    </button>

                    <div className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                      <span className="text-[var(--foreground)] font-medium">
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Footer */}
              <div className="p-4 border-t border-[var(--border)]">
                <button
                  onClick={async () => {
                    await signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/30 rounded-lg text-red-500 font-medium hover:bg-red-500/10 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
