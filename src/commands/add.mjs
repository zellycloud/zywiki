/**
 * add.mjs
 * Add files to documentation tracking
 */

import fs from 'fs';
import path from 'path';
import { addSnippet, loadConfig, getPaths } from '../core/metadata.mjs';
import { getLineCount, matchesPattern } from '../core/parser.mjs';

/**
 * Add files to tracking
 */
export async function addCommand(targetPath, options) {
  const { root } = getPaths();
  const config = loadConfig();
  const fullPath = path.resolve(targetPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Path not found: ${targetPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    if (options.recursive) {
      const added = addDirectory(fullPath, config, options);
      console.log(`\nAdded ${added} files to tracking.`);
    } else {
      console.log('Use -r or --recursive to add directory contents.');
    }
  } else {
    addFile(fullPath, options);
  }
}

/**
 * Add a single file
 */
function addFile(filePath, options) {
  const lineCount = getLineCount(filePath);
  const snippet = addSnippet(filePath, [1, lineCount]);

  if (snippet) {
    console.log(`Added: ${snippet.path}`);
    return true;
  }
  return false;
}

/**
 * Add directory recursively
 */
function addDirectory(dirPath, config, options) {
  let count = 0;
  const { root } = getPaths();

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(root, fullPath);

      if (entry.isDirectory()) {
        // Skip ignored directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }
        walk(fullPath);
      } else {
        // Check patterns
        if (matchesPattern(relativePath, config.sourcePatterns, config.ignorePatterns)) {
          if (addFile(fullPath, options)) {
            count++;
          }
        }
      }
    }
  };

  walk(dirPath);
  return count;
}
