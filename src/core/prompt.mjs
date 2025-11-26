/**
 * prompt.mjs
 * Interactive prompts for CLI
 */

import readline from 'readline';

/**
 * Ask a yes/no question
 */
export function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Ask for text input
 */
export function askInput(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer || defaultValue);
    });
  });
}
