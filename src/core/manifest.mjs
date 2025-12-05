/**
 * manifest.mjs
 * Generate and manage .zywiki/manifest.json
 */

import fs from 'fs';
import path from 'path';
import { loadMetadata, getPaths, loadConfig } from './metadata.mjs';
import { getVersion } from './output.mjs';

/**
 * Generate manifest.json with document-source mappings
 */
export async function generateManifest() {
  const { root, configDir } = getPaths();
  const config = loadConfig();
  const metadata = loadMetadata();

  // Calculate coverage
  const trackedFiles = metadata.snippets.length;
  const documents = metadata.documents.length;
  const coveragePercent = trackedFiles > 0
    ? parseFloat(((documents / trackedFiles) * 100).toFixed(1))
    : 0;

  // Build document mappings
  const documentMappings = metadata.documents.map(doc => {
    const docPath = path.relative(root, doc.path);
    const stat = fs.existsSync(doc.path) ? fs.statSync(doc.path) : null;

    return {
      path: docPath,
      sources: doc.sources || [],
      lastModified: stat ? stat.mtime.toISOString() : null,
    };
  });

  const manifest = {
    version: getVersion(),
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    wikiDir: config.docsDir,
    stats: {
      trackedFiles,
      documents,
      coveragePercent,
    },
    documents: documentMappings,
  };

  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write manifest
  const manifestPath = path.join(configDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return manifest;
}

/**
 * Load existing manifest
 */
export function loadManifest() {
  const { configDir } = getPaths();
  const manifestPath = path.join(configDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Get manifest stats
 */
export function getManifestStats() {
  const manifest = loadManifest();

  if (!manifest) {
    return {
      exists: false,
      trackedFiles: 0,
      documents: 0,
      coveragePercent: 0,
    };
  }

  return {
    exists: true,
    ...manifest.stats,
    generatedAt: manifest.generatedAt,
  };
}
