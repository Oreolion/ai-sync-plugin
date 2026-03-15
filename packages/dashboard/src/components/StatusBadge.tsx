import type { HandoffStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: HandoffStatus | null;
}

const STATUS_STYLES: Record<HandoffStatus, string> = {
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
};

const STATUS_LABELS: Record<HandoffStatus, string> = {
  'in-progress': 'In Progress',
  paused: 'Paused',
  blocked: 'Blocked',
  completed: 'Completed',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
