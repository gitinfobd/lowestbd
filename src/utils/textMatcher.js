/**
 * Precision Relevance Matching & Anti-False-Positive Engine
 */

const ACCESSORY_WORDS = new Set([
  'bracket', 'support', 'holder', 'stand', 'mount', 'cable', 'adapter',
  'case', 'cover', 'glass', 'protector', 'film', 'skin', 'sticker', 'bag',
  'sleeve', 'strap', 'converter', 'hub', 'dock', 'docking', 'splitter',
  'charger', 'keychain', 'toy', 'dummy', 'fan', 'cooling', 'paste',
  'shroud', 'backplate', 'plate', 'battery', 'housing', 'body', 'display'
]);

// Known tech brands for brand conflict detection
const TECH_BRANDS = [
  'apple', 'iphone', 'samsung', 'oppo', 'vivo', 'xiaomi', 'redmi', 'realme',
  'oneplus', 'google', 'pixel', 'motorola', 'infinix', 'tecno', 'walton',
  'asus', 'msi', 'gigabyte', 'zotac', 'pny', 'palit', 'colorful', 'sapphire',
  'logitech', 'razer', 'corsair', 'steelseries', 'fantech', 'havit', 'ugreen', 'anker'
];

/**
 * Tokenize string into normalized lowercase alphanumeric words
 * @param {string} str
 * @returns {string[]}
 */
function tokenize(str) {
  if (!str) return [];
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Calculate relevance score between search query and product title
 * @param {string} query - User search query
 * @param {string} title - Product title
 * @returns {number} Score between 0 and 1
 */
function calculateRelevance(query, title) {
  if (!query || !title) return 0;

  const queryTokens = tokenize(query);
  const titleTokens = tokenize(title);
  const titleSet = new Set(titleTokens);

  if (queryTokens.length === 0 || titleTokens.length === 0) return 0;

  // 1. Accessory check
  const queryHasAccessory = queryTokens.some(t => ACCESSORY_WORDS.has(t));
  if (!queryHasAccessory) {
    const titleHasAccessory = titleTokens.some(t => ACCESSORY_WORDS.has(t));
    if (titleHasAccessory) {
      return 0; // Completely reject accessories when searching for the core device
    }
  }

  // 2. Brand conflict check
  // If query specifies a brand (e.g. iphone or samsung), ensure title doesn't belong to a different phone brand
  const queryBrand = TECH_BRANDS.find(b => queryTokens.includes(b));
  if (queryBrand) {
    const titleBrand = TECH_BRANDS.find(b => titleTokens.includes(b));
    if (titleBrand && titleBrand !== queryBrand) {
      // E.g. Query asked for iPhone, title is Oppo or Ugreen
      return 0;
    }
    // Also if query specified a brand, title MUST contain that brand
    if (!titleTokens.includes(queryBrand)) {
      return 0;
    }
  }

  // 3. Exact Model Token Match
  // E.g., for 'iphone 15' or 'rtx 4060', both '15' or '4060' must be distinct tokens in the title
  const numericTokens = queryTokens.filter(t => /^[0-9]+[a-z]*$/i.test(t) || /^[a-z]+[0-9]+$/i.test(t));
  for (const nt of numericTokens) {
    const foundExact = titleTokens.some(tt => tt === nt || tt.startsWith(nt));
    if (!foundExact) {
      return 0; // Crucial model identifier is missing
    }
  }

  // 4. Token coverage check
  // For queries with 1-3 tokens, at least 80% of tokens must exist
  let matchedCount = 0;
  for (const q of queryTokens) {
    if (titleSet.has(q)) {
      matchedCount++;
    } else if (titleTokens.some(tt => tt.includes(q))) {
      matchedCount += 0.8;
    }
  }

  const coverage = matchedCount / queryTokens.length;
  if (queryTokens.length <= 3 && coverage < 0.75) {
    return 0; // Require high precision for short targeted queries
  }

  return Math.min(1, Math.max(0, coverage));
}

/**
 * Clean & normalize price number from various Bangladeshi formats
 * @param {string|number} rawPrice
 * @returns {number}
 */
function parseBdtPrice(rawPrice) {
  if (typeof rawPrice === 'number') return Math.round(rawPrice);
  if (!rawPrice) return 0;
  const cleaned = String(rawPrice).replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

module.exports = {
  tokenize,
  calculateRelevance,
  parseBdtPrice
};
