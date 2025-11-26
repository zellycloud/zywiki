/**
 * init.mjs
 * Initialize zy-docs in a project
 */

import fs from 'fs';
import path from 'path';
import { saveConfig, saveMetadata, getDefaultConfig, getPaths } from '../core/metadata.mjs';
import { setupClaudeCode, setupClaudeCodeAuto } from '../integrations/claude-code.mjs';

/**
 * Initialize documentation structure
 */
export async function initCommand(options) {
  const cwd = process.cwd();
  const configDir = path.join(cwd, '.zy-docs');
  const docsDir = path.join(cwd, 'docs');

  // Check if already initialized
  if (fs.existsSync(configDir) && !options.force) {
    console.log('Project already initialized. Use --force to reinitialize.');
    return;
  }

  console.log('Initializing zy-docs...\n');

  // Create .zy-docs directory
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log('Created .zy-docs/');
  }

  // Create config.json
  const config = getDefaultConfig();
  config.integrations.claudeCode = options.claude || false;
  config.integrations.git = options.git || false;
  saveConfig(config);
  console.log('Created .zy-docs/config.json');

  // Create metadata.json
  saveMetadata({
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    snippets: [],
    documents: [],
  });
  console.log('Created .zy-docs/metadata.json');

  // Create docs directory structure
  const docsDirs = [
    docsDir,
    path.join(docsDir, 'architecture'),
    path.join(docsDir, 'features'),
    path.join(docsDir, 'api'),
  ];

  for (const dir of docsDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  console.log('Created docs/ directory structure');

  // Create template files
  createTemplateFiles(docsDir);
  console.log('Created template documentation files');

  // Claude Code integration
  if (options.claude) {
    if (options.auto) {
      await setupClaudeCodeAuto(cwd);
      console.log('Configured Claude Code hooks (auto mode)');
    } else {
      await setupClaudeCode(cwd);
      console.log('Configured Claude Code hooks (manual mode)');
    }
  }

  // Git hooks (future)
  if (options.git) {
    console.log('Git hooks: Not implemented yet');
  }

  console.log('\nInitialization complete!');
  console.log('\nNext steps:');
  console.log('  zy-docs add src/           # Add files to track');
  console.log('  zy-docs status             # Check status');
}

/**
 * Create template documentation files
 */
function createTemplateFiles(docsDir) {
  // docs/index.md
  const indexContent = `# Project Documentation

This documentation is managed by [zy-docs](https://github.com/zellycloud/zellyy-docs).

## Categories

- [Architecture](./architecture/) - System structure and design
- [Features](./features/) - Feature documentation
- [API](./api/) - API reference

## Quick Start

\`\`\`bash
# Check documentation status
zy-docs status

# Add files to track
zy-docs add src/lib/myService.ts

# Generate documentation
zy-docs generate src/lib/myService.ts

# Detect changes
zy-docs detect
\`\`\`
`;

  // docs/architecture/overview.md
  const overviewContent = `# Architecture Overview

<cite>
**Referenced Files**
- No files linked yet. Use \`zy-docs add <file>\` to track files.
</cite>

## Overview

[Describe your project architecture here]

## Directory Structure

\`\`\`
src/
├── lib/          # Core business logic
├── components/   # UI components
├── hooks/        # React hooks
└── pages/        # Page components
\`\`\`

## Key Concepts

[Describe key architectural concepts]
`;

  // Write files
  const files = [
    { path: path.join(docsDir, 'index.md'), content: indexContent },
    { path: path.join(docsDir, 'architecture', 'overview.md'), content: overviewContent },
  ];

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.content);
    }
  }
}
