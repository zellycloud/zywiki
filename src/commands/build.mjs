/**
 * build.mjs
 * Build documentation using AI (Claude CLI or Gemini API)
 * - Full build: generates all documentation
 * - Prompts for confirmation if docs already exist
 * - Use --force to skip confirmation
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';
import { loadConfig, loadMetadata, getPaths, addDocument, addSnippet } from '../core/metadata.mjs';
import { groupFilesByFeature, getGroupingStats } from '../core/grouper.mjs';
import { clearPending } from '../core/detector.mjs';
import { generateDocPrompt } from '../core/ai-generator.mjs';
import { callGeminiAPI } from '../core/gemini.mjs';
import { matchesPattern, getLineCount } from '../core/parser.mjs';
import { output } from '../core/output.mjs';

/**
 * Auto-scan and add files based on sourcePatterns
 */
async function autoScanFiles(config, root) {
  const metadata = loadMetadata();
  const existingPaths = new Set(metadata.snippets.map(s => s.path));
  let added = 0;

  const scanDir = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(root, fullPath);

        if (entry.isDirectory()) {
          // Skip ignored directories
          if (entry.name === 'node_modules' || entry.name.startsWith('.') ||
              entry.name === 'dist' || entry.name === 'build' ||
              entry.name === config.docsDir) {
            continue;
          }
          scanDir(fullPath);
        } else {
          // Check if file matches patterns and not already tracked
          if (!existingPaths.has(relativePath) &&
              matchesPattern(relativePath, config.sourcePatterns, config.ignorePatterns)) {
            const lineCount = getLineCount(fullPath);
            const snippet = addSnippet(fullPath, [1, lineCount]);
            if (snippet) {
              added++;
            }
          }
        }
      }
    } catch (e) {
      // Ignore permission errors
    }
  };

  scanDir(root);
  return added;
}

/**
 * Prompt user for confirmation
 */
