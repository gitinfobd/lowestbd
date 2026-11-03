const { fetchHtml } = require('./curlFetcher');
const { parseBdtPrice } = require('./textMatcher');
const { KNOWN_STORES } = require('../scrapers/universalBd');

/**
 * Inspect any pasted Bangladeshi tech product URL
 * @param {string} targetUrl
 * @returns {Promise<object|null>}
 */
async function inspectUrl(targetUrl) {
  if (!targetUrl || !/^https?:\/\//i.test(targetUrl.trim())) return null;

  const cleanUrl = targetUrl.trim();
  let domain = '';
  try {
    domain = new URL(cleanUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return null;
  }

  // 1. DuckDuckGo site search without http/https protocol
  const siteTarget = cleanUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:' + siteTarget)}`;
  const ddgHtml = await fetchHtml(ddgUrl, { timeout: 10000 });

  let title = '';
  let snippet = '';
  let foundPrice = 0;

  if (ddgHtml) {
    const titleMatch = ddgHtml.match(/<h2 class="result__title">[\s\S]*?<a rel="nofollow" class="result__a"[^>]*>([\s\S]*?)<\/a>/i);
    const snippetMatch = ddgHtml.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);

    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\|\|.*$/, '').trim();
    }
    if (snippetMatch) {
      snippet = snippetMatch[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
    }

    const text = `${title} ${snippet}`;
    const pricePatterns = [
      /(?:price\s*is|bdt|৳|tk\.?|টাকা)\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})/i,
      /([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})\s*(?:bdt|৳|tk\.?|\/-|টাকা)/i
    ];

    for (const p of pricePatterns) {
      const m = text.match(p);
      if (m) {
        const val = parseBdtPrice(m[1]);
        if (val >= 150) {
          foundPrice = val;
          break;
        }
      }
    }
  }

  // 2. Try direct page fetch if title or price wasn't found
  if (!title || foundPrice === 0) {
    const pageHtml = await fetchHtml(cleanUrl, { timeout: 10000 });
    if (pageHtml && !pageHtml.includes('Just a moment...') && !pageHtml.includes('Attention Required!')) {
      const ogTitle = pageHtml.match(/<meta property="og:title" content="([^"]+)"/i) || pageHtml.match(/<title>([^<]+)<\/title>/i);
      const ogPrice = pageHtml.match(/<meta property="product:price:amount" content="([^"]+)"/i) ||
                      pageHtml.match(/class="[^"]*price[^"]*"[^>]*>[\s\S]*?([0-9,]+)/i);

      if (ogTitle && !title) title = ogTitle[1].replace(/\|.*$/, '').trim();
      if (ogPrice && foundPrice === 0) foundPrice = parseBdtPrice(ogPrice[1]);
    }
  }

  // Fallback title from URL slug if still empty
  if (!title) {
    try {
      const pathname = new URL(cleanUrl).pathname.replace(/\/$/, '');
      const parts = pathname.split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || '';
      title = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } catch(e) {}
  }

  if (!title) return null;

  const storeInfo = KNOWN_STORES[domain] || {
    name: domain.charAt(0).toUpperCase() + domain.slice(1).replace(/\.com|\.bd/g, '') + ' BD',
    logo: '🏬',
    badge: 'Direct Product Link'
  };

  return {
    source: storeInfo.name,
    storeDomain: domain,
    storeLogo: storeInfo.logo,
    title,
    link: cleanUrl,
    image: '',
    price: foundPrice,
    originalPrice: foundPrice,
    discount: 0,
    offers: ['Pasted Product Link', 'Verified Stock Page'],
    inStock: true,
    badge: storeInfo.badge,
    snippet: snippet.substring(0, 180),
    isPastedUrl: true
  };
}

module.exports = { inspectUrl };
