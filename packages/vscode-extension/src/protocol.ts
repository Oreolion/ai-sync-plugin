import matter from "gray-matter";

export interface HandoffData {
  status: string;
  agent: string;
  timestamp: string;
  phase: string;
  build_status: string;
  stop_reason: string;
  next_steps: string[];
  body: string;
}

export interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
  items: ProgressItem[];
}

export interface ProgressItem {
  text: string;
  done: boolean;
}

/**
 * Parse HANDOFF.md content. Expects YAML frontmatter with fields like:
 *   status, agent, timestamp, phase, build_status, stop_reason, next_steps
 */
export function parseHandoff(content: string): HandoffData {
  const { data, content: body } = matter(content);

  const nextSteps: string[] = [];
  if (Array.isArray(data.next_steps)) {
    for (const step of data.next_steps) {
      nextSteps.push(String(step));
    }
  } else if (typeof data.next_steps === "string") {
    nextSteps.push(data.next_steps);
  }

  return {
    status: String(data.status ?? "unknown"),
    agent: String(data.agent ?? "unknown"),
    timestamp: String(data.timestamp ?? "unknown"),
    phase: String(data.phase ?? "unknown"),
    build_status: String(data.build_status ?? "unknown"),
    stop_reason: String(data.stop_reason ?? ""),
    next_steps: nextSteps,
    body: body.trim(),
  };
}

/**
 * Parse PROGRESS.md content. Looks for Markdown checklist lines:
 *   - [x] Task completed
 *   - [ ] Task pending
 */
export function parseProgress(content: string): ProgressData {
  const checkboxPattern = /^[-*]\s+\[([ xX])\]\s+(.+)$/gm;
  const items: ProgressItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = checkboxPattern.exec(content)) !== null) {
    items.push({
      done: match[1].toLowerCase() === "x",
      text: match[2].trim(),
    });
  }

  const total = items.length;
  const completed = items.filter((i) => i.done).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage, items };
}