async function confirmPrompt(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Build command - full documentation build
 */
export async function buildCommand(options = {}) {
  const config = loadConfig();
  const { root } = getPaths();
  const isJson = options.json;
  const buildStartTime = Date.now();

  // Logging helper (suppress in JSON mode)
  const log = (...args) => {
    if (!isJson) console.log(...args);
  };

  // Auto-scan files first
  log('Scanning for source files...');
  const addedCount = await autoScanFiles(config, root);
  if (addedCount > 0) {
    log(`  Added ${addedCount} new files\n`);
  }

  const metadata = loadMetadata();

  if (metadata.snippets.length === 0) {
    const errorData = {
      success: false,
      error: 'No source files found matching patterns in config.',
      provider: config.ai?.provider || 'claude',
      totalGroups: 0,
      generated: 0,
      errors: 0,
      skipped: 0,
      totalDurationMs: Date.now() - buildStartTime,
      results: [],
    };

    if (isJson) {
      output(errorData, options, () => {});
    } else {
      console.log('No source files found matching patterns in config.');
      console.log('Check .zywiki/config.json sourcePatterns.');
    }
    return;
  }

  // Determine AI provider
  const provider = config.ai?.provider || 'claude';
  const providerName = provider === 'gemini' ? 'Gemini API' : 'Claude CLI';

  // Check provider availability
  if (provider === 'claude') {
    const claudeAvailable = await checkClaudeCLI();
    if (!claudeAvailable) {
      const errorData = {
        success: false,
        error: 'Claude CLI not found. Install: https://claude.ai/code',
        provider,
        totalGroups: 0,
        generated: 0,
        errors: 0,
        skipped: 0,
        totalDurationMs: Date.now() - buildStartTime,
        results: [],
      };

      if (isJson) {
        output(errorData, options, () => {});
      } else {
        console.error('Error: Claude CLI not found.');
        console.log('Install: https://claude.ai/code');
      }
      return;
    }
  } else if (provider === 'gemini') {
    const apiKey = config.ai?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const errorData = {
        success: false,
        error: 'GEMINI_API_KEY not found.',
        provider,
        totalGroups: 0,
        generated: 0,
        errors: 0,
        skipped: 0,
        totalDurationMs: Date.now() - buildStartTime,
        results: [],
      };

      if (isJson) {
        output(errorData, options, () => {});
      } else {
        console.error('Error: GEMINI_API_KEY not found.');
        console.log('Set it in environment or run "zywiki init" again.');
      }
      return;
    }
  }

  // Group files
  const groups = groupFilesByFeature(metadata.snippets, config);
  const stats = getGroupingStats(groups);

  // Check if docs already exist
  const docsPath = path.join(root, config.docsDir);
  const existingDocs = fs.existsSync(docsPath) ?
    fs.readdirSync(docsPath, { recursive: true }).filter(f => f.endsWith('.md')).length : 0;

  // Show build status header (text mode only)
  log('─'.repeat(40));
  log(`zywiki Build`);
  log('─'.repeat(40));
  log(`Tracked files:    ${stats.totalFiles}`);
  log(`Groups to build:  ${stats.totalGroups}`);
  log(`Existing docs:    ${existingDocs}`);
  log(`Provider:         ${providerName}`);
  log('─'.repeat(40));
  log('');

  // Confirm if docs already exist (unless --force or --json)
  if (existingDocs > 0 && !options.force && !isJson) {
    log(`Warning: ${existingDocs} existing documents will be overwritten.`);
    const confirmed = await confirmPrompt('Continue with full rebuild?');
    if (!confirmed) {
      log('Build cancelled.');
      return;
    }
    log('');
  }

  // Filter if specified
  let groupsToProcess = groups;
  if (options.filter) {
    groupsToProcess = groups.filter(g =>
      g.key.toLowerCase().includes(options.filter.toLowerCase())
    );
    log(`Filtered: ${groupsToProcess.length} groups\n`);
  }

  let generated = 0;
  let errors = 0;
  let skipped = 0;
  const results = [];

  for (let i = 0; i < groupsToProcess.length; i++) {
    const group = groupsToProcess[i];
    const docsDir = path.join(root, config.docsDir, group.category);
    const docFileName = sanitizeFileName(group.key) + '.md';
    const docPath = path.join(docsDir, docFileName);
    const relativePath = path.relative(root, docPath);

    log(`[${i + 1}/${groupsToProcess.length}] ${group.title}`);

    // Create directory
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const prompt = generateDocPrompt(group, { root, language: options.lang || config.language || 'en' });
    const startTime = Date.now();

    // Progress spinner (text mode only)
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinIdx = 0;
    let interval;

    if (!isJson) {
      interval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        process.stdout.write(`\r  ${spinner[spinIdx++ % spinner.length]} Generating... ${elapsed}s`);
      }, 100);
    }

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

      if (!isJson) clearInterval(interval);
      const elapsed = Date.now() - startTime;

      fs.writeFileSync(docPath, content);
      addDocument(docPath, group.files.map(f => f.path));

      log(`\r  ✓ Done (${(elapsed / 1000).toFixed(1)}s): ${relativePath}                    `);
      generated++;

      results.push({
        group: group.key,
        title: group.title,
        path: relativePath,
        status: 'success',
        durationMs: elapsed,
      });

      // Rate limit delay for Gemini (10 RPM = 6 sec between requests)
      if (provider === 'gemini' && i < groupsToProcess.length - 1) {
        await new Promise(r => setTimeout(r, 6500)); // 6.5 sec delay
      }
    } catch (error) {
      if (!isJson) clearInterval(interval);
      const elapsed = Date.now() - startTime;

      log(`\r  ✗ Error: ${error.message}                    `);
      errors++;

      results.push({
        group: group.key,
        title: group.title,
        path: relativePath,
        status: 'error',
        error: error.message,
        durationMs: elapsed,
      });

      // On rate limit error, wait longer and continue
      if (provider === 'gemini' && error.message.includes('rate')) {
        log('  → Waiting 60s for rate limit...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }

  const totalDurationMs = Date.now() - buildStartTime;

  // Output results
  const buildData = {
    success: errors === 0,
    provider,
    totalGroups: groupsToProcess.length,
    generated,
    errors,
    skipped,
    totalDurationMs,
    results,
  };

  if (isJson) {
    output(buildData, options, () => {});
  } else {
    console.log('');
    console.log(`Generated: ${generated}, Errors: ${errors}`);

    // Clear pending if any documents were generated
    if (generated > 0) {
      clearPending();
      console.log('Pending updates cleared.');

      // Auto-index for RAG search
      await autoIndex();
    }
  }

  // Generate manifest if successful
  if (generated > 0) {
    try {
      const { generateManifest } = await import('../core/manifest.mjs');
      await generateManifest();
      if (!isJson) {
        console.log('Manifest updated.');
      }
    } catch (e) {
      // Manifest module not yet implemented, skip
    }
  }
}

/**
 * Auto-index documents after build (if RAG is available)
 */
async function autoIndex() {
  try {
    const { indexAll } = await import('../core/rag/index.mjs');

    console.log('\nUpdating search index...');

    const result = await indexAll({
      onProgress: ({ current, total }) => {
        process.stdout.write(`\r  Indexing ${current}/${total}...`);
      },
    });

    console.log(`\r  ✓ Indexed ${result.indexed} files, ${result.sections} sections    `);
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('not installed')) {
      // RAG not installed, skip silently
      console.log('\nTip: Install RAG for semantic search: npm install @xenova/transformers @orama/orama');
    } else {
      console.log(`\nIndex update skipped: ${error.message}`);
    }
  }
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
