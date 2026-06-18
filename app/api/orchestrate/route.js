// app/api/orchestrate/route.js
// Big Ticket Studio — Interior Intelligence Engine
//
// Research:  Tavily (trend + expert searches) — purpose-built for AI agents
// Products:  Serper Google Shopping — structured product data with images/prices
// AI brain:  Claude (all agent reasoning)

import { callClaudeJSON } from '../../../lib/claude';
import { tavilySearch, formatTavilyResults } from '../../../lib/tavily';
import { shoppingSearch } from '../../../lib/serper';
import { getRoomCategories } from '../../../lib/roomLogic';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────
// AGENT 1: Intent Agent
// ─────────────────────────────────────────────
async function intentAgent(prompt) {
  const system = `You are the Intent Agent for Big Ticket Studio, an elite interior design intelligence system.
Extract a precise, structured design brief from the user's request.
Respond ONLY with valid JSON. No markdown. No explanation.`;

  const message = `Analyze this interior design request and extract a structured brief:

"${prompt}"

Return this exact JSON:
{
  "room": "specific room type lowercase (nursery, living room, bedroom, home office, etc.)",
  "style": "design style (maximalist, minimalist, coastal, mid-century modern, bohemian, Scandinavian, etc.)",
  "mood": "emotional quality (playful, serene, cozy, energizing, sophisticated, etc.)",
  "budget": null or total budget as integer in USD,
  "audience": "who this room is for (millennial mom, remote worker, couple, teen, etc.)",
  "colors": ["2-4 specific preferred or style-appropriate colors"],
  "materials": ["2-3 preferred materials (linen, oak wood, marble, rattan, velvet, etc.)"],
  "qualityLevel": "budget OR mid-range OR premium OR luxury",
  "retailerPreferences": ["preferred retailers if mentioned, empty array if none"],
  "requiredCategories": ["specific product types needed — be concrete (crib not furniture, glider chair not seating)"],
  "missingInfo": ["only truly critical missing info that prevents recommendations"],
  "designConcept": "specific, evocative 2-sentence vision. Make it poetic and precise.",
  "questions": ["1-3 follow-up questions ONLY if room type or style is completely unknown. Empty array if enough info exists."]
}

List 6-9 specific items in requiredCategories. Only ask questions if you genuinely cannot proceed.`;

  return callClaudeJSON([{ role: 'user', content: message }], system, 1500);
}

// ─────────────────────────────────────────────
// AGENT 2: Research Agent (powered by Tavily)
// Tavily is purpose-built for AI agent research — returns clean,
// LLM-ready content from editorial sources, not just links
// ─────────────────────────────────────────────
async function researchAgent(intent, trendData, expertData) {
  const system = `You are the Research Agent for Big Ticket Studio.
Synthesize search results into actionable design intelligence for product selection.
Respond ONLY with valid JSON.`;

  const trendSnippets = formatTavilyResults(trendData);
  const expertSnippets = formatTavilyResults(expertData);

  const message = `Synthesize research for a ${intent.style} ${intent.room}.

TREND RESEARCH (via Tavily):
${trendSnippets || 'No trend data retrieved'}

EXPERT RECOMMENDATIONS (via Tavily):
${expertSnippets || 'No expert data retrieved'}

Design brief:
- Room: ${intent.room}
- Style: ${intent.style}
- Budget level: ${intent.qualityLevel}
- Audience: ${intent.audience}

Respond with:
{
  "trendingColors": ["3-5 specific colors currently popular for this style/room"],
  "trendingMaterials": ["3-4 materials trending for this aesthetic"],
  "topBrands": ["4-6 quality brands known for this style — real brands only, no hallucination"],
  "bestRetailers": ["4-5 best retailers for this style and budget level"],
  "designPrinciples": ["4-5 specific actionable principles for this room/style combo"],
  "productsToAvoid": ["2-3 things to avoid or watch out for"],
  "trendSummary": "2 sentences on what's trending for this specific room/style right now",
  "confidenceLevel": "high OR medium OR low",
  "qualitySignals": ["3-4 things to look for that indicate quality for this room type"]
}`;

  return callClaudeJSON([{ role: 'user', content: message }], system, 1500);
}

