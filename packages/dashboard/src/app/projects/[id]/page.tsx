import { notFound } from 'next/navigation';
import { getProject, getHandoff, getHandoffs, getProgress, getSessions, getStats } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { Timeline } from '@/components/Timeline';
import type { Project, Handoff, Progress, Session, ProjectStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

interface ProjectData {
  project: Project;
  stats: ProjectStats | null;
  latestHandoff: Handoff | null;
  handoffs: Handoff[];
  progress: Progress | null;
  sessions: Session[];
}

async function loadProjectData(id: string): Promise<ProjectData | null> {
  try {
    const project = await getProject(id);

    const [stats, latestHandoff, handoffs, progress, sessions] =
      await Promise.allSettled([
        getStats(id),
        getHandoff(id),
        getHandoffs(id),
        getProgress(id),
        getSessions(id),
      ]);

    return {
      project,
      stats: stats.status === 'fulfilled' ? stats.value : null,
      latestHandoff:
        latestHandoff.status === 'fulfilled' ? latestHandoff.value : null,
      handoffs: handoffs.status === 'fulfilled' ? handoffs.value : [],
      progress: progress.status === 'fulfilled' ? progress.value : null,
      sessions: sessions.status === 'fulfilled' ? sessions.value : [],
    };
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const data = await loadProjectData(id);

  if (!data) {
    notFound();
  }

  const { project, stats, latestHandoff, handoffs, progress, sessions } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.repo_url && (
            <p className="mt-1 text-sm text-muted-foreground">
              {project.repo_url}
            </p>
          )}
        </div>
        <StatusBadge status={stats?.latest_status ?? null} />
      </div>

      {/* Stats overview */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Completion</p>
            <div className="mt-2">
              <ProgressBar percentage={stats.completion_percentage} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Handoffs</p>
            <p className="mt-1 text-2xl font-bold">{stats.handoff_count}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="mt-1 text-2xl font-bold">{stats.session_count}</p>
          </div>
        </div>
      )}

      {/* Latest handoff */}
      {latestHandoff && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Latest Handoff</h2>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {latestHandoff.last_agent}
                </span>
                <StatusBadge status={latestHandoff.status} />
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(latestHandoff.timestamp).toLocaleString()}
              </time>
            </div>
            {latestHandoff.current_phase && (
              <p className="mt-2 text-sm text-muted-foreground">
                Phase: <span className="font-medium text-foreground">{latestHandoff.current_phase}</span>
                {latestHandoff.current_task && (
                  <> &mdash; {latestHandoff.current_task}</>
                )}
              </p>
            )}
            {latestHandoff.stop_reason && (
              <p className="mt-1 text-xs text-muted-foreground">
                Stop reason: {latestHandoff.stop_reason}
              </p>
            )}
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs text-muted-foreground">
              {latestHandoff.content}
            </pre>
          </div>
        </section>
      )}

      {/* Current progress */}
      {progress && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Current Progress</h2>
          <div className="rounded-lg border border-border bg-background p-4">
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
              {progress.content}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {new Date(progress.updated_at).toLocaleString()}
            </p>
          </div>
        </section>
      )}

      {/* Handoff history */}
      {handoffs.length > 1 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Handoff History ({handoffs.length})
          </h2>
          <div className="space-y-3">
            {handoffs.slice(1).map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {h.last_agent}
                  </span>
                  <StatusBadge status={h.status} />
                  {h.current_phase && (
                    <span className="text-xs text-muted-foreground">
                      {h.current_phase}
                    </span>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(h.timestamp).toLocaleString()}
                </time>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Session timeline */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Session Timeline ({sessions.length})
        </h2>
        <Timeline sessions={sessions} />
      </section>
    </div>
  );
}
