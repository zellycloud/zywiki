/**
 * indexer.mjs
 * Document indexing pipeline
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPaths, loadConfig } from '../metadata.mjs';
import { embed, embedBatch } from './embedding.mjs';
import { insertDocuments, removeByFilePath, saveDatabase, clearDatabase, getStats } from './store.mjs';

/**
 * Parse markdown into sections
 */
function parseMarkdownSections(content, filePath) {
  const sections = [];
  const lines = content.split('\n');

  let currentSection = {
    heading: 'Introduction',
    content: [],
    startLine: 0,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if it has content
      if (currentSection.content.length > 0) {
        const text = currentSection.content.join('\n').trim();
        if (text.length > 50) { // Skip very short sections
          sections.push({
            heading: currentSection.heading,
            content: text,
            startLine: currentSection.startLine,
          });
        }
      }

      // Start new section
      currentSection = {
        heading: headingMatch[2],
        content: [],
        startLine: i,
      };
    } else {
      currentSection.content.push(line);
    }
  }

  // Don't forget the last section
  if (currentSection.content.length > 0) {
    const text = currentSection.content.join('\n').trim();
    if (text.length > 50) {
      sections.push({
        heading: currentSection.heading,
        content: text,
        startLine: currentSection.startLine,
      });
    }
  }

  return sections;
}

/**
 * Calculate content hash
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Get all wiki files
 */
function getWikiFiles() {
  const config = loadConfig();
  const { root } = getPaths();
  const docsDir = path.join(root, config.docsDir);
  const files = [];

  if (!fs.existsSync(docsDir)) {
    return files;
  }

  const scanDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  };

  scanDir(docsDir);
  return files;
}

/**
 * Index all wiki documents
 */
export async function indexAll(options = {}) {
  const { force = false, onProgress } = options;
  const files = getWikiFiles();

  if (files.length === 0) {
    return { indexed: 0, sections: 0, skipped: 0 };
  }

  if (force) {
    await clearDatabase();
  }

  const existingStats = await getStats();
  let indexed = 0;
  let totalSections = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const relativePath = path.relative(getPaths().root, filePath);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        file: relativePath,
      });
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileHash = hashContent(content);

      // Parse into sections
      const sections = parseMarkdownSections(content, relativePath);

      if (sections.length === 0) {
        skipped++;
        continue;
      }

      // Generate embeddings for all sections
      const docs = [];

      for (let j = 0; j < sections.length; j++) {
        const section = sections[j];
        const sectionId = `${relativePath}#${j}`;

        // Combine heading and content for embedding
        const textToEmbed = `${section.heading}\n${section.content}`.slice(0, 1000);
        const embedding = await embed(textToEmbed);

        docs.push({
          id: sectionId,
          filePath: relativePath,
          section: section.heading,
          content: section.content.slice(0, 2000), // Limit content size
          hash: fileHash,
          embedding,
        });
      }

      // Remove old documents for this file and insert new ones
      await removeByFilePath(relativePath);
      await insertDocuments(docs);

      indexed++;
      totalSections += docs.length;
    } catch (error) {
      console.error(`Error indexing ${relativePath}:`, error.message);
      skipped++;
    }
  }

  // Save to disk
  await saveDatabase();

  return {
    indexed,
    sections: totalSections,
    skipped,
  };
}

/**
 * Index a single file
 */
export async function indexFile(filePath) {
  const { root } = getPaths();
  const relativePath = path.relative(root, filePath);

  if (!fs.existsSync(filePath)) {
    await removeByFilePath(relativePath);
    await saveDatabase();
    return { removed: true };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const fileHash = hashContent(content);
  const sections = parseMarkdownSections(content, relativePath);

  if (sections.length === 0) {
    return { indexed: false, reason: 'No sections found' };
  }

  const docs = [];

  for (let j = 0; j < sections.length; j++) {
    const section = sections[j];
    const sectionId = `${relativePath}#${j}`;

    const textToEmbed = `${section.heading}\n${section.content}`.slice(0, 1000);
    const embedding = await embed(textToEmbed);

    docs.push({
      id: sectionId,
      filePath: relativePath,
      section: section.heading,
      content: section.content.slice(0, 2000),
      hash: fileHash,
      embedding,
    });
  }

  await removeByFilePath(relativePath);
  await insertDocuments(docs);
  await saveDatabase();

  return {
    indexed: true,
    sections: docs.length,
  };
}
