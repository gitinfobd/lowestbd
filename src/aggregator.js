const { scrapeStarTech } = require('./scrapers/startech');
const { scrapeDaraz } = require('./scrapers/daraz');
const { scrapeRyans } = require('./scrapers/ryans');
const { scrapeSkyland } = require('./scrapers/skyland');
const { scrapeUniversalBd, KNOWN_STORES } = require('./scrapers/universalBd');
const { calculateRelevance, distillQuery } = require('./utils/textMatcher');
const { inspectUrl } = require('./utils/urlInspector');

/**
 * Master Aggregator for Bangladesh Tech Sites
 * @param {string} inputQuery - Keyword, full product title, or product URL
 * @returns {Promise<object>}
 */
async function searchAllStores(inputQuery) {
  const startTime = Date.now();
  const rawInput = (inputQuery || '').trim();

  if (!rawInput) {
    return {
      query: '',
      distilledQuery: '',
      executionTimeMs: 0,
      totalScanned: 0,
      totalFound: 0,
      top3: [],
      allDeals: [],
      summary: null
    };
  }

  // 1. Check if user pasted a direct URL
  const isUrl = /^https?:\/\//i.test(rawInput);
  let inspectedProduct = null;
  let targetSearchTerm = rawInput;

  if (isUrl) {
    try {
      inspectedProduct = await inspectUrl(rawInput);
      if (inspectedProduct && inspectedProduct.title) {
        targetSearchTerm = distillQuery(inspectedProduct.title);
      } else {
        targetSearchTerm = distillQuery(rawInput);
      }
    } catch (e) {
      targetSearchTerm = distillQuery(rawInput);
    }
  } else {
    targetSearchTerm = distillQuery(rawInput);
  }

  // 2. Run all scrapers in parallel with the distilled query
  const results = await Promise.allSettled([
    scrapeStarTech(targetSearchTerm),
    scrapeDaraz(targetSearchTerm),
    scrapeRyans(targetSearchTerm),
    scrapeSkyland(targetSearchTerm),
    scrapeUniversalBd(targetSearchTerm)
  ]);

  let allProducts = [];
  const scannedSources = ['Star Tech', 'Daraz Bangladesh', 'Ryans Computers', 'Skyland BD'];

  // If user pasted a URL, prepend it
  if (inspectedProduct) {
    allProducts.push(inspectedProduct);
    if (!scannedSources.includes(inspectedProduct.source)) {
      scannedSources.push(inspectedProduct.source);
    }
  }

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allProducts.push(...res.value);
    }
  }

  for (const p of allProducts) {
    if (!scannedSources.includes(p.source)) {
      scannedSources.push(p.source);
    }
  }

  // 3. Relevance Filtering & Hardware Spec Verification (Zero-Tolerance Rules)
  const filtered = [];
  const seenUrls = new Set();

  for (const item of allProducts) {
    if (!item.title || !item.link) continue;
    if (seenUrls.has(item.link)) continue;
    seenUrls.add(item.link);

    if (item.isPastedUrl) {
      item.relevanceScore = 1;
      filtered.push(item);
      continue;
    }

    // Apply strict hardware validation rules
    const score = calculateRelevance(rawInput, item.title, item.price);
    if (score >= 0.45) {
      item.relevanceScore = score;
      filtered.push(item);
    }
  }

  // 4. Separate priced products vs unpriced
  const pricedItems = filtered.filter(i => i.price >= 150);
  const unpricedItems = filtered.filter(i => !i.price || i.price < 150);

  for (const u of unpricedItems) {
    u.price = 0;
    u.priceDisplay = 'Call for Price';
  }

  // Sort priced items: in-stock first, then price ascending (cheapest first)
  pricedItems.sort((a, b) => {
    if (a.inStock !== b.inStock) {
      return a.inStock ? -1 : 1;
    }
    return a.price - b.price;
  });

  // 5. Select Top 3 Cheapest / Best Value Deals
  const top3 = [];
  const topStores = new Set();

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

  const remainingPriced = pricedItems.filter(p => !top3.some(t => t.link === p.link));
  const allDeals = [...top3, ...remainingPriced, ...unpricedItems];
  const executionTimeMs = Date.now() - startTime;

  // Genuine dynamic store calculation (No fake static numbers!)
  const uniqueDomains = new Set(allProducts.map(p => p.storeDomain || p.source)).size;
  const verifiedStoresCount = scannedSources.length;

  return {
    query: rawInput,
    distilledQuery: targetSearchTerm,
    executionTimeMs,
    verifiedStoresCount,
    totalStoresDiscovered: uniqueDomains,
    scannedSourcesList: scannedSources,
    totalFound: allDeals.length,
    summary,
    top3,
    allDeals,
    inspectedProduct
  };
}

module.exports = { searchAllStores };
