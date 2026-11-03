const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Dazzle BD Live REST API Scraper
 * Endpoint: https://dazzle.com.bd/api/proxy/product/search
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeDazzle(query) {
  if (!query) return [];
  const cleanQ = query.replace(/[,\-_]+/g, ' ').trim();
  const url = `https://dazzle.com.bd/api/proxy/product/search?keyword=${encodeURIComponent(cleanQ)}&page=1&perPage=40`;
  
  const jsonStr = await fetchHtml(url, { timeout: 8000 });
  if (!jsonStr) return [];

  const items = [];
  try {
    const data = JSON.parse(jsonStr);
    const hits = data.hits || [];

    for (const h of hits) {
      const doc = h.document;
      if (!doc || !doc.productName) continue;

      const price = parseBdtPrice(doc.discountedPrice || doc.regularPrice);
      const originalPrice = parseBdtPrice(doc.regularPrice) || price;
      const discount = doc.disRate ? Math.round(doc.disRate) : (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

      const productSlug = doc.productSlug || '';
      const link = productSlug ? `https://dazzle.com.bd/product/${productSlug}` : 'https://dazzle.com.bd';

      const offers = [];
      if (discount > 0) offers.push(`${discount}% OFF`);
      if (doc.productBadge) offers.push(doc.productBadge.replace(/[🌟🔥]/g, '').trim());
      offers.push('1 Year Dazzle Care+');

      items.push({
        source: 'Dazzle BD',
        storeDomain: 'dazzle.com.bd',
        storeLogo: '✨',
        title: doc.productName,
        link,
        image: doc.thumbnailsUrl || '',
        price,
        originalPrice,
        discount,
        offers,
        inStock: doc.isStockAvailable !== false,
        badge: doc.brand_name ? `Brand: ${doc.brand_name}` : 'Dazzle Verified'
      });
    }
  } catch (err) {
    // Fail gracefully
  }

  return items;
}

module.exports = { scrapeDazzle };
