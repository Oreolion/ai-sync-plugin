/**
 * Protocol reader — parses .ai-sync/ files into structured data.
 * Designed to be importable by other packages (e.g., future MCP server).
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import type {
  HandoffData,
  HandoffFrontmatter,
  HandoffSections,
  ProgressData,
  ProgressPhase,
  ProgressTask,
  SessionLogEntry,
} from '../types.js';

const SECTION_HEADERS: Record<keyof HandoffSections, string> = {
  whatWasCompleted: 'What Was Completed',
  workInProgress: 'Work In Progress',
  nextSteps: 'Next Steps',
  filesModified: 'Files Modified/Created',
  blockers: 'Blockers',
  keyDecisions: 'Key Decisions',
  buildStatus: 'Build Status',
};

/**
 * Extract a named markdown section (## heading) from content.
 * Returns the text between this heading and the next heading of equal or higher level.
 */
function extractSection(content: string, heading: string): string {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `^##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=^##\\s|$(?!\\n))`,
    'm'
  );
  const match = regex.exec(content);
  return match ? match[1].trim() : '';
}

/**
 * Read and parse HANDOFF.md from the .ai-sync/ directory.
 */
export async function readHandoff(projectDir: string): Promise<HandoffData> {
  const filePath = join(projectDir, '.ai-sync', 'HANDOFF.md');
  const raw = await readFile(filePath, 'utf-8');
  const parsed = matter(raw);

  const frontmatter: HandoffFrontmatter = {
    last_agent: String(parsed.data.last_agent ?? ''),
    timestamp: String(parsed.data.timestamp ?? ''),
    status: parsed.data.status ?? 'paused',
    current_phase: String(parsed.data.current_phase ?? ''),
    current_task: String(parsed.data.current_task ?? ''),
    stop_reason: parsed.data.stop_reason ?? 'user-switch',
  };

  const body = parsed.content;

  const sections: HandoffSections = {
    whatWasCompleted: extractSection(body, SECTION_HEADERS.whatWasCompleted),
    workInProgress: extractSection(body, SECTION_HEADERS.workInProgress),
    nextSteps: extractSection(body, SECTION_HEADERS.nextSteps),
    filesModified: extractSection(body, SECTION_HEADERS.filesModified),
    blockers: extractSection(body, SECTION_HEADERS.blockers),
    keyDecisions: extractSection(body, SECTION_HEADERS.keyDecisions),
    buildStatus: extractSection(body, SECTION_HEADERS.buildStatus),
  };

  return { frontmatter, sections };
}

/**
 * Parse a PROGRESS.md file into structured phases with tasks.
 */
export async function readProgress(projectDir: string): Promise<ProgressData> {
  const filePath = join(projectDir, '.ai-sync', 'PROGRESS.md');
  const raw = await readFile(filePath, 'utf-8');
  return parseProgressContent(raw);
}

/**
 * Parse PROGRESS.md content string (exported for reuse/testing).
 */
export function parseProgressContent(raw: string): ProgressData {
  const phases: ProgressPhase[] = [];
  const lines = raw.split('\n');

  let currentPhase: ProgressPhase | null = null;

  for (const line of lines) {
    // Match phase headers: ## Phase N: Name — STATUS
    const phaseMatch = /^##\s+Phase\s+(\d+):\s*(.+?)\s*(?:—|--)\s*(COMPLETE|IN PROGRESS|PENDING)/i.exec(line);
    if (phaseMatch) {
      currentPhase = {
        number: parseInt(phaseMatch[1], 10),
        name: phaseMatch[2].trim(),
        status: phaseMatch[3].toUpperCase() as ProgressPhase['status'],
        tasks: [],
      };
      phases.push(currentPhase);
      continue;
    }

    // Match task items: - [x] or - [ ]
    const taskMatch = /^-\s+\[([ xX])\]\s+(.+)$/.exec(line);
    if (taskMatch && currentPhase) {
      const task: ProgressTask = {
        checked: taskMatch[1].toLowerCase() === 'x',
        text: taskMatch[2].trim(),
      };
      currentPhase.tasks.push(task);
    }
  }

  return { phases };
}

/**
 * Read PLAN.md content as a raw string.
 */
export async function readPlan(projectDir: string): Promise<string> {
  const filePath = join(projectDir, '.ai-sync', 'PLAN.md');
  return readFile(filePath, 'utf-8');
}

/**
 * List session log files with parsed dates and agent names.
 * Session files follow the naming convention: YYYY-MM-DD-HHMMSS-agentname.md
 */
export async function listSessions(projectDir: string): Promise<SessionLogEntry[]> {
  const sessionsDir = join(projectDir, '.ai-sync', 'sessions');

  let entries: string[];
  try {
    entries = await readdir(sessionsDir);
  } catch {
    return [];
  }

  const sessions: SessionLogEntry[] = [];

  for (const filename of entries) {
    if (!filename.endsWith('.md')) continue;

    // Parse: YYYY-MM-DD-HHMMSS-agentname.md
    const match = /^(\d{4}-\d{2}-\d{2})-(\d{6})-(.+)\.md$/.exec(filename);
    if (match) {
      const dateStr = match[1];
      const timeStr = match[2];
      const agent = match[3];

      const year = parseInt(dateStr.slice(0, 4), 10);
      const month = parseInt(dateStr.slice(5, 7), 10) - 1;
      const day = parseInt(dateStr.slice(8, 10), 10);
      const hours = parseInt(timeStr.slice(0, 2), 10);
      const minutes = parseInt(timeStr.slice(2, 4), 10);
      const seconds = parseInt(timeStr.slice(4, 6), 10);

      sessions.push({
        filename,
        date: new Date(year, month, day, hours, minutes, seconds),
        agent,
      });
    }
  }

  // Sort by date descending (most recent first)
  sessions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return sessions;
}

/**
 * Read a specific session log file.
 */
export async function readSessionLog(projectDir: string, filename: string): Promise<string> {
  const filePath = join(projectDir, '.ai-sync', 'sessions', filename);
  return readFile(filePath, 'utf-8');
}

/**
 * Check if .ai-sync/ directory exists in the project.
 */
export async function hasAiSync(projectDir: string): Promise<boolean> {
  try {
    const s = await stat(join(projectDir, '.ai-sync'));
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a specific .ai-sync/ file exists.
 */
export async function hasAiSyncFile(projectDir: string, filename: string): Promise<boolean> {
  try {
    const s = await stat(join(projectDir, '.ai-sync', filename));
    return s.isFile();
  } catch {
    return false;
  }
}
