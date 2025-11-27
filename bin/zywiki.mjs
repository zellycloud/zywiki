#!/usr/bin/env node
/**
 * zywiki CLI
 * AI-powered Code Wiki Generator for Claude Code
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initCommand } from '../src/commands/init.mjs';
import { addCommand } from '../src/commands/add.mjs';
import { generateCommand } from '../src/commands/generate.mjs';
import { buildCommand } from '../src/commands/build.mjs';
import { detectCommand } from '../src/commands/detect.mjs';
import { statusCommand } from '../src/commands/status.mjs';
import { syncCommand } from '../src/commands/sync.mjs';
import { stackCommand } from '../src/commands/stack.mjs';
import { updateCommand } from '../src/commands/update.mjs';

// Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('zywiki')
  .description('AI-powered Code Wiki Generator for Claude Code')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize wiki structure in project')
  .option('--claude', 'Setup Claude Code hooks')
  .option('--auto', 'Enable auto wiki update on session start (requires --claude)')
  .option('--git', 'Setup Git hooks')
  .option('--wiki-dir <path>', 'Wiki directory (default: zywiki)')
  .option('--force', 'Overwrite existing configuration')
  .action(initCommand);

program
  .command('add <path>')
  .description('Register files for wiki tracking')
  .option('-r, --recursive', 'Add files recursively')
  .option('--category <name>', 'Specify wiki category')
  .action(addCommand);

program
  .command('generate <path>')
  .description('Generate wiki template for file')
  .option('--category <name>', 'Specify wiki category')
  .option('--title <title>', 'Specify wiki title')
  .action(generateCommand);

program
  .command('build')
  .description('Generate wiki with Claude AI')
  .option('--force', 'Overwrite existing wiki pages')
  .option('--filter <keyword>', 'Filter groups by keyword')
  .option('--lang <code>', 'Language (ko, en, ja, zh, zh-tw, es, vi, pt-br, fr, ru)', 'ko')
  .action(buildCommand);

program
  .command('detect')
  .description('Detect changed files and affected wiki pages')
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

program
  .command('stack')
  .description('Analyze and display project tech stack')
  .option('--save', 'Save tech stack documentation to zywiki/architecture/')
  .option('--output <file>', 'Custom output path for markdown')
  .action(stackCommand);

program
  .command('update')
  .description('Update configuration and re-scan project')
  .option('--provider <name>', 'Set AI provider (gemini, claude)')
  .option('--lang <code>', 'Set output language (ko, en, ja, etc.)')
  .option('--docs-dir <path>', 'Set documentation directory')
  .option('--scan', 'Re-scan source directories')
  .action(updateCommand);

program.parse();
