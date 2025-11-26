#!/usr/bin/env node
/**
 * zy-docs CLI
 * Code-Documentation Auto Sync CLI for Claude Code
 */

import { Command } from 'commander';
import { initCommand } from '../src/commands/init.mjs';
import { addCommand } from '../src/commands/add.mjs';
import { generateCommand } from '../src/commands/generate.mjs';
import { detectCommand } from '../src/commands/detect.mjs';
import { statusCommand } from '../src/commands/status.mjs';
import { syncCommand } from '../src/commands/sync.mjs';

const program = new Command();

program
  .name('zy-docs')
  .description('Code-Documentation Auto Sync CLI for Claude Code')
  .version('0.1.3');

program
  .command('init')
  .description('Initialize documentation structure in project')
  .option('--claude', 'Setup Claude Code hooks')
  .option('--auto', 'Enable auto documentation update on session start (requires --claude)')
  .option('--git', 'Setup Git hooks')
  .option('--docs-dir <path>', 'Documentation directory (default: zy-docs)')
  .option('--force', 'Overwrite existing configuration')
  .action(initCommand);

program
  .command('add <path>')
  .description('Register files for documentation tracking')
  .option('-r, --recursive', 'Add files recursively')
  .option('--category <name>', 'Specify document category')
  .action(addCommand);

program
  .command('generate <path>')
  .description('Generate documentation template for file')
  .option('--category <name>', 'Specify document category')
  .option('--title <title>', 'Specify document title')
  .action(generateCommand);

program
  .command('detect')
  .description('Detect changed files and affected documents')
  .option('--output <file>', 'Output file path')
  .option('--quiet', 'Suppress output')
  .action(detectCommand);

program
  .command('status')
  .description('Show current tracking status')
  .action(statusCommand);

program
  .command('sync')
  .description('Generate update prompt for AI assistants')
  .option('--format <format>', 'Output format (prompt|json)', 'prompt')
  .option('--clear', 'Clear pending updates after sync')
  .action(syncCommand);

program.parse();
