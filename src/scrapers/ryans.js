const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Ryans Computers BD Scraper
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeRyans(query) {
  const url = `https://www.ryans.com/search?search=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  if (!html) return [];

  const items = [];
  const cards = html.split('<div class="card-body text-center">');

  for (let i = 1; i < cards.length; i++) {
    const c = cards[i];
    const titleMatch = c.match(/<h4 class="product-title">\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const imgMatch = c.match(/<img[^>]*class="[^"]*card-img-top[^"]*"[^>]*src="([^"]+)"/i) || c.match(/<img[^>]*src="([^"]+)"/i);
    const priceMatch = c.match(/pr-text">\s*Tk\s*([0-9,]+)/i) || c.match(/Tk\s*([0-9,]+)/i);
    const oldPriceMatch = c.match(/text-decoration-line-through[^>]*>\s*Tk\s*([0-9,]+)/i);
    const isOut = c.includes('Out of Stock') || c.includes('Stock Out') || c.includes('Upcoming');

    if (titleMatch) {
      const link = titleMatch[1];
      const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();
      const image = imgMatch ? imgMatch[1] : '';
      const price = priceMatch ? parseBdtPrice(priceMatch[1]) : 0;
      const originalPrice = oldPriceMatch ? parseBdtPrice(oldPriceMatch[1]) : price;
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      const offers = ['EMI Available', 'Brand Warranty', 'Free Delivery'];

      items.push({
        source: 'Ryans Computers',
        storeDomain: 'ryans.com',
        storeLogo: '💻',
        title,
        link,
        image,
        price,
        originalPrice,
        discount,
        offers,
        inStock: !isOut,
        badge: 'Official Distributor'
      });
    }
  }

  return items;
}

module.exports = { scrapeRyans };
