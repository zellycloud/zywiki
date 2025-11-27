/**
 * status.mjs
 * Show tracking status with tech stack info
 */

import { getStats, loadMetadata, getPaths } from '../core/metadata.mjs';
import { loadPending, getTechStack } from '../core/detector.mjs';

/**
 * Status command
 */
export async function statusCommand() {
  const stats = getStats();
  const pending = loadPending();
  const techStack = await getTechStack();

  console.log('\nzywiki Status');
  console.log('==============');
  console.log(`Tracked files:    ${stats.snippets}`);
  console.log(`Documents:        ${stats.documents}`);
  console.log(`Pending updates:  ${stats.pending}`);

  // Tech stack summary
  if (techStack.summary.totalFrameworks > 0 || techStack.summary.totalServices > 0) {
    console.log('\n--- Tech Stack ---');

    // Languages
    if (techStack.languages.length > 0) {
      const top3 = techStack.languages.slice(0, 3).map(l => l.name).join(', ');
      console.log(`Languages:        ${top3}`);
    }

    // Frameworks count by category
    if (techStack.summary.totalFrameworks > 0) {
      const frameworkCategories = Object.keys(techStack.frameworks).length;
      console.log(`Frameworks:       ${techStack.summary.totalFrameworks} (${frameworkCategories} categories)`);
    }

    // Services count by category
    if (techStack.summary.totalServices > 0) {
      const serviceCategories = Object.keys(techStack.services).length;
      console.log(`Services:         ${techStack.summary.totalServices} (${serviceCategories} categories)`);
    }
  }

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
