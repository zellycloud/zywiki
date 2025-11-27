/**
 * claude-code.mjs
 * Claude Code integration
 */

import fs from 'fs';
import path from 'path';

/**
 * Setup Claude Code hooks
 */
export async function setupClaudeCode(projectRoot) {
  const claudeDir = path.join(projectRoot, '.claude');
  const settingsPath = path.join(claudeDir, 'settings.local.json');
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  // Create .claude directory
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // Update or create settings.local.json
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch (e) {
      settings = {};
    }
  }

  // Ensure hooks structure
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Add PostToolUse hook
  if (!settings.hooks.PostToolUse) {
    settings.hooks.PostToolUse = [];
  }

  const postToolUseHook = {
    matcher: 'Write|Edit',
    hooks: [
      {
        type: 'command',
        command: 'npx zywiki detect --quiet 2>/dev/null || true',
      },
    ],
  };

  // Check if hook already exists
  const hasPostToolUse = settings.hooks.PostToolUse.some(
    h => h.hooks?.some(hh => hh.command?.includes('zywiki detect'))
  );

  if (!hasPostToolUse) {
    settings.hooks.PostToolUse.push(postToolUseHook);
  }

  // Add SessionEnd hook
  if (!settings.hooks.SessionEnd) {
    settings.hooks.SessionEnd = [];
  }

  const sessionEndHook = {
    matcher: '',
    hooks: [
      {
        type: 'command',
        command: 'npx zywiki sync 2>/dev/null || true',
      },
    ],
  };

  const hasSessionEnd = settings.hooks.SessionEnd.some(
    h => h.hooks?.some(hh => hh.command?.includes('zywiki sync'))
  );

  if (!hasSessionEnd) {
    settings.hooks.SessionEnd.push(sessionEndHook);
  }

  // Save settings
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  // Update CLAUDE.md
  updateClaudeMd(claudeMdPath);

  return true;
}

/**
 * Update CLAUDE.md with auto-sync instructions
 */
function updateClaudeMd(claudeMdPath) {
  const marker = '<!-- ZYWIKI:START -->';
  const endMarker = '<!-- ZYWIKI:END -->';

  const instructions = `${marker}
# zywiki - AI Code Wiki Integration

## Documentation Sync (Manual Mode)

Check for pending documentation updates:

\`\`\`bash
zywiki status
zywiki detect
\`\`\`

If there are pending updates:
1. Read the changed files with \`zywiki detect\`
2. Update the affected documents to match current code
3. Run \`zywiki sync --clear\` when done

## How to Use zywiki

### Commands
- \`zywiki status\` - Check tracking status
- \`zywiki add <path>\` - Add files for tracking
- \`zywiki build --prompt\` - Generate AI documentation
- \`zywiki detect\` - Detect changed files
- \`zywiki sync\` - Generate update prompt

### Generate Documentation
\`\`\`bash
zywiki build --prompt
\`\`\`
${endMarker}`;

  let content = '';
  if (fs.existsSync(claudeMdPath)) {
    content = fs.readFileSync(claudeMdPath, 'utf-8');
  }

  // Check if instructions already exist
  if (content.includes(marker)) {
    // Update existing
    const regex = new RegExp(`${marker}[\\s\\S]*?${endMarker}`, 'g');
    content = content.replace(regex, instructions);
  } else {
    // Append
    content = content.trim() + '\n\n' + instructions + '\n';
  }

  fs.writeFileSync(claudeMdPath, content);
}

/**
 * Setup Claude Code hooks with AUTO mode
 * Auto mode: automatically updates docs on session start
 */
export async function setupClaudeCodeAuto(projectRoot) {
  // First setup the basic hooks
  await setupClaudeCode(projectRoot);

  // Then update CLAUDE.md with auto instructions
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  updateClaudeMdAuto(claudeMdPath);

  return true;
}

/**
 * Update CLAUDE.md with zywiki instructions (exported for use in init/update)
 */
export function updateClaudeMdInstructions(projectRoot) {
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  updateClaudeMdAuto(claudeMdPath);
}

/**
 * Update CLAUDE.md with AUTO sync instructions
 */
