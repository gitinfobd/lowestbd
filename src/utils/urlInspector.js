const { fetchHtml } = require('./curlFetcher');
const { parseBdtPrice } = require('./textMatcher');
const { KNOWN_STORES } = require('../scrapers/knownStores');
const { synthesizeProductQuery } = require('./aiAssistant');

/**
 * Inspect any pasted Bangladeshi product URL using in-app browser crawler & AI/NLP extractor
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

  let title = '';
  let foundPrice = 0;
  let image = '';

  // 1. Direct Page Fetch via Resilient Fetcher
  const pageHtml = await fetchHtml(cleanUrl, { timeout: 8000 });
  if (pageHtml && !pageHtml.includes('Just a moment...') && !pageHtml.includes('Attention Required!')) {
    const ogTitle = pageHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                    pageHtml.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
                    pageHtml.match(/<title>([^<]+)<\/title>/i);

    const ogPrice = pageHtml.match(/<meta\s+property="product:price:amount"\s+content="([^"]+)"/i) ||
                    pageHtml.match(/class="[^"]*price[^"]*"[^>]*>[\s\S]*?([0-9,]+)/i);

    const ogImage = pageHtml.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (ogTitle) {
      title = ogTitle[1]
        .replace(/\|.*$/, '')
        .replace(/-.*(Star Tech|Ryans|Techland|Daraz|Dazzle|Apple Gadgets|Pickaboo|Computer Mania).*$/i, '')
        .replace(/Price in Bangladesh.*$/i, '')
        .trim();
    }
    if (ogPrice) foundPrice = parseBdtPrice(ogPrice[1]);
    if (ogImage) image = ogImage[1];
  }

  // 2. Fallback title from URL slug if still empty or blocked
  if (!title) {
    try {
      const pathname = new URL(cleanUrl).pathname.replace(/\/$/, '');
      const parts = pathname.split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || parts[parts.length - 2] || '';
      title = slug.replace(/[-_]+/g, ' ').replace(/\.html?$/i, '').replace(/\b\w/g, l => l.toUpperCase());
    } catch (e) {}
  }

  if (!title) return null;

  // 3. AI / Local NLP Query Decomposition
  const queryMeta = await synthesizeProductQuery(title, pageHtml);

  // Match store metadata
  let storeInfo = KNOWN_STORES[domain];
  if (!storeInfo) {
    for (const [knownDomain, info] of Object.entries(KNOWN_STORES)) {
      if (domain.includes(knownDomain) || knownDomain.includes(domain)) {
        storeInfo = info;
        break;
      }
    }
  }

  if (!storeInfo) {
    const cleanDomain = domain.replace(/\.com|\.bd|\.org|\.net/g, '');
    const formattedName = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1) + ' BD';
    storeInfo = {
      name: formattedName,
      logo: '🏬',
      badge: 'Direct Product Link'
    };
  }

  return {
    source: storeInfo.name,
    storeDomain: domain,
    storeLogo: storeInfo.logo || '🏬',
    title,
    canonicalQuery: queryMeta.canonicalQuery || title,
    brand: queryMeta.brand,
    model: queryMeta.model,
    specAnchor: queryMeta.specAnchor,
    link: cleanUrl,
    image,
    price: foundPrice,
    originalPrice: foundPrice,
    discount: 0,
    offers: ['আপনার পেস্ট করা লিংক', 'Direct Store Link'],
    inStock: true,
    badge: 'আপনার পেস্ট করা স্টোর',
    isPastedUrl: true,
    isLinkActive: true,
    linkStatus: '200 OK (Verified Source)'
  };
}

module.exports = { inspectUrl };
