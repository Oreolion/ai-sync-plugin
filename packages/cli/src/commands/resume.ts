/**
 * `ai-sync resume [tool]` — Generate a copy-pasteable resume prompt for a target tool.
 */

import chalk from 'chalk';
import { readHandoff, readProgress, readPlan, listSessions, readSessionLog, hasAiSync } from '../protocol/reader.js';

type ToolPromptFormatter = (context: ResumeContext) => string;

interface ResumeContext {
  handoffContent: string;
  progressSummary: string;
  planContent: string;
  lastSessionContent: string;
  nextSteps: string;
  currentPhase: string;
  currentTask: string;
  blockers: string;
  buildStatus: string;
}

const TOOL_FORMATTERS: Record<string, ToolPromptFormatter> = {
  cursor: formatCursorPrompt,
  cline: formatClinePrompt,
  windsurf: formatWindsurfPrompt,
  aider: formatAiderPrompt,
  opencode: formatOpenCodePrompt,
  codex: formatCodexPrompt,
  copilot: formatCopilotPrompt,
  continue: formatContinuePrompt,
  claude: formatClaudePrompt,
};

function formatCursorPrompt(ctx: ResumeContext): string {
  return `Resume working on this project. Here is the handoff context from the previous AI agent:

## Current State
- Phase: ${ctx.currentPhase}
- Task: ${ctx.currentTask}
- Build: ${ctx.buildStatus}
${ctx.blockers !== 'None' ? `- Blockers: ${ctx.blockers}` : ''}

## What To Do Next
${ctx.nextSteps}

## Progress Summary
${ctx.progressSummary}

## Important
- Read .ai-sync/PLAN.md for the full implementation plan
- Read .ai-sync/PROGRESS.md to see what's already done
- Do NOT repeat completed work
- Follow the plan — no unplanned features
- Before stopping, update .ai-sync/HANDOFF.md with your progress`;
}

function formatClinePrompt(ctx: ResumeContext): string {
  return formatCursorPrompt(ctx);
}

function formatWindsurfPrompt(ctx: ResumeContext): string {
  return formatCursorPrompt(ctx);
}

function formatContinuePrompt(ctx: ResumeContext): string {
  return formatCursorPrompt(ctx);
}

function formatAiderPrompt(ctx: ResumeContext): string {
  return `/read .ai-sync/HANDOFF.md
/read .ai-sync/PROGRESS.md
/read .ai-sync/PLAN.md

Resume the current task: ${ctx.currentTask}

Next steps:
${ctx.nextSteps}
${ctx.blockers !== 'None' ? `\nBlockers to resolve first: ${ctx.blockers}` : ''}

Before stopping, update .ai-sync/HANDOFF.md with your progress and next steps.`;
}

function formatOpenCodePrompt(ctx: ResumeContext): string {
  return `Read the following files first:
- .ai-sync/HANDOFF.md
- .ai-sync/PROGRESS.md
- .ai-sync/PLAN.md

Then resume the current task: ${ctx.currentTask}

Phase: ${ctx.currentPhase}
Build status: ${ctx.buildStatus}
${ctx.blockers !== 'None' ? `Blockers: ${ctx.blockers}` : ''}

Next steps:
${ctx.nextSteps}

Follow the plan. Don't repeat completed work. Update HANDOFF.md when you stop.`;
}

function formatCodexPrompt(ctx: ResumeContext): string {
  return formatOpenCodePrompt(ctx);
}

function formatCopilotPrompt(ctx: ResumeContext): string {
  return `I need help continuing work on this project. The previous AI agent left a handoff.

Current task: ${ctx.currentTask}
Phase: ${ctx.currentPhase}
${ctx.blockers !== 'None' ? `Blockers: ${ctx.blockers}` : ''}

Next steps:
${ctx.nextSteps}

Please read .ai-sync/HANDOFF.md and .ai-sync/PLAN.md for full context.`;
}

