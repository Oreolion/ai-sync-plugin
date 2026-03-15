/**
 * Adapter content templates for each supported AI coding tool.
 * Each adapter is a thin pointer file that tells the tool to read .ai-sync/.
 */

import type { AdapterTool } from '../types.js';

export interface AdapterConfig {
  tool: AdapterTool;
  filename: string;
  description: string;
  content: string;
}

const SYNC_PROTOCOL_RULES = `# Cross-Agent Synchronization

This project uses .ai-sync/ for cross-platform AI agent handoff.

## On Start
- Read .ai-sync/HANDOFF.md — understand current state and next steps
- Read .ai-sync/PROGRESS.md — know what's done, don't repeat work
- Read .ai-sync/PLAN.md — follow the plan, no deviations

## During Work
- Check off completed items in .ai-sync/PROGRESS.md
- Match existing code patterns and conventions

## On Stop
- Update .ai-sync/HANDOFF.md with: what you completed, specific next steps, files changed, build status
- Update .ai-sync/PROGRESS.md with completed tasks
- Run build/typecheck verification before stopping

## Rules
1. Follow the plan — no unplanned features or refactors
2. Don't repeat work — check PROGRESS.md first
3. Be specific in handoffs — actionable next steps, not vague summaries
4. Run verification — build and typecheck before stopping
5. Document decisions — the next agent has zero context`;

const AIDER_CONFIG = `# ai-sync: Cross-platform AI agent synchronization
# Read these files at the start of every session for project context

read:
  - .ai-sync/HANDOFF.md
  - .ai-sync/PROGRESS.md
  - .ai-sync/PLAN.md

# Conventions: Follow .ai-sync/ protocol
# - Check PROGRESS.md before starting — don't repeat completed work
# - Follow PLAN.md — no unplanned features or refactors
# - Before stopping, update HANDOFF.md with progress and next steps
# - Run build/typecheck verification before stopping`;

const AGENTS_MD = `# AI Agent Instructions

This project uses \`.ai-sync/\` for cross-platform AI agent synchronization.

## On Start
1. Read \`.ai-sync/HANDOFF.md\` — current state, what was done, what's next
2. Read \`.ai-sync/PROGRESS.md\` — completed vs pending tasks
3. Read \`.ai-sync/PLAN.md\` — the implementation plan (do not deviate)

## During Work
- Check off completed tasks in PROGRESS.md
- Match existing code patterns

## On Stop
1. Update \`HANDOFF.md\` with: completed work, specific next steps, files changed, build status
2. Update \`PROGRESS.md\` with completed items
3. Run verification (build + typecheck) before stopping

## Rules
1. Follow the plan — no unplanned features or refactors
2. Don't repeat work — check PROGRESS.md first
3. Be specific in handoffs — actionable next steps required
4. Run verification before stopping
5. Document decisions — the next agent has zero context`;

const COPILOT_INSTRUCTIONS = `# Copilot Instructions

This project uses \`.ai-sync/\` for cross-platform AI agent synchronization.

When working on this project:
- Read \`.ai-sync/HANDOFF.md\` for current project state and next steps
- Read \`.ai-sync/PROGRESS.md\` to understand what's done vs pending
- Follow \`.ai-sync/PLAN.md\` — do not deviate from the plan
- Before finishing, note what was accomplished and what should happen next
- Match existing code patterns and conventions
- Run build/typecheck verification when possible`;

/**
 * All adapter configurations indexed by tool name.
 */
export const ADAPTERS: Record<AdapterTool, AdapterConfig> = {
  cursor: {
    tool: 'cursor',
    filename: '.cursorrules',
    description: 'Cursor AI editor rules',
    content: SYNC_PROTOCOL_RULES,
  },
  cline: {
    tool: 'cline',
    filename: '.clinerules',
    description: 'Cline AI assistant rules',
    content: SYNC_PROTOCOL_RULES,
  },
  windsurf: {
    tool: 'windsurf',
    filename: '.windsurfrules',
    description: 'Windsurf AI editor rules',
    content: SYNC_PROTOCOL_RULES,
  },
  aider: {
    tool: 'aider',
    filename: '.aider.conf.yml',
    description: 'Aider configuration with read paths',
    content: AIDER_CONFIG,
  },
  opencode: {
    tool: 'opencode',
    filename: 'AGENTS.md',
    description: 'OpenCode / Codex agent instructions',
    content: AGENTS_MD,
  },
  codex: {
    tool: 'codex',
    filename: 'AGENTS.md',
    description: 'Codex / OpenCode agent instructions',
    content: AGENTS_MD,
  },
  copilot: {
    tool: 'copilot',
    filename: '.github/copilot-instructions.md',
    description: 'GitHub Copilot instructions',
    content: COPILOT_INSTRUCTIONS,
  },
  continue: {
    tool: 'continue',
    filename: '.continuerules',
    description: 'Continue.dev rules',
    content: SYNC_PROTOCOL_RULES,
  },
};

/**
 * Get adapter config for a tool, or undefined if not supported.
 */
export function getAdapterConfig(tool: string): AdapterConfig | undefined {
  return ADAPTERS[tool as AdapterTool];
}

/**
 * Get all supported tool names.
 */
export function getSupportedTools(): AdapterTool[] {
  return Object.keys(ADAPTERS) as AdapterTool[];
}

/**
 * List adapters in a formatted table string.
 */
export function listAdapters(): string {
  const lines: string[] = ['Available adapters:', ''];
  const entries: Array<[string, string]> = [
    ['cursor', '.cursorrules'],
    ['cline', '.clinerules'],
    ['windsurf', '.windsurfrules'],
    ['aider', '.aider.conf.yml'],
    ['opencode', 'AGENTS.md (shared with Codex)'],
    ['copilot', '.github/copilot-instructions.md'],
    ['continue', '.continuerules'],
    ['codex', 'AGENTS.md'],
  ];

  for (const [tool, file] of entries) {
    lines.push(`  ${tool.padEnd(12)} -> ${file}`);
  }

  lines.push('');
  lines.push('Usage: ai-sync adapter <tool>');
  return lines.join('\n');
}
