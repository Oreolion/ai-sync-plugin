import Link from 'next/link';
import type { Project, ProjectStats } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';

interface ProjectCardProps {
  project: Project;
  stats: ProjectStats | null;
}

export function ProjectCard({ project, stats }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {project.name}
          </h3>
          {project.repo_url && (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {project.repo_url}
            </p>
          )}
        </div>
        <StatusBadge status={stats?.latest_status ?? null} />
      </div>

      {stats && (
        <div className="mt-4 space-y-3">
          <ProgressBar percentage={stats.completion_percentage} />

          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">
                {stats.handoff_count}
              </span>{' '}
              handoffs
            </span>
            <span>
              <span className="font-medium text-foreground">
                {stats.session_count}
              </span>{' '}
              sessions
            </span>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Created {new Date(project.created_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