function formatClaudePrompt(ctx: ResumeContext): string {
  return `Read .ai-sync/HANDOFF.md, .ai-sync/PROGRESS.md, and .ai-sync/PLAN.md to understand the current state. Then resume work.

Current task: ${ctx.currentTask}
Phase: ${ctx.currentPhase}
Build status: ${ctx.buildStatus}
${ctx.blockers !== 'None' ? `Blockers: ${ctx.blockers}` : ''}

Next steps:
${ctx.nextSteps}`;
}

function formatGenericPrompt(ctx: ResumeContext): string {
  return formatCursorPrompt(ctx);
}

export async function resumeCommand(projectDir: string, tool?: string): Promise<void> {
  // Verify .ai-sync/ exists
  if (!(await hasAiSync(projectDir))) {
    console.log(chalk.red('Error: .ai-sync/ directory not found.'));
    console.log('Run ' + chalk.cyan('ai-sync init') + ' first.');
    return;
  }

  if (!tool) {
    console.log(chalk.bold('\nSupported tools for resume prompts:\n'));
    const tools = Object.keys(TOOL_FORMATTERS);
    for (const t of tools) {
      console.log(`  ${chalk.cyan(t)}`);
    }
    console.log('');
    console.log('Usage: ' + chalk.cyan('ai-sync resume <tool>'));
    console.log('');
    return;
  }

  const formatter = TOOL_FORMATTERS[tool.toLowerCase()] ?? formatGenericPrompt;

  // Read all context
  let handoffRaw = '';
  let nextSteps = '';
  let currentPhase = 'Unknown';
  let currentTask = 'Not specified';
  let blockers = 'None';
  let buildStatus = 'Unknown';

  try {
    const handoff = await readHandoff(projectDir);
    handoffRaw = JSON.stringify(handoff, null, 2);
    nextSteps = handoff.sections.nextSteps || 'No next steps specified';
    currentPhase = handoff.frontmatter.current_phase;
    currentTask = handoff.frontmatter.current_task;
    blockers = handoff.sections.blockers || 'None';
    buildStatus = handoff.sections.buildStatus || 'Unknown';
  } catch {
    console.log(chalk.yellow('Warning: Could not read HANDOFF.md'));
  }

  let progressSummary = '';
  try {
    const progress = await readProgress(projectDir);
    let totalTasks = 0;
    let completedTasks = 0;
    const phaseSummaries: string[] = [];

    for (const phase of progress.phases) {
      totalTasks += phase.tasks.length;
      const done = phase.tasks.filter((t) => t.checked).length;
      completedTasks += done;
      phaseSummaries.push(`Phase ${phase.number}: ${phase.name} — ${phase.status} (${done}/${phase.tasks.length})`);
    }

    progressSummary = `${completedTasks}/${totalTasks} tasks complete\n${phaseSummaries.join('\n')}`;
  } catch {
    progressSummary = 'No progress data available';
  }

  let planContent = '';
  try {
    planContent = await readPlan(projectDir);
  } catch {
    planContent = 'No plan available';
  }

  let lastSessionContent = '';
  try {
    const sessions = await listSessions(projectDir);
    if (sessions.length > 0) {
      lastSessionContent = await readSessionLog(projectDir, sessions[0].filename);
    }
  } catch {
    // No sessions yet
  }

  const context: ResumeContext = {
    handoffContent: handoffRaw,
    progressSummary,
    planContent,
    lastSessionContent,
    nextSteps,
    currentPhase,
    currentTask,
    blockers,
    buildStatus,
  };

  const resumePrompt = formatter(context);

  console.log(chalk.bold(`\n=== Resume prompt for ${tool} ===\n`));
  console.log(chalk.dim('Copy and paste this into your AI tool:\n'));
  console.log(chalk.dim('─'.repeat(60)));
  console.log(resumePrompt);
  console.log(chalk.dim('─'.repeat(60)));
  console.log('');
}
