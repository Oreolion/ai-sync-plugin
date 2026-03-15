/**
 * `ai-sync status` — Pretty-print progress and handoff state.
 */

import chalk from 'chalk';
import { readHandoff, readProgress, listSessions, hasAiSync } from '../protocol/reader.js';
import { progressBar, formatDate } from '../utils.js';

export async function statusCommand(projectDir: string): Promise<void> {
  // Verify .ai-sync/ exists
  if (!(await hasAiSync(projectDir))) {
    console.log(chalk.red('Error: .ai-sync/ directory not found.'));
    console.log('Run ' + chalk.cyan('ai-sync init') + ' first.');
    return;
  }

  console.log(chalk.bold('\n=== AI Sync Status ===\n'));

  // Handoff state
  try {
    const handoff = await readHandoff(projectDir);
    const fm = handoff.frontmatter;

    const statusColor =
      fm.status === 'completed'
        ? chalk.green
        : fm.status === 'blocked'
          ? chalk.red
          : fm.status === 'in-progress'
            ? chalk.blue
            : chalk.yellow;

    console.log(`${chalk.bold('Last Agent:')}   ${fm.last_agent}`);
    console.log(`${chalk.bold('Timestamp:')}    ${fm.timestamp}`);
    console.log(`${chalk.bold('Status:')}       ${statusColor(fm.status)}`);
    console.log(`${chalk.bold('Stop Reason:')}  ${fm.stop_reason}`);
    console.log(`${chalk.bold('Phase:')}        ${fm.current_phase}`);
    console.log(`${chalk.bold('Task:')}         ${fm.current_task}`);

    if (handoff.sections.blockers && handoff.sections.blockers !== 'None') {
      console.log(`${chalk.bold('Blockers:')}     ${chalk.red(handoff.sections.blockers)}`);
    }
  } catch {
    console.log(chalk.dim('No handoff data found.'));
  }

  // Progress
  console.log('');
  try {
    const progress = await readProgress(projectDir);
    let totalTasks = 0;
    let completedTasks = 0;

    for (const phase of progress.phases) {
      totalTasks += phase.tasks.length;
      completedTasks += phase.tasks.filter((t) => t.checked).length;
    }

    console.log(
      `${chalk.bold('Progress:')}     ${completedTasks}/${totalTasks} tasks  ${progressBar(completedTasks, totalTasks)}`
    );
    console.log('');

    // Phase-by-phase breakdown
    for (const phase of progress.phases) {
      const phaseCompleted = phase.tasks.filter((t) => t.checked).length;
      const phaseTotal = phase.tasks.length;

      const statusIcon =
        phase.status === 'COMPLETE'
          ? chalk.green('DONE')
          : phase.status === 'IN PROGRESS'
            ? chalk.blue('ACTIVE')
            : chalk.dim('PENDING');

      console.log(
        `  Phase ${phase.number}: ${phase.name} — ${statusIcon}  ${progressBar(phaseCompleted, phaseTotal, 20)}`
      );

      // Show tasks for active/in-progress phases
      if (phase.status === 'IN PROGRESS') {
        for (const task of phase.tasks) {
          const icon = task.checked ? chalk.green('  [x]') : chalk.dim('  [ ]');
          const text = task.checked ? chalk.dim(task.text) : task.text;
          console.log(`    ${icon} ${text}`);
        }
      }
    }
  } catch {
    console.log(chalk.dim('No progress data found.'));
  }

  // Session history
  console.log('');
  try {
    const sessions = await listSessions(projectDir);
    if (sessions.length > 0) {
      console.log(chalk.bold('Session History:'));
      const recentSessions = sessions.slice(0, 10); // Show last 10
      for (const session of recentSessions) {
        console.log(
          `  ${chalk.dim(formatDate(session.date))} — ${session.agent} (${session.filename})`
        );
      }
      if (sessions.length > 10) {
        console.log(chalk.dim(`  ... and ${sessions.length - 10} more`));
      }
    } else {
      console.log(chalk.dim('No session logs yet.'));
    }
  } catch {
    console.log(chalk.dim('No session logs found.'));
  }

  console.log('');
}
