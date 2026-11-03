const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Star Tech BD Live Scraper
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeStarTech(query) {
  const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  if (!html) return [];

  const items = [];
  const rawItems = html.split('<div class="p-item">');

  for (let i = 1; i < rawItems.length; i++) {
    const block = rawItems[i];
    const nameMatch = block.match(/<h4 class="p-item-name">\s*<a href="([^"]+)">([\s\S]*?)<\/a>/i);
    const imgMatch = block.match(/<div class="p-item-img"><a[^>]*><img[^>]*src="([^"]+)"/i);
    const newPriceMatch = block.match(/class="price-new">([^<]+)<\/span>/i);
    const oldPriceMatch = block.match(/class="price-old">([^<]+)<\/span>/i);
    const singlePriceMatch = block.match(/<div class="p-item-price">\s*<span>([^<]+)<\/span>/i);
    const saveMatch = block.match(/class="mark">Save:\s*([^<]+)<\/span>/i);
    const isOut = block.includes('Out Of Stock') || block.includes('stock-status') || block.includes('Upcoming');

    if (nameMatch) {
      const link = nameMatch[1];
      const title = nameMatch[2].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
      const image = imgMatch ? imgMatch[1] : '';
      let priceStr = newPriceMatch ? newPriceMatch[1] : (singlePriceMatch ? singlePriceMatch[1] : '0');
      let oldPriceStr = oldPriceMatch ? oldPriceMatch[1] : priceStr;

      const price = parseBdtPrice(priceStr);
      const originalPrice = parseBdtPrice(oldPriceStr) || price;
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      const offers = [];
      if (saveMatch) {
        offers.push(`Save ${saveMatch[1].trim()}`);
      }
      if (price > 0 && !isOut) {
        offers.push('Official Warranty');
      }

      items.push({
        source: 'Star Tech',
        storeDomain: 'startech.com.bd',
        storeLogo: '⭐',
        title,
        link,
        image,
        price,
        originalPrice,
        discount,
        offers,
        inStock: !isOut && price > 0,
        badge: 'Verified Retailer'
      });
    }
  }

  return items;
}

module.exports = { scrapeStarTech };
