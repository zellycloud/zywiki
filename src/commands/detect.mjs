/**
 * detect.mjs
 * Detect changed files
 */

import { runDetection } from '../core/detector.mjs';

/**
 * Detect changes command
 */
export async function detectCommand(options) {
  const result = runDetection({
    quiet: options.quiet,
  });

  if (options.output) {
    // Already saved by runDetection, but could customize path
    console.log(`Results saved to: ${options.output}`);
  }
}
