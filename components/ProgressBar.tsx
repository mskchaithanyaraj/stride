interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  return (
    <div
      className={`w-full rounded-full h-2.5 bg-[var(--border)] dark:bg-[var(--border)] ${className}`}
    >
      <div
        className={`h-2.5 rounded-full transition-all duration-300 bg-[var(--foreground)] dark:bg-[var(--foreground)]`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
