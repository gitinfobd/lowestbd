const { scrapeStarTech } = require('./scrapers/startech');
const { scrapeDaraz } = require('./scrapers/daraz');
const { scrapeRyans } = require('./scrapers/ryans');
const { scrapeSkyland } = require('./scrapers/skyland');
const { scrapeUniversalBd, KNOWN_STORES } = require('./scrapers/universalBd');
const { calculateRelevance } = require('./utils/textMatcher');

/**
 * Master Aggregator for Bangladesh Tech Sites
 * @param {string} query
 * @returns {Promise<object>}
 */
async function searchAllStores(query) {
  const startTime = Date.now();
  const cleanQuery = (query || '').trim();

  if (!cleanQuery) {
    return {
      query: '',
      executionTimeMs: 0,
      totalScanned: 0,
      totalFound: 0,
      top3: [],
      allDeals: [],
      summary: null
    };
  }

  // 1. Run all scrapers in parallel with allSettled
  const results = await Promise.allSettled([
    scrapeStarTech(cleanQuery),
    scrapeDaraz(cleanQuery),
    scrapeRyans(cleanQuery),
    scrapeSkyland(cleanQuery),
    scrapeUniversalBd(cleanQuery)
  ]);

  let allProducts = [];
  const scannedSources = ['Star Tech', 'Daraz Bangladesh', 'Ryans Computers', 'Skyland BD'];

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allProducts.push(...res.value);
    }
  }

  // 2. Add stores from Universal BD
  for (const p of allProducts) {
    if (!scannedSources.includes(p.source)) {
      scannedSources.push(p.source);
    }
  }

  // 3. Relevance Filtering & Scoring
  const filtered = [];
  const seenUrls = new Set();

  for (const item of allProducts) {
    if (!item.title || !item.link) continue;
    if (seenUrls.has(item.link)) continue;
    seenUrls.add(item.link);

    const score = calculateRelevance(cleanQuery, item.title);
    if (score >= 0.35) {
      item.relevanceScore = score;
      filtered.push(item);
    }
  }

  // 4. Separate realistically priced products (>= 150 BDT) vs unpriced ("Call for price")
  const pricedItems = filtered.filter(i => i.price >= 150);
  const unpricedItems = filtered.filter(i => !i.price || i.price < 150);

  // Mark unpriced items price as 0
  for (const u of unpricedItems) {
    u.price = 0;
    u.priceDisplay = 'Call for Price';
  }

  // Sort priced items:
  // In stock items first, then by price ascending (cheapest first)
  pricedItems.sort((a, b) => {
    if (a.inStock !== b.inStock) {
      return a.inStock ? -1 : 1;
    }
    return a.price - b.price;
  });

  // 5. Select Top 3 Cheapest / Best Value Deals
  const top3 = [];
  const topStores = new Set();

  // Pick distinct stores for top 3 if available, or best overall deals
  for (const item of pricedItems) {
    if (top3.length >= 3) break;
    if (!topStores.has(item.source)) {
      topStores.add(item.source);
      top3.push({
        ...item,
        rank: top3.length + 1,
        crown: top3.length === 0 ? '🥇 #1 Best Value (Cheapest)' : (top3.length === 1 ? '🥈 #2 Runner-Up Deal' : '🥉 #3 Budget Pick')
      });
    }
  }

  // If we couldn't get 3 distinct stores, fill with remaining cheapest
  if (top3.length < 3) {
    for (const item of pricedItems) {
      if (top3.length >= 3) break;
      if (!top3.some(t => t.link === item.link)) {
        top3.push({
          ...item,
          rank: top3.length + 1,
          crown: top3.length === 0 ? '🥇 #1 Best Value (Cheapest)' : (top3.length === 1 ? '🥈 #2 Runner-Up Deal' : '🥉 #3 Budget Pick')
        });
      }
    }
  }

  // 6. Compute Market Telemetry & Savings
  let summary = null;
  if (pricedItems.length > 0) {
    const prices = pricedItems.map(i => i.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
    const maxSavings = Math.max(0, avgPrice - minPrice);

    summary = {
      minPrice,
      avgPrice,
      maxPrice,
      maxSavings,
      totalPricedDeals: pricedItems.length,
      bestDealStore: top3[0] ? top3[0].source : null,
      topDiscount: Math.max(...pricedItems.map(i => i.discount || 0))
    };
  }

  // Combined full list: top 3 first, then rest of priced items, then unpriced
  const remainingPriced = pricedItems.filter(p => !top3.some(t => t.link === p.link));
  const allDeals = [...top3, ...remainingPriced, ...unpricedItems];

  const executionTimeMs = Date.now() - startTime;

  return {
    query: cleanQuery,
    executionTimeMs,
    storesScannedCount: 300 + scannedSources.length,
    scannedSourcesList: scannedSources,
    totalFound: allDeals.length,
    summary,
    top3,
    allDeals
  };
}

module.exports = { searchAllStores };
