/**
 * Protocol reader — parses .ai-sync/ files into typed objects.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import type {
  HandoffData,
  HandoffFrontmatter,
  HandoffStatus,
  ProgressData,
  ProgressPhase,
  ProgressTask,
  SessionEntry,
  StopReason,
} from "./types.js";

const AI_SYNC_DIR = ".ai-sync";

function resolveAiSyncPath(projectDir: string, ...segments: string[]): string {
  return join(projectDir, AI_SYNC_DIR, ...segments);
}

/**
 * Validates that a value is a recognized HandoffStatus.
 */
function isHandoffStatus(value: string): value is HandoffStatus {
  return ["in-progress", "paused", "blocked", "completed"].includes(value);
}

/**
 * Validates that a value is a recognized StopReason.
 */
function isStopReason(value: string): value is StopReason {
  return [
    "rate-limit",
    "context-limit",
    "completed",
    "user-switch",
    "error",
  ].includes(value);
}

/**
 * Extracts a named section from markdown content.
 * Sections are delimited by ## headings.
 */
function extractSection(content: string, heading: string): string | undefined {
  // Match the heading (case-insensitive) and capture until the next ## or end
  const pattern = new RegExp(
    `^##\\s+${escapeRegex(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s|$(?!\\n))`,
    "mi"
  );
  const match = content.match(pattern);
  return match ? match[1].trim() || undefined : undefined;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Read and parse HANDOFF.md into a structured HandoffData object.
 */
export async function readHandoff(projectDir: string): Promise<HandoffData> {
  const filePath = resolveAiSyncPath(projectDir, "HANDOFF.md");
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);

  const fm = data as Record<string, unknown>;

  const statusValue = String(fm.status ?? "in-progress");
  const stopReasonValue = String(fm.stop_reason ?? "user-switch");

  const frontmatter: HandoffFrontmatter = {
    last_agent: String(fm.last_agent ?? "unknown"),
    timestamp: String(fm.timestamp ?? new Date().toISOString()),
    status: isHandoffStatus(statusValue) ? statusValue : "in-progress",
    current_phase: String(fm.current_phase ?? ""),
    current_task: String(fm.current_task ?? ""),
    stop_reason: isStopReason(stopReasonValue) ? stopReasonValue : "user-switch",
  };

  const sections = {
    completed: extractSection(content, "What Was Completed"),
    inProgress: extractSection(content, "Work In Progress"),
    nextSteps: extractSection(content, "Next Steps"),
    filesModified: extractSection(content, "Files Modified/Created"),
    blockers: extractSection(content, "Blockers"),
    keyDecisions: extractSection(content, "Key Decisions"),
    buildStatus: extractSection(content, "Build Status"),
  };

  return {
    lastAgent: frontmatter.last_agent,
    timestamp: frontmatter.timestamp,
    status: frontmatter.status,
    currentPhase: frontmatter.current_phase,
    currentTask: frontmatter.current_task,
    stopReason: frontmatter.stop_reason,
    sections,
  };
}

/**
 * Read and parse PROGRESS.md into phases with tasks and completion stats.
 */
export async function readProgress(projectDir: string): Promise<ProgressData> {
  const filePath = resolveAiSyncPath(projectDir, "PROGRESS.md");
  const raw = await readFile(filePath, "utf-8");

  const phases: ProgressPhase[] = [];
  const phaseRegex = /^##\s+Phase\s+(\d+):\s+(.+?)\s*—\s*(COMPLETE|IN PROGRESS|PENDING)\s*$/gm;

  let phaseMatch: RegExpExecArray | null;
  const phasePositions: Array<{
    index: number;
    number: number;
    name: string;
    status: "COMPLETE" | "IN PROGRESS" | "PENDING";
  }> = [];

  while ((phaseMatch = phaseRegex.exec(raw)) !== null) {
    phasePositions.push({
      index: phaseMatch.index,
      number: parseInt(phaseMatch[1], 10),
      name: phaseMatch[2].trim(),
      status: phaseMatch[3] as "COMPLETE" | "IN PROGRESS" | "PENDING",
    });
  }

  for (let i = 0; i < phasePositions.length; i++) {
    const pos = phasePositions[i];
    const nextPos = phasePositions[i + 1];
    const sectionEnd = nextPos ? nextPos.index : raw.length;
    const sectionContent = raw.slice(pos.index, sectionEnd);

    const tasks: ProgressTask[] = [];
    const taskRegex = /^-\s+\[([ xX])\]\s+(.+)$/gm;
    let taskMatch: RegExpExecArray | null;

    while ((taskMatch = taskRegex.exec(sectionContent)) !== null) {
      tasks.push({
        checked: taskMatch[1].toLowerCase() === "x",
        text: taskMatch[2].trim(),
      });
    }

    phases.push({
      number: pos.number,
      name: pos.name,
      status: pos.status,
      tasks,
    });
  }

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = phases.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.checked).length,
    0
  );
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { phases, totalTasks, completedTasks, percentage };
}

/**
 * Read PLAN.md and return its raw content.
 */
export async function readPlan(projectDir: string): Promise<string> {
  const filePath = resolveAiSyncPath(projectDir, "PLAN.md");
  return readFile(filePath, "utf-8");
}

/**
 * List session log files with metadata, sorted most-recent-first.
 */
export async function listSessions(projectDir: string): Promise<SessionEntry[]> {
  const sessionsDir = resolveAiSyncPath(projectDir, "sessions");

  let files: string[];
  try {
    files = await readdir(sessionsDir);
  } catch {
    return [];
  }

  // Filter to .md files only
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const entries: SessionEntry[] = [];

  for (const filename of mdFiles) {
    const filePath = join(sessionsDir, filename);
    const fileStat = await stat(filePath);

    // Try to extract metadata from the file
    let agent = "unknown";
    let summary: string | undefined;
    let date = fileStat.mtime.toISOString();

    try {
      const content = await readFile(filePath, "utf-8");
      const { data } = matter(content);
      const fm = data as Record<string, unknown>;

      if (fm.agent && typeof fm.agent === "string") {
        agent = fm.agent;
      }
      if (fm.timestamp && typeof fm.timestamp === "string") {
        date = fm.timestamp;
      }
      if (fm.summary && typeof fm.summary === "string") {
        summary = fm.summary;
      }

      // If no summary in frontmatter, extract first non-empty line from content
      if (!summary) {
        const { content: body } = matter(content);
        const firstLine = body
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.length > 0 && !l.startsWith("#"));
        if (firstLine) {
          summary = firstLine.slice(0, 200);
        }
      }
    } catch {
      // If file can't be parsed, use filesystem metadata only
    }

    entries.push({ filename, date, agent, summary });
  }

  // Sort most-recent-first
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return entries;
}
