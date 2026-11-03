const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Apple Gadgets BD Live REST API Scraper
 * Endpoint: https://storeapi.applegadgetsbd.com/api/search (POST)
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeAppleGadgets(query) {
  if (!query) return [];
  const cleanQ = query.replace(/[,\-_]+/g, ' ').trim();

  const jsonStr = await fetchHtml('https://storeapi.applegadgetsbd.com/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ search_term: cleanQ }),
    timeout: 8000
  });

  if (!jsonStr) return [];

  const items = [];
  try {
    const data = JSON.parse(jsonStr);
    const products = Array.isArray(data.products) ? data.products : (data.products?.data || []);

    for (const p of products) {
      if (!p || !p.name) continue;

      const slug = p.urls?.[0]?.slug || '';
      const link = slug ? `https://applegadgetsbd.com/product/${slug}` : 'https://applegadgetsbd.com';

      const priceObj = p.variant?.prices?.[0];
      const rawPrice = priceObj?.price?.value || 0;
      const rawOldPrice = priceObj?.compare_price?.value || rawPrice;

      const price = parseBdtPrice(rawPrice);
      const originalPrice = parseBdtPrice(rawOldPrice) || price;
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      const imageFile = p.media?.[0]?.file_name || '';
      const image = imageFile ? `https://d30fs77zq6vq2v.cloudfront.net/product/${imageFile}` : '';

      const isOut = p.variant?.status !== 'in-stock';

      const offers = [];
      if (discount > 0) offers.push(`${discount}% OFF`);
      offers.push('Official Apple Warranty', 'Nationwide Delivery');

      if (price > 0) {
        items.push({
          source: 'Apple Gadgets BD',
          storeDomain: 'applegadgetsbd.com',
          storeLogo: '🍏',
          title: p.name,
          link,
          image,
          price,
          originalPrice,
          discount,
          offers,
          inStock: !isOut,
          badge: p.brand?.attribute_data?.name ? `Brand: ${p.brand.attribute_data.name}` : 'Apple Gadgets Verified'
        });
      }
    }
  } catch (err) {
    // Fail gracefully
  }

  return items;
}

module.exports = { scrapeAppleGadgets };
