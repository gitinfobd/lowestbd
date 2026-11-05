# 🤖 BD Price Sentinel - 22-Category Omni-Store Parallel Agent Architecture (AGENTS.md)

This document defines the agent architecture, specialized scraping roles, multi-category routing protocols, resilient cross-platform network fetching (Vercel Linux + Windows), integrated omni-browser URL inspection, AI query decomposition (Groq/Vyce/Local NLP), and anti-hallucination protocols powering **দাম কত BD (BD Price Sentinel)** across **22 Categories and 3,000+ Verified Bangladeshi E-Commerce Stores**.

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
                         - Extracts clean search keywords: e.g. "Acer Nitro V 15"
                                              │
                                              ▼
                         [Category Store Cluster Dispatcher Agent]
                         (Loads 150-200+ Stores for Detected Category)
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
    [Dedicated Direct Store Scrapers & APIs]               [Omni-Search Category Sweepers]
    - Star Tech BD (Live Search API)                       - Yahoo BD Engine (Decodes RU URLs)
    - Daraz Bangladesh (Real-Time JSON API)                - DuckDuckGo / Search Engine Sweepers
    - Apple Gadgets BD (REST Endpoint)                     - Sweeps 3,000+ Verified .bd Stores
    - Dazzle BD (Fast Product Search)                      - Area51, Computer Mania, Techland,
    - Skyland BD (Hardware Search)                           Ryans, Pickaboo, Chaldal, Rokomari
    - Dual Engine: Native Node Fetch + curl fallback
                │                                                           │
                └─────────────────────────────┬─────────────────────────────┘
                                              ▼
                        [Product & Hardware Strict Spec Verifier]
                        - Tech: DDR5 vs DDR4, NVMe capacity, CPU accessories
                        - Pharma: Dosages (mg), pack count, syrup vs tab
                        - Fashion/Books: Brand, author, edition, volume
                        - Relevance scored against extracted keywords (NOT raw URL)
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
                         - Shows exact list of stores scanned for query
                         - Store response status & live query telemetry
                                              │
                                              ▼
                         [Interactive Category Store Explorer Engine]
                         - Clickable Category Cards opening Store Directory Modal
                         - Real-time Search, Sort by Popularity, A-Z, Domain (.com.bd)
                         - Direct Clickable Links to every store in Bangladesh
