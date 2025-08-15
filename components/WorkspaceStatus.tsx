import { useState, useEffect } from "react";
import { WorkspaceManager } from "@/lib/workspace";
import {
  Cloud,
  CloudOff,
  Users,
  Settings,
  LogOut,
  RefreshCw,
  Save,
} from "lucide-react";

interface WorkspaceStatusProps {
  onOpenWorkspaceModal: () => void;
  onSave?: () => void;
  syncing?: boolean;
  hasUnsavedChanges?: boolean;
}

export function WorkspaceStatus({
  onOpenWorkspaceModal,
  onSave,
  syncing = false,
  hasUnsavedChanges = false,
}: WorkspaceStatusProps) {
  const [workspace, setWorkspace] = useState(
    WorkspaceManager.getCurrentWorkspace()
  );
  const [code, setCode] = useState(WorkspaceManager.getCurrentWorkspaceCode());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkWorkspace = () => {
      setWorkspace(WorkspaceManager.getCurrentWorkspace());
      setCode(WorkspaceManager.getCurrentWorkspaceCode());
    };

    checkWorkspace();

    // Listen for workspace changes
    const interval = setInterval(checkWorkspace, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLeaveWorkspace = () => {
    if (
      confirm(
        "Are you sure you want to leave this workspace? Your local data will be cleared."
      )
    ) {
      WorkspaceManager.leaveWorkspace();
      setWorkspace(null);
      setCode(null);
      setShowDropdown(false);
      window.location.reload(); // Reload to clear all local state
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      alert("Workspace code copied to clipboard!");
    }
  };

  return (
    <div className="relative">
      {workspace && code ? (
        <div className="flex items-center space-x-2">
          {/* Save button - only show when there are unsaved changes */}
          {hasUnsavedChanges && !syncing && (
            <button
              onClick={onSave}
              className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
              title="Save changes to cloud"
            >
              <Save size={14} />
              <span className="text-xs">Save</span>
            </button>
          )}

          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer transition-colors ${
              syncing
                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                : hasUnsavedChanges
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
            }`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {syncing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Cloud size={16} />
            )}
            <span className="text-sm font-medium">{code}</span>
            {hasUnsavedChanges && !syncing && (
              <span className="text-xs">●</span>
            )}
            <Settings size={14} />
          </div>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {workspace.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Code: {code}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={copyCode}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Users size={16} />
                    <span>Copy invite code</span>
                  </button>

                  <button
                    onClick={onOpenWorkspaceModal}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Settings size={16} />
                    <span>Switch workspace</span>
                  </button>

                  <button
                    onClick={handleLeaveWorkspace}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <LogOut size={16} />
                    <span>Leave workspace</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenWorkspaceModal}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <CloudOff size={16} />
          <span className="text-sm">Local only</span>
        </button>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
