"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function AuthDebugger() {
  const { user, session } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50 font-mono">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold">Auth Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <strong>User ID:</strong> {user?.id || "❌ NULL"}
        </div>
        <div>
          <strong>Email:</strong> {user?.email || "❌ NULL"}
        </div>
        <div>
          <strong>Session Valid:</strong> {session ? "✅ Yes" : "❌ No"}
        </div>
        <div>
          <strong>Access Token:</strong>{" "}
          {session?.access_token ? "✅ Present" : "❌ Missing"}
        </div>
        <div>
          <strong>User Metadata:</strong>
          <pre className="text-xs mt-1 overflow-auto max-h-20">
            {JSON.stringify(user?.user_metadata || {}, null, 2)}
          </pre>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-600">
          <button
            onClick={() => {
              console.log("Full Auth State:", { user, session });
              alert("Check browser console for full auth state");
            }}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  );
}
