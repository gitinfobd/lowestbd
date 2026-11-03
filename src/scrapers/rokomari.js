const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

/**
 * Rokomari Bangladesh Live Books & Literature Scraper
 * Uses fast chunk-based parsing to avoid regex catastrophic backtracking
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeRokomari(query) {
  const url = `https://www.rokomari.com/search?term=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url, { timeout: 6000 });
  if (!html) return [];

  const items = [];
  const seenLinks = new Set();

  // 1. Process Lane cards (recommendation / popular items)
  const laneBlocks = html.split('lane_cardText');
  for (let i = 1; i < laneBlocks.length; i++) {
    const chunk = laneBlocks[i].slice(0, 1500);
    const titleMatch = chunk.match(/class="[^"]*lane_cardTitle[^"]*">([^<]+)<\/span>/i);
    const authorMatch = chunk.match(/class="[^"]*lane_cardAuthor[^"]*">([^<]+)<\/span>/i);
    const priceMatch = chunk.match(/<span>৳?([\d,]+)<\/span>/i);
    const linkMatch = chunk.match(/href="(\/book\/[0-9]+\/[^"?]+)/i);

    if (titleMatch && priceMatch) {
      const title = titleMatch[1].trim();
      const author = authorMatch ? authorMatch[1].trim() : '';
      const price = parseBdtPrice(priceMatch[1]);
      const link = linkMatch ? `https://www.rokomari.com${linkMatch[1]}` : `https://www.rokomari.com/search?term=${encodeURIComponent(query)}`;

      if (title && price > 0 && !seenLinks.has(link)) {
        seenLinks.add(link);
        items.push({
          source: 'Rokomari Books',
          storeDomain: 'rokomari.com',
          storeLogo: '📚',
          title: author ? `${title} - ${author}` : title,
          link,
          price,
          originalPrice: price,
          discount: null,
          offers: ['Official Rokomari Edition', 'Doorstep Delivery'],
          inStock: true,
          category: 'books',
          categoryNameBn: 'বই, প্রকাশনী ও স্টেশনারি',
          badge: 'Verified Official Bookstore'
        });
      }
    }
  }

  // 2. Process Grid product items
  const gridBlocks = html.split('productContainer_productDetailsBody');
  for (let i = 1; i < gridBlocks.length; i++) {
    const chunk = gridBlocks[i].slice(0, 2500);
    const titleMatch = chunk.match(/class="[^"]*productTitle[^"]*">([^<]+)<\/p>/i);
    const authorMatch = chunk.match(/class="[^"]*productAuthor[^"]*">([^<]+)<\/p>/i);
    const priceMatch = chunk.match(/<span>৳?([\d,]+)<\/span>/i);
    const linkMatch = chunk.match(/href="(\/book\/[0-9]+\/[^"?]+)/i);

    if (titleMatch && priceMatch) {
      const title = titleMatch[1].trim();
      const author = authorMatch ? authorMatch[1].trim() : '';
      const price = parseBdtPrice(priceMatch[1]);
      const link = linkMatch ? `https://www.rokomari.com${linkMatch[1]}` : `https://www.rokomari.com/search?term=${encodeURIComponent(query)}`;

      if (title && price > 0 && !seenLinks.has(link)) {
        seenLinks.add(link);
        items.push({
          source: 'Rokomari Books',
          storeDomain: 'rokomari.com',
          storeLogo: '📚',
          title: author ? `${title} - ${author}` : title,
          link,
          price,
          originalPrice: price,
          discount: null,
          offers: ['Official Rokomari Edition'],
          inStock: true,
          category: 'books',
          categoryNameBn: 'বই, প্রকাশনী ও স্টেশনারি',
          badge: 'Verified Official Bookstore'
        });
      }
    }
  }

  return items;
}

module.exports = { scrapeRokomari };
