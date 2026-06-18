// lib/serper.js
// Serper.dev — Google Shopping API
// Used ONLY for product search (images, prices, retailer links)
// Docs: https://serper.dev/

/**
 * Google Shopping search via Serper
 * Returns structured product data: name, price, image, retailer, link
 * This is the gold standard for shoppable product data
 * @param {string} query
 * @param {number} num - number of results (max 10)
 */
export async function shoppingSearch(query, num = 8) {
  try {
    const response = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.SERPER_API_KEY,
      },
      body: JSON.stringify({ q: query, gl: 'us', hl: 'en', num }),
    });

    if (!response.ok) {
      console.warn(`Serper shopping failed (${response.status}) for: ${query}`);
      return [];
    }

    const data = await response.json();
    return normalizeProducts(data.shopping_results || [], query);
  } catch (e) {
    console.warn(`Serper shopping error for "${query}":`, e.message);
    return [];
  }
}

/**
 * Normalize Serper shopping results into our product format
 */
function normalizeProducts(results, category) {
  return results
    .filter(r => r.title && r.link)
    .map(r => ({
      name: r.title || '',
      retailer: r.source || '',
      price: r.price || '',
      priceNum: parsePrice(r.price),
      imageUrl: r.imageUrl || r.thumbnailUrl || '',
      productUrl: r.link || '',
      rating: r.rating ? parseFloat(r.rating) : null,
      reviewCount: r.ratingCount || 0,
      delivery: r.delivery || '',
      category,
    }));
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}
