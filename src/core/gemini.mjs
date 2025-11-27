/**
 * gemini.mjs
 * Gemini API client for zywiki
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call Gemini API
 * @param {string} prompt - The prompt to send
 * @param {object} options - Options including apiKey and model
 * @returns {Promise<string>} - The generated content
 */
export async function callGeminiAPI(prompt, options = {}) {
  const { apiKey, model = 'gemini-2.5-flash' } = options;

  // Get API key from options, config, or env
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY not found. Set it in environment or config.');
  }

  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${key}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  // Extract text from response
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  // Handle blocked responses (safety filter)
  if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
    throw new Error('Response blocked by safety filter');
  }

  // Handle empty content with STOP (Gemini sometimes returns empty parts)
  if (data.candidates && data.candidates[0]?.finishReason === 'STOP') {
    const candidate = data.candidates[0];
    // Check if content exists but parts is empty or missing
    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
      throw new Error('Gemini API returned empty content (try again or simplify the prompt)');
    }
  }

  // Handle rate limit / quota errors
  if (data.error) {
    throw new Error(`Gemini API: ${data.error.message || JSON.stringify(data.error)}`);
  }

  // Handle empty candidates (rate limit or other issues)
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini API returned empty response (possible rate limit)');
  }

  throw new Error(`Unexpected Gemini API response: ${JSON.stringify(data).slice(0, 200)}`);
}

/**
 * Check if Gemini API is available
 * @param {string} apiKey - API key to test
 * @returns {Promise<boolean>}
 */
export async function checkGeminiAPI(apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    return false;
  }

  try {
    // Simple test request
    const url = `${GEMINI_API_URL}?key=${key}`;
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}
