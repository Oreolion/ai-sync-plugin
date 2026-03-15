/**
 * Protocol writer — generates and updates .ai-sync/ files.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import matter from "gray-matter";
import type { HandoffData, ProgressData } from "./types.js";
import { readProgress } from "./reader.js";

const AI_SYNC_DIR = ".ai-sync";

function resolveAiSyncPath(projectDir: string, ...segments: string[]): string {
  return join(projectDir, AI_SYNC_DIR, ...segments);
}

/**
 * Write HANDOFF.md with the given HandoffData.
 */
export async function writeHandoff(
  projectDir: string,
  data: HandoffData
): Promise<void> {
  const filePath = resolveAiSyncPath(projectDir, "HANDOFF.md");

  const frontmatter = {
    last_agent: data.lastAgent,
    timestamp: data.timestamp,
    status: data.status,
    current_phase: data.currentPhase,
    current_task: data.currentTask,
    stop_reason: data.stopReason,
  };

  const sections: string[] = [];

  if (data.sections.completed) {
    sections.push(`## What Was Completed\n\n${data.sections.completed}`);
  }
  if (data.sections.inProgress) {
    sections.push(`## Work In Progress\n\n${data.sections.inProgress}`);
  }
  if (data.sections.nextSteps) {
    sections.push(`## Next Steps\n\n${data.sections.nextSteps}`);
  }
  if (data.sections.filesModified) {
    sections.push(`## Files Modified/Created\n\n${data.sections.filesModified}`);
  }
  if (data.sections.blockers) {
    sections.push(`## Blockers\n\n${data.sections.blockers}`);
  }
  if (data.sections.keyDecisions) {
    sections.push(`## Key Decisions\n\n${data.sections.keyDecisions}`);
  }
  if (data.sections.buildStatus) {
    sections.push(`## Build Status\n\n${data.sections.buildStatus}`);
  }

  const body = sections.join("\n\n");
  const output = matter.stringify(body, frontmatter);

  await ensureDirectory(dirname(filePath));
  await writeFile(filePath, output, "utf-8");
}

/**
 * Toggle a specific task's checked state in PROGRESS.md.
 * Returns the updated ProgressData.
 */
export async function updateProgressTask(
  projectDir: string,
  phaseIndex: number,
  taskIndex: number,
  checked: boolean
): Promise<ProgressData> {
  const filePath = resolveAiSyncPath(projectDir, "PROGRESS.md");
  const raw = await readFile(filePath, "utf-8");

  // Parse to find the exact task location
  const lines = raw.split("\n");
  let currentPhase = -1;
  let currentTask = -1;
  let targetLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect phase headers: ## Phase N: Name -- STATUS
    const phaseMatch = line.match(
      /^##\s+Phase\s+(\d+):\s+.+?\s*—\s*(?:COMPLETE|IN PROGRESS|PENDING)\s*$/
    );
    if (phaseMatch) {
      currentPhase++;
      currentTask = -1;
      continue;
    }

    // Detect task lines: - [x] or - [ ]
    const taskMatch = line.match(/^-\s+\[([ xX])\]\s+/);
    if (taskMatch && currentPhase >= 0) {
      currentTask++;

      if (currentPhase === phaseIndex && currentTask === taskIndex) {
        targetLineIndex = i;
        break;
      }
    }
  }

  if (targetLineIndex === -1) {
    throw new Error(
      `Task not found: phase ${phaseIndex}, task ${taskIndex}`
    );
  }

  // Replace the checkbox marker
  const marker = checked ? "[x]" : "[ ]";
  lines[targetLineIndex] = lines[targetLineIndex].replace(
    /\[([ xX])\]/,
    marker
  );

  await writeFile(filePath, lines.join("\n"), "utf-8");

  // Return updated progress data
  return readProgress(projectDir);
}

/**
 * Write a session log file to .ai-sync/sessions/.
 */
export async function writeSessionLog(
  projectDir: string,
  data: {
    agent: string;
    timestamp: string;
    summary: string;
    keyDecisions?: string[];
    filesChanged?: string[];
  }
): Promise<string> {
  const sessionsDir = resolveAiSyncPath(projectDir, "sessions");
  await ensureDirectory(sessionsDir);

  // Generate filename from timestamp: YYYY-MM-DD-HHmmss-agent.md
  const date = new Date(data.timestamp);
  const pad = (n: number): string => String(n).padStart(2, "0");
  const filename = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    `-${data.agent.toLowerCase().replace(/\s+/g, "-")}.md`,
  ].join("");

  const frontmatter = {
    agent: data.agent,
    timestamp: data.timestamp,
    summary: data.summary,
  };

  const bodyParts: string[] = [];

  if (data.summary) {
    bodyParts.push(`## Summary\n\n${data.summary}`);
  }

  if (data.keyDecisions && data.keyDecisions.length > 0) {
    const decisions = data.keyDecisions.map((d) => `- ${d}`).join("\n");
    bodyParts.push(`## Key Decisions\n\n${decisions}`);
  }

  if (data.filesChanged && data.filesChanged.length > 0) {
    const files = data.filesChanged.map((f) => `- ${f}`).join("\n");
    bodyParts.push(`## Files Changed\n\n${files}`);
  }

  const body = bodyParts.join("\n\n");
  const output = matter.stringify(body, frontmatter);

  const filePath = join(sessionsDir, filename);
  await writeFile(filePath, output, "utf-8");

  return filename;
}

async function ensureDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}
