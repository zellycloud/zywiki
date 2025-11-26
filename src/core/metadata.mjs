/**
 * metadata.mjs
 * Metadata management for zy-docs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CONFIG_DIR = '.zy-docs';
const METADATA_FILE = 'metadata.json';
const CONFIG_FILE = 'config.json';

/**
 * Get project root (where .zy-docs exists)
 */
export function getProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, CONFIG_DIR))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

/**
 * Get paths for config and metadata
 */
export function getPaths() {
  const root = getProjectRoot();
  return {
    root,
    configDir: path.join(root, CONFIG_DIR),
    metadataPath: path.join(root, CONFIG_DIR, METADATA_FILE),
    configPath: path.join(root, CONFIG_DIR, CONFIG_FILE),
    pendingPath: path.join(root, CONFIG_DIR, 'pending.json'),
  };
}

/**
 * Load metadata.json
 */
export function loadMetadata() {
  const { metadataPath } = getPaths();
  try {
    if (fs.existsSync(metadataPath)) {
      const data = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load metadata:', error.message);
  }
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    snippets: [],
    documents: [],
  };
}

/**
 * Save metadata.json
 */
export function saveMetadata(metadata) {
  const { metadataPath, configDir } = getPaths();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Load config.json
 */
export function loadConfig() {
  const { configPath } = getPaths();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load config:', error.message);
  }
  return getDefaultConfig();
}

/**
 * Save config.json
 */
export function saveConfig(config) {
  const { configPath, configDir } = getPaths();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get default config
 */
export function getDefaultConfig() {
  return {
    version: '1.0.0',
    docsDir: 'docs',
    sourcePatterns: ['src/**/*.{ts,tsx,js,jsx}', 'lib/**/*.ts'],
    ignorePatterns: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
    categories: {
      'src/lib/': 'features',
      'src/components/': 'features',
      'src/hooks/': 'features',
      'src/api/': 'api',
      'src/agents/': 'architecture',
    },
    integrations: {
      claudeCode: false,
      git: false,
    },
    ai: {
      model: 'haiku',
      autoUpdate: true,
    },
  };
}

/**
 * Generate unique ID for snippet
 */
function generateId(filePath, lines) {
  const hash = crypto.createHash('sha256')
    .update(`${filePath}:${lines[0]}-${lines[1]}`)
    .digest('hex')
    .slice(0, 12);
  return hash;
}

/**
 * Add a code snippet to metadata
 */
export function addSnippet(filePath, lines = [1, 100]) {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const relativePath = path.relative(root, path.resolve(filePath));

  // Check for duplicate
  const exists = metadata.snippets.some(s => s.path === relativePath);
  if (exists) {
    console.log(`Already tracking: ${relativePath}`);
    return false;
  }

  // Calculate hash
  const hash = calculateFileHash(filePath);

  const snippet = {
    id: generateId(relativePath, lines),
    path: relativePath,
    lines,
    hash,
    docs: [],
    updatedAt: new Date().toISOString(),
  };

  metadata.snippets.push(snippet);
  saveMetadata(metadata);

  return snippet;
}

/**
 * Remove a snippet from metadata
 */
export function removeSnippet(filePath) {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const relativePath = path.relative(root, path.resolve(filePath));

  const index = metadata.snippets.findIndex(s => s.path === relativePath);
  if (index === -1) {
    return false;
  }

  metadata.snippets.splice(index, 1);
  saveMetadata(metadata);

  return true;
}

/**
 * Find snippets by file path
 */
export function findSnippetsByPath(filePath) {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const relativePath = path.relative(root, path.resolve(filePath));

  return metadata.snippets.filter(snippet => {
    return snippet.path === relativePath ||
           snippet.path.endsWith(relativePath) ||
           relativePath.endsWith(snippet.path);
  });
}

/**
 * Find documents referencing a code file
 */
export function findDocsBySnippet(filePath) {
  const metadata = loadMetadata();
  const config = loadConfig();
  const { root } = getPaths();
  const relativePath = path.relative(root, path.resolve(filePath));
  const docsDir = path.join(root, config.docsDir);
  const docs = [];

  if (!fs.existsSync(docsDir)) {
    return docs;
  }

  const scanDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes(relativePath) ||
              content.includes(`file://${relativePath}`) ||
              content.includes(`file:///${relativePath}`)) {
            docs.push(fullPath);
          }
        } catch (e) {
          // Ignore read errors
        }
      }
    }
  };

  scanDir(docsDir);
  return docs;
}

/**
 * Calculate file hash
 */
export function calculateFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (e) {
    return null;
  }
}

/**
 * Update snippet hash and timestamp
 */
export function updateSnippet(filePath) {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const relativePath = path.relative(root, path.resolve(filePath));

  const snippet = metadata.snippets.find(s => s.path === relativePath);
  if (!snippet) {
    return false;
  }

  snippet.hash = calculateFileHash(filePath);
  snippet.updatedAt = new Date().toISOString();
  saveMetadata(metadata);

  return true;
}

/**
 * Add document to metadata
 */
export function addDocument(docPath, references = []) {
  const metadata = loadMetadata();
  const { root } = getPaths();
  const relativePath = path.relative(root, path.resolve(docPath));

  const exists = metadata.documents.some(d => d.path === relativePath);
  if (exists) {
    return false;
  }

  metadata.documents.push({
    path: relativePath,
    references,
    updatedAt: new Date().toISOString(),
  });

  saveMetadata(metadata);
  return true;
}

/**
 * Get statistics
 */
export function getStats() {
  const metadata = loadMetadata();
  const config = loadConfig();
  const { root, pendingPath } = getPaths();
  const docsDir = path.join(root, config.docsDir);

  let docCount = 0;
  if (fs.existsSync(docsDir)) {
    const countDocs = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          countDocs(path.join(dir, entry.name));
        } else if (entry.name.endsWith('.md')) {
          docCount++;
        }
      }
    };
    countDocs(docsDir);
  }

  let pendingCount = 0;
  if (fs.existsSync(pendingPath)) {
    try {
      const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
      pendingCount = pending.changedFiles?.length || 0;
    } catch (e) {
      // Ignore
    }
  }

  return {
    snippets: metadata.snippets.length,
    documents: docCount,
    pending: pendingCount,
  };
}
