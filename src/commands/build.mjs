/**
 * build.mjs
 * Build documentation for all tracked files
 */

import fs from 'fs';
import path from 'path';
import { loadConfig, loadMetadata, getPaths } from '../core/metadata.mjs';
import { generateCommand } from './generate.mjs';

/**
 * Build documentation for all tracked files
 */
export async function buildCommand(options) {
  const { root } = getPaths();
  const metadata = loadMetadata();
  const config = loadConfig();

  if (metadata.snippets.length === 0) {
    console.log('No files tracked. Use "zy-docs add <path>" to add files first.');
    return;
  }

  console.log(`Building documentation for ${metadata.snippets.length} tracked files...\n`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const snippet of metadata.snippets) {
    const filePath = path.join(root, snippet.path);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠ Skipped (not found): ${snippet.path}`);
      skipped++;
      continue;
    }

    try {
      // Check if doc already exists
      const docPath = getDocPath(snippet.path, config);

      if (fs.existsSync(docPath) && !options.force) {
        console.log(`  ⊘ Exists: ${path.relative(root, docPath)}`);
        skipped++;
        continue;
      }

      // Generate documentation
      await generateCommand(snippet.path, { force: options.force });
      generated++;
    } catch (error) {
      console.error(`  ✗ Error: ${snippet.path} - ${error.message}`);
      errors++;
    }
  }

  console.log(`\nBuild complete!`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped: ${skipped}`);
  if (errors > 0) {
    console.log(`  Errors: ${errors}`);
  }
}

/**
 * Get expected doc path for a source file
 */
function getDocPath(filePath, config) {
  const { root } = getPaths();
  const category = determineCategory(filePath, config.categories);
  const docFileName = path.basename(filePath, path.extname(filePath)) + '.md';
  return path.join(root, config.docsDir, category, docFileName);
}

/**
 * Determine document category from path
 */
function determineCategory(filePath, categories) {
  for (const [pattern, category] of Object.entries(categories)) {
    if (filePath.startsWith(pattern.replace(/^\//, ''))) {
      return category;
    }
  }
  return 'features';
}
