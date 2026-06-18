'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
// ICONS (inline SVG components — no dependency)
// ─────────────────────────────────────────────
const Icon = ({ name, size = 16, className = '' }) => {
  const icons = {
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    shopping: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    sparkle: <><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chevronDown: <polyline points="6 9 12 15 18 9"/>,
    lightbulb: <><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name]}
    </svg>
  );
};

// ─────────────────────────────────────────────
// SAMPLE PROMPTS
// ─────────────────────────────────────────────
const SAMPLE_PROMPTS = [
  'Create a colorful maximalist nursery for a first-time mom, under $2,500',
  'Design a minimal Scandinavian home office for a remote worker, around $3,000',
  'Build a warm coastal living room for a beach house rental, mid-range budget',
  'Create an elegant guest bedroom with a Parisian feel, under $2,000',
];

// ─────────────────────────────────────────────
// AGENT STATUS COMPONENT
// ─────────────────────────────────────────────
function AgentRow({ agent }) {
  const isRunning = agent.status === 'running';
  const isDone = agent.status === 'done';

  return (
    <div className={`flex items-start gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
      isRunning ? 'bg-brand-lightPurple border border-brand-softPurple' :
      isDone ? 'bg-white' : 'opacity-40'
    }`}>
      {/* Status indicator */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
        isRunning ? 'gradient-bg text-white' :
        isDone ? 'bg-green-100 text-green-600' :
        'bg-gray-100 text-gray-400'
      }`}>
        {isRunning ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isDone ? (
          <Icon name="check" size={14} />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-700 ${isDone ? 'text-brand-space' : isRunning ? 'text-brand-purple' : 'text-brand-charcoal'}`}>
          {agent.name}
        </p>
        {agent.message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${
            isRunning ? 'text-brand-purple agent-pulse' : 'text-brand-charcoal'
          }`}>
            {agent.message}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCT CARD COMPONENT
// ─────────────────────────────────────────────
function ProductCard({ product, onLock, locked }) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const confidenceColor = {
    high: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-red-500 bg-red-50',
  }[product.confidence] || 'text-brand-charcoal bg-brand-gray';

  const stars = product.rating ? Math.round(product.rating) : 0;

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      locked ? 'border-brand-purple ring-1 ring-brand-purple' : 'border-gray-100'
    }`}>
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-brand-gray overflow-hidden">
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-lightPurple">
            <p className="text-brand-charcoal text-xs text-center px-4">{product.name}</p>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-brand-purple text-xs font-600 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Confidence badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${confidenceColor}`}>
            {product.confidence}
          </span>
        </div>

        {/* Lock button */}
        <button
          onClick={() => onLock?.(product)}
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
            locked
              ? 'bg-brand-purple text-white opacity-100'
              : 'bg-white/90 text-brand-charcoal hover:bg-brand-purple hover:text-white'
          }`}
          title={locked ? 'Locked — click to unlock' : 'Lock this product'}
        >
          <Icon name="lock" size={12} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-700 text-brand-black text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Retailer + Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-brand-charcoal bg-brand-gray px-2 py-0.5 rounded-full">
            {product.retailer}
          </span>
          <span className="text-brand-purple font-900 text-base">
            {product.price}
          </span>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Icon
                  key={i}
                  name="star"
                  size={10}
                  className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-xs text-brand-charcoal">
              {product.rating} {product.reviewCount > 0 && `(${product.reviewCount.toLocaleString()})`}
            </span>
          </div>
        )}

        {/* Why it fits */}
        <div className="mb-3">
          <p className={`text-xs text-brand-space leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {product.whyItFits}
          </p>
          {product.whyItFits?.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-brand-purple mt-0.5 hover:underline"
            >
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>

        {/* Score pills */}
        <div className="flex gap-1 mb-3">
          {product.styleScore && (
            <span className="text-xs bg-brand-lightPurple text-brand-purple px-2 py-0.5 rounded-full">
              Style {product.styleScore}/10
            </span>
          )}
          {product.qualityScore && (
            <span className="text-xs bg-brand-lightPurple text-brand-purple px-2 py-0.5 rounded-full">
              Quality {product.qualityScore}/10
            </span>
          )}
        </div>

        {/* Shop Now */}
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-brand-purple text-white text-xs font-700 hover:opacity-90 transition-opacity"
        >
          Shop Now
          <Icon name="external" size={11} />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BOARD VIEW COMPONENT
// ─────────────────────────────────────────────
function BoardView({ board, lockedProducts, onLockToggle }) {
  const totalCost = board.estimatedCost;

  return (
    <div className="animate-fade-in">
      {/* Board Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-600 bg-brand-softPurple text-brand-purple px-2 py-0.5 rounded-full uppercase tracking-wide">
                Draft
              </span>
              <span className="text-xs text-brand-charcoal">{board.intent?.room} · {board.intent?.style}</span>
            </div>
            <h1 className="font-900 text-brand-black text-3xl leading-tight">
              {board.boardTitle}
            </h1>
          </div>
          {totalCost > 0 && (
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-brand-charcoal mb-0.5">Estimated total</p>
              <p className="font-900 text-2xl gradient-text">
                ${totalCost.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <p className="text-brand-space text-sm leading-relaxed max-w-2xl">
          {board.designConcept}
        </p>

        {/* Color palette */}
        {board.colorPalette?.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-brand-charcoal">Palette</span>
            {board.colorPalette.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {(board.products || []).map((product, i) => (
          <ProductCard
            key={`${product.category}-${i}`}
            product={product}
            locked={lockedProducts.has(product.category)}
            onLock={onLockToggle}
          />
        ))}
      </div>

      {/* Design Notes */}
      {board.designNotes && (
        <div className="bg-brand-lightPurple rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="lightbulb" size={16} className="text-brand-purple" />
            <h3 className="font-700 text-brand-black text-sm">Designer Notes</h3>
          </div>
          <p className="text-brand-space text-sm leading-relaxed">{board.designNotes}</p>
          {board.budgetAllocation && (
            <p className="text-brand-charcoal text-xs mt-2 leading-relaxed">
              Budget: {board.budgetAllocation}
            </p>
          )}
        </div>
      )}

      {/* Missing Categories */}
      {board.missingCategories?.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="info" size={14} className="text-yellow-600" />
            <h3 className="font-700 text-yellow-700 text-xs uppercase tracking-wide">
              Not found — quality over completeness
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {board.missingCategories.map(cat => (
              <span key={cat} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE COMPONENT
// ─────────────────────────────────────────────
function EmptyState({ onSampleClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center">
      {/* Logo mark */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full gradient-bg opacity-20 absolute -top-2 -left-2 blur-xl" />
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
          <Icon name="sparkle" size={20} className="text-white" />
        </div>
      </div>

      <h2 className="font-900 text-brand-black text-2xl mb-2">
        Your board will appear here
      </h2>
      <p className="text-brand-charcoal text-sm mb-8 max-w-sm leading-relaxed">
        Describe a room and Studio will research trends, find real products, verify every link, and build a complete shoppable board.
      </p>

      {/* Sample prompts */}
      <div className="w-full max-w-md">
        <p className="text-xs font-700 text-brand-charcoal uppercase tracking-wider mb-3">
          Try one of these
        </p>
        <div className="flex flex-col gap-2">
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSampleClick(prompt)}
              className="text-left text-sm text-brand-space bg-brand-lightPurple hover:bg-brand-softPurple px-4 py-3 rounded-xl transition-colors leading-snug"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────
export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | generating | questions | done | error
  const [agents, setAgents] = useState([]);
  const [board, setBoard] = useState(null);
  const [intent, setIntent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockedProducts, setLockedProducts] = useState(new Set());

  const textareaRef = useRef(null);
  const boardRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleLockToggle = useCallback((product) => {
    setLockedProducts(prev => {
      const next = new Set(prev);
      if (next.has(product.category)) {
        next.delete(product.category);
      } else {
        next.add(product.category);
      }
      return next;
    });
  }, []);

  const updateAgent = useCallback((agentData) => {
    setAgents(prev => {
      const existing = prev.findIndex(a => a.name === agentData.name);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = agentData;
        return next;
      }
      return [...prev, agentData];
    });
  }, []);

  const generate = useCallback(async (inputPrompt) => {
    const p = inputPrompt || prompt;
    if (!p.trim()) return;

    setPhase('generating');
    setAgents([]);
    setBoard(null);
    setIntent(null);
    setQuestions([]);
    setErrorMsg('');

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'agent') {
              updateAgent(data);
            } else if (data.type === 'intent') {
              setIntent(data.data);
            } else if (data.type === 'questions') {
              setQuestions(data.questions || []);
              setIntent(data.intent);
              setPhase('questions');
            } else if (data.type === 'board') {
              setBoard(data.data);
              setTimeout(() => boardRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            } else if (data.type === 'error') {
              setErrorMsg(data.message);
              setPhase('error');
            } else if (data.type === 'done') {
              setPhase('done');
            }
          } catch {}
        }
      }

    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
      setPhase('error');
    }
  }, [prompt, updateAgent]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generate();
    }
  };

  const handleSampleClick = (sample) => {
    setPrompt(sample);
    setTimeout(() => generate(sample), 50);
  };

  const isGenerating = phase === 'generating';

  return (
    <div className="flex flex-col h-screen bg-brand-gray">
      {/* ── HEADER ── */}
      <header className="flex-shrink-0 gradient-bg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo circles */}
          <div className="flex items-center" style={{ gap: '-4px' }}>
            <div className="w-7 h-7 rounded-full bg-brand-sky opacity-80" />
            <div className="w-7 h-7 rounded-full bg-white opacity-30 -ml-3" />
          </div>
          <div>
            <span className="font-900 text-white text-lg tracking-tight">big ticket.</span>
            <span className="font-400 text-white/80 text-sm ml-2">studio</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">Interior Intelligence Engine</span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">v1 · internal</span>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT PANEL: Input + Agents ── */}
        <div className="w-[380px] flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

          {/* Input area */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a room... &quot;Create a colorful maximalist nursery for a first-time mom, under $2,500&quot;"
                disabled={isGenerating}
                className="w-full bg-brand-lightPurple text-brand-black text-sm placeholder-brand-charcoal rounded-xl p-4 pr-12 resize-none outline-none border border-transparent focus:border-brand-softPurple transition-colors leading-relaxed font-400 disabled:opacity-60 min-h-[80px]"
                rows={3}
              />
              <button
                onClick={() => generate()}
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-3 bottom-3 w-8 h-8 rounded-lg gradient-bg text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity"
                title="Generate board (⌘ + Enter)"
              >
                {isGenerating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="send" size={13} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-brand-charcoal">⌘ + Enter to generate</p>
              {phase === 'done' && (
                <button
                  onClick={() => { setPhase('idle'); setBoard(null); setAgents([]); }}
                  className="text-xs text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Icon name="refresh" size={11} /> New board
                </button>
              )}
            </div>
          </div>

          {/* Intent summary */}
          {intent && (
            <div className="px-4 py-3 border-b border-gray-100 bg-brand-lightPurple">
              <div className="flex flex-wrap gap-1.5">
                {intent.room && (
                  <span className="text-xs bg-white text-brand-purple px-2 py-0.5 rounded-full font-500">
                    {intent.room}
                  </span>
                )}
                {intent.style && (
                  <span className="text-xs bg-white text-brand-space px-2 py-0.5 rounded-full">
                    {intent.style}
                  </span>
                )}
                {intent.budget && (
                  <span className="text-xs bg-white text-brand-space px-2 py-0.5 rounded-full">
                    ${intent.budget.toLocaleString()}
                  </span>
                )}
                {intent.qualityLevel && (
                  <span className="text-xs bg-white text-brand-charcoal px-2 py-0.5 rounded-full">
                    {intent.qualityLevel}
                  </span>
                )}
              </div>
              {intent.designConcept && (
                <p className="text-xs text-brand-space mt-2 leading-relaxed italic">
                  &ldquo;{intent.designConcept}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Agents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {agents.length === 0 && !isGenerating && (
              <div className="text-center py-8">
                <p className="text-xs text-brand-charcoal">
                  {phase === 'idle' ? 'Agents will run here when you generate a board.' :
                   phase === 'done' ? 'Board complete.' :
                   phase === 'error' ? '' : ''}
                </p>
              </div>
            )}

            {agents.map((agent) => (
              <AgentRow key={agent.name} agent={agent} />
            ))}

            {/* Questions Panel */}
            {phase === 'questions' && questions.length > 0 && (
              <div className="bg-brand-lightPurple rounded-xl p-4 border border-brand-softPurple">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="info" size={14} className="text-brand-purple" />
                  <p className="text-xs font-700 text-brand-purple">A few quick questions</p>
                </div>
                {questions.map((q, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <p className="text-xs text-brand-black font-500 leading-relaxed">{q}</p>
                  </div>
                ))}
                <p className="text-xs text-brand-charcoal mt-3">
                  Update your prompt above with these details and try again.
                </p>
              </div>
            )}

            {/* Error */}
            {phase === 'error' && errorMsg && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs text-red-600 font-500">
                  {errorMsg}
                </p>
                <button
                  onClick={() => { setPhase('idle'); setErrorMsg(''); }}
                  className="text-xs text-red-500 mt-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Locked products summary */}
          {lockedProducts.size > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-brand-charcoal flex items-center gap-1">
                <Icon name="lock" size={11} />
                {lockedProducts.size} product{lockedProducts.size > 1 ? 's' : ''} locked
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Board ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div ref={boardRef} className="max-w-5xl mx-auto px-8 py-8">
            {board ? (
              <BoardView
                board={board}
                lockedProducts={lockedProducts}
                onLockToggle={handleLockToggle}
              />
            ) : (
              <EmptyState onSampleClick={handleSampleClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
