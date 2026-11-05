# 🤖 BD Price Sentinel - 22-Category Omni-Store Parallel Agent Architecture (AGENTS.md)

This document defines the agent architecture, specialized scraping roles, multi-category routing protocols, resilient cross-platform network fetching (Vercel Linux + Windows), Cloudflare anti-bot evasion via whitelisted SERP replica indexing, integrated omni-browser URL inspection, AI query decomposition (Groq/Vyce/Local NLP), and anti-hallucination protocols powering **দাম কত BD (BD Price Sentinel)** across **22 Categories and 3,000+ Verified Bangladeshi E-Commerce Stores**.

---

## 🏛️ System Architecture & Specialist Agents

```
                        [ User Input: Direct Product URL OR Keyword ]
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
    [Direct URL Inspector & Browser Agent]                  [Category Classifier & Intent Router]
    - In-App Headless Web Inspector                         - 22 Category Routing Engine
    - Extracts canonical product title, price & image        - Keyword & Intent Mapping
    - Decomposes URL into Core Brand & Product Model
    - Strips merchant noise & tracking tokens
                │                                                           │
                └─────────────────────────────┬─────────────────────────────┘
                                              ▼
                         [AI & NLP Query Synthesizer Agent]
                         - Ultra-Fast Local Regex/NLP Engine (0ms, 100% Offline)
                         - Optional Groq API (llama-3.1-8b) / Vyce API Accelerator
                         - Multi-Variant Keyword Expander (e.g. "acer nitro v16" -> "nitro 16", "anv16")
                                              │
                                              ▼
                         [Category Store Cluster Dispatcher Agent]
                         (Loads 150-200+ Stores for Detected Category)
                                              │
                ┌─────────────────────────────┼─────────────────────────────┐
                ▼                             ▼                             ▼
    [Dedicated Direct APIs]        [Dedicated Area 51 & Store Scrapers]   [SERP Replica Anti-Bot Sweepers]
    - Star Tech BD (Live API)      - Area 51 BD (SERP Replica)            - Yahoo BD Search Engine
    - Daraz Bangladesh (JSON API)  - Computer Mania BD (SERP Replica)     - Bypasses Cloudflare Managed
    - Apple Gadgets BD (REST)      - TechLand BD (SERP Replica)             Challenges ("Just a moment...")
    - Dazzle BD (Fast Search)      - Ryans Computers (SERP Replica)       - Extracts BDT prices directly
    - Skyland BD (Hardware Search) - Star Tech BD (Variant Sweeper)         from SERP snippet cache
                │                             │                             │
                └─────────────────────────────┼─────────────────────────────┘
                                              ▼
                        [Product & Hardware Strict Spec Verifier]
                        - Tech: DDR5 vs DDR4, NVMe capacity, CPU accessories
                        - Pharma: Dosages (mg), pack count, syrup vs tab
                        - Fashion/Books: Brand, author, edition, volume
                        - Laptop vs Monitor isolation: blocks monitors on laptop queries
                        - Relevance scored against canonical distilled search keywords
                                              │
                                              ▼
                         [Best Value & Telemetry Ranker Agent]
                         - Sorts ALL discovered deals strictly Lowest to Highest Price
                         - 🥇 Top 1 Winner (Cheapest Verified In-Stock Deal)
                         - 🥈 Top 2 Runner-up Deal
                         - 🥉 Top 3 Budget Pick
                         - Benchmarks user's pasted URL against other stores:
                           "💡 সেভিংস অ্যালার্ট: অন্য স্টোরে আপনার পেস্ট করা লিংকের চেয়ে ৳X কম দামে পাওয়া যাচ্ছে!"
                                              │
                                              ▼
                         [Scan Audit & Store Transparency Inspector]
                         - Shows exact list of stores scanned for query with live deal counts
                         - Real price detection (eliminates "Call for Price" when BDT is in SERP)
                                              │
                                              ▼
                         [Interactive Category Store Explorer Engine]
                         - Clickable Category Cards opening Store Directory Modal
                         - Real-time Search, Sort by Popularity, A-Z, Domain (.com.bd)
                         - Direct Clickable Links to every store in Bangladesh
```

---

## 👥 Specialized Agent Roles

### 1. Cloudflare Anti-Bot Evasion & SERP Replica Agent (ক্লাউডফ্লেয়ার বাইপাস ও এসইআরপি রেপ্লিকা)
* **Problem Solved**: Top Bangladeshi retailers like **Area 51 BD (`area51.com.bd`)**, **Computer Mania BD (`computermania.com.bd`)**, **TechLand BD (`techlandbd.com`)**, and **Ryans Computers (`ryans.com`)** use Cloudflare Bot Management / "Under Attack" mode, returning `403 Forbidden` or `Just a moment...` JavaScript challenges to serverless scrapers.
* **Architecture**:
  - Major search engine crawlers (Yahoo / Bing / Google) are explicitly whitelisted by Cloudflare CDN IP ranges.
  - The SERP Replica Agent queries whitelisted Yahoo BD search endpoints with site-targeted operators:
    - `site:area51.com.bd <query>`
    - `site:computermania.com.bd <query>`
    - `site:techlandbd.com <query>`
    - `site:ryans.com <query>`
  - Instead of discarding snippet metadata, the agent extracts:
    1. Canonical direct product URL (decoded from `/RU=...`).
    2. Exact product model title and configuration specs.
    3. Live promotional and regular BDT price (e.g. `145,000.00৳ 134,900.00৳ -4%`).
  - This guarantees that **Area 51 BD** deals (such as `Acer Nitro V16 AI ANV16S 16.0"` at **৳134,900**) and **Computer Mania BD** deals are 100% discovered, priced, and ranked.