```

---

## 👥 Specialized Agent Roles

### 1. Direct URL Inspector & In-App Omni-Browser Agent (ইউআরএল ইন্সপেক্টর ও অমনি-ব্রাউজার)
* **Problem Solved**: Previously, pasting a product URL only displayed that single store's item, because relevance checking compared against the raw URL string, and Vercel serverless fetch failed.
* **Goal**: When a user pastes ANY product URL (e.g. from StarTech, Area51, Ryans, Daraz, Techland, Dazzle, Apple Gadgets, etc.):
  1. Inspects the URL with the in-app browser engine to extract:
     - Official product title (from `<meta property="og:title">`, `<title>`, or clean URL slug).
     - Store price and current stock status (as a reference benchmark).
     - High-resolution product image.
  2. Decomposes the product into clean, universal search keywords (e.g. `"Acer Nitro V 15"`, removing merchant slugs, "Price in Bangladesh", tracking query parameters, and store brand fluff).
  3. Automatically searches **ALL OTHER STORES ACROSS BANGLADESH** using the synthesized keywords.
  4. Ranks ALL stores side-by-side from lowest to highest price.
  5. Alerts the user if another store has the identical product at a lower price than their pasted link.

### 2. AI & NLP Query Synthesizer Agent (এআই ও এনএলপি কিওয়ার্ড ডিস্টিলার)
* **Goal**: Transform complex, noisy, or long-tail product titles and URL slugs into high-yield search terms.
* **Dual-Mode Engine**:
  - **Local High-Performance NLP (Default)**: Zero-latency, zero-dependency tokenizer and entity extractor anchored on tech brands, model numbers, chipsets, and capacities.
  - **AI Acceleration (Groq / Vyce API)**: Seamlessly enabled when `GROQ_API_KEY` or `VYCE_API_KEY` is provided. Uses ultra-fast LLMs (`llama-3.1-8b-instant`) to parse intricate model designations into clean search keywords in under 200ms.

### 3. Resilient Cross-Platform Network Fetcher (ক্রস-প্ল্যাটফর্ম হাইব্রিড ফেচার)
* **Problem Solved**: On Vercel (Linux Serverless Lambda), hardcoded `curl.exe` caused immediate `ENOENT` crashes, returning 0 results in 0.1 seconds.
* **Dual-Layer Architecture**:
  - **Layer 1 (Native Node.js Fetch)**: Modern standard `fetch` with realistic browser headers, gzip/br compression, and `AbortController` timeout. Natively works on Vercel Linux, AWS Lambda, Windows, and macOS.
  - **Layer 2 (Cross-Platform curl Fallback)**: Automatically detects OS (`process.platform === 'win32' ? 'curl.exe' : 'curl'`) for sites requiring advanced TLS evasion, wrapped in safe try/catch error guards.

### 4. Category Classifier & Intent Routing Agent (শ্রেণী বিন্যাস ও ইন্টেন্ট রাউটার)
* **Goal**: Route queries to the optimal category store cluster across 22 categories:
  1. `fashion` (আড়ং, সেইলর, ইনফিনিটি, ইয়োলো, জেন্টল পার্ক, ইত্যাদি)
  2. `electronics` (স্টারটেক, রায়ান্স, টেক dealল্যান্ড, ড্যাজল, অ্যাপল গ্যাজেটস, স্কাইল্যান্ড, কম্পিউটার ম্যানিয়া, এরিয়া৫১)
  3. `grocery` (চালডাল, স্বপ্ন, মীনা বাজার, আগোরা, ইত্যাদি)
  4. `pharmacy` (আরোগ্য, ওষুধ ডট কম, ডিজিফার্মা, ইত্যাদি)
  5. `books` (রকমারি, ওয়াফিলাইফ, প্রথমা, বাতিঘর, ইত্যাদি)
  6. `furniture` (হাতিল, অটোবি, আখতার, নাভানা ফার্নিচার)
  7. `beauty` (সাজগোজ, রূপচর্চা, ইত্যাদি)
  8. `baby` (টগলস, বেবি শপ বিডি, কিডস ক্র্যাডেল)
  9. `footwear` (এপেক্স, বাটা, বে এম্পোরিয়াম, লোটো বিডি)
  10. `jewelry` (ডায়মন্ড ওয়ার্ল্ড, ভেনাস জুয়েলার্স, আমিন জুয়েলার্স)
  11. `organic` (খাস ফুড, সুন্দরবন অরগানিক, ইত্যাদি)
  12. `sports` (স্পোর্টস ওয়ার্ল্ড, ডিক্যাথলন বিডি)
  13. `automobile` (গিয়ারএক্স বিডি, বাইকবাবার)
  14. `appliances` (ওয়ালটন, মিনিস্টার, সিঙ্গার বিডি, বাটারফ্লাই)
  15. `bags` (প্রেসিডেন্ট, লাগেজ বিডি)
  16. `pets` (পেটজোন বিডি, অ্যাকোয়ারিয়াম বিডি)
  17. `music` (মেলোডি বিডি, গিটার সেন্টার)
  18. `gifts` (উপহার বিডি, বিডিফ্লোরিস্ট)
  19. `eyewear` (লেন্সকার্ট বিডি, ফ্যাশন অপটিক্স)
  20. `handicrafts` (কারুপল্লী, জয়িতা)
  21. `hardware` (ইনকো বিডি, ক্রাউন হার্ডওয়্যার)
  22. `marketplace` (দারাজ, পিকাবু, অথবা, বিক্রয়)

### 5. Hardware & Product Specification Verifier Agent (জিরো-টলারেন্স স্পেক ভেরিফায়ার)
* **Goal**: Eliminate hallucinations, false-positive cheap accessories, mismatched memory generations, and wrong dosages.
* **Protocols**:
  - Memory: `DDR5` strictly disqualifies `DDR4` and `DDR3`.
  - Chipset: `B650` strictly disqualifies `B450`, `B550`, `B560`.
  - Storage: Capacity token matching (512GB strictly rejects 64GB / 256GB).
  - CPU Accessories: CPUs reject fans, heatsinks, brackets, thermal paste.
  - Relevance scored strictly against the canonical distilled search keywords.

### 6. Best Value & Telemetry Ranker Agent (মূল্য যাচাই ও র‍্যাংকিং এজেন্ট)
* **Goal**: Sort all verified deals strictly from lowest price to highest price:
  - 🥇 Top 1 Winner (Cheapest Verified In-Stock Deal)
  - 🥈 Top 2 Runner-up Deal
  - 🥉 Top 3 Budget Pick
  - Highlights whether other stores beat the user's pasted link price.

---

## 🎨 Neumorphic Dual-Theme UI Standards

* **Light Theme**: Soft Neumorphic Slate `#e2e8f0` with 100% Solid Bold Black (`#000000`, `#0f172a`) typography.
* **Dark Theme**: Deep Neumorphic Night `#0c101a` with Emerald `#10b981` & Cyan `#38bdf8` highlights.
