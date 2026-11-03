/**
 * Precision Relevance Matching & Hardware Specification Verifier Agent
 * Enforces zero-tolerance rules for RAM gen, Chipsets, Capacity, and CPU accessories.
 */

const ACCESSORY_WORDS = new Set([
  'bracket', 'support', 'holder', 'stand', 'mount', 'cable', 'adapter',
  'case', 'cover', 'glass', 'protector', 'film', 'skin', 'sticker', 'bag',
  'sleeve', 'strap', 'converter', 'hub', 'dock', 'docking', 'splitter',
  'charger', 'keychain', 'toy', 'dummy', 'thermal paste', 'layout',
  'keyboard', 'keypad', 'keys', 'shroud', 'backplate', 'plate', 'housing',
  'hinge', 'caddy', 'connector', 'screws', 'bezel', 'cooler', 'fan', 'radiator',
  'heatsink', 'cooling'
]);

const TECH_BRANDS = [
  'acer', 'asus', 'msi', 'lenovo', 'hp', 'dell', 'apple', 'iphone', 'macbook',
  'samsung', 'oppo', 'vivo', 'xiaomi', 'redmi', 'realme', 'oneplus', 'google',
  'pixel', 'motorola', 'infinix', 'tecno', 'walton', 'gigabyte', 'zotac', 'pny',
  'palit', 'colorful', 'sapphire', 'logitech', 'razer', 'corsair', 'steelseries',
  'fantech', 'havit', 'ugreen', 'anker', 'amd', 'intel', 'nvidia', 'lexar', 'team'
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
 * Extract storage or RAM capacity in MB/GB/TB (normalized to lowercase, e.g. '512gb')
 * @param {string} str
 * @returns {string|null}
 */
function extractCapacity(str) {
  const match = str.toLowerCase().match(/\b([0-9]{1,4})\s*(gb|tb|mb)\b/);
  return match ? `${match[1]}${match[2]}` : null;
}

/**
 * Extract all capacity tokens from string
 * @param {string} str
 * @returns {string[]}
 */
function extractAllCapacities(str) {
  const matches = [...str.toLowerCase().matchAll(/\b([0-9]{1,4})\s*(gb|tb|mb)\b/g)];
  return matches.map(m => `${m[1]}${m[2]}`);
}

/**
 * Extract motherboard chipset family (e.g. 'b650', 'b550', 'b450', 'h610', 'z790')
 * @param {string} str
 * @returns {string|null}
 */
function extractChipset(str) {
  const match = str.toLowerCase().match(/\b([abxz][0-9]{3}[a-z]?|h[0-9]{3}[a-z]?)\b/);
  return match ? match[1].replace(/m$/, '') : null;
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

  // Clean punctuation including commas, semicolons, brackets
  str = str.replace(/[,;()[\]{},:"'”’\\/|]/g, ' ');

  // Preserve model numbers like rtx4060 -> rtx 4060, b650m -> b650m, m6 -> m6
  str = str.replace(/([a-zA-Z]{2,})([0-9]+)/g, '$1 $2').replace(/([0-9]+)([a-zA-Z]{2,})/g, '$1 $2');

  const noiseRegex = /\b(15\.6["”']?|14["”']?|16["”']?|13\.3["”']?|17\.3["”']?|fhd|qhd|uhd|4k|2k|ips|oled|144hz|165hz|240hz|360hz|display|screen|model|edition|gaming|notebook|processor|graphics|dedicated|price|bd|bangladesh|buy|online|official|unofficial|brand|new|in|ram|ssd|hdd|ddr4|ddr5|nvme|pcie|gen4|gen3|rgb|wifi|bluetooth|dos|windows|win11|year|warranty|2023|2024|2025|2026)\b/gi;

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
    '7600', '7600x', '5600', '5600x', '5600g', '7700', '7800x3d',
    '7735hs', '13420h', '13620h', '14700hx', 'm1', 'm2', 'm3', 'm4',
    'plus', 'pro', 'max', 'ultra', 'ti', 'super', 'air', 'mini', 'nitro',
    'b650', 'b650m', 'b550', 'b450', 'b760', 'h610', 'z790',
    'nm620', 'nm790', '980', '990', 'sn580', 'sn770', 'mp225', 'ddr5', 'ddr4'
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
 * Applies strict hardware generation and capacity isolation.
 * @param {string} rawQuery - User search query or distilled query
 * @param {string} title - Candidate product title
 * @param {number} [price=0] - Product price for category threshold validation
 * @returns {number} Score between 0 and 1 (0 = strictly rejected)
 */
function calculateRelevance(rawQuery, title, price = 0) {
  if (!rawQuery || !title) return 0;

  const rawLower = rawQuery.toLowerCase();
  const titleLower = title.toLowerCase();
  const titleTokens = tokenize(title);
  const titleSet = new Set(titleTokens);

  // =========================================================================
  // ZERO-TOLERANCE RULE 1: Memory Generation Isolation (DDR5 vs DDR4 vs DDR3)
  // =========================================================================
  const queryHasDdr5 = /\bddr5\b/i.test(rawLower);
  const queryHasDdr4 = /\bddr4\b/i.test(rawLower);
  const queryHasDdr3 = /\bddr3\b/i.test(rawLower);

  if (queryHasDdr5) {
    if (/\bddr4\b/i.test(titleLower) || /\bddr3\b/i.test(titleLower)) {
      return 0; // Strict rejection: User asked for DDR5, title has DDR4/DDR3!
    }
    if (!/\bddr5\b/i.test(titleLower)) {
      return 0; // DDR5 must be present in title
    }
  } else if (queryHasDdr4) {
    if (/\bddr5\b/i.test(titleLower) || /\bddr3\b/i.test(titleLower)) {
      return 0; // User asked for DDR4, title has DDR5
    }
    if (!/\bddr4\b/i.test(titleLower)) {
      return 0;
    }
  }

  // =========================================================================
  // ZERO-TOLERANCE RULE 2: Motherboard Chipset Architecture Lock (B650 vs B450/B560)
  // =========================================================================
  const queryChipset = extractChipset(rawLower);
  if (queryChipset) {
    const titleChipset = extractChipset(titleLower);
    if (titleChipset && titleChipset !== queryChipset) {
      return 0; // Strict rejection: Mismatched chipset family (e.g. B450 or B560 instead of B650)!
    }
    if (!titleLower.includes(queryChipset)) {
      return 0; // Target chipset must be in product title
    }
  }

  // =========================================================================
  // ZERO-TOLERANCE RULE 3: Storage Capacity Exact Match (512GB vs 64GB/256GB)
  // =========================================================================
  const queryCapacity = extractCapacity(rawLower);
  if (queryCapacity) {
    const titleCapacities = extractAllCapacities(titleLower);
    if (titleCapacities.length > 0) {
      // If none of the title capacities match the requested capacity, reject!
      const hasMatchingCapacity = titleCapacities.includes(queryCapacity);
      if (!hasMatchingCapacity) {
        return 0; // Strict rejection: e.g. 64GB or 256GB when user asked for 512GB!
      }
    }
  }

  // =========================================================================
  // ZERO-TOLERANCE RULE 4: SSD vs Pen Drive / Flash Drive Isolation
  // =========================================================================
  const isSsdQuery = /\b(ssd|nvme|m\.2|nm620|nm790|980|990|sn580|sn770|sn850)\b/i.test(rawLower);
  if (isSsdQuery) {
    if (/\b(pen\s*drive|pendrive|flash\s*drive|thumb\s*drive|usb\s*drive|sd\s*card|micro\s*sd|otg)\b/i.test(titleLower)) {
      return 0; // Strict rejection: Flash drive/pen drive is NOT an SSD!
    }
  }

  // =========================================================================
  // ZERO-TOLERANCE RULE 5: CPU Processor vs CPU Cooler/Accessory Purge
  // =========================================================================
  const isCpuQuery = /\b(ryzen|processor|cpu|7600|7600x|5600|5600x|5600g|7500f|7700|7800x3d|12400|13400|14400|13600k|14700k)\b/i.test(rawLower);
  const queryWantsCooler = /\b(cooler|fan|radiator|heatsink)\b/i.test(rawLower);

  if (isCpuQuery && !queryWantsCooler) {
    // If title has cooler/fan/radiator or accessory phrasing like "suit for", reject!
    if (/\b(cooler|fan|radiator|heatsink|air\s*cooler|liquid\s*cooler|case\s*fan|thermal\s*paste|bracket|suit\s*for|for\s*ryzen|for\s*am5|for\s*am4|for\s*intel)\b/i.test(titleLower)) {
      return 0; // Strict rejection: That is a cooler/accessory, NOT the processor!
    }
    // Desktop CPU price sanity (modern desktop processors cannot be under ৳7,000)
    if (price > 0 && price < 7000) {
      return 0; // Reject false accessory listings
    }
  }

  // =========================================================================
  // ZERO-TOLERANCE RULE 6: Apple Mac & Apple Silicon Chip Isolation (M1 - M6)
  // =========================================================================
  const queryWantsMac = /\b(mac|macbook|imac|mac\s*mini|mac\s*studio|mac\s*pro)\b/i.test(rawLower);
  if (queryWantsMac) {
    const titleHasMacOrApple = /\b(mac|macbook|imac|apple)\b/i.test(titleLower);
    if (!titleHasMacOrApple) {
      return 0; // Strict rejection: Not an Apple / Mac device!
    }
    // Purge industrial splicers, cables, adapters, optical tools
    if (/\b(splicer|fiberfox|welder|cleaver|stripper|patch\s*cord|splitter|machine)\b/i.test(titleLower)) {
      return 0; // Strict rejection: Splicer machine is NOT a Mac!
    }
  }

  // Apple M-Series chip lock (m1, m2, m3, m4, m5, m6)
  const mChipMatch = rawLower.match(/\b(m[1-9](?:\s*(?:pro|max|ultra))?)\b/i);
  if (mChipMatch) {
    const reqChip = mChipMatch[1].replace(/\s+/g, '').toLowerCase();
    const titleHasReqChip = titleTokens.some(tt => tt === reqChip || tt.startsWith(reqChip)) || titleLower.includes(mChipMatch[1].toLowerCase());
    if (!titleHasReqChip) {
      return 0; // Strict rejection: Target Apple M-chip missing in product!
    }
  }

  // =========================================================================
  // ZERO-TOLERANCE RULE 7: Exact Hardware Model Number Anchor Matching
  // =========================================================================
  // Extract key model numbers like 7600, 5600, 4060, 620, 225, m6
  const modelNumbers = rawLower.match(/\b([0-9]{3,4}[a-z]*|[a-z]+[0-9]{1,4})\b/g) || [];
  for (const mn of modelNumbers) {
    // Ignore common spec numbers & generic words
    if (['144', '165', '240', '360', '2023', '2024', '2025', '2026', 'gb', 'tb', 'mb', 'hz'].includes(mn)) continue;

    // Check if title has this exact model number
    const foundModelNumber = titleTokens.some(tt => tt === mn || tt.startsWith(mn) || tt.endsWith(mn));
    if (!foundModelNumber) {
      return 0; // Critical hardware model number missing!
    }
  }

  // =========================================================================
  // Standard Accessory & Category Threshold Validations
  // =========================================================================
  const isLaptop = /\b(laptop|nitro|macbook|thinkpad|zenbook|vivobook|legion|victus|omen|predator|tuf)\b/i.test(rawLower);
  if (isLaptop && price > 0 && price < 20000) {
    return 0; // Filter out replacement keyboards, fans, chargers
  }

  const isGpu = /\b(4060|4070|4080|4090|5060|3060|3070|3080)\b/i.test(rawLower);
  if (isGpu && !isLaptop && price > 0 && price < 15000) {
    return 0; // Filter out GPU brackets, stickers
  }

  // Reject generic accessories if query didn't want them
  const queryHasAccessory = tokenize(rawLower).some(t => ACCESSORY_WORDS.has(t));
  if (!queryHasAccessory) {
    const titleHasAccessory = titleTokens.some(t => ACCESSORY_WORDS.has(t));
    if (titleHasAccessory) {
      return 0;
    }
  }

  // Brand conflict check
  const queryTokens = tokenize(distillQuery(rawQuery));
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

  // Compute soft relevance ratio
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
  parseBdtPrice,
  extractCapacity,
  extractChipset
};
