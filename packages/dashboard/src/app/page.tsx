import { ProjectCard } from '@/components/ProjectCard';
import { getProjects, getStats } from '@/lib/api';
import type { Project, ProjectStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function loadProjectsWithStats(): Promise<
  { project: Project; stats: ProjectStats | null }[]
> {
  try {
    const projects = await getProjects();
    const results = await Promise.allSettled(
      projects.map(async (project) => {
        try {
          const stats = await getStats(project.id);
          return { project, stats };
        } catch {
          return { project, stats: null };
        }
      })
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<{ project: Project; stats: ProjectStats | null }> =>
          r.status === 'fulfilled'
      )
      .map((r) => r.value);
  } catch {
    return [];
  }
}

export default async function DashboardHome() {
  const projectsWithStats = await loadProjectsWithStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registered projects and their handoff status.
        </p>
      </div>

      {projectsWithStats.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <h3 className="text-lg font-medium text-foreground">
            No projects yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Register a project via the remote-sync API to get started.
          </p>
          <pre className="mt-4 inline-block rounded bg-muted px-4 py-2 text-left text-xs text-muted-foreground">
            {`POST /api/projects
{
  "id": "my-project",
  "name": "My Project",
  "repo_url": "https://github.com/org/repo"
}`}
          </pre>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projectsWithStats.map(({ project, stats }) => (
            <ProjectCard key={project.id} project={project} stats={stats} />
          ))}
        </div>
      )}
    </div>
  );
}
