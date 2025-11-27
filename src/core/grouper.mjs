/**
 * grouper.mjs
 * Group related files into documentation units (qoder-style)
 */

import path from 'path';

/**
 * Group files by feature/domain
 * Strategy: Group files that belong to the same logical unit
 */
export function groupFilesByFeature(snippets, config) {
  const groups = new Map();

  for (const snippet of snippets) {
    const groupKey = determineGroupKey(snippet.path, config);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        title: generateGroupTitle(groupKey),
        category: determineCategory(snippet.path, config.categories),
        files: [],
        mainFile: null,
      });
    }

    const group = groups.get(groupKey);
    group.files.push(snippet);

    // Determine main file (index, main class, or largest file)
    if (isMainFile(snippet.path, groupKey)) {
      group.mainFile = snippet;
    }
  }

  // Set main file if not found
  for (const group of groups.values()) {
    if (!group.mainFile && group.files.length > 0) {
      // Use the file that best represents the group
      group.mainFile = findBestMainFile(group.files);
    }
  }

  return Array.from(groups.values());
}

/**
 * Determine group key for a file
 * Groups files by their parent directory or logical domain
 */
function determineGroupKey(filePath, config) {
  const parts = filePath.split('/');

  // Special grouping rules
  const groupingRules = [
    // Agent system: src/agents/* -> agents
    { pattern: /^src\/agents\/([^/]+)\.ts$/, group: 'agents/$1' },
    { pattern: /^src\/agents\/analyzers\//, group: 'agents/analyzers' },
    { pattern: /^src\/agents\/templates\//, group: 'agents/templates' },

    // Components: src/components/feature/* -> components/feature
    { pattern: /^src\/components\/([^/]+)\//, group: 'components/$1' },
    { pattern: /^src\/components\/([^/]+)\.tsx?$/, group: 'components/$1' },

    // Hooks: src/hooks/queries/* -> hooks/queries
    { pattern: /^src\/hooks\/queries\//, group: 'hooks/queries' },
    { pattern: /^src\/hooks\/mutations\//, group: 'hooks/mutations' },
    { pattern: /^src\/hooks\/([^/]+)\.ts$/, group: 'hooks/$1' },

    // Pages: src/pages/* -> pages
    { pattern: /^src\/pages\/([^/]+)\.tsx?$/, group: 'pages/$1' },

    // Lib: src/lib/* -> lib/feature
    { pattern: /^src\/lib\/([^/]+)\//, group: 'lib/$1' },
    { pattern: /^src\/lib\/([^.]+)\.ts$/, group: 'lib/$1' },

    // Types: src/types/* -> types
    { pattern: /^src\/types\//, group: 'types' },

    // Supabase functions
    { pattern: /^supabase\/functions\/([^/]+)\//, group: 'functions/$1' },

    // Migrations (group all together)
    { pattern: /^supabase\/migrations\//, group: 'database/migrations' },

    // Tests: group with their source
    { pattern: /^tests\/(.+)\.test\.ts$/, group: 'tests/$1' },
    { pattern: /^e2e\//, group: 'tests/e2e' },
  ];

  for (const rule of groupingRules) {
    const match = filePath.match(rule.pattern);
    if (match) {
      return rule.group.replace(/\$(\d+)/g, (_, idx) => match[parseInt(idx)] || '');
    }
  }

  // Default: use parent directory
  if (parts.length >= 2) {
    return parts.slice(0, -1).join('/');
  }

  return parts[0] || 'root';
}

/**
 * Generate human-readable title from group key
 */
function generateGroupTitle(groupKey) {
  const parts = groupKey.split('/');
  const lastPart = parts[parts.length - 1];

  // Special title mappings
  const titleMappings = {
    'agents': '에이전트 시스템',
    'analyzers': '분석기 모듈',
    'templates': '템플릿 시스템',
    'components': '컴포넌트',
    'hooks': '훅 (Hooks)',
    'queries': '데이터 조회 (Queries)',
    'mutations': '데이터 변경 (Mutations)',
    'pages': '페이지',
    'lib': '라이브러리',
    'types': '타입 정의',
    'functions': 'Edge Functions',
    'database': '데이터베이스',
    'migrations': '마이그레이션',
    'tests': '테스트',
    'e2e': 'E2E 테스트',
  };

  // Build title from parts
  const titleParts = parts.map(part => {
    if (titleMappings[part]) {
      return titleMappings[part];
    }
    // Convert camelCase/PascalCase/kebab-case to readable
    return part
      .replace(/([A-Z])/g, ' $1')
      .replace(/-/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  });

  return titleParts.join(' - ');
}

/**
 * Check if file is the main file of a group
 */
function isMainFile(filePath, groupKey) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const groupName = groupKey.split('/').pop();

  // Index files
  if (fileName === 'index') return true;

  // Main class file (e.g., FinanceAgent.ts for agents/FinanceAgent group)
  if (fileName.toLowerCase() === groupName.toLowerCase()) return true;

  // Files ending with the group name
  if (fileName.toLowerCase().endsWith(groupName.toLowerCase())) return true;

  return false;
}

/**
 * Find the best main file from a list
 */
function findBestMainFile(files) {
  // Priority: index > largest file > first file
  const indexFile = files.find(f =>
    path.basename(f.path, path.extname(f.path)) === 'index'
  );
  if (indexFile) return indexFile;

  // Sort by lines (descending) and take the largest
  const sorted = [...files].sort((a, b) => (b.lines || 0) - (a.lines || 0));
  return sorted[0];
}

/**
 * Determine category from path
 */
function determineCategory(filePath, categories = {}) {
  for (const [pattern, category] of Object.entries(categories)) {
    if (filePath.startsWith(pattern.replace(/^\//, ''))) {
      return category;
    }
  }
  return 'features';
}

/**
 * Get grouping statistics
 */
export function getGroupingStats(groups) {
  const stats = {
    totalGroups: groups.length,
    totalFiles: groups.reduce((sum, g) => sum + g.files.length, 0),
    byCategory: {},
    largestGroups: [],
  };

  for (const group of groups) {
    if (!stats.byCategory[group.category]) {
      stats.byCategory[group.category] = 0;
    }
    stats.byCategory[group.category]++;
  }

  // Find largest groups
  stats.largestGroups = [...groups]
    .sort((a, b) => b.files.length - a.files.length)
    .slice(0, 10)
    .map(g => ({ key: g.key, files: g.files.length }));

  return stats;
}
