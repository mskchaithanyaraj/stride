"use client";

import { useState } from "react";
import { Subtask } from "@/types/tracker";

interface InlineCreateProps {
  onCreate: (tracker: {
    title: string;
    description: string;
    timeEstimate: number;
    deadline?: Date;
    subtasks: Subtask[];
  }) => void;
}

export function InlineCreate({ onCreate }: InlineCreateProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [deadline, setDeadline] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([""]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setTimeEstimate(30);
    setDeadline("");
    setSubtasks([""]);
  };

  const submit = () => {
    if (!title.trim()) return;
    const items: Subtask[] = subtasks
      .filter((t) => t.trim())
      .map((t) => ({
        id: crypto.randomUUID(),
        text: t.trim(),
        completed: false,
      }));
    onCreate({
      title: title.trim(),
      description: description.trim(),
      timeEstimate,
      deadline: deadline ? new Date(deadline) : undefined,
      subtasks: items,
    });
    reset();
    setExpanded(false);
  };

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--background)]">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          + Create a new tracker
        </button>
      ) : (
        <div className="space-y-3">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none py-1"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none py-1"
          />
          <div className="flex flex-wrap gap-3 items-center text-sm text-[var(--muted)]">
            <label className="flex items-center gap-2">
              <span>Time</span>
              <input
                type="number"
                min={1}
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(Number(e.target.value))}
                className="w-16 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none"
              />
              <span>min</span>
            </label>
            <label className="flex items-center gap-2">
              <span>Deadline</span>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none"
              />
            </label>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--muted)] mb-1">
              Subtasks
            </div>
            {subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  value={s}
                  onChange={(e) => {
                    const next = [...subtasks];
                    next[i] = e.target.value;
                    setSubtasks(next);
                  }}
                  placeholder={`Subtask ${i + 1}`}
                  className="flex-1 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] focus:outline-none py-1"
                />
                {subtasks.length > 1 && (
                  <button
                    onClick={() =>
                      setSubtasks(subtasks.filter((_, idx) => idx !== i))
                    }
                    className="px-2 py-1 text-[var(--muted)] border border-[var(--border)] rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setSubtasks([...subtasks, ""])}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              + Add subtask
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                reset();
                setExpanded(false);
              }}
              className="px-3 py-2 border border-[var(--border)] rounded text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-3 py-2 border border-[var(--border)] rounded bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
