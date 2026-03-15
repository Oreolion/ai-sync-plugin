/**
 * Core types for the ai-sync protocol.
 */

export type HandoffStatus = 'in-progress' | 'paused' | 'blocked' | 'completed';

export type StopReason =
  | 'rate-limit'
  | 'context-limit'
  | 'completed'
  | 'user-switch'
  | 'error';

export interface HandoffFrontmatter {
  last_agent: string;
  timestamp: string;
  status: HandoffStatus;
  current_phase: string;
  current_task: string;
  stop_reason: StopReason;
}

export interface HandoffSections {
  whatWasCompleted: string;
  workInProgress: string;
  nextSteps: string;
  filesModified: string;
  blockers: string;
  keyDecisions: string;
  buildStatus: string;
}

export interface HandoffData {
  frontmatter: HandoffFrontmatter;
  sections: HandoffSections;
}

export interface ProgressTask {
  text: string;
  checked: boolean;
}

export interface ProgressPhase {
  number: number;
  name: string;
  status: 'COMPLETE' | 'IN PROGRESS' | 'PENDING';
  tasks: ProgressTask[];
}

export interface ProgressData {
  phases: ProgressPhase[];
}

export interface SessionLogEntry {
  filename: string;
  date: Date;
  agent: string;
}

export interface SessionLogData {
  agent: string;
  timestamp: string;
  summary: string;
  keyDecisions: string[];
  filesChanged: string[];
}

export type AdapterTool =
  | 'cursor'
  | 'cline'
  | 'windsurf'
  | 'aider'
  | 'opencode'
  | 'copilot'
  | 'continue'
  | 'codex';

export interface ProjectType {
  name: string;
  detected: boolean;
  buildCommand?: string;
  typecheckCommand?: string;
}
