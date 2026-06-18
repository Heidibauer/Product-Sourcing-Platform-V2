// lib/tavily.js
// Tavily Search API — purpose-built for AI agents
// Used for: trend research + expert source research
// Docs: https://docs.tavily.com

/**
 * Research search via Tavily
 * Returns clean, LLM-ready content from trusted web sources
 * @param {string} query
 * @param {'basic'|'advanced'} depth - basic = 1 credit, advanced = 2 credits (better results)
 */
export async function tavilySearch(query, depth = 'advanced') {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: depth,
        max_results: 6,
        include_answer: false,
        include_raw_content: false,
        include_domains: [], // no restrictions — cast wide net
        exclude_domains: ['pinterest.com', 'reddit.com'], // exclude low-signal sources for research
      }),
    });

    if (!response.ok) {
      console.warn(`Tavily search failed (${response.status}) for: ${query}`);
      return { results: [] };
    }

    return response.json();
  } catch (e) {
    console.warn(`Tavily error for "${query}":`, e.message);
    return { results: [] };
  }
}

/**
 * Format Tavily results into snippets for Claude synthesis
 */
export function formatTavilyResults(data) {
  return (data.results || [])
    .slice(0, 6)
    .map(r => `• ${r.title}\n  ${r.content?.slice(0, 300) || ''}`)
    .join('\n\n');
}
