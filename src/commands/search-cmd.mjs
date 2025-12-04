/**
 * search-cmd.mjs
 * Search wiki documents using RAG
 */

import { search, formatResults } from '../core/rag/index.mjs';

/**
 * Search command
 */
export async function searchCommand(query, options) {
  try {
    const results = await search(query, {
      limit: options.limit || 5,
      vectorOnly: options.vectorOnly,
    });

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(formatResults(results));
      console.log('');
    }
  } catch (error) {
    if (error.message.includes('not installed') || error.message.includes('RAG dependencies')) {
      console.error('\n' + error.message);
      console.log('');
    } else if (error.message.includes('No documents')) {
      console.error('\nNo documents indexed yet.');
      console.log('Run "zywiki index" to create the search index.\n');
    } else {
      throw error;
    }
  }
}
