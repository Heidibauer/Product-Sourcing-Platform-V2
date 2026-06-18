# big ticket. studio

**Interior Intelligence Engine** — An AI-powered internal tool that researches the world, evaluates products, and creates complete, shoppable design boards using real products and verified links.

---

## What It Does

Studio runs a 5-agent pipeline for every board request:

1. **Intent Agent** — Extracts room, style, mood, budget, colors, and required categories from natural language
2. **Research Agent** — Searches Google for current trends and expert recommendations (Apartment Therapy, Studio McGee, Wirecutter)
3. **Product Search Agent** — Searches Google Shopping for real products across all categories
4. **Verification Agent** — Filters out incomplete or low-quality product data
5. **Board Intelligence Agent** — Selects the best products, ensures visual cohesion, and writes the complete board narrative

Every board includes: product images, retailer names, live links, prices, ratings, and a written explanation of why each product was selected.

---

## Deploy to Vercel

### Step 1: Clone and push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/big-ticket-studio.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3: Set Environment Variables

In Vercel → Settings → Environment Variables, add:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| `SERPER_API_KEY` | [serper.dev](https://serper.dev/) (2,500 free queries) |

### Step 4: Redeploy

After setting env vars, trigger a redeploy from the Vercel dashboard.

---

## API Keys & Costs

### Anthropic (Claude)
- Model: `claude-sonnet-4-6`
- Cost: ~$3–15 per 1,000 board generations (input + output tokens)
- Get key: [console.anthropic.com](https://console.anthropic.com/)

### Serper (Google Search + Shopping)
- Free tier: **2,500 queries/month**
- Each board uses ~4–6 Serper calls (2 web + 7 shopping)
- Paid: $50/month for 50,000 queries
- Get key: [serper.dev](https://serper.dev/)

---

## Vercel Plan Requirements

The orchestration pipeline can take 60–120 seconds for a full board (research + shopping searches + Claude calls).

| Plan | Max Duration | Notes |
|------|-------------|-------|
| **Hobby** | 60 seconds | May timeout on complex boards |
| **Pro** | 300 seconds ✓ | Recommended for production |

The `vercel.json` is already configured for 300s. Upgrade to Pro for reliability.

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local from template
cp .env.example .env.local
# Edit .env.local and add your API keys

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Agent Pipeline

```
User Prompt
    │
    ▼
Intent Agent (Claude)
  → Extracts: room, style, budget, mood, categories
    │
    ▼
Research Agent (Serper × 2 + Claude)
  → Trends, expert picks, brand recommendations
    │
    ▼
Product Search Agent (Serper Shopping × N categories)
  → Real products with images, prices, links
    │
    ▼
Verification Agent
  → Filters incomplete or invalid data
    │
    ▼
Board Intelligence Agent (Claude)
  → Selects best products, ensures cohesion, writes board
    │
    ▼
Board Output (streamed to UI)
```

---

## Room Support

Rooms with full category logic built in:

- Nursery
- Living room
- Bedroom / Guest bedroom
- Home office
- Dining room
- Bathroom
- Kitchen
- Coffee corner
- Entryway
- Kids bedroom
- Playroom
- Outdoor patio
- And more (falls back to generic categories for unknown rooms)

---

## Architecture

```
big-ticket-studio/
├── app/
│   ├── layout.js           Root layout, Montserrat font
│   ├── page.js             Main UI (chat + agents + board)
│   ├── globals.css         Tailwind + brand utilities
│   └── api/
│       └── orchestrate/
│           └── route.js    5-agent pipeline (SSE streaming)
├── lib/
│   ├── claude.js           Anthropic API client
│   ├── serper.js           Serper API client
│   └── roomLogic.js        Room categories & budget logic
├── .env.example            Environment variable template
├── vercel.json             Function duration config
└── tailwind.config.js      Big Ticket brand colors
```

---

## Core Design Principles

- **Trust over completeness** — Never recommend a mediocre product just to fill a category
- **No hallucination** — Products come from real Google Shopping results
- **Streaming** — Agent progress is visible in real time
- **Budget intelligence** — Spend more on beds/sofas/rugs, less on accents
- **Retailer diversity** — Avoid recommending everything from one store

---

## Roadmap (v2+)

- [ ] Board refinement: "Replace the rug" / "Make it more colorful"
- [ ] Product locking: regenerate individual categories
- [ ] Alternative products (budget / premium swaps)
- [ ] Board approval workflow (draft → approved → published)
- [ ] Learning layer: remember rejected products and styles
- [ ] Visual mood board input ("recreate this room")
- [ ] Affiliate link insertion
- [ ] Board export (PDF, shareable link)
