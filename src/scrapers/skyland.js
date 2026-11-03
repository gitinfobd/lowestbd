const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Skyland Computer BD Scraper
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeSkyland(query) {
  const url = `https://www.skyland.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  if (!html) return [];

  const items = [];
  const thumbs = html.split('class="product-thumb"');

  for (let i = 1; i < thumbs.length; i++) {
    const block = thumbs[i];
    const linkMatch = block.match(/<h4><a href="([^"]+)">([^<]+)<\/a>/i) || block.match(/<div class="caption">[\s\S]*?<a href="([^"]+)">([^<]+)<\/a>/i);
    const imgMatch = block.match(/<img[^>]*src="([^"]+)"/i);
    const saveMatch = block.match(/class="badge-save">Save:\s*([^<]+)<\/span>/i);
    const priceNewMatch = block.match(/class="price-new">([^<]+)<\/span>/i);
    const priceOldMatch = block.match(/class="price-old">([^<]+)<\/span>/i);
    const priceSingleMatch = block.match(/<p class="price">\s*([0-9,]+৳?)/i);
    const isOut = block.includes('Out Of Stock') || block.includes('stock-status');

    if (linkMatch) {
      const link = linkMatch[1];
      const title = linkMatch[2].trim();
      const image = imgMatch ? imgMatch[1] : '';

      let priceStr = priceNewMatch ? priceNewMatch[1] : (priceSingleMatch ? priceSingleMatch[1] : '0');
      let oldPriceStr = priceOldMatch ? priceOldMatch[1] : priceStr;

      const price = parseBdtPrice(priceStr);
      const originalPrice = parseBdtPrice(oldPriceStr) || price;
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      const offers = [];
      if (saveMatch) offers.push(`Save ${saveMatch[1].trim()}`);
      offers.push('Authentic BD Stock');

      if (price > 0) {
        items.push({
          source: 'Skyland BD',
          storeDomain: 'skyland.com.bd',
          storeLogo: '🛸',
          title,
          link,
          image,
          price,
          originalPrice,
          discount,
          offers,
          inStock: !isOut,
          badge: 'Gaming Hardware Specialist'
        });
      }
    }
  }

  return items;
}

module.exports = { scrapeSkyland };
