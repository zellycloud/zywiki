/**
 * detector.mjs
 * Change detection for zy-docs
 */

import fs from 'fs';
import path from 'path';
import { loadMetadata, saveMetadata, getPaths, findDocsBySnippet } from './metadata.mjs';
import { calculateHash } from './parser.mjs';

/**
 * Detect changes in tracked files
 * @returns {Object} Changed files and affected documents
 */
export function detectChanges() {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const changedFiles = [];
  const missingFiles = [];

  for (const snippet of metadata.snippets) {
    const filePath = path.join(root, snippet.path);

    if (!fs.existsSync(filePath)) {
      missingFiles.push(snippet.path);
      continue;
    }

    const currentHash = calculateHash(filePath);
    if (currentHash && currentHash !== snippet.hash) {
      changedFiles.push({
        path: snippet.path,
        oldHash: snippet.hash,
        newHash: currentHash,
      });
    }
  }

  return {
    changedFiles,
    missingFiles,
    total: metadata.snippets.length,
  };
}

/**
 * Find documents affected by changed files
 * @param {string[]} changedFilePaths - List of changed file paths
 * @returns {Set<string>} Set of affected document paths
 */
export function findAffectedDocs(changedFilePaths) {
  const { root } = getPaths();
  const affectedDocs = new Set();

  for (const filePath of changedFilePaths) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
    const docs = findDocsBySnippet(fullPath);
    docs.forEach(doc => {
      const relativePath = path.relative(root, doc);
      affectedDocs.add(relativePath);
    });
  }

  return affectedDocs;
}

/**
 * Save pending updates to file
 * @param {Object} changes - Detection result
 * @param {Set<string>} affectedDocs - Affected documents
 */
export function savePending(changes, affectedDocs) {
  const { pendingPath } = getPaths();

  const pending = {
    timestamp: new Date().toISOString(),
    changedFiles: changes.changedFiles.map(f => f.path),
    affectedDocs: Array.from(affectedDocs),
    missingFiles: changes.missingFiles,
  };

  fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
  return pending;
}

/**
 * Load pending updates
 */
export function loadPending() {
  const { pendingPath } = getPaths();

  try {
    if (fs.existsSync(pendingPath)) {
      return JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
    }
  } catch (e) {
    // Ignore
  }

  return {
    timestamp: null,
    changedFiles: [],
    affectedDocs: [],
    missingFiles: [],
  };
}

/**
 * Clear pending updates
 */
export function clearPending() {
  const { pendingPath } = getPaths();

  if (fs.existsSync(pendingPath)) {
    fs.unlinkSync(pendingPath);
    return true;
  }
  return false;
}

/**
 * Update hashes for changed files
 * @param {Array} changedFiles - List of changed file objects
 */
export function updateHashes(changedFiles) {
  const metadata = loadMetadata();
  const now = new Date().toISOString();

  for (const change of changedFiles) {
    const snippet = metadata.snippets.find(s => s.path === change.path);
    if (snippet) {
      snippet.hash = change.newHash;
      snippet.updatedAt = now;
    }
  }

  saveMetadata(metadata);
}

/**
 * Run full detection pipeline
 * @param {Object} options - Options
 * @returns {Object} Detection result
 */
export function runDetection(options = {}) {
  const changes = detectChanges();
  const changedPaths = changes.changedFiles.map(f => f.path);
  const affectedDocs = findAffectedDocs(changedPaths);

  if (!options.quiet) {
    if (changes.changedFiles.length > 0) {
      console.log(`\nChanged files: ${changes.changedFiles.length}`);
      changes.changedFiles.forEach(f => console.log(`  - ${f.path}`));
    }

    if (affectedDocs.size > 0) {
      console.log(`\nAffected documents: ${affectedDocs.size}`);
      affectedDocs.forEach(d => console.log(`  - ${d}`));
    }

    if (changes.missingFiles.length > 0) {
      console.log(`\nMissing files: ${changes.missingFiles.length}`);
      changes.missingFiles.forEach(f => console.log(`  - ${f}`));
    }

    if (changes.changedFiles.length === 0 && changes.missingFiles.length === 0) {
      console.log('\nNo changes detected.');
    }
  }

  // Save to pending.json
  const pending = savePending(changes, affectedDocs);

  return {
    changes,
    affectedDocs: Array.from(affectedDocs),
    pending,
  };
}
