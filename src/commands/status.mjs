/**
 * status.mjs
 * Show tracking status with tech stack info
 */

import { getStats } from '../core/metadata.mjs';
import { loadPending, getTechStack } from '../core/detector.mjs';
import { output } from '../core/output.mjs';

/**
 * Collect status data
 */
async function collectStatusData() {
  const stats = getStats();
  const pending = loadPending();
  const techStack = await getTechStack();

  return {
    success: true,
    stats: {
      trackedFiles: stats.snippets,
      documents: stats.documents,
      pendingUpdates: stats.pending,
    },
    techStack: {
      primaryLanguage: techStack.summary.primaryLanguage || 'unknown',
      totalFrameworks: techStack.summary.totalFrameworks,
      totalServices: techStack.summary.totalServices,
      topLanguages: techStack.languages.slice(0, 3).map(l => l.name),
    },
    pending: {
      changedFiles: pending.changedFiles || [],
      affectedDocs: pending.affectedDocs || [],
    },
  };
}

/**
 * Format status data as text
 */
function formatStatusText(data) {
  console.log('\nzywiki Status');
  console.log('==============');
  console.log(`Tracked files:    ${data.stats.trackedFiles}`);
  console.log(`Documents:        ${data.stats.documents}`);
  console.log(`Pending updates:  ${data.stats.pendingUpdates}`);

  // Tech stack summary
  if (data.techStack.totalFrameworks > 0 || data.techStack.totalServices > 0) {
    console.log('\n--- Tech Stack ---');

    if (data.techStack.topLanguages.length > 0) {
      console.log(`Languages:        ${data.techStack.topLanguages.join(', ')}`);
    }

    if (data.techStack.totalFrameworks > 0) {
      console.log(`Frameworks:       ${data.techStack.totalFrameworks}`);
    }

    if (data.techStack.totalServices > 0) {
      console.log(`Services:         ${data.techStack.totalServices}`);
    }
  }

  // Show pending summary (limit to 5 items)
  if (data.pending.changedFiles.length > 0) {
    const maxShow = 5;
    const files = data.pending.changedFiles;
    console.log(`\nPending changes (${files.length} files):`);
    files.slice(0, maxShow).forEach(f => console.log(`  - ${f}`));
    if (files.length > maxShow) {
      console.log(`  ... and ${files.length - maxShow} more`);
    }
  }

  if (data.pending.affectedDocs.length > 0) {
    const maxShow = 5;
    const docs = data.pending.affectedDocs;
    console.log(`\nAffected documents (${docs.length} docs):`);
    docs.slice(0, maxShow).forEach(d => console.log(`  - ${d}`));
    if (docs.length > maxShow) {
      console.log(`  ... and ${docs.length - maxShow} more`);
    }
  }

  if (data.stats.pendingUpdates > 0) {
    console.log('\nRun "zywiki build" to generate missing docs.');
  }

  console.log('');
}

/**
 * Status command
 */
export async function statusCommand(options = {}) {
  const data = await collectStatusData();
  output(data, options, formatStatusText);
}
