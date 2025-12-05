/**
 * output.mjs
 * JSON/Text output utility for CLI commands
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

/**
 * Output helper that handles JSON/text format switching
 * @param {Object} data - Data to output
 * @param {Object} options - Options object with json flag
 * @param {Function} textFormatter - Function to format data as text
 */
export function output(data, options, textFormatter) {
  if (options?.json) {
    // Add metadata fields for JSON output
    const jsonOutput = {
      version: pkg.version,
      timestamp: new Date().toISOString(),
      ...data,
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
  } else {
    textFormatter(data);
  }
}

/**
 * Get package version
 */
export function getVersion() {
  return pkg.version;
}

/**
 * Create success result object
 * @param {Object} data - Result data
 */
export function success(data) {
  return {
    success: true,
    ...data,
  };
}

/**
 * Create error result object
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
export function error(message, details = {}) {
  return {
    success: false,
    error: message,
    ...details,
  };
}
