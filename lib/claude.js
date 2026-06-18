// lib/claude.js
// Anthropic Claude API client for Big Ticket Studio agents

const CLAUDE_MODEL = 'claude-sonnet-4-6';

/**
 * Call Claude and return raw text
 */
export async function callClaude(messages, systemPrompt, maxTokens = 2000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

/**
 * Call Claude and parse JSON response
 * Strips markdown code fences before parsing
 */
export async function callClaudeJSON(messages, systemPrompt, maxTokens = 2000) {
  const text = await callClaude(messages, systemPrompt, maxTokens);

  // Strip markdown code fences
  const cleaned = text
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to find JSON object in the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    console.error('Failed to parse Claude JSON:', cleaned.slice(0, 500));
    throw new Error(`Claude returned invalid JSON: ${e.message}`);
  }
}
