/**
 * prompt.mjs
 * Interactive prompts for CLI
 */

import readline from 'readline';

/**
 * Ask a yes/no question (default: Y)
 */
export function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${question} (Y/n): `, (answer) => {
      rl.close();
      // Default is Y (empty string or 'y' or 'yes')
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === '' || trimmed === 'y' || trimmed === 'yes');
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

/**
 * Ask for AI provider selection
 */
export function askAIProvider() {
  const providers = [
    { code: 'claude', name: 'Claude Code CLI (requires claude cli)' },
    { code: 'gemini', name: 'Gemini API (free, requires GEMINI_API_KEY)' },
  ];

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nSelect AI provider:');
    providers.forEach((p, i) => {
      const marker = i === 0 ? ' (default)' : '';
      console.log(`  ${i + 1}. ${p.name}${marker}`);
    });

    rl.question('\nEnter number [1]: ', (answer) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      if (num >= 1 && num <= providers.length) {
        resolve(providers[num - 1].code);
      } else {
        resolve('claude'); // default
      }
    });
  });
}

/**
 * Ask for API key
 */
export function askAPIKey(provider) {
  const envVar = provider === 'gemini' ? 'GEMINI_API_KEY' : 'ANTHROPIC_API_KEY';
  const existingKey = process.env[envVar];

  if (existingKey) {
    console.log(`\n${envVar} found in environment.`);
    return Promise.resolve(null); // Use env var
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`\nEnter ${envVar} (or press Enter to skip): `, (answer) => {
      rl.close();
      resolve(answer.trim() || null);
    });
  });
}

/**
 * Ask for language selection
 */
export function askLanguage() {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'pt-br', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'zh', name: '简体中文' },
    { code: 'zh-tw', name: '繁體中文' },
  ];

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nSelect documentation language:');
    languages.forEach((lang, i) => {
      const marker = i === 0 ? ' (default)' : '';
      console.log(`  ${i + 1}. ${lang.name}${marker}`);
    });

    rl.question('\nEnter number [1]: ', (answer) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      if (num >= 1 && num <= languages.length) {
        resolve(languages[num - 1].code);
      } else {
        resolve('en'); // default
      }
    });
  });
}
