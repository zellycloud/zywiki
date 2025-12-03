/**
 * init.mjs
 * Initialize zywiki in a project
 */

import fs from 'fs';
import path from 'path';
import { saveConfig, saveMetadata, loadMetadata, getDefaultConfig, getPaths } from '../core/metadata.mjs';
import { setupClaudeCode, setupClaudeCodeAuto, updateClaudeMdInstructions } from '../integrations/claude-code.mjs';
import { setupGitHooks } from '../integrations/git-hooks.mjs';
import { askYesNo, askLanguage, askAIProvider, askAPIKey } from '../core/prompt.mjs';
import { scanAndAddFiles } from './add.mjs';
import { buildCommand } from './build.mjs';
import { getTechStack, saveOverview } from '../core/detector.mjs';
import { execSync } from 'child_process';

/**
 * Check if Claude CLI is available
 */
async function checkClaudeCli() {
  try {
    execSync('which claude', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize documentation structure
 */
export async function initCommand(options) {
  const cwd = process.cwd();
  const configDir = path.join(cwd, '.zywiki');
  const configPath = path.join(configDir, 'config.json');

  // Check if already initialized
  if (fs.existsSync(configDir) && !options.force) {
    console.log('zywiki is already initialized in this project.');
    console.log('');
    console.log('Use "zywiki update" to change settings or re-scan files.');
    console.log('Use "zywiki init --force" to completely reinitialize.');
    return;
  }

  // Get version from package.json
  const packageJsonPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../../package.json');
  let version = '0.2.0';
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    version = pkg.version;
  } catch (e) {
    // Use default version
  }

  console.log(`Initializing zywiki v${version}...\n`);

  // Create .zywiki directory
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log('Created .zywiki/');
  }

  // Load existing config or create new one
  let config = getDefaultConfig();
  let existingDocsDir = null;

  if (fs.existsSync(configPath)) {
    try {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      existingDocsDir = existingConfig.docsDir;
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Ask for AI provider selection
  const provider = await askAIProvider();

  // Ask for API key if needed (gemini requires it)
  let apiKey = null;
  if (provider === 'gemini') {
    apiKey = await askAPIKey(provider);
  }

  // Ask for language selection
  const language = await askLanguage();

  // Auto-detect Git repository
  const isGitRepo = fs.existsSync(path.join(cwd, '.git'));
  let enableGit = options.git || false;
  if (isGitRepo && !options.git) {
    enableGit = await askYesNo('\nGit repository detected. Enable auto-sync on commit?', true);
  }

  // Auto-detect Claude Code
  const hasClaudeDir = fs.existsSync(path.join(cwd, '.claude'));
  const hasClaudeCli = await checkClaudeCli();
  let enableClaude = options.claude || false;
  if ((hasClaudeDir || hasClaudeCli) && !options.claude) {
    enableClaude = await askYesNo('Claude Code detected. Enable Claude Code integration?', true);
  }

  // Determine docsDir: CLI option > existing config > default
  const docsDirName = options.docsDir || existingDocsDir || config.docsDir;
  config.docsDir = docsDirName;
  config.language = language;
  config.ai = {
    provider,
    model: provider === 'gemini' ? 'gemini-2.5-flash' : 'haiku',
    apiKey: apiKey || null, // Store in config (or use env var)
  };
  config.integrations.claudeCode = enableClaude;
  config.integrations.git = enableGit;
  saveConfig(config);
  console.log(`\nCreated .zywiki/config.json (provider: ${provider}, language: ${language})`);

  // Use the determined docsDir
  const docsDir = path.join(cwd, docsDirName);

  // Create or preserve metadata.json
  const metadataPath = path.join(configDir, 'metadata.json');
  if (fs.existsSync(metadataPath) && options.force) {
    // Preserve existing metadata on --force (only update version)
    const existingMetadata = loadMetadata();
    existingMetadata.lastUpdated = new Date().toISOString();
    saveMetadata(existingMetadata);
    console.log('Preserved .zywiki/metadata.json (existing data kept)');
  } else if (!fs.existsSync(metadataPath)) {
    // Create new metadata only if it doesn't exist
    saveMetadata({
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      snippets: [],
      documents: [],
    });
    console.log('Created .zywiki/metadata.json');
  }

  // Scan project structure and create matching wiki directories
  const projectDirs = scanProjectStructure(cwd);

  // Create wiki directories based on project structure
  const wikiDirs = [docsDir];

  if (projectDirs.length > 0) {
    console.log('\nDetected wiki categories:');
    for (const dir of projectDirs) {
      const wikiDir = path.join(docsDir, dir.wikiPath);
      wikiDirs.push(wikiDir);
      console.log(`  ${docsDirName}/${dir.wikiPath}/`);
    }
  } else {
    // Fallback to default structure
    console.log('\nUsing default wiki structure:');
    const defaultDirs = ['architecture', 'features', 'api', 'database', 'guides'];
    for (const dir of defaultDirs) {
      wikiDirs.push(path.join(docsDir, dir));
      console.log(`  ${docsDirName}/${dir}/`);
    }
  }

  for (const dir of wikiDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  console.log(`\nCreated ${docsDirName}/ directory structure`);

  // Template files removed - AI generates all documentation

  // Claude Code integration
  if (enableClaude) {
    if (options.auto) {
      await setupClaudeCodeAuto(cwd);
      console.log('Configured Claude Code hooks (auto mode)');
    } else {
      await setupClaudeCode(cwd);
      console.log('Configured Claude Code hooks (manual mode)');
    }
  }

  // Git hooks for auto doc detection
  if (enableGit) {
    try {
      await setupGitHooks(cwd);
    } catch (err) {
      console.log('Warning: Could not setup Git hooks');
    }
  }

  // Always update CLAUDE.md with zywiki instructions
  try {
    updateClaudeMdInstructions(cwd);
    console.log('Updated CLAUDE.md with zywiki instructions');
  } catch (err) {
    // Ignore CLAUDE.md update errors
  }

  console.log('\nInitialization complete!');

  // Show tech stack summary
  try {
    const techStack = await getTechStack();
    if (techStack.summary.totalFrameworks > 0 || techStack.summary.totalServices > 0) {
      console.log('\n--- Tech Stack Detected ---');

      if (techStack.languages.length > 0) {
        const topLangs = techStack.languages.slice(0, 3).map(l => l.name).join(', ');
        console.log(`  Languages:   ${topLangs}`);
      }

      if (techStack.summary.totalFrameworks > 0) {
        // Get framework names
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

      console.log('\nRun "zywiki stack" for detailed analysis');
      console.log('Run "zywiki stack --save" to save as documentation');

      // Generate overview.md
      try {
        await saveOverview({ docsDir: docsDirName, language });
        console.log(`\nGenerated ${docsDirName}/overview.md`);
      } catch (err) {
        // Ignore overview generation errors
      }
    }
  } catch (e) {
    // Ignore tech stack errors during init
  }

  // Detect source directories in codebase
  const sourceDirs = detectSourceDirectories(cwd);

  if (sourceDirs.length > 0) {
    console.log('\nDetected source directories:');
    sourceDirs.forEach((dir) => console.log(`  - ${dir.path} (${dir.category})`));

    const shouldScan = await askYesNo('\nWould you like to scan these directories and add files for tracking?');

    if (shouldScan) {
      let totalAdded = 0;

      for (const dir of sourceDirs) {
        console.log(`\nScanning ${dir.path}/...`);
        const addedCount = await scanAndAddFiles(dir.path, { recursive: true });
        console.log(`  Added ${addedCount} files`);
        totalAdded += addedCount;
      }

      console.log(`\nTotal: ${totalAdded} files added for tracking.`);

      if (totalAdded > 0) {
        const shouldBuild = await askYesNo('\nWould you like to generate AI prompts for documentation?');

        if (shouldBuild) {
          console.log('');
          // Generate AI prompts by default (qoder-style workflow)
          await buildCommand({ prompt: true, force: options.force || false });
        }
      }
    }
  } else {
    console.log('\nNo source directories detected. Use "zywiki add <path>" to add files manually.');
  }

  console.log('\nNext steps:');
  console.log('  zywiki build --prompt     # Generate AI prompts for documentation');
  console.log('  zywiki build              # Generate basic doc structure');
  console.log('  zywiki status             # Check status');
}

/**
 * Scan project structure and return simplified category mappings
 * Maps source folders to wiki categories (repowiki-style)
 */
function scanProjectStructure(cwd) {
  const categories = new Set();
  const ignoreDirs = new Set([
    'node_modules', '.git', '.zywiki', 'zywiki', 'dist', 'build', 'out',
    '.next', '.nuxt', '.cache', 'coverage', '.turbo', '.vercel',
    'repowiki', 'zy-docs', '.zy-docs', 'wiki', 'docs',
    'tmp', 'temp', 'archive', 'backup', 'deprecated', 'disabled',
    'v3-worktree', 'worktree', 'vendor', 'third_party', 'public'
  ]);

  // Category mapping rules: folder patterns → wiki category
  const categoryRules = [
    // Architecture & Core
    { patterns: ['agents', 'core', 'lib', 'services', 'providers', 'engine'], category: 'architecture' },
    // Features & UI
    { patterns: ['components', 'hooks', 'pages', 'app', 'views', 'screens', 'features', 'modules'], category: 'features' },
    // API & Server
    { patterns: ['api', 'server', 'routes', 'controllers', 'endpoints', 'functions'], category: 'api' },
    // Database & Data
    { patterns: ['migrations', 'prisma', 'database', 'db', 'models', 'schemas', 'supabase'], category: 'database' },
    // Security & Auth
    { patterns: ['auth', 'security', 'middleware', 'policies', 'permissions', 'rbac', 'oauth', 'jwt'], category: 'security' },
    // Deployment & Infra
    { patterns: ['deploy', 'docker', 'k8s', 'kubernetes', 'ci', 'cd', 'infra', 'terraform', 'ansible', 'github', 'workflows'], category: 'deployment' },
    // Testing
    { patterns: ['tests', '__tests__', 'e2e', 'test', 'spec', 'cypress', 'playwright'], category: 'testing' },
    // Guides & Utils
    { patterns: ['scripts', 'utils', 'helpers', 'tools', 'bin', 'cli', 'commands'], category: 'guides' },
    // Types & Config
    { patterns: ['types', 'interfaces', 'config', 'constants'], category: 'architecture' },
    // Styles
    { patterns: ['styles', 'css', 'themes'], category: 'features' },
  ];

  // Scan directories and map to categories
  const topLevelDirs = fs.readdirSync(cwd, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !ignoreDirs.has(d.name));

  for (const dir of topLevelDirs) {
    const dirPath = path.join(cwd, dir.name);
    if (!hasCodeFiles(dirPath)) continue;

    // Find matching category
    const dirNameLower = dir.name.toLowerCase();
    let matched = false;

    for (const rule of categoryRules) {
      if (rule.patterns.some(p => dirNameLower.includes(p))) {
        categories.add(rule.category);
        matched = true;
        break;
      }
    }

    // Also scan subdirectories for category hints
    try {
      const subDirs = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && !ignoreDirs.has(d.name));

      for (const subDir of subDirs) {
        const subDirPath = path.join(dirPath, subDir.name);
        if (!hasCodeFiles(subDirPath)) continue;

        const subDirNameLower = subDir.name.toLowerCase();
        for (const rule of categoryRules) {
          if (rule.patterns.some(p => subDirNameLower.includes(p))) {
            categories.add(rule.category);
            break;
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }

    // Default: if has code but no match, add to features
    if (!matched && hasCodeFiles(dirPath)) {
      categories.add('features');
    }
  }

  // Convert to results format
  return Array.from(categories).map(cat => ({
    sourcePath: cat,
    wikiPath: cat,
  }));
}

/**
 * Check if directory contains code files
 */
function hasCodeFiles(dirPath) {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.rb', '.php', '.sql', '.prisma'];

  try {
    const files = fs.readdirSync(dirPath);
    return files.some(f => codeExtensions.some(ext => f.endsWith(ext)));
  } catch (e) {
    return false;
  }
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

// Template files removed - AI generates all documentation via build command
