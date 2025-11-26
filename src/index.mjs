/**
 * zellyy-docs (zy-docs)
 * Code-Documentation Auto Sync CLI for Claude Code
 */

export { loadMetadata, saveMetadata, addSnippet, findSnippetsByPath } from './core/metadata.mjs';
export { parseFile, calculateHash } from './core/parser.mjs';
export { detectChanges, findAffectedDocs } from './core/detector.mjs';
