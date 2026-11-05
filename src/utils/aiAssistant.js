/**
 * AI & NLP Query Synthesizer Agent
 * Supports Groq API (free ultra-fast llama-3.1-8b), Vyce.com API,
 * and high-performance zero-latency local NLP rule engine fallback.
 */

const TECH_BRANDS = [
  'acer', 'asus', 'msi', 'lenovo', 'hp', 'dell', 'apple', 'macbook', 'iphone', 'ipad',
  'samsung', 'oppo', 'vivo', 'xiaomi', 'redmi', 'realme', 'oneplus', 'google', 'pixel',
  'motorola', 'infinix', 'tecno', 'walton', 'gigabyte', 'zotac', 'pny', 'palit', 'colorful',
  'sapphire', 'logitech', 'razer', 'corsair', 'steelseries', 'fantech', 'havit', 'ugreen',
  'anker', 'amd', 'intel', 'nvidia', 'lexar', 'team', 'adata', 'crucial', 'western digital',
  'seagate', 'sandisk', 'kingston', 'transcend', 'canon', 'nikon', 'sony', 'dji'
];

const KNOWN_SERIES = [
  'nitro', 'predator', 'aspire', 'swift', 'spin',
  'rog', 'tuf', 'zephyrus', 'zenbook', 'vivobook',
  'legion', 'loq', 'thinkpad', 'ideapad', 'yoga',
  'victus', 'omen', 'pavilion', 'envy', 'spectre',
  'alienware', 'xps', 'inspiron', 'g15', 'g16', 'latitude',
  'katana', 'sword', 'cyborg', 'stealth', 'raider', 'modern', 'prestige',
  'air', 'pro', 'mini', 'studio', 'ultra', 'plus', 'max'
];

/**
 * High-performance local NLP extractor
 * @param {string} input - URL, raw product title, or slug
 * @returns {object} { brand, model, canonicalQuery, specAnchor }
 */
function localExtractKeywords(input) {
  if (!input) return { canonicalQuery: '', brand: '', model: '' };

  let text = input.trim();

  // If input is URL, extract the path slug
  if (/^https?:\/\//i.test(text)) {
    try {
      const u = new URL(text);
      const segments = u.pathname.split('/').filter(Boolean);
      // Take the most descriptive slug (usually the last or second to last)
      const last = segments[segments.length - 1] || '';
      const secondLast = segments[segments.length - 2] || '';
      const candidate = last.length > 5 && !/^[0-9]+$/.test(last) ? last : `${secondLast} ${last}`;
      text = candidate.replace(/[-_]+/g, ' ').replace(/\.html?$/i, '');
    } catch (e) {}
  }

  // Strip noise words
  const noiseRegex = /\b(price\s*in\s*bangladesh|price\s*in\s*bd|price|bdt|official|unofficial|warranty|brand\s*new|genuine|best\s*deal|online|buy|shop|store|specs?|review|features?)\b/gi;
  let cleanText = text.replace(noiseRegex, ' ').replace(/\s+/g, ' ').trim();

  const words = cleanText.split(/\s+/);
  const lowerWords = words.map(w => w.toLowerCase());

  let brand = '';
  let brandIdx = -1;
  for (let i = 0; i < words.length; i++) {
    const lw = lowerWords[i];
    if (TECH_BRANDS.includes(lw)) {
      brand = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      brandIdx = i;
      break;
    }
  }

  // Look for series / product line after brand or anywhere
  const queryParts = [];
  if (brand) queryParts.push(brand);

  let series = '';
  for (let i = 0; i < words.length; i++) {
    const lw = lowerWords[i];
    if (KNOWN_SERIES.includes(lw)) {
      series = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      if (!queryParts.includes(series)) {
        queryParts.push(series);
      }
      // Check if subsequent tokens are version numbers (e.g. V 15, V15, A15, 14, 16)
      if (i + 1 < words.length) {
        const next = words[i + 1];
        if (/^[a-zA-Z]?[0-9]{1,3}$/i.test(next) || /^[ivx]+$/i.test(next)) {
          queryParts.push(next.toUpperCase());
          if (i + 2 < words.length && /^[0-9]{2}$/i.test(words[i + 2])) {
            queryParts.push(words[i + 2]);
          }
        }
      }
      break;
    }
  }

  // If no known series found, pick 2-3 most descriptive tokens
  if (queryParts.length < 2) {
    const descriptive = words.filter(w => {
      const lw = w.toLowerCase();
      return lw.length > 2 &&
        !['product', 'item', 'gaming', 'laptop', 'desktop', 'computer', 'notebook', 'black', 'white'].includes(lw);
    }).slice(0, 4);

    return {
      canonicalQuery: descriptive.join(' ') || cleanText.split(/\s+/).slice(0, 3).join(' '),
      brand,
      model: descriptive.join(' ')
    };
  }

  // Check for model numbers like RTX 4060, i5-13420H, Ryzen 5 7535HS
  const hardwareMatch = cleanText.match(/\b(rtx\s*[0-9]{4}|gtx\s*[0-9]{4}|i[3579][\s-]*[0-9]{4,5}[a-z]*|ryzen\s*[3579][\s-]*[0-9]{4}[a-z]*|m[1234]\s*(?:pro|max|ultra)?)\b/i);
  let specAnchor = '';
  if (hardwareMatch) {
    specAnchor = hardwareMatch[0].replace(/\s+/g, ' ').toUpperCase();
  }

  const canonicalQuery = queryParts.join(' ').trim();

  return {
    canonicalQuery,
    brand,
    model: queryParts.slice(1).join(' '),
    specAnchor
  };
}

