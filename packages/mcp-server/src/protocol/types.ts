/**
 * Core types for the ai-sync MCP server.
 * Mirrors the canonical protocol types from the CLI package.
 */

export type HandoffStatus = "in-progress" | "paused" | "blocked" | "completed";

export type StopReason =
  | "rate-limit"
  | "context-limit"
  | "completed"
  | "user-switch"
  | "error";

export interface HandoffFrontmatter {
  last_agent: string;
  timestamp: string;
  status: HandoffStatus;
  current_phase: string;
  current_task: string;
  stop_reason: StopReason;
}

export interface HandoffSections {
  completed?: string;
  inProgress?: string;
  nextSteps?: string;
  filesModified?: string;
  blockers?: string;
  keyDecisions?: string;
  buildStatus?: string;
}

export interface HandoffData {
  lastAgent: string;
  timestamp: string;
  status: HandoffStatus;
  currentPhase: string;
  currentTask: string;
  stopReason: StopReason;
  sections: HandoffSections;
}

export interface ProgressTask {
  text: string;
  checked: boolean;
}

export interface ProgressPhase {
  number: number;
  name: string;
  status: "COMPLETE" | "IN PROGRESS" | "PENDING";
  tasks: ProgressTask[];
}

export interface ProgressData {
  phases: ProgressPhase[];
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

export interface SessionEntry {
  filename: string;
  date: string;
  agent: string;
  summary?: string;
}

export interface SessionLogData {
  agent: string;
  timestamp: string;
  summary: string;
  keyDecisions: string[];
  filesChanged: string[];
}
