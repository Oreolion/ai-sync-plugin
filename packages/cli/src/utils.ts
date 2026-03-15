/**
 * Shared utility functions for the CLI.
 */

import { execFile } from 'node:child_process';
import { access, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectType } from './types.js';

/**
 * Execute a shell command and return stdout.
 * Returns empty string on error instead of throwing.
 */
export function exec(command: string, args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve) => {
    execFile(command, args, { cwd, maxBuffer: 1024 * 1024 }, (error, stdout) => {
      if (error) {
        resolve('');
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Execute a shell command and return { stdout, stderr, exitCode }.
 */
export function execFull(
  command: string,
  args: string[],
  cwd?: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    execFile(command, args, { cwd, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      let exitCode = 0;
      if (error) {
        // Node child_process errors store the exit code in error.code (as number)
        // or error.status for spawn errors
        const errWithStatus = error as Error & { status?: number; code?: string | number };
        if (typeof errWithStatus.status === 'number') {
          exitCode = errWithStatus.status;
        } else {
          exitCode = 1;
        }
      }
      resolve({
        stdout: stdout?.trim() ?? '',
        stderr: stderr?.trim() ?? '',
        exitCode,
      });
    });
  });
}

/**
 * Check if a file or directory exists.
 */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory.
 */
export async function isDirectory(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Detect the project type by looking for config files.
 */
export async function detectProjectType(projectDir: string): Promise<ProjectType[]> {
  const types: ProjectType[] = [];

  // Node.js / TypeScript
  if (await pathExists(join(projectDir, 'package.json'))) {
    const hasTypeScript = await pathExists(join(projectDir, 'tsconfig.json'));

    let buildCommand: string | undefined;
    try {
      const pkgRaw = await readFile(join(projectDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(pkgRaw) as { scripts?: Record<string, string> };
      if (pkg.scripts?.build) {
        buildCommand = 'npm run build';
      }
    } catch {
      // ignore parse errors
    }

    types.push({
      name: hasTypeScript ? 'TypeScript' : 'JavaScript',
      detected: true,
      buildCommand,
      typecheckCommand: hasTypeScript ? 'npx tsc --noEmit' : undefined,
    });
  }

  // Rust
  if (await pathExists(join(projectDir, 'Cargo.toml'))) {
    types.push({
      name: 'Rust',
      detected: true,
      buildCommand: 'cargo build',
      typecheckCommand: 'cargo check',
    });
  }

  // Go
  if (await pathExists(join(projectDir, 'go.mod'))) {
    types.push({
      name: 'Go',
      detected: true,
      buildCommand: 'go build ./...',
      typecheckCommand: 'go vet ./...',
    });
  }

  // Python
  if (
    (await pathExists(join(projectDir, 'pyproject.toml'))) ||
    (await pathExists(join(projectDir, 'setup.py'))) ||
    (await pathExists(join(projectDir, 'requirements.txt')))
  ) {
    types.push({
      name: 'Python',
      detected: true,
      buildCommand: undefined,
      typecheckCommand: 'mypy .',
    });
  }

  return types;
}

/**
 * Check if the current directory is inside a git repository.
 */
export async function isGitRepo(projectDir: string): Promise<boolean> {
  const result = await exec('git', ['rev-parse', '--is-inside-work-tree'], projectDir);
  return result === 'true';
}

/**
 * Get current ISO-8601 timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format a date as a human-readable string.
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Create a simple progress bar string.
 */
export function progressBar(completed: number, total: number, width: number = 30): string {
  if (total === 0) return `[${'░'.repeat(width)}] 0%`;
  const ratio = Math.min(completed / total, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const percentage = Math.round(ratio * 100);
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
}