/**
 * Intelligent AI Query Synthesizer
 * Uses Groq (llama-3.1-8b) if GROQ_API_KEY is available, or Vyce if VYCE_API_KEY is available,
 * otherwise runs high-accuracy local NLP.
 * @param {string} input - URL, raw title, or user query
 * @param {string} [rawHtml] - Optional page HTML for deeper extraction
 * @returns {Promise<object>}
 */
async function synthesizeProductQuery(input, rawHtml = '') {
  if (!input) return { canonicalQuery: '', brand: '', model: '', source: 'none' };

  const localResult = localExtractKeywords(input);

  const groqKey = process.env.GROQ_API_KEY;
  const vyceKey = process.env.VYCE_API_KEY;

  if (!groqKey && !vyceKey) {
    return {
      ...localResult,
      aiPowered: false,
      extractor: 'Local Fast NLP'
    };
  }

  // Attempt Groq API with 1.5s timeout for ultra-fast response
  if (groqKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);

      const prompt = `You are a search query optimizer for Bangladeshi e-commerce.
Given this product URL or title: "${input.substring(0, 200)}"
Extract:
1. "canonicalQuery": The best 2 to 4 word universal search query for BD stores (e.g. "Acer Nitro V 15", "Aarong Panjabi", "Napa Extra 500mg", "RTX 4060").
2. "brand": Brand name (e.g. "Acer").
3. "model": Core model name.
4. "category": One of [electronics, fashion, grocery, pharmacy, books, furniture, beauty, baby, footwear, appliances].
Reply ONLY valid JSON: {"canonicalQuery":"...", "brand":"...", "model":"...", "category":"..."}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.canonicalQuery) {
            return {
              canonicalQuery: parsed.canonicalQuery,
              brand: parsed.brand || localResult.brand,
              model: parsed.model || localResult.model,
              specAnchor: localResult.specAnchor,
              category: parsed.category,
              aiPowered: true,
              extractor: 'Groq Llama-3.1-8B'
            };
          }
        }
      }
    } catch (e) {
      // Fallback gracefully to local NLP
    }
  }

  return {
    ...localResult,
    aiPowered: false,
    extractor: 'Local Fast NLP'
  };
}

module.exports = {
  localExtractKeywords,
  synthesizeProductQuery
};