// ─────────────────────────────────────────────
// AGENT 3: Product Search Agent (powered by Serper Google Shopping)
// Serper's /shopping endpoint returns structured product data:
// title, price, image, retailer, link, rating — exactly what board cards need
// ─────────────────────────────────────────────
async function productSearchAgent(intent, categories) {
  const style = intent.style || '';
  const qualityLevel = intent.qualityLevel || 'mid-range';

  const qualityModifier =
    qualityLevel === 'luxury' ? 'luxury designer' :
    qualityLevel === 'premium' ? 'premium high quality' :
    qualityLevel === 'budget' ? 'affordable' : '';

  const searchPromises = categories.slice(0, 9).map(async (category) => {
    const query = [qualityModifier, style, category].filter(Boolean).join(' ').trim();
    const products = await shoppingSearch(query, 8);
    return { category, products };
  });

  return Promise.all(searchPromises);
}

// ─────────────────────────────────────────────
// AGENT 4: Verification Agent
// Filters out incomplete product data before Claude sees it
// ─────────────────────────────────────────────
async function verificationAgent(categoryResults) {
  return categoryResults.map(({ category, products }) => ({
    category,
    products: products.filter(p =>
      p.imageUrl &&
      p.productUrl &&
      p.price &&
      p.priceNum > 0 &&
      p.priceNum < 50000 &&
      p.name.length > 5
    ),
  }));
}

// ─────────────────────────────────────────────
// AGENT 5: Board Intelligence Agent
// The main brain — selects products, ensures cohesion, writes the board
// ─────────────────────────────────────────────
async function boardIntelligenceAgent(intent, research, verifiedResults) {
  const system = `You are the Board Intelligence Agent for Big Ticket Studio — an elite interior design AI.

Select the best products from the candidates to create a cohesive, beautiful, shoppable design board.

Rules:
1. Never select a mediocre product just to fill a category. Empty > mediocre.
2. Ensure all products work together visually and stylistically.
3. Distribute across retailers when possible.
4. Spend budget intelligently — more on key pieces, less on accents.
5. Write specific, genuine reasoning for every selection.
6. Be honest about missing or inadequate options.
7. Copy imageUrl and productUrl EXACTLY from candidates — never modify them.

Respond ONLY with valid JSON.`;

  const candidateData = verifiedResults.map(({ category, products }) => ({
    category,
    candidates: products.slice(0, 6).map(p => ({
      name: p.name,
      retailer: p.retailer,
      price: p.price,
      priceNum: p.priceNum,
      rating: p.rating,
      reviewCount: p.reviewCount,
      imageUrl: p.imageUrl,
      productUrl: p.productUrl,
    })),
  }));

  const budgetInfo = intent.budget
    ? `Total budget: $${intent.budget.toLocaleString()}`
    : 'Budget: flexible, match quality level';

  const message = `Build a complete ${intent.style} ${intent.room} design board.

═══ DESIGN BRIEF ═══
Room: ${intent.room}
Style: ${intent.style}
Mood: ${intent.mood}
Audience: ${intent.audience}
${budgetInfo}
Quality: ${intent.qualityLevel}
Colors: ${(intent.colors || []).join(', ') || 'not specified'}
Materials: ${(intent.materials || []).join(', ') || 'not specified'}
Vision: ${intent.designConcept}

═══ RESEARCH (via Tavily) ═══
Trending colors: ${(research.trendingColors || []).join(', ')}
Top brands: ${(research.topBrands || []).join(', ')}
Design principles: ${(research.designPrinciples || []).join('; ')}
Trend summary: ${research.trendSummary}
Quality signals: ${(research.qualitySignals || []).join('; ')}

═══ PRODUCT CANDIDATES (via Serper Google Shopping) ═══
${JSON.stringify(candidateData, null, 2)}

Return:
{
  "boardTitle": "specific 3-5 word poetic title (e.g., 'Warm Parisian Nursery')",
  "designConcept": "3 sentences: the room vision, feeling, and how it comes together",
  "targetAudience": "who this board is for",
  "estimatedCost": total as number,
  "colorPalette": ["3-4 hex color codes that define this board"],
  "products": [
    {
      "category": "exact category name",
      "name": "exact product name from candidates",
      "retailer": "exact retailer",
      "price": "exact price string",
      "priceNum": price as number,
      "imageUrl": "EXACT imageUrl — copy verbatim",
      "productUrl": "EXACT productUrl — copy verbatim",
      "rating": number or null,
      "reviewCount": number,
      "whyItFits": "1-2 specific sentences: why THIS product for THIS board. Reference real qualities.",
      "confidence": "high OR medium OR low",
      "styleScore": 1-10,
      "qualityScore": 1-10,
      "budgetScore": 1-10
    }
  ],
  "missingCategories": ["categories with no suitable product — be honest"],
  "designNotes": "3-4 sentences of interior designer advice for putting this room together",
  "budgetAllocation": "1-2 sentences on how budget is distributed across key pieces"
}

Select 5-8 products. Skip categories with no good options.
CRITICAL: Copy imageUrl and productUrl EXACTLY from candidates.`;

  return callClaudeJSON([{ role: 'user', content: message }], system, 4000);
}

