"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  CloudCheck,
  RefreshCcw,
  SearchX,
  Download,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoIcon } from "@/components/InfoIcon";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { LayoutControl } from "@/components/LayoutControl";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showGoodbyeScreen, setShowGoodbyeScreen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Helper function to export data to local storage
  const exportToLocalStorage = () => {
    try {
      const data = {
        trackers: localStorage.getItem("stride-trackers"),
        layoutColumns: localStorage.getItem("stride-layout-columns"),
        selectedColumns: localStorage.getItem("stride-selected-columns"),
        celebratedTasks: localStorage.getItem("celebrated-tasks"),
        exportDate: new Date().toISOString(),
        userEmail: user?.email || "unknown",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stride-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";

    // Try user metadata first (for OAuth users)
    if (user.user_metadata?.first_name) {
      const firstName = user.user_metadata.first_name;
      const lastName = user.user_metadata.last_name || "";
      return `${firstName} ${lastName}`.trim();
    }

    // Fallback to email username
    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  // Helper function to handle account deletion
  const handleDeleteAccount = async () => {
    try {
      if (!user) {
        toast.error("No user found to delete");
        return;
      }

      // Get the current session to pass the access token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No access token available");
      }

      // Call our API route to completely delete the account
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Clear account-specific data but preserve user preferences like theme
      localStorage.removeItem("stride-trackers");
      localStorage.removeItem("celebrated-tasks");
      localStorage.removeItem("stride-layout-columns");
      localStorage.removeItem("stride-selected-columns");

      // Clear Supabase session data manually (preserve theme)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          localStorage.removeItem(key);
        }
      });

      toast.success("Account completely deleted");

      setShowDeleteDialog(false);

      // Show goodbye screen with fun effect
      setShowGoodbyeScreen(true);

      // Give user time to see the goodbye message before allowing redirect
      setTimeout(() => {
        window.location.href = "/login";
      }, 15000); // 15 second delay - but user can click button to go sooner
    } catch (error) {
      console.error("Delete account failed:", error);

      // Fallback: delete data locally and sign out
      try {
        // Delete user's data from the trackers table
        const { error: deleteDataError } = await supabase
          .from("trackers")
          .delete()
          .eq("user_id", user!.id);

        if (deleteDataError) {
          console.error("Error deleting user data:", deleteDataError);
        }

        // Clear account-specific data but preserve user preferences like theme
        localStorage.removeItem("stride-trackers");
        localStorage.removeItem("celebrated-tasks");
        localStorage.removeItem("stride-layout-columns");
        localStorage.removeItem("stride-selected-columns");

        // Clear Supabase session data manually (preserve theme)
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key);
          }
        });

        // Sign out user
        await signOut();

        toast.error(
          "Failed to delete account completely, but local data cleared and signed out. Contact support."
        );
        setShowDeleteDialog(false);
      } catch (fallbackError) {
        console.error("Fallback deletion error:", fallbackError);
        toast.error("Failed to delete account. Please contact support.");
        setShowDeleteDialog(false);
      }
    }
  };

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

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() =>
                        setShowProfileDropdown(!showProfileDropdown)
                      }
                      className="flex items-center justify-center w-10 h-10 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200"
                      title="Profile"
                    >
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {getUserDisplayName().charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--foreground)] truncate">
                                {getUserDisplayName()}
                              </p>
                              <p className="text-sm text-[var(--muted)] truncate">
                                {user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              exportToLocalStorage();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Export Data</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowDeleteDialog(true);
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Account Data</span>
                          </button>

                          <div className="border-t border-[var(--border)] my-1"></div>

                          <button
                            onClick={async () => {
                              await signOut();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors text-sm"
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
                      </div>
                    )}
                  </div>
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
                {/* Profile Section */}
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-3">
                    Profile
                  </label>
                  <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-sm text-[var(--muted)] truncate">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          exportToLocalStorage();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-medium hover:bg-[var(--border)]/50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowDeleteDialog(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account Data</span>
                      </button>
                    </div>
                  </div>
                </div>

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

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Delete Account Data
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                      Warning
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      This will permanently delete your entire account,
                      including all tasks, settings, and progress data from both
                      this device and the database. Your account will be
                      completely removed from our authentication system. This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-[var(--muted)]">
                  Before proceeding, you might want to:
                </p>
                <ul className="text-sm text-[var(--muted)] space-y-1 ml-4">
                  <li>
                    • Export your data using the &quot;Export Data&quot; button
                  </li>
                  <li>• Make sure you&apos;ve backed up any important tasks</li>
                  <li>• Consider if you really want to delete everything</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] font-medium hover:bg-[var(--surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    exportToLocalStorage();
                  }}
                  className="flex-1 px-4 py-2 border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export First
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goodbye Screen Effect */}
      {showGoodbyeScreen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center space-y-4 max-w-sm mx-auto">
            <div className="flex justify-center mb-2">
              <Image
                src="/break-up.png"
                alt="Breakup"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-medium text-gray-900 dark:text-white">
              Really? You&apos;re breaking up with Stride?
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We thought we had something special... but okay, your account is
              deleted. Don&apos;t come crawling back when your tasks are all
              over the place! 💔
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Go to Home
            </button>
            <div className="flex justify-center space-x-1 pt-2">
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
