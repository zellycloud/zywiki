/**
 * update.mjs
 * Update zywiki configuration and re-scan project
 */

import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig, getPaths } from '../core/metadata.mjs';
import { askYesNo, askLanguage, askAIProvider, askAPIKey } from '../core/prompt.mjs';
import { scanAndAddFiles } from './add.mjs';
import { getTechStack } from '../core/detector.mjs';
import { updateClaudeMdInstructions } from '../integrations/claude-code.mjs';

/**
 * Update command - update existing zywiki configuration
 */
export async function updateCommand(options = {}) {
  const cwd = process.cwd();
  const configDir = path.join(cwd, '.zywiki');
  const configPath = path.join(configDir, 'config.json');

  // Check if initialized
  if (!fs.existsSync(configDir)) {
    console.log('zywiki is not initialized. Run "zywiki init" first.');
    return;
  }

  // Load existing config
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.log('Error loading config. Run "zywiki init --force" to reinitialize.');
    return;
  }

  console.log('zywiki Update');
  console.log('=============\n');

  console.log('Current configuration:');
  console.log(`  Provider: ${config.ai?.provider || 'not set'}`);
  console.log(`  Language: ${config.language || 'not set'}`);
  console.log(`  Docs dir: ${config.docsDir || 'zywiki'}`);
  console.log('');

  // Handle CLI options for non-interactive update
  let updated = false;

  if (options.provider) {
    const validProviders = ['gemini', 'claude'];
    if (validProviders.includes(options.provider)) {
      config.ai = config.ai || {};
      config.ai.provider = options.provider;
      config.ai.model = options.provider === 'gemini' ? 'gemini-2.5-flash' : 'haiku';
      console.log(`Updated provider to: ${options.provider}`);
      updated = true;
    } else {
      console.log(`Invalid provider: ${options.provider}. Use 'gemini' or 'claude'.`);
    }
  }

  if (options.lang) {
    const validLangs = ['ko', 'en', 'ja', 'zh', 'zh-tw', 'es', 'vi', 'pt-br', 'fr', 'ru'];
    if (validLangs.includes(options.lang)) {
      config.language = options.lang;
      console.log(`Updated language to: ${options.lang}`);
      updated = true;
    } else {
      console.log(`Invalid language: ${options.lang}. Valid: ${validLangs.join(', ')}`);
    }
  }

  if (options.docsDir) {
    config.docsDir = options.docsDir;
    console.log(`Updated docs directory to: ${options.docsDir}`);
    updated = true;
  }

  // If no CLI options, ask if user wants to change settings (default: No)
  if (!updated) {
    const wantToUpdate = await askYesNo('Do you want to change settings?', false);

    if (wantToUpdate) {
      // Ask what to update
      const updateProvider = await askYesNo('Update AI provider?');
      if (updateProvider) {
        const provider = await askAIProvider();
        config.ai = config.ai || {};
        config.ai.provider = provider;
        config.ai.model = provider === 'gemini' ? 'gemini-2.5-flash' : 'haiku';

        // Only ask for API key if provider is gemini and no existing key
        if (provider === 'gemini' && !config.ai.apiKey && !process.env.GEMINI_API_KEY) {
          const apiKey = await askAPIKey(provider);
          config.ai.apiKey = apiKey;
        }
        updated = true;
      }

      const updateLanguage = await askYesNo('Update output language?');
      if (updateLanguage) {
        const language = await askLanguage();
        config.language = language;
        updated = true;
      }
    }
  }

  // Save config if updated
  if (updated) {
    saveConfig(config);
    console.log('\nConfiguration updated.');
  }

  // Show tech stack
  try {
    const techStack = await getTechStack();
    if (techStack.summary.totalFrameworks > 0 || techStack.summary.totalServices > 0) {
      console.log('\n--- Tech Stack ---');

      if (techStack.languages.length > 0) {
        const topLangs = techStack.languages.slice(0, 3).map(l => l.name).join(', ');
        console.log(`  Languages:   ${topLangs}`);
      }

      if (techStack.summary.totalFrameworks > 0) {
        const frameworkNames = Object.values(techStack.frameworks)
          .flat()
          .slice(0, 5)
          .map(f => f.name)
          .join(', ');
        console.log(`  Frameworks:  ${frameworkNames}${techStack.summary.totalFrameworks > 5 ? ` (+${techStack.summary.totalFrameworks - 5} more)` : ''}`);
      }

      if (techStack.summary.totalServices > 0) {
        const serviceNames = Object.values(techStack.services)
          .flat()
          .slice(0, 5)
          .map(s => s.name)
          .join(', ');
        console.log(`  Services:    ${serviceNames}${techStack.summary.totalServices > 5 ? ` (+${techStack.summary.totalServices - 5} more)` : ''}`);
      }
    }
  } catch (e) {
    // Ignore tech stack errors
  }

  // Ask to re-scan
  if (options.scan || (!options.provider && !options.lang && !options.docsDir)) {
    const shouldScan = options.scan || await askYesNo('\nRe-scan source directories?');
    if (shouldScan) {
      const sourceDirs = detectSourceDirectories(cwd);
      if (sourceDirs.length > 0) {
        let totalAdded = 0;
        for (const dir of sourceDirs) {
          console.log(`\nScanning ${dir.path}/...`);
          const addedCount = await scanAndAddFiles(dir.path, { recursive: true });
          console.log(`  Added ${addedCount} files`);
          totalAdded += addedCount;
        }
        console.log(`\nTotal: ${totalAdded} files added for tracking.`);
      } else {
        console.log('\nNo source directories detected.');
      }
    }
  }

  // Update CLAUDE.md with zywiki instructions
  try {
    updateClaudeMdInstructions(cwd);
    console.log('\nUpdated CLAUDE.md with zywiki instructions');
  } catch (err) {
    // Ignore CLAUDE.md update errors
  }

  console.log('\nDone. Run "zywiki status" to check current status.');
}

/**
 * Detect source directories in the codebase
 */
function detectSourceDirectories(cwd) {
  const knownDirs = [
    { path: 'src', category: 'features' },
    { path: 'lib', category: 'features' },
    { path: 'app', category: 'features' },
    { path: 'pages', category: 'features' },
    { path: 'components', category: 'features' },
    { path: 'hooks', category: 'features' },
    { path: 'utils', category: 'features' },
    { path: 'services', category: 'features' },
    { path: 'api', category: 'api' },
    { path: 'server', category: 'api' },
    { path: 'supabase/functions', category: 'api' },
    { path: 'supabase/migrations', category: 'database' },
    { path: 'prisma', category: 'database' },
    { path: 'scripts', category: 'guides' },
    { path: 'tests', category: 'testing' },
    { path: '__tests__', category: 'testing' },
    { path: 'e2e', category: 'testing' },
  ];

  const detected = [];

  for (const dir of knownDirs) {
    const fullPath = path.join(cwd, dir.path);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      detected.push(dir);
    }
  }

  return detected;
}