// ─────────────────────────────────────────────
// MAIN HANDLER — streams progress via SSE
// ─────────────────────────────────────────────
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { prompt } = body;
  if (!prompt?.trim()) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let streamController;

  const stream = new ReadableStream({
    start(controller) { streamController = controller; },
  });

  const send = (data) => {
    try {
      streamController.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {}
  };

  (async () => {
    try {

      // ── Intent ──────────────────────────────────
      send({ type: 'agent', name: 'Intent Agent', status: 'running', message: 'Understanding your vision...' });
      const intent = await intentAgent(prompt);
      send({
        type: 'agent', name: 'Intent Agent', status: 'done',
        message: `${intent.room} · ${intent.style} · ${intent.budget ? `$${intent.budget.toLocaleString()}` : 'open budget'}`,
      });

      if (intent.questions?.length > 0 && intent.missingInfo?.length > 0) {
        send({ type: 'questions', questions: intent.questions, intent });
        send({ type: 'done' });
        return;
      }

      send({ type: 'intent', data: intent });

      // ── Research via Tavily ──────────────────────────────────
      send({
        type: 'agent', name: 'Research Agent', status: 'running',
        message: `Searching Apartment Therapy, Studio McGee, Wirecutter...`,
      });

      const [trendData, expertData] = await Promise.all([
        tavilySearch(`${intent.style} ${intent.room} interior design trends 2025 2026`),
        tavilySearch(`best ${intent.room} ${intent.style} recommendations "Apartment Therapy" OR "Studio McGee" OR "Wirecutter" OR "Domino"`),
      ]);

      const research = await researchAgent(intent, trendData, expertData);
      send({
        type: 'agent', name: 'Research Agent', status: 'done',
        message: `${research.trendSummary?.slice(0, 80)}...`,
      });

      // ── Product Search via Serper Google Shopping ──────────────────────────────────
      const categories = intent.requiredCategories?.length > 0
        ? intent.requiredCategories
        : getRoomCategories(intent.room);

      send({
        type: 'agent', name: 'Product Search Agent', status: 'running',
        message: `Searching Google Shopping for ${categories.length} categories...`,
      });

      const productResults = await productSearchAgent(intent, categories);
      const totalFound = productResults.reduce((n, { products }) => n + products.length, 0);

      send({
        type: 'agent', name: 'Product Search Agent', status: 'done',
        message: `Found ${totalFound} product candidates`,
      });

      // ── Verification ──────────────────────────────────
      send({ type: 'agent', name: 'Verification Agent', status: 'running', message: 'Checking data quality...' });
      const verified = await verificationAgent(productResults);
      const verifiedCount = verified.reduce((n, { products }) => n + products.length, 0);
      send({
        type: 'agent', name: 'Verification Agent', status: 'done',
        message: `${verifiedCount} products passed quality check`,
      });

      // ── Board Intelligence ──────────────────────────────────
      send({ type: 'agent', name: 'Board Intelligence', status: 'running', message: 'Curating your board...' });
      const board = await boardIntelligenceAgent(intent, research, verified);
      send({
        type: 'agent', name: 'Board Intelligence', status: 'done',
        message: `"${board.boardTitle}" · ${board.products?.length || 0} products selected`,
      });

      // ── Final board ──────────────────────────────────
      send({
        type: 'board',
        data: { ...board, id: Date.now().toString(), intent, research, status: 'draft', createdAt: new Date().toISOString(), prompt },
      });
      send({ type: 'done' });

    } catch (error) {
      console.error('[Orchestrate] Error:', error);
      send({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
    } finally {
      try { streamController.close(); } catch {}
    }
  })();

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
