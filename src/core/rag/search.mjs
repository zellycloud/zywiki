/**
 * search.mjs
 * Search functionality
 */

import { embedQuery } from './embedding.mjs';
import { hybridSearch, vectorSearch } from './store.mjs';

/**
 * Search wiki documents
 */
export async function search(query, options = {}) {
  const { limit = 5, vectorOnly = false } = options;

  // Generate query embedding
  const queryEmbedding = await embedQuery(query);

  // Perform search
  let results;
  if (vectorOnly) {
    results = await vectorSearch(queryEmbedding, { limit });
  } else {
    results = await hybridSearch(query, queryEmbedding, { limit });
  }

  return results.map(result => ({
    file: result.document.filePath,
    section: result.document.section,
    content: result.document.content,
    score: result.score,
  }));
}

/**
 * Format search results for display
 */
export function formatResults(results) {
  if (results.length === 0) {
    return 'No results found.';
  }

  const lines = [];

  results.forEach((result, idx) => {
    lines.push(`\n[${idx + 1}] ${result.file}`);
    lines.push(`    Section: ${result.section}`);
    lines.push(`    Score: ${result.score.toFixed(4)}`);

    // Show preview (first 200 chars)
    const preview = result.content
      .replace(/\n+/g, ' ')
      .slice(0, 200)
      .trim();
    lines.push(`    ${preview}...`);
  });

  return lines.join('\n');
}
