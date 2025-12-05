#!/usr/bin/env node
/**
 * zywiki CLI
 * AI-powered Code Wiki Generator
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initCommand } from '../src/commands/init.mjs';
import { buildCommand } from '../src/commands/build.mjs';
import { updateCommand } from '../src/commands/update.mjs';
import { statusCommand } from '../src/commands/status.mjs';
import { stackCommand } from '../src/commands/stack.mjs';
import { searchCommand } from '../src/commands/search-cmd.mjs';

// Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('zywiki')
  .description('AI-powered Code Wiki Generator')
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
  .command('build')
  .description('Generate all documentation (prompts if docs exist)')
  .option('--force', 'Skip confirmation and rebuild all')
  .option('--filter <keyword>', 'Filter groups by keyword')
  .option('--lang <code>', 'Language (ko, en, ja, zh, es, fr, etc.)', 'ko')
  .option('--json', 'Output as JSON')
  .action(buildCommand);

program
  .command('update [path]')
  .description('Update only pending documents (changed source files)')
  .option('--lang <code>', 'Language (ko, en, ja, zh, es, fr, etc.)', 'ko')
  .action(updateCommand);

program
  .command('status')
  .description('Show current tracking status')
  .option('--json', 'Output as JSON')
  .action(statusCommand);

program
  .command('search <query>')
  .description('Search wiki documents using RAG (semantic + keyword)')
  .option('-l, --limit <number>', 'Max results (default: 5)', parseInt)
  .option('--json', 'Output as JSON')
  .action(searchCommand);

program
  .command('stack')
  .description('Analyze and display project tech stack')
  .option('--save', 'Save tech stack documentation')
  .option('--json', 'Output as JSON')
  .action(stackCommand);

program.parse();
