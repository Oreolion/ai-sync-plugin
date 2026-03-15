/**
 * Protocol writer — generates and writes .ai-sync/ files.
 * Designed to be importable by other packages (e.g., future MCP server).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type {
  HandoffData,
  HandoffFrontmatter,
  HandoffSections,
  SessionLogData,
} from '../types.js';

/**
 * Generate HANDOFF.md content from structured data.
 */
export function generateHandoffContent(data: HandoffData): string {
  const { frontmatter: fm, sections: s } = data;

  const yamlFrontmatter = [
    '---',
    `last_agent: ${fm.last_agent}`,
    `timestamp: ${fm.timestamp}`,
    `status: ${fm.status}`,
    `current_phase: "${fm.current_phase}"`,
    `current_task: "${fm.current_task}"`,
    `stop_reason: ${fm.stop_reason}`,
    '---',
  ].join('\n');

  const sections = [
    formatSection('What Was Completed', s.whatWasCompleted),
    formatSection('Work In Progress', s.workInProgress),
    formatSection('Next Steps', s.nextSteps),
    formatSection('Files Modified/Created', s.filesModified),
    formatSection('Blockers', s.blockers),
    formatSection('Key Decisions', s.keyDecisions),
    formatSection('Build Status', s.buildStatus),
  ].join('\n\n');

  return `${yamlFrontmatter}\n\n${sections}\n`;
}

function formatSection(heading: string, content: string): string {
  return `## ${heading}\n\n${content || 'None'}`;
}

/**
 * Write HANDOFF.md to the .ai-sync/ directory.
 */
