interface ProgressBarProps {
  /** Completion percentage (0-100) */
  percentage: number;
  /** Optional label shown to the right */
  label?: string;
}

export function ProgressBar({ percentage, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));

  let barColor = 'bg-blue-500';
  if (clamped === 100) {
    barColor = 'bg-green-500';
  } else if (clamped >= 75) {
    barColor = 'bg-blue-500';
  } else if (clamped >= 50) {
    barColor = 'bg-yellow-500';
  } else if (clamped >= 25) {
    barColor = 'bg-orange-500';
  } else {
    barColor = 'bg-red-500';
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground tabular-nums w-12 text-right">
        {label ?? `${clamped}%`}
      </span>
    </div>
  );
}
