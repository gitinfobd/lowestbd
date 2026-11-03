const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Daraz Bangladesh Live JSON API Scraper
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeDaraz(query) {
  const url = `https://www.daraz.com.bd/catalog/?_keyori=ss&from=input&q=${encodeURIComponent(query)}&ajax=true`;
  const jsonStr = await fetchHtml(url);
  if (!jsonStr) return [];

  const items = [];
  try {
    const data = JSON.parse(jsonStr);
    const list = data.mods?.listItems || [];

    for (const item of list) {
      const price = parseBdtPrice(item.price);
      const originalPrice = parseBdtPrice(item.originalPrice) || price;
      let discount = 0;
      if (item.discount) {
        discount = parseBdtPrice(item.discount);
      } else if (originalPrice > price) {
        discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      let link = item.itemUrl || '';
      if (link.startsWith('//')) link = 'https:' + link;

      const offers = [];
      if (discount > 0) offers.push(`${discount}% OFF`);
      if (item.isFreeShipping) offers.push('Free Delivery');
      if (item.voucherInfo) offers.push('Voucher Available');

      items.push({
        source: 'Daraz Bangladesh',
        storeDomain: 'daraz.com.bd',
        storeLogo: '🛍️',
        title: item.name || '',
        link,
        image: item.image || '',
        price,
        originalPrice,
        discount,
        offers,
        inStock: true,
        rating: item.ratingScore ? parseFloat(item.ratingScore).toFixed(1) : null,
        reviewCount: item.review ? parseInt(item.review, 10) : 0,
        badge: item.brandName ? `Brand: ${item.brandName}` : 'Daraz Verified'
      });
    }
  } catch (err) {
    // Graceful fallback
  }

  return items;
}

module.exports = { scrapeDaraz };