export async function writeHandoff(projectDir: string, data: HandoffData): Promise<void> {
  const filePath = join(projectDir, '.ai-sync', 'HANDOFF.md');
  await ensureDir(dirname(filePath));
  const content = generateHandoffContent(data);
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Generate PROGRESS.md content from phases data.
 */
export function generateProgressContent(
  phases: Array<{
    number: number;
    name: string;
    status: 'COMPLETE' | 'IN PROGRESS' | 'PENDING';
    tasks: Array<{ text: string; checked: boolean }>;
  }>
): string {
  const lines: string[] = ['# Progress\n'];

  for (const phase of phases) {
    lines.push(`## Phase ${phase.number}: ${phase.name} — ${phase.status}`);
    for (const task of phase.tasks) {
      const checkbox = task.checked ? '[x]' : '[ ]';
      lines.push(`- ${checkbox} ${task.text}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Update a specific task's checked state in PROGRESS.md.
 * Identifies tasks by their text content within a phase.
 */
export async function updateProgress(
  projectDir: string,
  phaseNumber: number,
  taskText: string,
  checked: boolean
): Promise<void> {
  const { readFile: readF } = await import('node:fs/promises');
  const filePath = join(projectDir, '.ai-sync', 'PROGRESS.md');
  const raw = await readF(filePath, 'utf-8');

  const lines = raw.split('\n');
  let inTargetPhase = false;
  const updatedLines: string[] = [];

  for (const line of lines) {
    // Detect phase header
    const phaseMatch = /^##\s+Phase\s+(\d+):/.exec(line);
    if (phaseMatch) {
      inTargetPhase = parseInt(phaseMatch[1], 10) === phaseNumber;
      updatedLines.push(line);
      continue;
    }

    // If in target phase, look for the matching task
    if (inTargetPhase) {
      const taskMatch = /^(-\s+\[)[ xX](\]\s+)(.+)$/.exec(line);
      if (taskMatch && taskMatch[3].trim() === taskText.trim()) {
        const marker = checked ? 'x' : ' ';
        updatedLines.push(`${taskMatch[1]}${marker}${taskMatch[2]}${taskMatch[3]}`);
        continue;
      }
    }

    updatedLines.push(line);
  }

  // Update phase status based on task completion
  const result = updatePhaseStatuses(updatedLines.join('\n'));
  await writeFile(filePath, result, 'utf-8');
}

/**
 * Recalculate phase statuses based on task completion.
 */
function updatePhaseStatuses(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];

  let phaseStartIdx = -1;
  let allChecked = true;
  let anyChecked = false;
  let hasTasks = false;

  for (let i = 0; i < lines.length; i++) {
    const phaseMatch = /^(##\s+Phase\s+\d+:\s*.+?)\s*(?:—|--)\s*(?:COMPLETE|IN PROGRESS|PENDING)/.exec(lines[i]);

    if (phaseMatch || i === lines.length - 1) {
      // Finalize previous phase
      if (phaseStartIdx >= 0 && hasTasks) {
        let newStatus: string;
        if (allChecked) newStatus = 'COMPLETE';
        else if (anyChecked) newStatus = 'IN PROGRESS';
        else newStatus = 'PENDING';

        const prevPhaseMatch = /^(##\s+Phase\s+\d+:\s*.+?)\s*(?:—|--)\s*(?:COMPLETE|IN PROGRESS|PENDING)/.exec(
          result[phaseStartIdx]
        );
        if (prevPhaseMatch) {
          result[phaseStartIdx] = `${prevPhaseMatch[1]} — ${newStatus}`;
        }
      }

      // Reset for new phase
      allChecked = true;
      anyChecked = false;
      hasTasks = false;
      phaseStartIdx = result.length;
    }

    // Track task state
    const taskMatch = /^-\s+\[([ xX])\]/.exec(lines[i]);
    if (taskMatch) {
      hasTasks = true;
      if (taskMatch[1].toLowerCase() === 'x') {
        anyChecked = true;
      } else {
        allChecked = false;
      }
    }

    result.push(lines[i]);
  }

  // Handle the last phase
  if (phaseStartIdx >= 0 && hasTasks) {
    let newStatus: string;
    if (allChecked) newStatus = 'COMPLETE';
    else if (anyChecked) newStatus = 'IN PROGRESS';
    else newStatus = 'PENDING';

    const prevPhaseMatch = /^(##\s+Phase\s+\d+:\s*.+?)\s*(?:—|--)\s*(?:COMPLETE|IN PROGRESS|PENDING)/.exec(
      result[phaseStartIdx]
    );
    if (prevPhaseMatch) {
      result[phaseStartIdx] = `${prevPhaseMatch[1]} — ${newStatus}`;
    }
  }

  return result.join('\n');
}

/**
 * Write a session log file to .ai-sync/sessions/.
 */
export async function writeSessionLog(
  projectDir: string,
  data: SessionLogData
): Promise<string> {
  const sessionsDir = join(projectDir, '.ai-sync', 'sessions');
  await ensureDir(sessionsDir);

  const now = new Date(data.timestamp);
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  const filename = `${dateStr}-${timeStr}-${data.agent}.md`;
  const filePath = join(sessionsDir, filename);

  const content = [
    `# Session Log: ${data.agent}`,
    ``,
    `**Timestamp:** ${data.timestamp}`,
    `**Agent:** ${data.agent}`,
    ``,
    `## Summary`,
    ``,
    data.summary,
    ``,
    `## Key Decisions`,
    ``,
    ...data.keyDecisions.map((d) => `- ${d}`),
    ``,
    `## Files Changed`,
    ``,
    ...data.filesChanged.map((f) => `- \`${f}\``),
    ``,
  ].join('\n');

  await writeFile(filePath, content, 'utf-8');
  return filename;
}

/**
 * Write PROGRESS.md to the .ai-sync/ directory.
 */
export async function writeProgress(
  projectDir: string,
  phases: Array<{
    number: number;
    name: string;
    status: 'COMPLETE' | 'IN PROGRESS' | 'PENDING';
    tasks: Array<{ text: string; checked: boolean }>;
  }>
): Promise<void> {
  const filePath = join(projectDir, '.ai-sync', 'PROGRESS.md');
  await ensureDir(dirname(filePath));
  const content = generateProgressContent(phases);
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Write PLAN.md to the .ai-sync/ directory.
 */
export async function writePlan(projectDir: string, content: string): Promise<void> {
  const filePath = join(projectDir, '.ai-sync', 'PLAN.md');
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Create the .ai-sync/ directory structure.
 */
export async function createAiSyncDir(projectDir: string): Promise<void> {
  const aiSyncDir = join(projectDir, '.ai-sync');
  await ensureDir(aiSyncDir);
  await ensureDir(join(aiSyncDir, 'sessions'));
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}
