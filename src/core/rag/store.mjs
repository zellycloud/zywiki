/**
 * store.mjs
 * Orama vector store with hybrid search
 */

import fs from 'fs';
import path from 'path';
import { getPaths } from '../metadata.mjs';

let db = null;
let oramaModule = null;

/**
 * Load Orama module
 */
async function loadOrama() {
  if (oramaModule) return oramaModule;

  try {
    oramaModule = await import('@orama/orama');
    return oramaModule;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        'RAG dependencies not installed. Run: npm install @xenova/transformers @orama/orama'
      );
    }
    throw error;
  }
}

/**
 * Get store path
 */
function getStorePath() {
  const { configDir } = getPaths();
  return path.join(configDir, 'rag-index.json');
}

/**
 * Create or load database
 */
export async function getDatabase() {
  if (db) return db;

  const orama = await loadOrama();
  const storePath = getStorePath();

  const schema = {
    id: 'string',
    filePath: 'string',
    section: 'string',
    content: 'string',
    hash: 'string',
    embedding: 'vector[384]',
  };

  // Create new database first
  db = await orama.create({ schema });

  // Try to load existing index
  if (fs.existsSync(storePath)) {
    try {
      const data = fs.readFileSync(storePath, 'utf-8');
      const parsed = JSON.parse(data);
      await orama.load(db, parsed);
    } catch (e) {
      console.log('Index corrupted, starting fresh...', e.message);
    }
  }

  return db;
}

/**
 * Save database to disk
 */
export async function saveDatabase() {
  if (!db) return;

  const orama = await loadOrama();
  const storePath = getStorePath();
  const { configDir } = getPaths();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const data = await orama.save(db);
  fs.writeFileSync(storePath, JSON.stringify(data));
}

/**
 * Insert document
 */
export async function insertDocument(doc) {
  const database = await getDatabase();
  const orama = await loadOrama();

  await orama.insert(database, doc);
}

/**
 * Insert multiple documents
 */
export async function insertDocuments(docs) {
  const database = await getDatabase();
  const orama = await loadOrama();

  await orama.insertMultiple(database, docs);
}

/**
 * Remove documents by file path
 */
export async function removeByFilePath(filePath) {
  const database = await getDatabase();
  const orama = await loadOrama();

  const results = await orama.search(database, {
    term: filePath,
    properties: ['filePath'],
    limit: 1000,
  });

  for (const hit of results.hits) {
    await orama.remove(database, hit.id);
  }
}

/**
 * Hybrid search (BM25 + vector)
 */
export async function hybridSearch(query, queryEmbedding, options = {}) {
  const database = await getDatabase();
  const orama = await loadOrama();
  const limit = options.limit || 10;

  // BM25 text search
  const textResults = await orama.search(database, {
    term: query,
    properties: ['content', 'section'],
    limit: limit * 2,
  });

  // Vector search
  const vectorResults = await orama.search(database, {
    mode: 'vector',
    vector: {
      value: queryEmbedding,
      property: 'embedding',
    },
    limit: limit * 2,
    similarity: 0.5,
  });

  // Reciprocal Rank Fusion
  const scores = new Map();
  const docs = new Map();
  const k = 60; // RRF constant

  textResults.hits.forEach((hit, idx) => {
    const score = 1 / (k + idx + 1);
    scores.set(hit.id, (scores.get(hit.id) || 0) + score);
    docs.set(hit.id, hit.document);
  });

  vectorResults.hits.forEach((hit, idx) => {
    const score = 1 / (k + idx + 1);
    scores.set(hit.id, (scores.get(hit.id) || 0) + score);
    docs.set(hit.id, hit.document);
  });

  // Sort by combined score
  const combined = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, score]) => ({
      id,
      score,
      document: docs.get(id),
    }));

  return combined;
}

/**
 * Vector-only search
 */
export async function vectorSearch(queryEmbedding, options = {}) {
  const database = await getDatabase();
  const orama = await loadOrama();
  const limit = options.limit || 10;

  const results = await orama.search(database, {
    mode: 'vector',
    vector: {
      value: queryEmbedding,
      property: 'embedding',
    },
    limit,
    similarity: 0.5,
  });

  return results.hits.map(hit => ({
    id: hit.id,
    score: hit.score,
    document: hit.document,
  }));
}

/**
 * Get index stats
 */
export async function getStats() {
  const database = await getDatabase();
  const orama = await loadOrama();

  const count = await orama.count(database);
  const storePath = getStorePath();
  let sizeKB = 0;

  if (fs.existsSync(storePath)) {
    const stats = fs.statSync(storePath);
    sizeKB = Math.round(stats.size / 1024);
  }

  return {
    documents: count,
    sizeKB,
    indexPath: storePath,
  };
}

/**
 * Clear database
 */
export async function clearDatabase() {
  db = null;
  const storePath = getStorePath();
  if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }
}
