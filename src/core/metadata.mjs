/**
 * metadata.mjs
 * Metadata management for zywiki
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CONFIG_DIR = '.zywiki';
const METADATA_FILE = 'metadata.json';
const CONFIG_FILE = 'config.json';

/**
 * Get project root (where .zywiki exists)
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
    docsDir: 'zywiki',
    sourcePatterns: [
      // JavaScript/TypeScript (Web & Node.js)
      'src/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'lib/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'app/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'pages/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'components/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'hooks/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'utils/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'services/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'api/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'server/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'bin/**/*.{js,mjs,cjs}',
      'scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'tests/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      '__tests__/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'e2e/**/*.{ts,tsx,js,jsx,mjs,cjs}',

      // Python
      'src/**/*.py',
      'lib/**/*.py',
      'app/**/*.py',
      'api/**/*.py',
      'services/**/*.py',
      'utils/**/*.py',
      'tests/**/*.py',
      'scripts/**/*.py',

      // Go
      'cmd/**/*.go',
      'pkg/**/*.go',
      'internal/**/*.go',
      'api/**/*.go',

      // Rust
      'src/**/*.rs',
      'lib/**/*.rs',

      // Java/Kotlin (Android, Spring)
      'src/**/*.{java,kt,kts}',
      'app/**/*.{java,kt,kts}',

      // Swift (iOS/macOS)
      'Sources/**/*.swift',
      'App/**/*.swift',

      // C/C++
      'src/**/*.{c,cpp,cc,cxx,h,hpp}',
      'lib/**/*.{c,cpp,cc,cxx,h,hpp}',
      'include/**/*.{h,hpp}',

      // Ruby
      'app/**/*.rb',
      'lib/**/*.rb',
      'spec/**/*.rb',

      // PHP
      'src/**/*.php',
      'app/**/*.php',
      'lib/**/*.php',

      // Shell scripts
      'bin/**/*.sh',
      'scripts/**/*.sh',

      // Database & Config
      'supabase/functions/**/*.ts',
      'supabase/migrations/**/*.sql',
      'migrations/**/*.sql',
      'prisma/**/*.prisma',

      // Infrastructure
      '**/*.tf',
      '**/*.tfvars',
      'docker/**/*.{yml,yaml}',
      'k8s/**/*.{yml,yaml}',
      '.github/workflows/**/*.{yml,yaml}',
    ],
    ignorePatterns: [
      // Test files
      '**/*.test.{ts,tsx,js,jsx,py,go,rs}',
      '**/*.spec.{ts,tsx,js,jsx,rb}',
      '**/*_test.{go,py}',
      // Dependencies & build
      '**/node_modules/**',
      '**/vendor/**',
      '**/dist/**',
      '**/build/**',
      '**/target/**',
      '**/__pycache__/**',
      // Generated files
      '**/*.min.js',
      '**/*.generated.*',
      '**/generated/**',
    ],
    // 8 categories - all docs must be in a category
    categories: {
      // architecture - 핵심 아키텍처
      'src/agents/': 'architecture',
      'src/lib/agent': 'architecture',
      'cmd/': 'architecture',           // Go main commands
      'internal/': 'architecture',      // Go internal packages
      'pkg/': 'architecture',           // Go public packages

      // features - 주요 기능
      'src/lib/': 'features',
      'src/components/': 'features',
      'src/hooks/': 'features',
      'src/pages/': 'features',
      'app/': 'features',               // Next.js app dir, Rails, Laravel
      'pages/': 'features',             // Next.js pages dir
      'lib/': 'features',               // General library code
      'utils/': 'features',
      'services/': 'features',
      'Sources/': 'features',           // Swift

      // api - API 참조
      'src/api/': 'api',
      'api/': 'api',
      'supabase/functions/': 'api',
      'routes/': 'api',                 // Express routes
      'controllers/': 'api',            // MVC controllers

      // database - 데이터베이스 설계
      'supabase/migrations/': 'database',
      'migrations/': 'database',
      'prisma/': 'database',
      'src/types/supabase': 'database',
      'models/': 'database',            // ORM models
      'entities/': 'database',          // TypeORM entities
      'schemas/': 'database',           // GraphQL/DB schemas

      // deployment - 배포 및 운영
      '.github/': 'deployment',
      'docker/': 'deployment',
      'k8s/': 'deployment',
      'terraform/': 'deployment',
      'infra/': 'deployment',
      'deploy/': 'deployment',

      // security - 보안 아키텍처
      'src/lib/auth': 'security',
      'src/middleware/': 'security',
      'middleware/': 'security',
      'auth/': 'security',

      // testing - 테스트 전략
      'tests/': 'testing',
      '__tests__/': 'testing',
      'e2e/': 'testing',
      'spec/': 'testing',               // Ruby RSpec
      'test/': 'testing',               // Go, Java convention

      // guides - 가이드
      'scripts/': 'guides',
      'bin/': 'guides',
      'tools/': 'guides',
    },
    // Valid categories (no root-level docs allowed)
    validCategories: [
      'architecture',
      'features',
      'api',
      'database',
      'deployment',
      'security',
      'testing',
      'guides',
    ],
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
