/**
 * init.mjs
 * Initialize zy-docs in a project
 */

import fs from 'fs';
import path from 'path';
import { saveConfig, saveMetadata, getDefaultConfig, getPaths } from '../core/metadata.mjs';
import { setupClaudeCode, setupClaudeCodeAuto } from '../integrations/claude-code.mjs';
import { askYesNo } from '../core/prompt.mjs';
import { scanAndAddFiles } from './add.mjs';
import { buildCommand } from './build.mjs';

/**
 * Initialize documentation structure
 */
export async function initCommand(options) {
  const cwd = process.cwd();
  const configDir = path.join(cwd, '.zy-docs');
  const configPath = path.join(configDir, 'config.json');

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

  // Load existing config or create new one
  let config = getDefaultConfig();
  let existingDocsDir = null;

  if (fs.existsSync(configPath)) {
    try {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      existingDocsDir = existingConfig.docsDir;
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Determine docsDir: CLI option > existing config > default
  const docsDirName = options.docsDir || existingDocsDir || config.docsDir;
  config.docsDir = docsDirName;
  config.integrations.claudeCode = options.claude || false;
  config.integrations.git = options.git || false;
  saveConfig(config);
  console.log('Created .zy-docs/config.json');

  // Use the determined docsDir
  const docsDir = path.join(cwd, docsDirName);

  // Create metadata.json
  saveMetadata({
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    snippets: [],
    documents: [],
  });
  console.log('Created .zy-docs/metadata.json');

  // Create docs directory structure (7 categories)
  const docsDirs = [
    docsDir,
    path.join(docsDir, 'architecture'),   // 핵심 아키텍처
    path.join(docsDir, 'features'),       // 주요 기능
    path.join(docsDir, 'api'),            // API 참조
    path.join(docsDir, 'database'),       // 데이터베이스 설계
    path.join(docsDir, 'deployment'),     // 배포 및 운영
    path.join(docsDir, 'security'),       // 보안 아키텍처
    path.join(docsDir, 'testing'),        // 테스트 전략
    path.join(docsDir, 'guides'),         // 가이드 (용어집, 코딩 규칙 등)
  ];

  for (const dir of docsDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  console.log(`Created ${docsDirName}/ directory structure`);

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

  // Interactive: Ask to scan and build
  const shouldScan = await askYesNo('\nWould you like to scan src/ and add files for tracking?');

  if (shouldScan) {
    console.log('\nScanning src/ for files...');
    const addedCount = await scanAndAddFiles('src/', { recursive: true });
    console.log(`Added ${addedCount} files for tracking.`);

    if (addedCount > 0) {
      const shouldBuild = await askYesNo('\nWould you like to generate documentation for all tracked files?');

      if (shouldBuild) {
        console.log('');
        await buildCommand({ force: false });
      }
    }
  }

  console.log('\nNext steps:');
  console.log('  zy-docs add <path>         # Add more files to track');
  console.log('  zy-docs build              # Generate docs for all tracked files');
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

- [Architecture](./architecture/) - Core system architecture and design patterns
- [Features](./features/) - Feature documentation and specifications
- [API](./api/) - API reference and endpoints
- [Database](./database/) - Database schema and data models
- [Deployment](./deployment/) - Deployment guides and operations
- [Security](./security/) - Security architecture and policies
- [Testing](./testing/) - Test strategies and coverage
- [Guides](./guides/) - Development guides, glossary, coding standards

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
