// lib/roomLogic.js
// Room category definitions, budget allocations, and design rules

export const ROOM_CATEGORIES = {
  nursery: ['crib', 'glider chair', 'dresser', 'rug', 'blackout curtains', 'floor lamp', 'storage baskets', 'wall art'],
  'living room': ['sofa', 'coffee table', 'area rug', 'side table', 'floor lamp', 'throw pillows', 'bookshelf', 'wall art'],
  bedroom: ['bed frame', 'bedding set', 'nightstand', 'dresser', 'area rug', 'curtains', 'table lamp', 'mirror'],
  'guest bedroom': ['bed frame', 'bedding set', 'nightstand', 'table lamp', 'area rug', 'curtains', 'mirror', 'luggage bench'],
  'home office': ['desk', 'office chair', 'bookshelf', 'desk lamp', 'area rug', 'monitor stand', 'storage', 'wall art'],
  'dining room': ['dining table', 'dining chairs', 'area rug', 'pendant light', 'sideboard', 'table runner', 'wall art'],
  bathroom: ['vanity mirror', 'bath mat', 'storage organizer', 'towel set', 'shower curtain', 'soap dispenser', 'candles'],
  kitchen: ['bar stools', 'pendant lighting', 'storage canisters', 'kitchen textiles', 'small appliances', 'cutting board'],
  'coffee corner': ['espresso machine', 'coffee mugs set', 'serving tray', 'storage canisters', 'floating shelf', 'milk frother', 'bean grinder'],
  entryway: ['console table', 'mirror', 'entryway bench', 'entryway rug', 'wall hooks', 'table lamp'],
  'kids bedroom': ['kids bed frame', 'bedding set', 'kids desk', 'bookshelf', 'area rug', 'pendant lamp', 'toy storage', 'wall decor'],
  playroom: ['activity table', 'storage bins', 'play rug', 'bookshelf', 'bean bag chair', 'pendant lamp', 'wall art'],
  'laundry room': ['hamper', 'storage shelves', 'laundry basket', 'wall hooks', 'mat', 'organizer'],
  'outdoor patio': ['outdoor sofa', 'outdoor coffee table', 'outdoor rug', 'string lights', 'planters', 'side table', 'lanterns'],
  mudroom: ['bench with storage', 'wall hooks', 'shoe rack', 'basket storage', 'mat'],
};

// Budget allocation by category (how much % of budget to spend on each)
export const BUDGET_ALLOCATIONS = {
  // Beds and seating get the most spend — durability + comfort matters
  'bed frame': 0.25,
  'sofa': 0.35,
  'mattress': 0.25,
  'crib': 0.20,
  'office chair': 0.20,
  'dining table': 0.25,
  'dining chairs': 0.20,
  // Rugs are a major visual investment
  'area rug': 0.15,
  'rug': 0.15,
  // Lighting sets the mood
  'floor lamp': 0.08,
  'pendant light': 0.10,
  'table lamp': 0.07,
  // Accent/decor — invest less
  'wall art': 0.05,
  'throw pillows': 0.04,
  'curtains': 0.06,
  // Default allocation
  default: 0.08,
};

// Products that should never be compromised on quality
export const QUALITY_CRITICAL = [
  'mattress', 'crib', 'mattress', 'office chair', 'sofa', 'bed frame', 'crib', 'glider chair',
];

// Product categories that are nice-to-have vs must-have
export const PRIORITY = {
  essential: ['bed frame', 'mattress', 'crib', 'sofa', 'dining table', 'dining chairs', 'desk', 'office chair'],
  important: ['rug', 'area rug', 'floor lamp', 'table lamp', 'dresser', 'nightstand', 'bookshelf'],
  accent: ['wall art', 'throw pillows', 'curtains', 'mirror', 'candles', 'planters', 'decorative objects'],
};

/**
 * Get product categories for a given room type
 * Falls back to generic categories if room not recognized
 */
export function getRoomCategories(room) {
  if (!room) return ['furniture', 'lighting', 'rug', 'wall art', 'storage', 'textiles'];

  const normalized = room.toLowerCase().trim();

  // Direct match
  if (ROOM_CATEGORIES[normalized]) {
    return ROOM_CATEGORIES[normalized];
  }

  // Partial match
  for (const [key, categories] of Object.entries(ROOM_CATEGORIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return categories;
    }
  }

  // Generic fallback
  return ['furniture', 'lighting', 'rug', 'wall art', 'storage', 'curtains'];
}

/**
 * Calculate target price for a product category given total budget
 */
export function getCategoryBudget(category, totalBudget) {
  if (!totalBudget) return null;
  const allocation = BUDGET_ALLOCATIONS[category?.toLowerCase()] || BUDGET_ALLOCATIONS.default;
  return Math.round(totalBudget * allocation);
}

/**
 * Known quality retailers by tier
 */
export const RETAILERS = {
  premium: ['Pottery Barn', 'West Elm', 'CB2', 'Restoration Hardware', 'Williams Sonoma', 'Anthropologie', 'Crate and Barrel'],
  midRange: ['Wayfair', 'Target', 'IKEA', 'Overstock', 'Article', 'Joss & Main', 'AllModern'],
  budget: ['Amazon', 'Walmart', 'HomeGoods', 'World Market'],
  specialty: ['Home Depot', 'Lowe\'s', 'Best Buy'],
};

export function getRetailerTier(retailer) {
  const r = retailer?.toLowerCase() || '';
  if (RETAILERS.premium.some(p => r.includes(p.toLowerCase()))) return 'premium';
  if (RETAILERS.midRange.some(p => r.includes(p.toLowerCase()))) return 'mid-range';
  if (RETAILERS.budget.some(p => r.includes(p.toLowerCase()))) return 'budget';
  return 'unknown';
}
