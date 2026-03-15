import type {
  ApiResponse,
  Project,
  Handoff,
  Progress,
  Session,
  ProjectStats,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// ── Generic fetcher ─────────────────────────────────────────────

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || json.error) {
    throw new Error(json.error ?? `Request failed with status ${res.status}`);
  }

  return json.data as T;
}

// ── Project endpoints ───────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  // The API doesn't have a list-all endpoint yet, so we'll use a
  // lightweight wrapper that can be swapped when one is added.
  // For now, this hits the individual project endpoint.
  // TODO: Add GET /api/projects list endpoint to remote-sync
  return fetcher<Project[]>('/api/projects');
}

export async function getProject(id: string): Promise<Project> {
  return fetcher<Project>(`/api/projects/${encodeURIComponent(id)}`);
}

// ── Handoff endpoints ───────────────────────────────────────────

export async function getHandoff(projectId: string): Promise<Handoff> {
  return fetcher<Handoff>(
    `/api/projects/${encodeURIComponent(projectId)}/handoff`
  );
}

export async function getHandoffs(projectId: string): Promise<Handoff[]> {
  return fetcher<Handoff[]>(
    `/api/projects/${encodeURIComponent(projectId)}/handoffs`
  );
}

// ── Progress endpoints ──────────────────────────────────────────

export async function getProgress(projectId: string): Promise<Progress> {
  return fetcher<Progress>(
    `/api/projects/${encodeURIComponent(projectId)}/progress`
  );
}

// ── Session endpoints ───────────────────────────────────────────

export async function getSessions(projectId: string): Promise<Session[]> {
  return fetcher<Session[]>(
    `/api/projects/${encodeURIComponent(projectId)}/sessions`
  );
}

export async function getSession(
  projectId: string,
  sessionId: number
): Promise<Session> {
  return fetcher<Session>(
    `/api/projects/${encodeURIComponent(projectId)}/sessions/${sessionId}`
  );
}

// ── Stats endpoints ─────────────────────────────────────────────

export async function getStats(projectId: string): Promise<ProjectStats> {
  return fetcher<ProjectStats>(
    `/api/projects/${encodeURIComponent(projectId)}/stats`
  );
}
