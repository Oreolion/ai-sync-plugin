// ────────────────────────────────────────────────────────────────
// Shared types for the ai-sync dashboard.
// These mirror the remote-sync API response shapes exactly.
// ────────────────────────────────────────────────────────────────

export type HandoffStatus = 'in-progress' | 'paused' | 'blocked' | 'completed';

export type StopReason =
  | 'rate-limit'
  | 'context-limit'
  | 'completed'
  | 'user-switch'
  | 'error';

export interface Project {
  id: string;
  name: string;
  repo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Handoff {
  id: number;
  project_id: string;
  last_agent: string;
  timestamp: string;
  status: HandoffStatus;
  current_phase: string | null;
  current_task: string | null;
  stop_reason: StopReason | null;
  content: string;
  created_at: string;
}

export interface Progress {
  id: number;
  project_id: string;
  content: string;
  updated_at: string;
}

export interface Session {
  id: number;
  project_id: string;
  agent: string;
  timestamp: string;
  summary: string | null;
  content: string;
  created_at: string;
}

export interface ProjectStats {
  handoff_count: number;
  session_count: number;
  latest_status: HandoffStatus | null;
  completion_percentage: number;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error?: string;
}
