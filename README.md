# ⚡ দাম কত BD (BD Price Sentinel)
> **Real-time Bangladesh 300+ Tech Price Comparison Engine & Best Value Deal Hunter**

বাংলাদেশর ৩০০+ টেক ওয়েবসাইট (Star Tech, Ryans, Daraz, Skyland, TechLand, Apple Gadgets, Dazzle, Trust Computer, Computer Village, Creatus, Potaka IT, UCC সহ সকল স্টোর) থেকে মুহূর্তের মধ্যে লাইভ মূল্য ও অফার যাচাইকারী।

---

## 🌟 প্রধান বৈশিষ্ট্যসমূহ (Key Features)

1. **৩০০+ বিডি টেক ওয়েবসাইট ও অনলাইন স্টোর কভারেজ**:
   - **Direct High-Precision Adapters**: Star Tech, Daraz Bangladesh, Ryans Computers, Skyland BD.
   - **Universal BD Web Sentinel**: TechLand, Apple Gadgets, Dazzle, Trust Computer, Computer Village, Creatus Computer, Potaka IT, UCC, UltraTech, PC House, Pickaboo, BDShop, Bikroy ইত্যাদি যেকোনো বাংলাদেশি স্টোরের প্রোডাক্ট ও অফার নিমেষেই খুঁজে আনে।
2. **মুহূর্তেই টপ ৩ বেস্ট ভ্যালু (Top 3 Cheapest Deals)**:
   - 🥇 **#1 Best Value Champion**: যাচাইকৃত সর্বনিম্ন মূল্যের সেরা ডিল।
   - 🥈 **#2 Runner-Up Deal**: দ্বিতীয় সেরা ডিল।
   - 🥉 **#3 Budget Pick**: বাজেট ফ্রেন্ডলি বিকল্প।
3. **লাইভ অফার ও ডিসকাউন্ট ডিটেক্টর**:
   - ক্যাশ ডিসকাউন্ট (Cash Discount / Save ৳)
   - ০% ইএমআই সুবিধা (0% EMI)
   - অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি (Official Warranty)
   - ফ্রি হোম ডেলিভারি ও ভাউচার
4. **মার্কেট টেলিমেট্রি অ্যানালিটিক্স**:
   - সর্বনিম্ন বাজারদর, গড় বাজারদর ও সর্বোচ্চ সম্ভাব্য সেভিংস (BDT)।
5. **ফ্রি ও ওপেন REST API**:
   - আপনার যেকোনো মোবাইল অ্যাপ, ডিসকর্ড বট বা স্ক্রিপ্টে যুক্ত করার জন্য উন্মুক্ত JSON API।
6. **জিরো-কনফিগ ডাইনামিক পোর্ট**:
   - পোর্ট `3000`, `3001`, `5000` ইত্যাদির যেকোনো ফ্রি পোর্টে স্বয়ংক্রিয়ভাবে রান হয়।

---

## 🚀 কীভাবে চালাবেন (How to Run)

```bash
# ১. ডিপেনডেন্সি চেক বা ইন্সটল (সম্পূর্ণ জিরো-হেভি ডিপেনডেন্সি, পিওর নোড.জেএস)
npm install

# ২. সার্ভার রান করুন (যেকোনো ফ্রি পোর্টে রান হবে)
npm start
# বা
node server.js
```

ব্রাউজারে ওপেন করুন: `http://localhost:3000`

---

## ⚡ REST API ব্যবহারের নিয়ম

### অনুসন্ধান (Search Products):
```http
GET /api/search?q=RTX+4060
```

#### রেসপন্স ফরম্যাট (JSON):
```json
{
  "query": "RTX 4060",
  "executionTimeMs": 2150,
  "storesScannedCount": 305,
  "summary": {
    "minPrice": 42500,
    "avgPrice": 56600,
    "maxSavings": 14100,
    "totalPricedDeals": 25,
    "bestDealStore": "Skyland BD"
  },
  "top3": [
    {
      "rank": 1,
      "crown": "🥇 #1 Best Value (Cheapest)",
      "source": "Skyland BD",
      "price": 42500,
      "discount": 5,
      "offers": ["Save 1,400৳", "Authentic BD Stock"],
      "inStock": true,
      "link": "https://www.skyland.com.bd/..."
    }
  ]
}
```

---

## 🛡️ আর্কিটেকচার ও টেক স্ট্যাক
- **Backend**: Node.js v24 (Native HTTP Server, Zero-bloat async curl bridge)
- **Frontend**: Cyberpunk Dark Glassmorphism SPA (Vanilla JS + CSS, 60fps animations)
- **Scraping Engine**: Hybrid Parallel Scraper (Direct JSON API + OpenCart Parser + Universal Web Sentinel)
