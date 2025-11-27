/**
 * progress.mjs
 * Progress bar utility for CLI
 */

/**
 * Create a progress bar
 */
export function createProgressBar(total, width = 30) {
  let current = 0;

  const render = () => {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    // Clear line and write progress
    process.stdout.write(`\r  Building... [${bar}] ${percent}% (${current}/${total})`);
  };

  return {
    increment: () => {
      current++;
      render();
    },
    finish: () => {
      process.stdout.write('\n');
    },
    getCurrent: () => current,
  };
}
