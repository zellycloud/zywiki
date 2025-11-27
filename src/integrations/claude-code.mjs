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
 * Update CLAUDE.md with AUTO sync instructions
 */
function updateClaudeMdAuto(claudeMdPath) {
  const marker = '<!-- ZYWIKI:START -->';
  const endMarker = '<!-- ZYWIKI:END -->';

  const instructions = `${marker}
# zywiki - AI Code Wiki Integration

## Auto Documentation Sync

**At session start**, check for pending documentation updates:

\`\`\`bash
cat .zywiki/pending.json 2>/dev/null
\`\`\`

**If pending updates exist, automatically execute:**
1. Read each changed file listed in \`changedFiles\`
2. Read each affected document listed in \`affectedDocs\`
3. Update the documents to reflect code changes
4. Ensure \`<cite>\` blocks have correct file references and line numbers
5. Run \`zywiki sync --clear\` when done

This is AUTO mode - execute without asking for confirmation.

## How to Use zywiki

### Check Status
\`\`\`bash
zywiki status
\`\`\`

### Add Files for Tracking
\`\`\`bash
# Add single file
zywiki add src/lib/service.ts

# Add directory recursively
zywiki add src/ --recursive
\`\`\`

### Generate Documentation
\`\`\`bash
# Generate AI documentation for all tracked files
zywiki build --prompt

# Generate for specific filter
zywiki build --prompt --filter "hooks"

# Force regenerate existing docs
zywiki build --prompt --force
\`\`\`

### Detect Changes
\`\`\`bash
zywiki detect
\`\`\`

## Document Format

Generated documents follow this structure:
- \`<cite>file/path</cite>\` - Source file reference
- Overview (2-3 sentences)
- Mermaid diagrams (architecture, data flow, dependencies)
- Functions/classes list
- Usage examples
- Troubleshooting guide

## Configuration

Config file: \`.zywiki/config.json\`
- \`docsDir\`: Documentation output directory (default: "zywiki")
- \`language\`: Output language (ko, en, ja, zh, etc.)
- \`ai.provider\`: "gemini" or "claude"
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
