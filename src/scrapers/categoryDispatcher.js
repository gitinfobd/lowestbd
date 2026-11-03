const { fetchHtml } = require('../utils/curlFetcher');
const { parseBdtPrice } = require('../utils/textMatcher');
const { cleanMerchantUrl, isLinkActive } = require('../utils/linkVerifier');
const { getStoresForCategory, CATEGORY_LEXICON } = require('../categoryRouter');

/**
 * Category-Targeted Multi-Store Parallel Scraping Engine
 * Visits and scans stores of the detected category in parallel
 * @param {string} query - Product search keyword
 * @param {object} categoryMeta - Category metadata { id, nameEn, nameBn, icon }
 * @returns {Promise<Array>} Array of verified product deals
 */
async function scrapeCategoryStores(query, categoryMeta) {
  const cleanQ = (query || '').replace(/[,\-_]+/g, ' ').trim();
  if (!cleanQ) return [];

  const catId = categoryMeta ? categoryMeta.id : 'all';
  const categoryStores = getStoresForCategory(catId);

  // Collect unique domains from this category's 105+ stores
  const categoryDomains = [];
  const domainToStoreMap = new Map();

  for (const s of categoryStores) {
    const rawDomain = s.Domain || (s.Website_URL ? new URL(s.Website_URL).hostname.replace(/^www\./, '') : null);
    if (rawDomain && !domainToStoreMap.has(rawDomain)) {
      domainToStoreMap.set(rawDomain, {
        name: s.Website_Name,
        url: s.Website_URL,
        specialty: s["Products_Specialty (পণ্যের ধরন)"] || categoryMeta.nameEn,
        area: s["Delivery_Area (ডেলিভারি এরিয়া)"] || "সারা বাংলাদেশ"
      });
      categoryDomains.push(rawDomain);
    }
  }

  // Construct search queries targeting category-specific stores
  const searchQueries = [];

  // Query 1: Universal Category Query
  searchQueries.push(`${cleanQ} ${categoryMeta.nameEn ? categoryMeta.nameEn.split(',')[0] : ''} price in bangladesh`);

  // Query 2: Top 6 Stores Cluster of this category
  if (categoryDomains.length > 0) {
    const cluster1 = categoryDomains.slice(0, 6).map(d => `site:${d}`).join(' OR ');
    searchQueries.push(`${cleanQ} ${cluster1}`);
  }

  // Query 3: Next 6 Stores Cluster of this category
  if (categoryDomains.length > 6) {
    const cluster2 = categoryDomains.slice(6, 12).map(d => `site:${d}`).join(' OR ');
    searchQueries.push(`${cleanQ} ${cluster2}`);
  }

  // Query 4: Daraz + Category Megastore sweep
  searchQueries.push(`${cleanQ} site:daraz.com.bd OR site:pickaboo.com OR site:othoba.com`);

  const results = [];
  const seenUrls = new Set();

  // Run DuckDuckGo sweeps in parallel across the clusters
  const searchPromises = searchQueries.map(async (q) => {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
      const html = await fetchHtml(url, { timeout: 8000 });
      if (!html) return [];

      const titleRegex = /<h2 class="result__title">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/gi;
      const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

      const titles = [...html.matchAll(titleRegex)];
      const snippets = [...html.matchAll(snippetRegex)];
      const batch = [];

      for (let i = 0; i < titles.length; i++) {
        const rawUrl = titles[i][1];
        const cleanUrl = cleanMerchantUrl(rawUrl);
        if (!cleanUrl || seenUrls.has(cleanUrl)) continue;

        let hostname = '';
        try {
          hostname = new URL(cleanUrl).hostname.replace(/^www\./, '');
        } catch (e) {
          continue;
        }

        seenUrls.add(cleanUrl);

        const rawTitle = titles[i][2].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
        const snippet = snippets[i] ? snippets[i][1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim() : '';
        const combinedText = `${rawTitle} ${snippet}`;

        // Extract Price in BDT
        const pricePatterns = [
          /(?:BDT|৳|Tk\.?|টাকা|price\s*is|only)\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{2,7})/i,
          /([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{2,7})\s*(?:৳|Tk\.?|\/-|টাকা|BDT)/i,
          /from\s*(?:BDT|৳|Tk\.?)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{2,7})/i
        ];

        let foundPrice = 0;
        for (const p of pricePatterns) {
          const match = combinedText.match(p);
          if (match) {
            const val = parseBdtPrice(match[1]);
            if (val >= 30 && val <= 5000000) {
              foundPrice = val;
              break;
            }
          }
        }

        // Extract Discount
        let discount = 0;
        const discountMatch = combinedText.match(/([0-9]{1,2})%\s*(?:off|discount|ছাড়)/i);
        if (discountMatch) {
          discount = parseInt(discountMatch[1], 10);
        }

        // Determine Store Name & Branding
        let storeInfo = domainToStoreMap.get(hostname);
        let storeName = storeInfo ? storeInfo.name : hostname;

        if (!storeInfo) {
          // Check common store brands
          for (const [dom, meta] of domainToStoreMap.entries()) {
            if (hostname.includes(dom) || dom.includes(hostname)) {
              storeInfo = meta;
              storeName = meta.name;
              break;
            }
          }
        }

        if (hostname.includes('daraz')) storeName = 'Daraz Bangladesh';
        else if (hostname.includes('rokomari')) storeName = 'Rokomari Books';
        else if (hostname.includes('chaldal')) storeName = 'Chaldal Grocery';
        else if (hostname.includes('arogga')) storeName = 'Arogga Pharmacy';
        else if (hostname.includes('shajgoj')) storeName = 'Shajgoj Beauty';
        else if (hostname.includes('aarong')) storeName = 'Aarong Fashion';
        else if (hostname.includes('hatil')) storeName = 'Hatil Furniture';
        else if (hostname.includes('apex')) storeName = 'Apex Footwear';
        else if (hostname.includes('bata')) storeName = 'Bata Bangladesh';

        const inStock = !combinedText.toLowerCase().includes('out of stock') &&
                        !combinedText.toLowerCase().includes('স্টক আউট') &&
                        !combinedText.toLowerCase().includes('unavailable');

        const title = rawTitle.replace(/\s*\|.*$/, '').replace(/\s*-.*$/, '').trim();

        batch.push({
          title: title || rawTitle,
          price: foundPrice,
          priceDisplay: foundPrice > 0 ? `৳${foundPrice.toLocaleString()}` : 'দাম জানতে ভিজিট করুন',
          link: cleanUrl,
          source: storeName,
          storeDomain: hostname,
          category: categoryMeta.id,
          categoryNameBn: categoryMeta.nameBn,
          badge: storeInfo ? 'Verified Category Store' : 'Active BD Store',
          discount: discount > 0 ? discount : null,
          inStock,
          deliveryArea: storeInfo ? storeInfo.area : 'সারা বাংলাদেশ'
        });
      }

      return batch;
    } catch (err) {
      return [];
    }
  });

  const settled = await Promise.allSettled(searchPromises);
  for (const s of settled) {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      results.push(...s.value);
    }
  }

  return results;
}

module.exports = { scrapeCategoryStores };
