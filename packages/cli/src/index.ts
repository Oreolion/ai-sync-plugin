/**
 * @oreolion/ai-sync — Cross-platform AI agent synchronization CLI.
 *
 * Entry point that registers all commands via commander.
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { handoffCommand } from './commands/handoff.js';
import { statusCommand } from './commands/status.js';
import { resumeCommand } from './commands/resume.js';
import { diffCommand } from './commands/diff.js';
import { adapterCommand } from './commands/adapter.js';
import { transferCommand } from './commands/transfer.js';
import { hooksCommand } from './commands/hooks.js';

const program = new Command();

program
  .name('ai-sync')
  .description('Cross-platform AI agent synchronization — seamless handoff between coding agents')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize .ai-sync/ directory in the current project')
  .action(async () => {
    await initCommand(process.cwd());
  });

program
  .command('handoff')
  .description('Capture work state before switching to another AI agent')
  .action(async () => {
    await handoffCommand(process.cwd());
  });

program
  .command('status')
  .description('Show current sync state, progress, and session history')
  .action(async () => {
    await statusCommand(process.cwd());
  });

program
  .command('resume [tool]')
  .description('Generate a resume prompt for a target AI tool')
  .action(async (tool?: string) => {
    await resumeCommand(process.cwd(), tool);
  });

program
  .command('diff')
  .description('Show changes since the last handoff')
  .action(async () => {
    await diffCommand(process.cwd());
  });

program
  .command('adapter [tool]')
  .description('Generate adapter file for a specific AI tool')
  .action(async (tool?: string) => {
    await adapterCommand(process.cwd(), tool);
  });

program
  .command('transfer')
  .description('Transfer session context using npx continues')
  .action(async () => {
    await transferCommand(process.cwd());
  });

program
  .command('hooks <action>')
  .description('Install or remove git hooks (install|remove)')
  .action(async (action: string) => {
    await hooksCommand(process.cwd(), action);
  });

program.parse();
