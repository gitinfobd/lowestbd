# 🤖 BD Price Sentinel - 22-Category Omni-Store Parallel Agent Architecture (AGENTS.md)

This document defines the agent architecture, specialized scraping roles, multi-category routing protocols, strict hardware and product specification validation rules, and anti-hallucination protocols powering **দাম কত BD (BD Price Sentinel)** across **22 Categories and 2,310+ Verified Bangladeshi E-Commerce Stores**.

---

## 🏛️ System Architecture & Specialist Agents

```
                                [ User Request / URL / Keyword ]
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                 [Category Classifier & Intent]   [Direct URL Inspector Agent]
                   - Auto Category Detection         - Extracts store & canonical
                   - 22 Category Routing Engine        product title
                                 │                           │
                                 └─────────────┬─────────────┘
                                               ▼
                         [Category Store Cluster Dispatcher Agent]
                         (Loads 105+ Stores for Detected Category)
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                   [Dedicated Direct Store APIs]    [Category Cluster Sweepers]
                   - StarTech, Ryans, Daraz          - Parallel multi-site search
                   - Dazzle, Apple Gadgets, Skyland  - DuckDuckGo / Search APIs
                   - Chaldal, Rokomari, Arogga,      - 105+ Category Verified Stores
                     Shajgoj, Hatil, Apex, etc.
                                 │                           │
                                 └─────────────┬─────────────┘
                                               ▼
                              [Universal BD Web Sentinel Agent]
                              (Sweeps all 2,310+ .bd web stores)
                                               │
                                               ▼
                        [Product & Hardware Strict Spec Verifier]
                        - Tech: DDR5 vs DDR4, NVMe capacity, CPU accessories
                        - Pharma: Dosages (mg), pack count, syrup vs tab
                        - Fashion/Books: Brand, author, edition, volume
                        - Exact numeric model match enforcement
                                               │
                                               ▼
                         [Best Value & Telemetry Ranker Agent]
                         - 🥇 Top 1 Winner (Cheapest Verified In-Stock)
                         - 🥈 Top 2 Runner-up Deal
                         - 🥉 Top 3 Budget Pick
                         - Side-by-Side 3-Way Comparison Matrix
                                               │
                                               ▼
                         [Neumorphic Dual-Theme UI Engine]
                         - Auto-Detected Category Badge & Category Selector
                         - 100% Solid Bold Black in Light Theme (No washed-out text)
                         - Instant Multi-Email Price Drop Alerts
```

---

## 👥 Specialized Agent Roles

### 1. Category Classifier & Intent Routing Agent (শ্রেণী বিন্যাস ও ইন্টেন্ট রাউটার)
* **Goal**: Understand what kind of product the user is searching for and route queries to the correct category store cluster.
* **Knowledge**: Maps keywords across 22 Bangladeshi e-commerce categories:
  1. `fashion` (ফ্যাশন, শাড়ি, পাঞ্জাবি, শার্ট, পলো, থ্রি-পিস, জিন্স, জামদানি)
  2. `electronics` (ল্যাপটপ, প্রসেসর, র‍্যাম, গ্রাফিক্স কার্ড, মনিটর, এসএসডি, ম্যাকবুক)
  3. `grocery` (চাল, ডাল, তেল, চিনি, লবণ, মশলা, মাছ, মাংস, ডিম)
  4. `pharmacy` (ওষুধ, ট্যাবলেট, সিরাপ, প্রেসক্রিপশন মেডিসিন, বিপি মেশিন, ডায়াবেটিস স্ট্রিপ)
  5. `books` (বই, উপন্যাস, রকমারি, ইসলামিক বই, বিসিএস গাইড, পাঠ্যবই)
  6. `furniture` (সোফা, খাট, ডাইনিং টেবিল, ওয়ারড্রোব, অফিস চেয়ার, হাতিল, অটোবি)
  7. `beauty` (রূপচর্চা, সিরাম, সানস্ক্রিন, শ্যাম্পু, ময়েশ্চারাইজার, মেকআপ, লিপস্টিক)
  8. `baby` (ডায়াপার, বেবি ফুড, সেরেল্যাক, বাচ্চাদের খেলনা, স্ট্রোলার)
  9. `footwear` (জুতো, স্নিকার্স, স্যান্ডেল, লেদার জুতো, এপেক্স, বাটা)
  10. `jewelry` (স্বর্ণের গহনা, রুপা, ডায়মন্ডের আংটি, ঘড়ি, চেইন)
  11. `organic` (সুন্দরবনের মধু, খাঁটি সরিষার তেল, বিলোনা ঘি, চিয়া সিড, কালোজিরা)
  12. `sports` (ক্রিকেট ব্যাট, ফুটবল, জার্সি, ট্রেডমিল, ডাম্বেল, ব্যাডমিন্টন র‍্যাকেট)
  13. `automobile` (বাইক হেলমেট, বাইক পার্টস, ইঞ্জিন অয়েল, কার ড্যাশ ক্যাম)
  14. `appliances` (রেফ্রিজারেটর, ফ্রিজ, এসি, ওয়াশিং মেশিন, ব্লেন্ডার, ওভেন)
  15. `bags` (ট্রাভেল ব্যাগ, লাগেজ, ব্যাকপ্যাক, স্কুল ব্যাগ, লেদার ওয়ালেট)
  16. `pets` (বিড়ালের খাবার, কুকুরের খাবার, অ্যাকোরিয়াম, পাখির খাঁচা)
  17. `music` (গিটার, কিবোর্ড পিয়ানো, ড্রাম সেট, ভায়োলিন, হারমোনিয়াম, মাইক)
  18. `gifts` (উপহার, ফুলের তোড়া, গোলাপ, বার্থডে কেক, চকোলেট বক্স)
  19. `eyewear` (চশমা, সানগ্লাস, ব্লু-কাট লেন্স, কন্টাক্ট লেন্স, রে-ব্যান)
  20. `handicrafts` (নকশী কাঁথা, পাটের ব্যাগ, মাটির পাত্র, পিতলের শোপিস, শীতল পাটি)
  21. `hardware` (পাওয়ার ড্রিল, টুলবক্স, পানির পাম্প, সোলার প্যানেল, ইনভার্টার)
  22. `marketplace` (দারাজ, পিকাবু, অথবা, ইভ্যালি, বিক্রয় মাল্টিভেন্ডর ডিল)
