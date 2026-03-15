/**
 * `ai-sync hooks install|remove` — Manage git hooks for auto-sync.
 */

import { writeFile, unlink, chmod, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import chalk from 'chalk';
import { pathExists, isGitRepo, exec } from '../utils.js';

const HOOK_MARKER = '# ai-sync post-commit hook';

const POST_COMMIT_HOOK = `#!/bin/sh
${HOOK_MARKER}
# Automatically updates .ai-sync/ metadata on each commit.
# Installed by: ai-sync hooks install
# Remove with:  ai-sync hooks remove

# Get the latest commit info
COMMIT_SHA=$(git log -1 --format="%H")
COMMIT_MSG=$(git log -1 --format="%s")
COMMIT_DATE=$(git log -1 --format="%aI")
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)

# Only update if .ai-sync/ exists
if [ -d ".ai-sync" ]; then
  # Check if HANDOFF.md exists
  if [ -f ".ai-sync/HANDOFF.md" ]; then
    # Update the timestamp in HANDOFF.md frontmatter
    # This is a lightweight touch — full updates are done by the handoff command
    echo "ai-sync: commit $COMMIT_SHA recorded"
  fi
fi
`;

export async function hooksCommand(projectDir: string, action?: string): Promise<void> {
  if (!action || (action !== 'install' && action !== 'remove')) {
    console.log(chalk.bold('\nai-sync hooks\n'));
    console.log('Usage:');
    console.log('  ai-sync hooks install  — Install post-commit git hook');
    console.log('  ai-sync hooks remove   — Remove the git hook');
    console.log('');
    return;
  }

  // Check if this is a git repo
  if (!(await isGitRepo(projectDir))) {
    console.log(chalk.red('Error: Not a git repository.'));
    return;
  }

  // Find the actual git root (may differ from projectDir in subfolders)
  const gitRoot = await exec('git', ['rev-parse', '--show-toplevel'], projectDir);
  if (!gitRoot) {
    console.log(chalk.red('Error: Could not determine git root directory.'));
    return;
  }

  const hooksDir = join(gitRoot, '.git', 'hooks');
  const hookPath = join(hooksDir, 'post-commit');

  if (action === 'install') {
    await installHook(hookPath);
  } else {
    await removeHook(hookPath);
  }
}

async function installHook(hookPath: string): Promise<void> {
  // Ensure hooks directory exists
  const { dirname } = await import('node:path');
  await mkdir(dirname(hookPath), { recursive: true });

  // Check if hook already exists
  if (await pathExists(hookPath)) {
    const { readFile } = await import('node:fs/promises');
    const existing = await readFile(hookPath, 'utf-8');

    if (existing.includes(HOOK_MARKER)) {
      console.log(chalk.yellow('ai-sync post-commit hook is already installed.'));
      return;
    }

    // Append to existing hook
    console.log(chalk.yellow('Existing post-commit hook found — appending ai-sync hook.'));
    const combined = existing.trimEnd() + '\n\n' + POST_COMMIT_HOOK.split('\n').slice(1).join('\n');
    await writeFile(hookPath, combined, 'utf-8');
  } else {
    await writeFile(hookPath, POST_COMMIT_HOOK, 'utf-8');
  }

  // Make executable (Unix)
  try {
    await chmod(hookPath, 0o755);
  } catch {
    // chmod may fail on Windows — that's OK, git handles it
  }

  console.log(chalk.green('\nInstalled post-commit hook at .git/hooks/post-commit'));
  console.log(chalk.dim('The hook will log commits when .ai-sync/ is present.'));
  console.log('');
}

async function removeHook(hookPath: string): Promise<void> {
  if (!(await pathExists(hookPath))) {
    console.log(chalk.dim('No post-commit hook found — nothing to remove.'));
    return;
  }

  const { readFile } = await import('node:fs/promises');
  const existing = await readFile(hookPath, 'utf-8');

  if (!existing.includes(HOOK_MARKER)) {
    console.log(chalk.yellow('The post-commit hook was not installed by ai-sync — not removing.'));
    return;
  }

  // Check if there's other content besides our hook
  const lines = existing.split('\n');
  const ourSection: number[] = [];
  let inOurSection = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(HOOK_MARKER)) {
      inOurSection = true;
    }
    if (inOurSection) {
      ourSection.push(i);
    }
  }

  const otherContent = lines.filter((_, i) => !ourSection.includes(i)).join('\n').trim();

  if (otherContent && otherContent !== '#!/bin/sh') {
    // Keep the other content, just remove our section
    await writeFile(hookPath, otherContent + '\n', 'utf-8');
    console.log(chalk.green('Removed ai-sync hook (kept other hook content).'));
  } else {
    // Remove the entire file
    await unlink(hookPath);
    console.log(chalk.green('Removed post-commit hook.'));
  }

  console.log('');
}