### 2. Dedicated Area 51 BD Scraper Agent (এরিয়া ৫১ স্পেশালিস্ট স্ক্র্যাপার)
* **Goal**: Area 51 BD is one of the most competitive tech stores in Bangladesh with aggressive pricing on 2025/2026 gaming laptops.
* **Execution**:
  - Dedicated runner in [`src/scrapers/area51.js`](file:///E:/price/src/scrapers/area51.js).
  - Sweeps Area 51's indexed product catalog via SERP replica.
  - Maps promotional discount prices (`৳134,900`) and regular prices (`৳145,000`).
  - Directly feeds verified Area 51 deals into the aggregator deal pipeline.

### 3. Multi-Variant Keyword Expander Agent (মাল্টি-ভেরিয়েন্ট কিওয়ার্ড এক্সপ্যান্ডার)
* **Problem Solved**: OpenCart / legacy retail search bars (e.g. Star Tech, Skyland, Ryans) require exact phrase matches. When a user searches `"acer nitro v16"`, Star Tech returns 0 because Star Tech catalogs the laptop as `"Acer Nitro 16"` or `"Nitro 16"` or `"ANV16"`.
* **Execution**:
  - Automatically decomposes queries with alphanumeric version tokens:
    - `"acer nitro v16"` -> `["acer nitro v16", "nitro 16", "acer nitro 16", "anv16"]`
    - `"rtx 4060"` -> `["rtx 4060", "geforce rtx 4060"]`
  - Runs parallel variant sweeps on Star Tech and Ryans, aggregating all matching laptops.

### 4. Direct URL Inspector & In-App Omni-Browser Agent (ইউআরএল ইন্সপেক্টর ও অমনি-ব্রাউজার)
* **Goal**: When a user pastes ANY product URL (e.g. from StarTech, Area51, Ryans, Daraz, Techland, Dazzle, Apple Gadgets, etc.):
  1. Inspects the URL with the in-app browser engine to extract:
     - Official product title (from `<meta property="og:title">`, `<title>`, or clean URL slug).
     - Store price and current stock status (as a reference benchmark).
     - High-resolution product image.
  2. Decomposes the product into clean, universal search keywords (e.g. `"Acer Nitro V 15"`, removing merchant slugs, "Price in Bangladesh", tracking query parameters, and store brand fluff).
  3. Automatically searches **ALL OTHER STORES ACROSS BANGLADESH** using the synthesized keywords.
  4. Ranks ALL stores side-by-side from lowest to highest price.
  5. Alerts the user if another store has the identical product at a lower price than their pasted link.

### 5. AI & NLP Query Synthesizer Agent (এআই ও এনএলপি কিওয়ার্ড ডিস্টিলার)
* **Goal**: Transform complex, noisy, or long-tail product titles and URL slugs into high-yield search terms.
* **Dual-Mode Engine**:
  - **Local High-Performance NLP (Default)**: Zero-latency, zero-dependency tokenizer and entity extractor anchored on tech brands, model numbers, chipsets, and capacities.
  - **AI Acceleration (Groq / Vyce API)**: Seamlessly enabled when `GROQ_API_KEY` or `VYCE_API_KEY` is provided. Uses ultra-fast LLMs (`llama-3.1-8b-instant`) to parse intricate model designations into clean search keywords in under 200ms.

### 6. Resilient Cross-Platform Network Fetcher (ক্রস-প্ল্যাটফর্ম হাইব্রিড ফেচার)
* **Dual-Layer Architecture**:
  - **Layer 1 (Native Node.js Fetch)**: Modern standard `fetch` with realistic browser headers, gzip/br compression, and `AbortController` timeout. Natively works on Vercel Linux, AWS Lambda, Windows, and macOS.
  - **Layer 2 (Cross-Platform curl Fallback)**: Automatically detects OS (`process.platform === 'win32' ? 'curl.exe' : 'curl'`) for sites requiring advanced TLS evasion, wrapped in safe try/catch error guards.

### 7. Product & Hardware Strict Spec Verifier (জিরো-টলারেন্স স্পেক ভেরিফায়ার)
* **Protocols**:
  - Laptop vs Monitor: Blocks monitors (e.g. `Acer Nitro VG270 X1 27" IPS Monitor`) on laptop queries (`acer nitro v16`).
  - Series Lock: Enforces series isolation (e.g. Nitro strictly rejects Aspire).
  - Memory: `DDR5` strictly disqualifies `DDR4` and `DDR3`.
  - Chipset: `B650` strictly disqualifies `B450`, `B550`, `B560`.
  - Storage: Capacity token matching (512GB strictly rejects 64GB / 256GB).
  - CPU Accessories: CPUs reject fans, heatsinks, brackets, thermal paste.

### 8. Best Value & Telemetry Ranker Agent (মূল্য যাচাই ও র‍্যাংকিং এজেন্ট)
* **Goal**: Sort all verified deals strictly from lowest price to highest price:
  - 🥇 Top 1 Winner (Cheapest Verified In-Stock Deal)
  - 🥈 Top 2 Runner-up Deal
  - 🥉 Top 3 Budget Pick
  - Highlights whether other stores beat the user's pasted link price.

---

## 🎨 Neumorphic Dual-Theme UI Standards

* **Light Theme**: Soft Neumorphic Slate `#e2e8f0` with 100% Solid Bold Black (`#000000`, `#0f172a`) typography.
* **Dark Theme**: Deep Neumorphic Night `#0c101a` with Emerald `#10b981` & Cyan `#38bdf8` highlights.
