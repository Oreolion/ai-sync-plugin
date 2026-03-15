/**
 * `ai-sync diff` — Show changes since the last handoff.
 */

import chalk from 'chalk';
import { readHandoff, hasAiSync, listSessions } from '../protocol/reader.js';
import { exec, isGitRepo, formatDate } from '../utils.js';

export async function diffCommand(projectDir: string): Promise<void> {
  // Verify .ai-sync/ exists
  if (!(await hasAiSync(projectDir))) {
    console.log(chalk.red('Error: .ai-sync/ directory not found.'));
    console.log('Run ' + chalk.cyan('ai-sync init') + ' first.');
    return;
  }

  // Check git
  if (!(await isGitRepo(projectDir))) {
    console.log(chalk.red('Error: Not a git repository.'));
    return;
  }

  // Read handoff timestamp
  let handoffTimestamp = '';
  let lastAgent = '';
  try {
    const handoff = await readHandoff(projectDir);
    handoffTimestamp = handoff.frontmatter.timestamp;
    lastAgent = handoff.frontmatter.last_agent;
  } catch {
    console.log(chalk.yellow('Warning: Could not read HANDOFF.md — showing all uncommitted changes.'));
  }

  console.log(chalk.bold('\n=== Changes Since Last Handoff ===\n'));

  if (handoffTimestamp) {
    console.log(`${chalk.bold('Handoff:')} ${lastAgent} at ${handoffTimestamp}`);
  }

  // Find the handoff commit
  let handoffCommit = '';
  if (handoffTimestamp) {
    handoffCommit = await exec(
      'git',
      ['log', '--oneline', `--until=${handoffTimestamp}`, '-1', '--format=%H'],
      projectDir
    );
    if (handoffCommit) {
      const shortSha = handoffCommit.slice(0, 7);
      const commitMsg = await exec(
        'git',
        ['log', '-1', '--format=%s', handoffCommit],
        projectDir
      );
      console.log(`${chalk.bold('Handoff Commit:')} ${shortSha} ${commitMsg}`);
    }
  }

  console.log('');

  // Committed changes since handoff
  if (handoffCommit) {
    const commits = await exec(
      'git',
      ['log', '--oneline', `${handoffCommit}..HEAD`],
      projectDir
    );

    if (commits) {
      const commitLines = commits.split('\n').filter(Boolean);
      console.log(chalk.bold(`Commits Since Handoff (${commitLines.length}):`));
      for (const line of commitLines) {
        console.log(`  ${line}`);
      }
    } else {
      console.log(chalk.dim('No new commits since handoff.'));
    }

    console.log('');

    const diffStat = await exec(
      'git',
      ['diff', '--stat', `${handoffCommit}..HEAD`],
      projectDir
    );
    if (diffStat) {
      console.log(chalk.bold('Files Changed (committed):'));
      console.log(`  ${diffStat.split('\n').join('\n  ')}`);
    }
  }

  // Uncommitted changes
  console.log('');
  const unstaged = await exec('git', ['diff', '--stat'], projectDir);
  const staged = await exec('git', ['diff', '--stat', '--cached'], projectDir);

  if (unstaged || staged) {
    console.log(chalk.bold('Uncommitted Changes:'));
    if (staged) {
      console.log(chalk.green('  Staged:'));
      console.log(`    ${staged.split('\n').join('\n    ')}`);
    }
    if (unstaged) {
      console.log(chalk.yellow('  Unstaged:'));
      console.log(`    ${unstaged.split('\n').join('\n    ')}`);
    }
  } else {
    console.log(chalk.dim('Working tree clean.'));
  }

  // Untracked files
  const untracked = await exec(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    projectDir
  );
  if (untracked) {
    const files = untracked.split('\n').filter(Boolean);
    console.log('');
    console.log(chalk.bold(`Untracked Files (${files.length}):`));
    for (const f of files.slice(0, 20)) {
      console.log(`  ${chalk.dim('?')} ${f}`);
    }
    if (files.length > 20) {
      console.log(chalk.dim(`  ... and ${files.length - 20} more`));
    }
  }

  // Check if .ai-sync/ files changed
  if (handoffCommit) {
    const syncDiff = await exec(
      'git',
      ['diff', '--name-only', `${handoffCommit}..HEAD`, '--', '.ai-sync/'],
      projectDir
    );
    if (syncDiff) {
      console.log('');
      console.log(
        chalk.yellow('Sync files changed since handoff (another agent may have worked here):')
      );
      for (const f of syncDiff.split('\n').filter(Boolean)) {
        console.log(`  ${f}`);
      }
    }
  }

  // New sessions since handoff
  if (handoffTimestamp) {
    const handoffDate = new Date(handoffTimestamp);
    try {
      const sessions = await listSessions(projectDir);
      const newSessions = sessions.filter((s) => s.date > handoffDate);
      if (newSessions.length > 0) {
        console.log('');
        console.log(chalk.bold('Sessions Since Handoff:'));
        for (const s of newSessions) {
          console.log(`  ${formatDate(s.date)} — ${s.agent}`);
        }
      }
    } catch {
      // No sessions directory
    }
  }

  console.log('');
}
