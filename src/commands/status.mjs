/**
 * status.mjs
 * Show tracking status
 */

import { getStats, loadMetadata, getPaths } from '../core/metadata.mjs';
import { loadPending } from '../core/detector.mjs';

/**
 * Status command
 */
export async function statusCommand() {
  const stats = getStats();
  const pending = loadPending();

  console.log('\nzywiki Status');
  console.log('==============');
  console.log(`Tracked files:    ${stats.snippets}`);
  console.log(`Documents:        ${stats.documents}`);
  console.log(`Pending updates:  ${stats.pending}`);

  if (pending.changedFiles && pending.changedFiles.length > 0) {
    console.log('\nPending changes:');
    pending.changedFiles.forEach(f => console.log(`  - ${f}`));
  }

  if (pending.affectedDocs && pending.affectedDocs.length > 0) {
    console.log('\nAffected documents:');
    pending.affectedDocs.forEach(d => console.log(`  - ${d}`));
  }

  console.log('');
}
