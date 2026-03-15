/**
 * `ai-sync adapter <tool>` — Generate adapter file for a specific AI tool.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import chalk from 'chalk';
import { hasAiSync } from '../protocol/reader.js';
import { getAdapterConfig, listAdapters } from '../adapters/templates.js';
import { pathExists } from '../utils.js';

export async function adapterCommand(projectDir: string, tool?: string): Promise<void> {
  // Verify .ai-sync/ exists
  if (!(await hasAiSync(projectDir))) {
    console.log(chalk.red('Error: .ai-sync/ directory not found.'));
    console.log('Run ' + chalk.cyan('ai-sync init') + ' first.');
    return;
  }

  // If no tool specified, list available adapters
  if (!tool) {
    console.log('');
    console.log(listAdapters());
    console.log('');
    return;
  }

  const config = getAdapterConfig(tool.toLowerCase());
  if (!config) {
    console.log(chalk.red(`Unknown tool: ${tool}`));
    console.log('');
    console.log(listAdapters());
    return;
  }

  const filePath = join(projectDir, config.filename);

  // Create parent directory if needed (e.g., .github/)
  const parentDir = dirname(filePath);
  if (parentDir !== projectDir) {
    await mkdir(parentDir, { recursive: true });
  }

  // Warn if overwriting
  if (await pathExists(filePath)) {
    console.log(
      chalk.yellow(`Warning: ${config.filename} already exists. Overwriting with updated version.`)
    );
  }

  await writeFile(filePath, config.content + '\n', 'utf-8');

  console.log(chalk.green(`\nCreated ${config.filename} (${config.description})`));
  console.log(chalk.dim('Remember to commit this file to your repository.'));
  console.log('');
}
