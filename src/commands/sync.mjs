/**
 * sync.mjs
 * Generate sync prompt for AI assistants
 */

import { loadPending, clearPending } from '../core/detector.mjs';

/**
 * Sync command
 */
export async function syncCommand(options) {
  const pending = loadPending();

  if (pending.changedFiles.length === 0) {
    console.log('No pending updates.');
    return;
  }

  if (options.format === 'json') {
    console.log(JSON.stringify(pending, null, 2));
  } else {
    // Generate prompt
    const prompt = generatePrompt(pending);
    console.log(prompt);
  }

  if (options.clear) {
    clearPending();
    console.log('\nPending updates cleared.');
  }
}

/**
 * Generate AI-friendly prompt
 */
function generatePrompt(pending) {
  const lines = [];

  lines.push('='.repeat(60));
  lines.push('Documentation Update Required');
  lines.push('='.repeat(60));
  lines.push('');

  lines.push(`Changed files (${pending.changedFiles.length}):`);
  pending.changedFiles.forEach(f => lines.push(`  - ${f}`));
  lines.push('');

  if (pending.affectedDocs.length > 0) {
    lines.push(`Affected documents (${pending.affectedDocs.length}):`);
    pending.affectedDocs.forEach(d => lines.push(`  - ${d}`));
    lines.push('');
  }

  lines.push('Instructions:');
  lines.push('1. Read each changed file to understand the modifications');
  lines.push('2. Update the affected documents to reflect the changes');
  lines.push('3. Ensure <cite> blocks have correct file references and line numbers');
  lines.push('4. Update function/class descriptions if signatures changed');
  lines.push('5. Run `zywiki sync --clear` when done');
  lines.push('');
  lines.push('='.repeat(60));

  return lines.join('\n');
}
