import type { Session } from '@/lib/types';

interface TimelineProps {
  sessions: Session[];
}

export function Timeline({ sessions }: TimelineProps) {
  if (sessions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No sessions recorded yet.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <ol className="space-y-6">
        {sessions.map((session) => (
          <li key={session.id} className="relative pl-10">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-blue-500 bg-background" />

            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {session.agent}
                </span>
                <time className="text-xs text-muted-foreground">
                  {new Date(session.timestamp).toLocaleString()}
                </time>
              </div>

              {session.summary && (
                <p className="mt-2 text-sm font-medium text-foreground">
                  {session.summary}
                </p>
              )}

              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs text-muted-foreground">
                {session.content}
              </pre>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
