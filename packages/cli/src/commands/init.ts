/**
 * `ai-sync init` — Bootstrap .ai-sync/ directory structure and adapter files.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import chalk from 'chalk';
import { createAiSyncDir, writePlan, writeProgress } from '../protocol/writer.js';
import { hasAiSync } from '../protocol/reader.js';
import { ADAPTERS, getSupportedTools } from '../adapters/templates.js';
import { detectProjectType, pathExists, exec } from '../utils.js';
import type { AdapterTool } from '../types.js';
import { createInterface } from 'node:readline';

/**
 * Prompt user with a yes/no question.
 */
function promptYesNo(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (Y/n) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() !== 'n');
    });
  });
}

/**
 * Prompt user for multi-select from a list.
 */
function promptMultiSelect(question: string, options: string[]): Promise<string[]> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log(question);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt}`);
  });
  console.log(`  a. All`);

  return new Promise((resolve) => {
    rl.question('Select (comma-separated numbers, or "a" for all): ', (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();

      if (trimmed === 'a' || trimmed === 'all' || trimmed === '') {
        resolve(options);
        return;
      }

      const indices = trimmed
        .split(',')
        .map((s) => parseInt(s.trim(), 10) - 1)
        .filter((i) => i >= 0 && i < options.length);

      resolve(indices.map((i) => options[i]));
    });
  });
}

export async function initCommand(projectDir: string): Promise<void> {
  console.log(chalk.bold('\nInitializing ai-sync in this project...\n'));

  // Check if already initialized
  if (await hasAiSync(projectDir)) {
    console.log(chalk.yellow('! .ai-sync/ directory already exists.'));
    const proceed = await promptYesNo('Reinitialize?');
    if (!proceed) {
      console.log('Aborted.');
      return;
    }
  }

  // Detect project type
  const projectTypes = await detectProjectType(projectDir);
  if (projectTypes.length > 0) {
    console.log(
      chalk.dim(
        `Detected: ${projectTypes.map((t) => t.name).join(', ')}`
      )
    );
  }

  // Create directory structure
  await createAiSyncDir(projectDir);
  console.log(chalk.green('+ Created .ai-sync/ directory'));

  // Create initial HANDOFF.md
  const timestamp = new Date().toISOString();
  const handoffContent = [
    '---',
    'last_agent: ai-sync-init',
    `timestamp: ${timestamp}`,
    'status: paused',
    'current_phase: "Setup"',
    'current_task: "Project initialized with ai-sync"',
    'stop_reason: completed',
    '---',
    '',
    '## What Was Completed',
    '',
    'Project initialized with ai-sync cross-agent synchronization.',
    '',
    '## Work In Progress',
    '',
    'None',
    '',
    '## Next Steps',
    '',
    '1. Review and update PLAN.md with your implementation plan',
    '2. Update PROGRESS.md with phases and tasks',
    '3. Begin work following the plan',
    '',
    '## Files Modified/Created',
    '',
    '- `.ai-sync/` directory structure',
    '',
    '## Blockers',
    '',
    'None',
    '',
    '## Key Decisions',
    '',
    'None yet — document decisions here as they are made.',
    '',
    '## Build Status',
    '',
    'N/A — initial setup',
    '',
  ].join('\n');

  await writeFile(join(projectDir, '.ai-sync', 'HANDOFF.md'), handoffContent, 'utf-8');
  console.log(chalk.green('+ Created .ai-sync/HANDOFF.md'));

  // Create initial PLAN.md
  let planContent = '# Implementation Plan\n\nAdd your implementation plan here.\n';

  // Check for existing context
  const claudeMdPath = join(projectDir, 'CLAUDE.md');
  if (await pathExists(claudeMdPath)) {
    const { readFile: rf } = await import('node:fs/promises');
    const claudeMd = await rf(claudeMdPath, 'utf-8');
    const firstLine = claudeMd.split('\n').find((l) => l.startsWith('# '));
    if (firstLine) {
      planContent = `# Implementation Plan\n\nProject: ${firstLine.replace('# ', '')}\n\nAdd your implementation plan here.\n`;
    }
  }

  await writePlan(projectDir, planContent);
  console.log(chalk.green('+ Created .ai-sync/PLAN.md'));

  // Create initial PROGRESS.md
  await writeProgress(projectDir, [
    {
      number: 1,
      name: 'Setup',
      status: 'COMPLETE',
      tasks: [{ text: 'Initialize ai-sync', checked: true }],
    },
  ]);
  console.log(chalk.green('+ Created .ai-sync/PROGRESS.md'));

  // Prompt for adapter files
  const allTools = getSupportedTools().filter(
    (t) => t !== 'codex' // codex shares AGENTS.md with opencode
  );

  console.log('');
  const selectedTools = await promptMultiSelect(
    'Which AI tools do you want to generate adapters for?',
    allTools
  );

  const createdFiles: string[] = [];

  for (const toolName of selectedTools) {
    const adapter = ADAPTERS[toolName as AdapterTool];
    if (!adapter) continue;

    const filePath = join(projectDir, adapter.filename);

    // Create parent directory if needed
    const parentDir = dirname(filePath);
    if (parentDir !== projectDir) {
      await mkdir(parentDir, { recursive: true });
    }

    await writeFile(filePath, adapter.content + '\n', 'utf-8');
    createdFiles.push(adapter.filename);
    console.log(chalk.green(`+ Created ${adapter.filename}`));
  }

  // Check git and suggest .gitignore update
  const gitignorePath = join(projectDir, '.gitignore');
  if (await pathExists(gitignorePath)) {
    const { readFile: rf } = await import('node:fs/promises');
    const gitignore = await rf(gitignorePath, 'utf-8');
    if (!gitignore.includes('.ai-sync/sessions/')) {
      console.log(
        chalk.yellow(
          '\nTip: Add .ai-sync/sessions/ to .gitignore (session logs are local).'
        )
      );
    }
  }

  // Summary
  console.log(chalk.bold('\nai-sync initialized successfully.\n'));
  console.log('Created:');
  console.log('  .ai-sync/HANDOFF.md');
  console.log('  .ai-sync/PLAN.md');
  console.log('  .ai-sync/PROGRESS.md');
  console.log('  .ai-sync/sessions/');
  for (const f of createdFiles) {
    console.log(`  ${f}`);
  }
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit .ai-sync/PLAN.md with your implementation plan');
  console.log('  2. Edit .ai-sync/PROGRESS.md with phases and tasks');
  console.log('  3. Run ' + chalk.cyan('ai-sync handoff') + ' when switching agents');
  console.log('');
}
