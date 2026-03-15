// ────────────────────────────────────────────────────────────────
// Shared types for the ai-sync remote sync API
// These mirror the D1 schema and are used across all route handlers.
// ────────────────────────────────────────────────────────────────

export type HandoffStatus = 'in-progress' | 'paused' | 'blocked' | 'completed';

export type StopReason =
  | 'rate-limit'
  | 'context-limit'
  | 'completed'
  | 'user-switch'
  | 'error';

// ── Database row types ──────────────────────────────────────────

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

// ── API request bodies ──────────────────────────────────────────

export interface CreateProjectBody {
  id: string;
  name: string;
  repo_url?: string;
}

export interface CreateHandoffBody {
  last_agent: string;
  timestamp: string;
  status: HandoffStatus;
  current_phase?: string;
  current_task?: string;
  stop_reason?: StopReason;
  content: string;
}

export interface UpdateProgressBody {
  content: string;
}

export interface CreateSessionBody {
  agent: string;
  timestamp: string;
  summary?: string;
  content: string;
}

// ── API response envelope ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null;
  error?: string;
}

// ── Aggregate statistics ────────────────────────────────────────

export interface ProjectStats {
  handoff_count: number;
  session_count: number;
  latest_status: HandoffStatus | null;
  completion_percentage: number;
}

// ── Cloudflare bindings ─────────────────────────────────────────

export interface Env {
  DB: D1Database;
}
