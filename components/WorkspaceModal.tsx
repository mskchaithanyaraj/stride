import { useState } from "react";
import { WorkspaceManager } from "@/lib/workspace";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceChange: () => void;
}

export function WorkspaceModal({
  isOpen,
  onClose,
  onWorkspaceChange,
}: WorkspaceModalProps) {
  const [mode, setMode] = useState<"join" | "create">("join");
  const [code, setCode] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [useCustomCode, setUseCustomCode] = useState(true);
  const [codeLength, setCodeLength] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleJoinWorkspace = async () => {
    if (!code.trim()) {
      setError("Please enter a workspace code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await WorkspaceManager.joinWorkspace(code.trim());
      onWorkspaceChange();
      onClose();
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setError("Please enter a workspace name");
      return;
    }

    if (useCustomCode) {
      const trimmedCode = customCode.trim();
      if (!trimmedCode || trimmedCode.length < 3 || trimmedCode.length > 8) {
        setError("Custom code must be between 3 and 8 characters");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const { code: newCode } = await WorkspaceManager.createWorkspace(
        workspaceName.trim(),
        useCustomCode ? customCode.trim() : undefined,
        codeLength
      );
      onWorkspaceChange();

      // Show the generated code to the user
      alert(
        `Workspace created! Your code is: ${newCode}\n\nShare this code with others to let them join your workspace.`
      );
      onClose();
      setWorkspaceName("");
      setCustomCode("");
      setUseCustomCode(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Workspace Management
        </h2>

        <div className="flex mb-4 space-x-2">
          <button
            onClick={() => setMode("join")}
            className={`px-4 py-2 rounded-md flex-1 ${
              mode === "join"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Join Workspace
          </button>
          <button
            onClick={() => setMode("create")}
            className={`px-4 py-2 rounded-md flex-1 ${
              mode === "create"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Create Workspace
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 rounded">
            {error}
          </div>
        )}

        {mode === "join" ? (
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Workspace Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter workspace code (3-8 characters)"
              maxLength={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleJoinWorkspace}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Workspace"}
            </button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="workspaceName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Workspace Name
            </label>
            <input
              id="workspaceName"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code Options
              </label>

              {/* Custom Code Toggle */}
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!useCustomCode}
                    onChange={(e) => setUseCustomCode(!e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Generate random code
                  </span>
                </label>
              </div>

              {/* Custom Code Input (default) */}
              {useCustomCode && (
                <input
                  type="text"
                  placeholder="Enter your custom code (3-8 characters)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  maxLength={8}
                />
              )}

              {/* Code Length Selector (when generating random) */}
              {!useCustomCode && (
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Generated code length: {codeLength} characters
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={codeLength}
                    onChange={(e) => setCodeLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                    <span>8</span>
                  </div>
                </div>
              )}
            </div>

            {useCustomCode && (
              <div className="mt-3">
                <label
                  htmlFor="customCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Custom Code (6 characters)
                </label>
                <input
                  id="customCode"
                  type="text"
                  value={customCode}
                  onChange={(e) =>
                    setCustomCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="CUSTOM"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Only letters and numbers allowed. Must be unique.
                </p>
              </div>
            )}

            <button
              onClick={handleCreateWorkspace}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
