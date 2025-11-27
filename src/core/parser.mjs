/**
 * parser.mjs
 * File parsing utilities for zywiki
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Calculate SHA-256 hash of file content
 */
export function calculateHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Parse file to extract structure
 */
export function parseFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const ext = path.extname(filePath);

    const result = {
      path: filePath,
      lines: lines.length,
      hash: calculateHash(filePath),
      exports: [],
      functions: [],
      classes: [],
    };

    // TypeScript/JavaScript parsing
    if (['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext)) {
      result.exports = extractExports(content);
      result.functions = extractFunctions(content);
      result.classes = extractClasses(content);
    }

    return result;
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract exports from TypeScript/JavaScript
 */
export function extractExports(content) {
  const exports = [];
  const lines = content.split('\n');

  const exportRegex = /^export\s+(const|let|var|function|class|interface|type|enum)\s+(\w+)/;
  const defaultExportRegex = /^export\s+default\s+(function|class)?\s*(\w+)?/;
  const namedExportRegex = /^export\s*\{\s*([^}]+)\s*\}/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Named export
    const match = trimmed.match(exportRegex);
    if (match) {
      exports.push({
        name: match[2],
        type: match[1],
        line: index + 1,
      });
    }

    // Default export
    const defaultMatch = trimmed.match(defaultExportRegex);
    if (defaultMatch) {
      exports.push({
        name: defaultMatch[2] || 'default',
        type: 'default',
        line: index + 1,
      });
    }

    // Re-exports
    const namedMatch = trimmed.match(namedExportRegex);
    if (namedMatch) {
      const names = namedMatch[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0]);
      names.forEach(name => {
        exports.push({
          name,
          type: 're-export',
          line: index + 1,
        });
      });
    }
  });

  return exports;
}

/**
 * Extract function definitions
 */
export function extractFunctions(content) {
  const functions = [];
  const lines = content.split('\n');

  const funcRegex = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/;
  const arrowRegex = /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    const funcMatch = trimmed.match(funcRegex);
    if (funcMatch) {
      functions.push({
        name: funcMatch[1],
        line: index + 1,
      });
    }

    const arrowMatch = trimmed.match(arrowRegex);
    if (arrowMatch) {
      functions.push({
        name: arrowMatch[1],
        line: index + 1,
      });
    }
  });

  return functions;
}

/**
 * Extract class definitions
 */
export function extractClasses(content) {
  const classes = [];
  const lines = content.split('\n');

  const classRegex = /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    const match = trimmed.match(classRegex);
    if (match) {
      classes.push({
        name: match[1],
        line: index + 1,
      });
    }
  });

  return classes;
}

/**
 * Get file line count
 */
export function getLineCount(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if file matches patterns
 */
export function matchesPattern(filePath, patterns, ignorePatterns = []) {
  const relativePath = filePath.replace(/\\/g, '/');

  // Check ignore patterns first
  for (const pattern of ignorePatterns) {
    if (matchGlob(relativePath, pattern)) {
      return false;
    }
  }

  // Check include patterns
  for (const pattern of patterns) {
    if (matchGlob(relativePath, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Simple glob matching
 */
function matchGlob(filePath, pattern) {
  // Step 1: Handle brace expansion {a,b,c} BEFORE escaping
  let processed = pattern.replace(/\{([^}]+)\}/g, (_, group) => `\x00BRACE:${group}\x00`);

  // Step 2: Escape special regex chars
  processed = processed.replace(/[.+^$|[\]\\]/g, '\\$&');

  // Step 3: Restore brace expansion as regex alternation
  processed = processed.replace(/\x00BRACE:([^\x00]+)\x00/g, (_, group) => `(${group.split(',').join('|')})`);

  // Step 4: Handle glob patterns (use placeholders to avoid conflicts)
  // **/ at start or middle -> zero or more directories (including direct match)
  processed = processed.replace(/\*\*\//g, '\x00GLOBSTARSLASH\x00');
  // /** at end -> anything after
  processed = processed.replace(/\/\*\*$/g, '\x00SLASHGLOBSTAR\x00');
  // ** alone -> anything
  processed = processed.replace(/\*\*/g, '\x00GLOBSTAR\x00');
  // * -> anything except /
  processed = processed.replace(/\*/g, '[^/]*');

  // Step 5: Replace placeholders with actual regex
  processed = processed.replace(/\x00GLOBSTARSLASH\x00/g, '(?:.*/)?');
  processed = processed.replace(/\x00SLASHGLOBSTAR\x00/g, '(?:/.*)?');
  processed = processed.replace(/\x00GLOBSTAR\x00/g, '.*');

  const regex = new RegExp(`^${processed}$`);
  return regex.test(filePath);
}