* **Fallback**: When ambiguous or multi-category, sweeps across all 2,310+ stores.

### 2. Category Store Cluster Dispatcher Agent (ক্যাটাগরি ক্লাস্টার ডিসপ্যাচার)
* **Goal**: Retrieve the 105+ verified stores dedicated to the detected category from `data/bangladesh_ecommerce_2000_sites.json`.
* **Execution**: Dispatches parallel search clusters targeting the top stores and domain groups for that exact category.

### 3. Omni-Store Parallel Scraping & API Hub (প্যারালাল মাল্টি-স্টোর স্ক্র্যাপার হাব)
* **Goal**: Execute real-time queries across all category stores in under 2.5 seconds using non-blocking asynchronous fetching (`Promise.allSettled`).
* **Strategies**:
  1. Direct Store APIs & Scrapers (Dazzle, Apple Gadgets, StarTech, Daraz, Ryans, Skyland, Chaldal, Rokomari, Arogga, Shajgoj, Hatil, Apex, etc.).
  2. Targeted Category Domain Queries (`site:<domain1> OR site:<domain2>`).
  3. Universal BD fallback sweep across all `.bd` domains.

### 4. Hardware & Product Specification Verifier Agent (জিরো-টলারেন্স স্পেক ভেরিফায়ার)
* **Goal**: Eliminate hallucinations, false-positive cheap accessories, mismatched memory generations, and wrong dosages.
* **Protocols**:
  - Memory: `DDR5` strictly disqualifies `DDR4` and `DDR3`.
  - Chipset: `B650` strictly disqualifies `B450`, `B550`, `B560`.
  - Storage: Capacity token matching (512GB strictly rejects 64GB / 256GB).
  - CPU Accessories: CPUs reject fans, heatsinks, brackets, thermal paste.
  - Pharma: Disqualifies mismatched dosages (e.g. 500mg vs 1000mg).
  - Exact Numeric Match: Hardware and model numbers (`7600`, `5600`, `4060`, `MP225`, `M6`) must be strictly anchored.

### 5. Best Value & Market Telemetry Ranker Agent (সেরা ৩ ডিল ও টেলিমেট্রি র‍্যাংকার)
* **Goal**: Sort verified in-stock items by lowest price first and award:
  - 🥇 Top 1 Winner (Cheapest Verified In-Stock)
  - 🥈 Top 2 Runner-up Deal
  - 🥉 Top 3 Budget Pick
* **Output**: Detailed pricing comparison, average market price, maximum customer savings, and full comparison matrix.

---

## 🎨 Neumorphic Dual-Theme UI Standards

* **Light Theme**:
  - Background: Soft Neumorphic Slate `#e2e8f0`
  - Typography: 100% Solid Bold Black (`#000000`, `#0f172a`) for all headings, titles, prices, and store names. Zero low-contrast/washed-out text.
* **Dark Theme**:
  - Background: Deep Neumorphic Night `#0c101a`
  - Highlighting: Vibrant Emerald `#10b981` & Cyan `#38bdf8`
