/**
 * `ai-sync transfer` — Wrap `npx continues` for session transfer.
 */

import chalk from 'chalk';
import { hasAiSync, readHandoff } from '../protocol/reader.js';
import { writeHandoff } from '../protocol/writer.js';
import { execFull, nowISO } from '../utils.js';

export async function transferCommand(projectDir: string): Promise<void> {
  // Verify .ai-sync/ exists
  if (!(await hasAiSync(projectDir))) {
    console.log(chalk.red('Error: .ai-sync/ directory not found.'));
    console.log('Run ' + chalk.cyan('ai-sync init') + ' first.');
    return;
  }

  console.log(chalk.bold('\nSession Transfer\n'));
  console.log(chalk.dim('Running npx continues to extract session context...\n'));

  // Check if continues is available
  const checkResult = await execFull('npx', ['continues', '--help'], projectDir);

  if (checkResult.exitCode !== 0 && !checkResult.stdout.includes('continues')) {
    console.log(chalk.yellow('The "continues" package is not available or failed to run.'));
    console.log('');
    console.log('Install it with: ' + chalk.cyan('npm install -g continues'));
    console.log('Or use: ' + chalk.cyan('npx continues'));
    console.log('');
    console.log(
      'Alternatively, you can manually copy session context into .ai-sync/HANDOFF.md.'
    );
    return;
  }

  // Run continues and capture output
  console.log(chalk.dim('Extracting session data...'));
  const result = await execFull('npx', ['continues'], projectDir);

  if (result.exitCode !== 0) {
    console.log(chalk.red('Failed to run continues.'));
    if (result.stderr) {
      console.log(chalk.dim(result.stderr));
    }
    return;
  }

  const sessionOutput = result.stdout;

  if (!sessionOutput) {
    console.log(chalk.yellow('No session data captured.'));
    return;
  }

  console.log(chalk.green('Session data captured.\n'));

  // Append to HANDOFF.md
  try {
    const handoff = await readHandoff(projectDir);

    // Append the transferred session context
    handoff.sections.keyDecisions =
      (handoff.sections.keyDecisions || '') +
      '\n\n### Transferred Session Context\n\n' +
      sessionOutput;

    handoff.frontmatter.timestamp = nowISO();

    await writeHandoff(projectDir, handoff);
    console.log(chalk.green('Appended session context to .ai-sync/HANDOFF.md'));
  } catch {
    // If HANDOFF.md doesn't exist, just print the output
    console.log(chalk.yellow('Could not append to HANDOFF.md — printing output:\n'));
    console.log(sessionOutput);
  }

  console.log('');
}
