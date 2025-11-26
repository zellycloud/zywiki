/**
 * generate.mjs
 * Generate documentation template for a file
 */

import fs from 'fs';
import path from 'path';
import { loadConfig, getPaths, addDocument, findSnippetsByPath } from '../core/metadata.mjs';
import { parseFile } from '../core/parser.mjs';

/**
 * Generate documentation for a file
 */
export async function generateCommand(targetPath, options) {
  const { root } = getPaths();
  const config = loadConfig();
  const fullPath = path.resolve(targetPath);
  const relativePath = path.relative(root, fullPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${targetPath}`);
    process.exit(1);
  }

  // Parse file
  const parsed = parseFile(fullPath);
  if (!parsed) {
    console.error('Failed to parse file.');
    process.exit(1);
  }

  // Determine category
  const category = options.category || determineCategory(relativePath, config.categories);

  // Validate category (no root-level docs allowed)
  if (!isValidCategory(category, config)) {
    console.error(`Invalid category: ${category}`);
    console.error('Valid categories: architecture, features, api, database, deployment, security, testing, guides');
    process.exit(1);
  }

  const docsDir = path.join(root, config.docsDir, category);

  // Create docs directory if needed
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate document
  const title = options.title || generateTitle(relativePath);
  const docFileName = path.basename(relativePath, path.extname(relativePath)) + '.md';
  const docPath = path.join(docsDir, docFileName);

  // Check if document already exists
  if (fs.existsSync(docPath) && !options.force) {
    console.log(`Document already exists: ${path.relative(root, docPath)}`);
    console.log('Use --force to overwrite.');
    return;
  }

  // Generate content
  const content = generateDocContent(title, relativePath, parsed);
  fs.writeFileSync(docPath, content);

  // Add to metadata
  addDocument(docPath, [relativePath]);

  console.log(`Generated: ${path.relative(root, docPath)}`);
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
  return 'features'; // Default - no root-level docs allowed
}

/**
 * Validate category is allowed
 */
export function isValidCategory(category, config) {
  const validCategories = config.validCategories || [
    'architecture', 'features', 'api', 'database',
    'deployment', 'security', 'testing', 'guides'
  ];
  return validCategories.includes(category);
}

/**
 * Generate title from file path
 */
function generateTitle(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  // Convert camelCase/PascalCase to Title Case
  return basename
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Generate document content
 */
function generateDocContent(title, filePath, parsed) {
  const lines = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push('<cite>');
  lines.push('**Referenced Files**');
  lines.push(`- [${path.basename(filePath)}](file://${filePath}#L1-L${parsed.lines})`);
  lines.push('</cite>');
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push('[Add description here]');
  lines.push('');

  // Add exports section if available
  if (parsed.exports && parsed.exports.length > 0) {
    lines.push('## Exports');
    lines.push('');
    for (const exp of parsed.exports) {
      lines.push(`- \`${exp.name}\` (${exp.type}) - Line ${exp.line}`);
    }
    lines.push('');
  }

  // Add functions section
  if (parsed.functions && parsed.functions.length > 0) {
    lines.push('## Functions');
    lines.push('');
    for (const func of parsed.functions) {
      lines.push(`### ${func.name}`);
      lines.push('');
      lines.push(`[Description for ${func.name}]`);
      lines.push('');
    }
  }

  // Add classes section
  if (parsed.classes && parsed.classes.length > 0) {
    lines.push('## Classes');
    lines.push('');
    for (const cls of parsed.classes) {
      lines.push(`### ${cls.name}`);
      lines.push('');
      lines.push(`[Description for ${cls.name}]`);
      lines.push('');
    }
  }

  lines.push('## Usage');
  lines.push('');
  lines.push('```typescript');
  lines.push('// Add usage example');
  lines.push('```');
  lines.push('');
  lines.push('## Related');
  lines.push('');
  lines.push('- [Related document](./related.md)');
  lines.push('');

  return lines.join('\n');
}
