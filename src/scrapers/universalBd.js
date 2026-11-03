const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');

// Comprehensive Bangladeshi tech store directory (names, emojis, badges)
const KNOWN_STORES = {
  'area51.com.bd': { name: 'Area 51 BD', logo: '🛸', badge: 'Gaming Laptop Specialist' },
  'computermania.com.bd': { name: 'Computer Mania BD', logo: '💻', badge: 'Top Gaming Laptop Chain' },
  'itstore.com.bd': { name: 'IT Store BD', logo: '🏬', badge: 'Authentic Hardware' },
  'techlandbd.com': { name: 'TechLand BD', logo: '⚡', badge: 'Major Tech Retailer' },
  'applegadgetsbd.com': { name: 'Apple Gadgets BD', logo: '🍏', badge: 'Gadget Specialist' },
  'dazzle.com.bd': { name: 'Dazzle BD', logo: '✨', badge: 'Premium Devices' },
  'computervillage.com.bd': { name: 'Computer Village', logo: '🏙️', badge: 'Hardware Pioneer' },
  'trusttechbd.com': { name: 'Trust Computer BD', logo: '🤝', badge: 'Multiplan Center' },
  'trustcomputer.com.bd': { name: 'Trust Computer BD', logo: '🤝', badge: 'Multiplan Center' },
  'creatuscomputer.com': { name: 'Creatus Computer', logo: '🖥️', badge: 'Custom PC Builder' },
  'creatus.com.bd': { name: 'Creatus Computer', logo: '🖥️', badge: 'Custom PC Builder' },
  'potakait.com': { name: 'Potaka IT', logo: '🚩', badge: 'Gaming Hardware' },
  'ucc.com.bd': { name: 'UCC Bangladesh', logo: '🏢', badge: 'Authorized Distributor' },
  'ultratech.com.bd': { name: 'UltraTech BD', logo: '⚙️', badge: 'PC Components' },
  'pchouse.com.bd': { name: 'PC House BD', logo: '🏠', badge: 'IT Shop BD' },
  'pickaboo.com': { name: 'Pickaboo', logo: '📱', badge: 'Fast E-commerce' },
  'bdshop.com': { name: 'BDShop', logo: '📦', badge: 'Gadget & Gear' },
  'bikroy.com': { name: 'Bikroy Deals', logo: '🏷️', badge: 'Verified Listings' },
  'gamersbd.com': { name: 'Gamers BD', logo: '🎮', badge: 'Gaming Rig Specialist' },
  'custommacbd.com': { name: 'Custom Mac BD', logo: '💻', badge: 'Mac & Apple Tech' },
  'sumashtech.com': { name: 'Sumash Tech', logo: '📱', badge: 'Smartphone Hub' },
  'gadgetandgear.com': { name: 'Gadget & Gear', logo: '💎', badge: 'Authorized Apple Reseller' },
  'samson.com.bd': { name: 'Samson BD', logo: '🔌', badge: 'Tech Equipment' },
  'nexus.com.bd': { name: 'Nexus Computer', logo: '🌐', badge: 'Hardware Hub' },
  'krible.com.bd': { name: 'Krible BD', logo: '🛍️', badge: 'Tech Marketplace' }
};

/**
 * Format domain into clean store name
 * @param {string} hostname
 * @returns {{name: string, logo: string, badge: string}}
 */
function getStoreMeta(hostname) {
  const cleanHost = hostname.replace(/^www\./, '').toLowerCase();
  if (KNOWN_STORES[cleanHost]) {
    return KNOWN_STORES[cleanHost];
  }
  const parts = cleanHost.split('.');
  const baseName = parts[0];
  const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  return {
    name: `${capitalized} BD Tech`,
    logo: '🏬',
    badge: 'BD Retail Store'
  };
}