function updateClaudeMdAuto(claudeMdPath) {
  const marker = '<!-- ZYWIKI:START -->';
  const endMarker = '<!-- ZYWIKI:END -->';

  const instructions = `${marker}
# zywiki - AI Code Wiki Integration

## For AI Assistants: How to Use This Wiki

### Reading Documentation
When you need to understand code in this project:
1. **First check** \`zywiki/overview.md\` for project structure and tech stack
2. **Search by category**: \`zywiki/features/\`, \`zywiki/api/\`, \`zywiki/database/\`, etc.
3. **Use file references**: Each doc has \`<cite>file/path:line</cite>\` pointing to source code

### When User Asks About Code
1. Read the relevant \`zywiki/*.md\` documentation first
2. Then read the actual source code if needed for details
3. Documentation provides context, architecture decisions, and usage patterns

### Updating Documentation After Code Changes
When you modify code files:
1. Check if there's a corresponding doc in \`zywiki/\` folder
2. Update the doc to reflect your changes
3. Keep \`<cite>\` references accurate with correct line numbers

## Auto Documentation Sync

**At session start**, check for pending documentation updates:

\`\`\`bash
cat .zywiki/pending.json 2>/dev/null
\`\`\`

**If pending updates exist:**
1. Read each changed file listed in \`changedFiles\`
2. Read each affected document listed in \`affectedDocs\`
3. Update the documents to reflect code changes
4. Ensure \`<cite>\` blocks have correct file references and line numbers

## Commands Reference

| Command | Description |
|---------|-------------|
| \`zywiki status\` | Show tracking status and pending updates |
| \`zywiki build\` | Generate documentation for tracked files |
| \`zywiki build --filter <keyword>\` | Generate docs for specific groups |
| \`zywiki build --force\` | Regenerate existing docs |
| \`zywiki add <path> -r\` | Add files for tracking |
| \`zywiki detect\` | Detect changed files |
| \`zywiki stack\` | Show project tech stack |

## Wiki Structure

\`\`\`
zywiki/
├── overview.md          # Project overview & tech stack
├── architecture/        # Core architecture & design patterns
├── features/            # Feature implementations
├── api/                 # API endpoints & edge functions
├── database/            # Database schema & migrations
├── security/            # Auth & security patterns
├── testing/             # Test strategies
└── guides/              # Scripts & utilities
\`\`\`

## Document Format

Each document includes:
- **Source reference**: \`<cite>file/path:line</cite>\`
- **Overview**: 2-3 sentence summary
- **Mermaid diagrams**: Architecture, data flow, dependencies
- **Key components**: Functions, classes, exports
- **Usage examples**: Code snippets
- **Related docs**: Links to related documentation
${endMarker}`;

  let content = '';
  if (fs.existsSync(claudeMdPath)) {
    content = fs.readFileSync(claudeMdPath, 'utf-8');
  }

  // Check if instructions already exist
  if (content.includes(marker)) {
    // Update existing
    const regex = new RegExp(`${marker}[\\s\\S]*?${endMarker}`, 'g');
    content = content.replace(regex, instructions);
  } else {
    // Append
    content = content.trim() + '\n\n' + instructions + '\n';
  }

  fs.writeFileSync(claudeMdPath, content);
}

/**
 * Remove Claude Code integration
 */
export async function removeClaudeCode(projectRoot) {
  const settingsPath = path.join(projectRoot, '.claude', 'settings.local.json');
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  // Remove hooks from settings
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    if (settings.hooks?.PostToolUse) {
      settings.hooks.PostToolUse = settings.hooks.PostToolUse.filter(
        h => !h.hooks?.some(hh => hh.command?.includes('zywiki'))
      );
    }

    if (settings.hooks?.SessionEnd) {
      settings.hooks.SessionEnd = settings.hooks.SessionEnd.filter(
        h => !h.hooks?.some(hh => hh.command?.includes('zywiki'))
      );
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  // Remove from CLAUDE.md
  if (fs.existsSync(claudeMdPath)) {
    let content = fs.readFileSync(claudeMdPath, 'utf-8');
    const marker = '<!-- ZYWIKI:START -->';
    const endMarker = '<!-- ZYWIKI:END -->';
    const regex = new RegExp(`\\n*${marker}[\\s\\S]*?${endMarker}\\n*`, 'g');
    content = content.replace(regex, '\n');
    fs.writeFileSync(claudeMdPath, content.trim() + '\n');
  }

  return true;
}
