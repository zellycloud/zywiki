/**
 * build.mjs
 * Build documentation using AI (Claude CLI or Gemini API)
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { loadConfig, loadMetadata, getPaths, addDocument } from '../core/metadata.mjs';
import { groupFilesByFeature, getGroupingStats } from '../core/grouper.mjs';
import { generateDocPrompt } from '../core/ai-generator.mjs';
import { callGeminiAPI } from '../core/gemini.mjs';

/**
 * Build documentation using Claude AI
 */
export async function buildCommand(options) {
  const metadata = loadMetadata();
  const config = loadConfig();

  if (metadata.snippets.length === 0) {
    console.log('No files tracked. Use "zywiki add <path>" to add files first.');
    return;
  }

  const { root } = getPaths();

  // Determine AI provider
  const provider = config.ai?.provider || 'claude';
  const providerName = provider === 'gemini' ? 'Gemini API' : 'Claude CLI';

  console.log(`Building documentation with ${providerName}...\n`);

  // Check provider availability
  if (provider === 'claude') {
    const claudeAvailable = await checkClaudeCLI();
    if (!claudeAvailable) {
      console.error('Error: Claude CLI not found.');
      console.log('Install: https://claude.ai/code');
      return;
    }
  } else if (provider === 'gemini') {
    const apiKey = config.ai?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found.');
      console.log('Set it in environment or run "zywiki init" again.');
      return;
    }
  }

  // Group files
  const groups = groupFilesByFeature(metadata.snippets, config);
  const stats = getGroupingStats(groups);

  console.log(`${stats.totalGroups} groups from ${stats.totalFiles} files\n`);

  // Filter if specified
  let groupsToProcess = groups;
  if (options.filter) {
    groupsToProcess = groups.filter(g =>
      g.key.toLowerCase().includes(options.filter.toLowerCase())
    );
    console.log(`Filtered: ${groupsToProcess.length} groups\n`);
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < groupsToProcess.length; i++) {
    const group = groupsToProcess[i];
    const docsDir = path.join(root, config.docsDir, group.category);
    const docFileName = sanitizeFileName(group.key) + '.md';
    const docPath = path.join(docsDir, docFileName);

    console.log(`[${i + 1}/${groupsToProcess.length}] ${group.title}`);

    // Skip if exists and not forcing
    if (fs.existsSync(docPath) && !options.force) {
      console.log(`  → Skipped (use --force to overwrite)`);
      skipped++;
      continue;
    }

    // Create directory
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const prompt = generateDocPrompt(group, { root, language: options.lang || config.language || 'en' });
    const startTime = Date.now();

    // Progress spinner
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinIdx = 0;
    const interval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      process.stdout.write(`\r  ${spinner[spinIdx++ % spinner.length]} Generating... ${elapsed}s`);
    }, 100);

    try {
      // Call AI provider
      let content;
      if (provider === 'gemini') {
        content = await callGeminiAPI(prompt, {
          apiKey: config.ai?.apiKey,
          model: config.ai?.model || 'gemini-2.5-flash',
        });
      } else {
        content = await callClaudeCLI(prompt);
      }

      clearInterval(interval);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      fs.writeFileSync(docPath, content);
      addDocument(docPath, group.files.map(f => f.path));

      console.log(`\r  ✓ Done (${elapsed}s): ${path.relative(root, docPath)}                    `);
      generated++;

      // Rate limit delay for Gemini (10 RPM = 6 sec between requests)
      if (provider === 'gemini' && i < groupsToProcess.length - 1) {
        await new Promise(r => setTimeout(r, 6500)); // 6.5 sec delay
      }
    } catch (error) {
      clearInterval(interval);
      console.log(`\r  ✗ Error: ${error.message}                    `);
      errors++;

      // On rate limit error, wait longer and continue
      if (provider === 'gemini' && error.message.includes('rate')) {
        console.log('  → Waiting 60s for rate limit...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }

  console.log('');
  console.log(`Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);
}

/**
 * Call Claude CLI with Haiku model (fast & cheap)
 */
async function callClaudeCLI(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', prompt, '--model', 'haiku', '--output-format', 'json'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);

    child.on('error', error => reject(new Error(`CLI error: ${error.message}`)));

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Exit ${code}: ${stderr}`));
        return;
      }

      try {
        const response = JSON.parse(stdout);
        if (response.is_error) {
          reject(new Error(response.result));
          return;
        }
        resolve(response.result);
      } catch {
        resolve(stdout.trim() || '');
      }
    });

    // 5 min timeout
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Timeout (5min)'));
    }, 300000);

    child.on('close', () => clearTimeout(timeout));
  });
}

/**
 * Check Claude CLI
 */
async function checkClaudeCLI() {
  return new Promise(resolve => {
    const child = spawn('claude', ['--version'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.on('error', () => resolve(false));
    child.on('close', code => resolve(code === 0));
  });
}

/**
 * Sanitize filename
 */
function sanitizeFileName(key) {
  return key
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9가-힣-_]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}