/**
 * Universal Bangladesh Web & Tech Aggregator (sweeps 300+ BD tech stores)
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function scrapeUniversalBd(query) {
  const queries = [
    `${query} price in bangladesh`,
    `${query} site:area51.com.bd OR site:computermania.com.bd OR site:techlandbd.com OR site:applegadgetsbd.com OR site:dazzle.com.bd OR site:itstore.com.bd OR site:startech.com.bd OR site:ryans.com`,
    `${query} site:custommacbd.com OR site:gamersbd.com OR site:skyland.com.bd OR site:creatus.com.bd OR site:potakait.com OR site:trusttechbd.com OR site:computervillage.com.bd OR site:ucc.com.bd OR site:ultratech.com.bd`
  ];

  const results = [];
  const seenUrls = new Set();

  for (const q of queries) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const html = await fetchHtml(url, { timeout: 10000 });
    if (!html) continue;

    const titleRegex = /<h2 class="result__title">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

    const titles = [...html.matchAll(titleRegex)];
    const snippets = [...html.matchAll(snippetRegex)];

    for (let i = 0; i < titles.length; i++) {
      const rawUrl = titles[i][1];
      const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
      const cleanUrl = uddgMatch ? decodeURIComponent(uddgMatch[1]) : rawUrl;

      if (!cleanUrl || seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);

      let hostname = '';
      try {
        hostname = new URL(cleanUrl).hostname;
      } catch (e) {
        continue;
      }

      // Filter to relevant BD sites or tech domains
      const isBdSite = hostname.endsWith('.bd') ||
        hostname.includes('area51') ||
        hostname.includes('computermania') ||
        hostname.includes('techland') ||
        hostname.includes('dazzle') ||
        hostname.includes('applegadgets') ||
        hostname.includes('computervillage') ||
        hostname.includes('potakait') ||
        hostname.includes('creatus') ||
        hostname.includes('startech') ||
        hostname.includes('ryans') ||
        hostname.includes('bikroy') ||
        hostname.includes('pickaboo') ||
        hostname.includes('itstore') ||
        hostname.includes('gadget');

      if (!isBdSite) continue;

      const title = titles[i][2].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\|\|.*$/, '').trim();
      const snippet = snippets[i] ? snippets[i][1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim() : '';

      const combinedText = `${title} ${snippet}`;

      // Extract BDT Price patterns
      const pricePatterns = [
        /(?:BDT|৳|Tk\.?|টাকা|price\s*is)\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})/i,
        /([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})\s*(?:৳|Tk\.?|\/-|টাকা|BDT)/i,
        /from\s*(?:BDT|৳|Tk\.?)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})/i
      ];

      let foundPrice = 0;
      for (const p of pricePatterns) {
        const match = combinedText.match(p);
        if (match) {
          const val = parseBdtPrice(match[1]);
          if (val >= 150 && val <= 5000000) {
            foundPrice = val;
            break;
          }
        }
      }

      // Extract discount & offers
      let discount = 0;
      const discountMatch = combinedText.match(/([0-9]{1,2})%\s*(?:off|discount)/i);
      if (discountMatch) {
        discount = parseInt(discountMatch[1], 10);
      }

      const offers = [];
      if (/emi/i.test(combinedText)) offers.push('0% EMI');
      if (/warranty/i.test(combinedText)) offers.push('Official Warranty');
      if (/cash discount|special price|save/i.test(combinedText)) offers.push('Cash Discount');
      if (/free delivery|free shipping/i.test(combinedText)) offers.push('Free Delivery');
      if (/exchange/i.test(combinedText)) offers.push('Exchange Offer');

      const isOut = /out of stock|stock out|unavailable/i.test(combinedText);
      const storeMeta = getStoreMeta(hostname);

      results.push({
        source: storeMeta.name,
        storeDomain: hostname.replace(/^www\./, ''),
        storeLogo: storeMeta.logo,
        title,
        link: cleanUrl,
        image: '',
        price: foundPrice,
        originalPrice: discount > 0 && foundPrice > 0 ? Math.round(foundPrice / (1 - discount / 100)) : foundPrice,
        discount,
        offers,
        inStock: !isOut,
        badge: storeMeta.badge,
        snippet: snippet.substring(0, 180)
      });
    }
  }

  return results;
}

module.exports = { scrapeUniversalBd, KNOWN_STORES };
