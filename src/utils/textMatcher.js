/**
 * Precision Relevance Matching & Adaptive Query Distiller
 */

const ACCESSORY_WORDS = new Set([
  'bracket', 'support', 'holder', 'stand', 'mount', 'cable', 'adapter',
  'case', 'cover', 'glass', 'protector', 'film', 'skin', 'sticker', 'bag',
  'sleeve', 'strap', 'converter', 'hub', 'dock', 'docking', 'splitter',
  'charger', 'keychain', 'toy', 'dummy', 'thermal paste', 'layout',
  'keyboard', 'keypad', 'keys', 'shroud', 'backplate', 'plate', 'housing',
  'hinge', 'caddy', 'connector', 'screws', 'bezel'
]);

const TECH_BRANDS = [
  'acer', 'asus', 'msi', 'lenovo', 'hp', 'dell', 'apple', 'iphone', 'macbook',
  'samsung', 'oppo', 'vivo', 'xiaomi', 'redmi', 'realme', 'oneplus', 'google',
  'pixel', 'motorola', 'infinix', 'tecno', 'walton', 'gigabyte', 'zotac', 'pny',
  'palit', 'colorful', 'sapphire', 'logitech', 'razer', 'corsair', 'steelseries',
  'fantech', 'havit', 'ugreen', 'anker', 'amd', 'intel', 'nvidia'
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
 * Distill a long product title, URL, or raw search string into optimal search keywords
 * @param {string} input
 * @returns {string}
 */
function distillQuery(input) {
  if (!input) return '';
  let str = input.trim();

  // If input is URL, extract the slug
  if (/^https?:\/\//i.test(str)) {
    try {
      const u = new URL(str);
      const pathname = u.pathname.replace(/\/$/, '');
      const parts = pathname.split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || '';
      str = slug.replace(/[-_]+/g, ' ');
    } catch (e) {}
  }

  // Separate letter-number combinations like rtx4060 -> rtx 4060
  str = str.replace(/([a-zA-Z]{2,})([0-9]+)/g, '$1 $2').replace(/([0-9]+)([a-zA-Z]{2,})/g, '$1 $2');

  const noiseRegex = /\b(15\.6["”']?|14["”']?|16["”']?|13\.3["”']?|17\.3["”']?|fhd|qhd|uhd|4k|2k|ips|oled|144hz|165hz|240hz|360hz|display|screen|model|edition|gaming|laptop|notebook|processor|graphics|dedicated|price|bd|bangladesh|buy|online|official|unofficial|brand|new|in|ram|ssd|hdd|ddr4|ddr5|nvme|pcie|gen4|gen3|rgb|wifi|bluetooth|dos|windows|win11|16gb|8gb|32gb|1tb|512gb|256gb|gb|tb|hz|year|warranty|2023|2024|2025|2026)\b/gi;

  let cleaned = str
    .replace(/[()[\]{},:;"'”’\\/|]/g, ' ')
    .replace(noiseRegex, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const allWords = cleaned.split(/\s+/).filter(w => w.length > 1);

  const primary = [];
  const anchors = [];
  const importantKeywords = new Set([
    'rtx', 'gtx', 'geforce', 'radeon', 'ryzen', 'intel', 'core',
    '4060', '4050', '3050', '4070', '4080', '4090', '5060', '5070',
    '7735hs', '13420h', '13620h', '14700hx', 'm1', 'm2', 'm3', 'm4',
    'plus', 'pro', 'max', 'ultra', 'ti', 'super', 'air', 'mini', 'nitro'
  ]);

  for (const w of allWords) {
    const lw = w.toLowerCase();
    if (importantKeywords.has(lw) || /^(r[3579]|i[3579])$/i.test(lw)) {
      anchors.push(w);
    } else if (primary.length < 3) {
      primary.push(w);
    }
  }

  const combined = Array.from(new Set([...primary, ...anchors]));
  return combined.slice(0, 5).join(' ');
}

/**
 * Calculate relevance score between search query and product title
 * @param {string} rawQuery - User search query or distilled query
 * @param {string} title - Candidate product title
 * @param {number} [price=0] - Product price for category threshold validation
 * @returns {number} Score between 0 and 1
 */
function calculateRelevance(rawQuery, title, price = 0) {
  if (!rawQuery || !title) return 0;

  const cleanQuery = distillQuery(rawQuery);
  const queryTokens = tokenize(cleanQuery);
  const titleTokens = tokenize(title);
  const titleSet = new Set(titleTokens);

  if (queryTokens.length === 0 || titleTokens.length === 0) return 0;

  // 1. Category Price Sanity Thresholds
  // If query is for a laptop/notebook/nitro/macbook and price is under 20,000 BDT -> it's an accessory/keyboard!
  const isLaptop = queryTokens.some(t => ['laptop', 'nitro', 'macbook', 'thinkpad', 'zenbook', 'vivobook', 'legion', 'victus', 'omen', 'predator', 'tuf'].includes(t));
  if (isLaptop && price > 0 && price < 20000) {
    return 0; // Filter out replacement keyboards, fans, chargers
  }

  // If query is for high-end GPU (RTX 4060, etc.) and price is under 15,000 BDT -> accessory
  const isGpu = queryTokens.some(t => ['4060', '4070', '4080', '4090', '5060', '3060', '3070', '3080'].includes(t));
  if (isGpu && !isLaptop && price > 0 && price < 15000) {
    return 0; // Filter out brackets, stickers
  }

  // 2. Reject accessories unless query explicitly wanted them
  const queryHasAccessory = queryTokens.some(t => ACCESSORY_WORDS.has(t));
  if (!queryHasAccessory) {
    const titleHasAccessory = titleTokens.some(t => ACCESSORY_WORDS.has(t));
    if (titleHasAccessory) {
      return 0;
    }
  }

  // 3. Brand conflict check
  const queryBrand = TECH_BRANDS.find(b => queryTokens.includes(b));
  if (queryBrand) {
    const titleBrand = TECH_BRANDS.find(b => titleTokens.includes(b));
    if (titleBrand && titleBrand !== queryBrand) {
      return 0; // Brand mismatch
    }
    if (!titleTokens.includes(queryBrand)) {
      return 0;
    }
  }

  // 4. Model & Series token matching
  const coreTokens = queryTokens.filter(t => t.length > 2 || /[0-9]/.test(t));
  let matchedCore = 0;

  for (const ct of coreTokens) {
    if (titleSet.has(ct)) {
      matchedCore++;
    } else if (titleTokens.some(tt => tt.includes(ct) || ct.includes(tt))) {
      matchedCore += 0.7;
    }
  }

  const coreRatio = coreTokens.length > 0 ? (matchedCore / coreTokens.length) : 0.5;

  if (coreRatio < 0.45) {
    return 0;
  }

  return Math.min(1, Math.max(0, coreRatio));
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
  distillQuery,
  calculateRelevance,
  parseBdtPrice
};
