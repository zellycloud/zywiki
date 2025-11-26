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
        command: 'npx zy-docs detect --quiet 2>/dev/null || true',
      },
    ],
  };

  // Check if hook already exists
  const hasPostToolUse = settings.hooks.PostToolUse.some(
    h => h.hooks?.some(hh => hh.command?.includes('zy-docs detect'))
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
        command: 'npx zy-docs sync 2>/dev/null || true',
      },
    ],
  };

  const hasSessionEnd = settings.hooks.SessionEnd.some(
    h => h.hooks?.some(hh => hh.command?.includes('zy-docs sync'))
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
  const marker = '<!-- ZY-DOCS:START -->';
  const endMarker = '<!-- ZY-DOCS:END -->';

  const instructions = `${marker}
# Auto Documentation Sync (zy-docs)

At session start, check for pending documentation updates:

\`\`\`bash
cat .zy-docs/pending.json 2>/dev/null
\`\`\`

If there are pending updates:
1. Read the changed files listed
2. Update the affected documents to match current code
3. Run \`zy-docs sync --clear\` when done
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
  const marker = '<!-- ZY-DOCS:START -->';
  const endMarker = '<!-- ZY-DOCS:END -->';

  const instructions = `${marker}
# Auto Documentation Sync (zy-docs)

**At session start**, check \`.zy-docs/pending.json\`:

\`\`\`bash
cat .zy-docs/pending.json 2>/dev/null
\`\`\`

**If pending updates exist, automatically execute:**
1. Read each changed file listed in \`changedFiles\`
2. Read each affected document listed in \`affectedDocs\`
3. Update the documents to reflect code changes
4. Ensure \`<cite>\` blocks have correct file references and line numbers
5. Run \`zy-docs sync --clear\` when done

This is AUTO mode - execute without asking for confirmation.
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
        h => !h.hooks?.some(hh => hh.command?.includes('zy-docs'))
      );
    }

    if (settings.hooks?.SessionEnd) {
      settings.hooks.SessionEnd = settings.hooks.SessionEnd.filter(
        h => !h.hooks?.some(hh => hh.command?.includes('zy-docs'))
      );
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  // Remove from CLAUDE.md
  if (fs.existsSync(claudeMdPath)) {
    let content = fs.readFileSync(claudeMdPath, 'utf-8');
    const marker = '<!-- ZY-DOCS:START -->';
    const endMarker = '<!-- ZY-DOCS:END -->';
    const regex = new RegExp(`\\n*${marker}[\\s\\S]*?${endMarker}\\n*`, 'g');
    content = content.replace(regex, '\n');
    fs.writeFileSync(claudeMdPath, content.trim() + '\n');
  }

  return true;
}
