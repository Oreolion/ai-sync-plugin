/**
 * `ai-sync handoff` — Interactive handoff: capture state before switching agents.
 */

import { createInterface } from 'node:readline';
import chalk from 'chalk';
import { readHandoff, readProgress, hasAiSync, readPlan } from '../protocol/reader.js';
import { writeHandoff, updateProgress, writeSessionLog } from '../protocol/writer.js';
import { detectProjectType, exec, execFull, nowISO } from '../utils.js';
import type {
  HandoffData,
  HandoffStatus,
  StopReason,
} from '../types.js';

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptChoice<T extends string>(question: string, choices: T[], defaultChoice: T): Promise<T> {
  const choiceStr = choices
    .map((c) => (c === defaultChoice ? chalk.bold(`[${c}]`) : c))
    .join(' / ');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (${choiceStr}): `, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase() as T;
      if (choices.includes(trimmed)) {
        resolve(trimmed);
      } else {
        resolve(defaultChoice);
      }
    });
  });
}

export async function handoffCommand(projectDir: string): Promise<void> {
  console.log(chalk.bold('\nAgent Handoff\n'));

  // Verify .ai-sync/ exists
  if (!(await hasAiSync(projectDir))) {
    console.log(chalk.red('Error: .ai-sync/ directory not found.'));
    console.log('Run ' + chalk.cyan('ai-sync init') + ' first.');
    return;
  }

  // Read current handoff state
  let currentHandoff: HandoffData | undefined;
  try {
    currentHandoff = await readHandoff(projectDir);
    console.log(
      chalk.dim(
        `Previous handoff: ${currentHandoff.frontmatter.last_agent} at ${currentHandoff.frontmatter.timestamp}`
      )
    );
  } catch {
    console.log(chalk.dim('No previous handoff found.'));
  }

  // Detect project type and run verification
  const projectTypes = await detectProjectType(projectDir);
  let buildStatus = 'N/A';

  if (projectTypes.length > 0) {
    const primaryType = projectTypes[0];
    console.log(chalk.dim(`\nProject type: ${primaryType.name}`));

    // Run typecheck
    if (primaryType.typecheckCommand) {
      console.log(chalk.dim(`Running typecheck: ${primaryType.typecheckCommand}...`));
      const [cmd, ...args] = primaryType.typecheckCommand.split(' ');
      const result = await execFull(cmd, args, projectDir);
      if (result.exitCode === 0) {
        console.log(chalk.green('  Typecheck: PASS'));
        buildStatus = 'Typecheck: PASS';
      } else {
        console.log(chalk.red('  Typecheck: FAIL'));
        buildStatus = 'Typecheck: FAIL';
        if (result.stderr) {
          console.log(chalk.dim(`  ${result.stderr.split('\n').slice(0, 5).join('\n  ')}`));
        }
      }
    }

    // Run build
    if (primaryType.buildCommand) {
      console.log(chalk.dim(`Running build: ${primaryType.buildCommand}...`));
      const [cmd, ...args] = primaryType.buildCommand.split(' ');
      const result = await execFull(cmd, args, projectDir);
      if (result.exitCode === 0) {
        console.log(chalk.green('  Build: PASS'));
        buildStatus += '\nBuild: PASS';
      } else {
        console.log(chalk.red('  Build: FAIL'));
        buildStatus += '\nBuild: FAIL';
        if (result.stderr) {
          console.log(chalk.dim(`  ${result.stderr.split('\n').slice(0, 5).join('\n  ')}`));
        }
      }
    }
  }

  // Get git diff for auto-progress
  const changedFiles = await exec('git', ['diff', '--name-only', 'HEAD'], projectDir);
  const stagedFiles = await exec('git', ['diff', '--name-only', '--cached'], projectDir);
  const allChanged = [...new Set([
    ...changedFiles.split('\n').filter(Boolean),
    ...stagedFiles.split('\n').filter(Boolean),
  ])];

  if (allChanged.length > 0) {
    console.log(chalk.dim(`\n${allChanged.length} files changed since last commit.`));
  }

  // Auto-update PROGRESS.md by cross-referencing changed files against tasks
  let autoCheckedTasks: string[] = [];
  try {
    const progress = await readProgress(projectDir);
    let planContent = '';
    try {
      planContent = await readPlan(projectDir);
    } catch {
      // Plan might not exist
    }

    for (const phase of progress.phases) {
      for (const task of phase.tasks) {
        if (task.checked) continue;

        // Check if any changed file is mentioned in the task text
        for (const file of allChanged) {
          const fileName = file.split('/').pop() ?? '';
          if (
            task.text.includes(file) ||
            task.text.includes(fileName) ||
            task.text.includes(`\`${file}\``) ||
            task.text.includes(`\`${fileName}\``)
          ) {
            try {
              await updateProgress(projectDir, phase.number, task.text, true);
              autoCheckedTasks.push(task.text);
            } catch {
              // Ignore update errors
            }
            break;
          }
        }
      }
    }

    if (autoCheckedTasks.length > 0) {
      console.log(chalk.green(`\nAuto-checked ${autoCheckedTasks.length} task(s) in PROGRESS.md:`));
      for (const task of autoCheckedTasks) {
        console.log(chalk.green(`  - ${task}`));
      }
    }
  } catch {
    // Progress file might not exist
  }

  // Interactive prompts
  console.log('');
  const status = await promptChoice<HandoffStatus>(
    'Status',
    ['paused', 'blocked', 'completed', 'in-progress'],
    'paused'
  );

  const stopReason = await promptChoice<StopReason>(
    'Stop reason',
    ['user-switch', 'rate-limit', 'context-limit', 'completed', 'error'],
    'user-switch'
  );

  const currentTask = await prompt('Current task: ');
  const nextSteps = await prompt('Next steps (separate with semicolons): ');
  const blockers = await prompt('Blockers (or "none"): ');
  const whatCompleted = await prompt('What was completed this session: ');

  // Read current progress for phase info
  let currentPhase = 'Unknown';
  try {
    const progress = await readProgress(projectDir);
    const inProgressPhase = progress.phases.find((p) => p.status === 'IN PROGRESS');
    if (inProgressPhase) {
      currentPhase = `Phase ${inProgressPhase.number}: ${inProgressPhase.name}`;
    } else {
      const pendingPhase = progress.phases.find((p) => p.status === 'PENDING');
      if (pendingPhase) {
        currentPhase = `Phase ${pendingPhase.number}: ${pendingPhase.name}`;
      }
    }
  } catch {
    // Ignore
  }

  // Format next steps as numbered list
  const formattedNextSteps = nextSteps
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');

  // Format files modified
  const formattedFiles = allChanged.length > 0
    ? allChanged.map((f) => `- \`${f}\``).join('\n')
    : 'None detected (working tree clean)';

  const timestamp = nowISO();

  // Write HANDOFF.md
  const handoffData: HandoffData = {
    frontmatter: {
      last_agent: 'cli-handoff',
      timestamp,
      status,
      current_phase: currentPhase,
      current_task: currentTask || 'Not specified',
      stop_reason: stopReason,
    },
    sections: {
      whatWasCompleted: whatCompleted || 'Not specified',
      workInProgress: currentTask || 'None',
      nextSteps: formattedNextSteps || 'None specified',
      filesModified: formattedFiles,
      blockers: blockers === 'none' || !blockers ? 'None' : blockers,
      keyDecisions: 'See session log for details.',
      buildStatus,
    },
  };

  await writeHandoff(projectDir, handoffData);
  console.log(chalk.green('\nWrote .ai-sync/HANDOFF.md'));

  // Create session log
  const sessionFilename = await writeSessionLog(projectDir, {
    agent: 'cli-handoff',
    timestamp,
    summary: whatCompleted || 'Handoff recorded via CLI',
    keyDecisions: [],
    filesChanged: allChanged,
  });
  console.log(chalk.green(`Wrote .ai-sync/sessions/${sessionFilename}`));

  // Summary
  console.log(chalk.bold('\nHandoff complete.\n'));
  console.log(`Status: ${status}`);
  console.log(`Stop reason: ${stopReason}`);
  console.log(`Phase: ${currentPhase}`);
  if (autoCheckedTasks.length > 0) {
    console.log(`Auto-checked tasks: ${autoCheckedTasks.length}`);
  }
  console.log('');
  console.log(
    'The next agent can resume with: ' + chalk.cyan('ai-sync resume <tool>')
  );
  console.log('');
}
