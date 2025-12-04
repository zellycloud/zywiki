/**
 * embedding.mjs
 * Local embedding using Transformers.js
 */

let pipeline = null;
let extractor = null;

/**
 * Initialize embedding pipeline (lazy loading)
 */
async function getExtractor() {
  if (extractor) return extractor;

  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers');

    console.log('Loading embedding model (first time may take a while)...');
    extractor = await createPipeline(
      'feature-extraction',
      'Xenova/multilingual-e5-small',
      { quantized: true }
    );
    console.log('Embedding model loaded.');

    return extractor;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        'RAG dependencies not installed.\n\n' +
        '  To enable semantic search, run:\n' +
        '  npm install @xenova/transformers @orama/orama\n\n' +
        '  Note: First run will download ~100MB embedding model.'
      );
    }
    throw error;
  }
}

/**
 * Generate embedding for text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function embed(text) {
  const extractor = await getExtractor();

  // E5 models require "query: " or "passage: " prefix
  const prefixedText = `passage: ${text}`;

  const output = await extractor(prefixedText, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Texts to embed
 * @returns {Promise<number[][]>} - Embedding vectors
 */
export async function embedBatch(texts) {
  const results = [];
  for (const text of texts) {
    results.push(await embed(text));
  }
  return results;
}

/**
 * Generate query embedding (with query prefix)
 * @param {string} query - Query text
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function embedQuery(query) {
  const extractor = await getExtractor();

  // E5 models require "query: " prefix for queries
  const prefixedQuery = `query: ${query}`;

  const output = await extractor(prefixedQuery, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}

/**
 * Get embedding dimension
 */
export function getEmbeddingDimension() {
  return 384; // multilingual-e5-small dimension
}
