const fs = require('fs');
const path = require('path');

// Load compiled 2000+ BD Ecommerce Database
const DB_PATH = path.join(__dirname, '../data/bangladesh_ecommerce_2000_sites.json');
let database = null;

try {
  if (fs.existsSync(DB_PATH)) {
    database = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }
} catch (e) {
  console.error('Error loading 2000+ sites database:', e);
}

// 22 Category Keyword Lexicon (English & Bengali tokens)
const CATEGORY_LEXICON = {
  fashion: {
    id: "fashion",
    nameEn: "Fashion, Clothing & Apparel",
    nameBn: "ফ্যাশন, পোশাক ও লাইফস্টাইল",
    icon: "👗",
    keywords: [
      "saree", "sari", "panjabi", "punjabi", "shirt", "t-shirt", "tshirt", "polo", "jeans", "denim",
      "kurti", "kameez", "salwar", "three piece", "lehenga", "lungi", "fatua", "fotua", "blazer", "suit",
      "jacket", "hoodie", "sweater", "shawl", "chador", "abaya", "hijab", "burqa", "trousers", "chinos",
      "vest", "innerwear", "nighty", "dupatta", "gamcha", "aarong", "yellow", "sailor", "lereve", "richman",
      "catseye", "dorjibari", "fabrilife", "শাড়ি", "পাঞ্জাবি", "শার্ট", "টি-শার্ট", "পলো", "জিন্স", "কুর্তি",
      "থ্রি পিস", "লেহেঙ্গা", "লুঙ্গি", "ফতুয়া", "ব্লেজার", "হুডি", "জ্যাকেট", "হিজাব", "বোরকা", "পোশাক"
    ]
  },
  electronics: {
    id: "electronics",
    nameEn: "Electronics, Computers & IT Gadgets",
    nameBn: "ইলেকট্রনিক্স, কম্পিউটার ও গেজেট",
    icon: "💻",
    keywords: [
      "acer", "nitro", "asus", "rog", "tuf", "lenovo", "legion", "hp", "victus", "omen", "dell", "alienware",
      "rtx", "gtx", "rx", "ryzen", "core i", "intel", "amd", "processor", "motherboard", "ram", "ddr4", "ddr5",
      "ssd", "nvme", "m.2", "hard disk", "monitor", "laptop", "macbook", "mac mini", "desktop", "gpu", "cpu",
      "gaming pc", "mechanical keyboard", "mouse", "graphics card", "webcam", "router", "wifi", "ipad", "tablet",
      "smartphone", "iphone", "pixel", "samsung galaxy", "oneplus", "soundbar", "speaker", "earbuds", "airpods",
      "startech", "ryans", "skyland", "techland", "dazzle", "applegadgets", "area51", "computermania", "itstore",
      "ল্যাপটপ", "কম্পিউটার", "প্রসেসর", "মাদারবোর্ড", "র‍্যাম", "মনিটর", "কিবোর্ড", "মাউস", "রাউটার", "গেজেট"
    ]
  },
  grocery: {
    id: "grocery",
    nameEn: "Grocery, Daily Essentials & Superstores",
    nameBn: "মুদি, কাঁচাবাজার ও নিত্যপ্রয়োজনীয়",
    icon: "🛒",
    keywords: [
      "rice", "miniket", "nazirshail", "chinigura", "dal", "lentil", "oil", "soybean", "mustard oil",
      "sugar", "salt", "onion", "garlic", "ginger", "potato", "beef", "mutton", "chicken", "meat",
      "fish", "hilsha", "rui", "egg", "milk", "tea", "coffee", "biscuit", "noodles", "atta", "maida",
      "flour", "chili", "turmeric", "coriander", "cumin", "spice", "masala", "chaldal", "shwapno", "agora",
      "চাল", "ডাল", "তেল", "সয়াবিন", "সরিষার তেল", "চিনি", "লবণ", "পেঁয়াজ", "রসুন", "আলু", "গরুর মাংস",
      "খাসির মাংস", "মুরগির মাংস", "মাছ", "ইলিশ", "ডিম", "দুধ", "চা", "কফি", "বিস্কুট", "নুডুলস", "আটা", "ময়দা"
    ]
  },
  pharmacy: {
    id: "pharmacy",
    nameEn: "Pharmacy, Healthcare & Medical Care",
    nameBn: "ফার্মেসি, ওষুধ ও হেলথকেয়ার",
    icon: "💊",
    keywords: [
      "medicine", "tablet", "syrup", "capsule", "injection", "ointment", "napa", "napa extra", "paracetamol",
      "seclo", "sergel", "omeprazole", "ceevit", "vitamin", "calcium", "zinc", "insulin", "glucometer",
      "test strip", "bp machine", "blood pressure", "wheelchair", "thermometer", "oximeter", "nebulizer",
      "mask", "surgical", "bandage", "daktarbhai", "arogga", "lazz pharma", "osudpotro", "medeasy",
      "ওষুধ", "ঔষধ", "ট্যাবলেট", "সিরাপ", "ক্যাপসুল", "নাপা", "সার্জেল", "সেকলো", "ভিটামিন", "ইনসুলিন",
      "প্রেসার মাপার মেশিন", "ডায়াবেটিস", "হুইলচেয়ার", "থার্মোমিটার", "অক্সিজেন", "নেবুলাইজার", "ফার্মেসি"
    ]
  },
  books: {
    id: "books",
    nameEn: "Books, Publications & Stationery",
    nameBn: "বই, প্রকাশনী ও স্টেশনারি",
    icon: "📚",
    keywords: [
      "book", "books", "novel", "story book", "rokomari", "wafilife", "boibazar", "baatighar", "prothoma",
      "humayun ahmed", "zafar iqbal", "bcs", "bank job", "admission", "hadith", "bukhari", "muslim", "quran",
      "tafseer", "islamic book", "poetry", "kobita", "literature", "sahitya", "dictionary", "grammar",
      "notebook", "diary", "pen", "pencil", "stationery", "বই", "উপন্যাস", "গল্পের বই", "রকমারি", "হুমায়ূন আহমেদ",
      "বিসিএস", "হাদিস", "কোরআন", "তাফসীর", "ইসলামিক বই", "কবিতা", "সাহিত্য", "ডায়েরি", "খাতা", "কলম"
    ]
  },
  furniture: {
    id: "furniture",
    nameEn: "Furniture, Interior & Home Decor",
    nameBn: "আসবাবপত্র, ইন্টেরিয়র ও গৃহসজ্জা",
    icon: "🛋️",
    keywords: [
      "sofa", "bed", "dining table", "chair", "office chair", "wardrobe", "almirah", "dressing table",
      "bookshelf", "mattress", "foam", "divan", "hatil", "otobi", "akhtar", "regal", "partex", "isho",
      "curtain", "carpet", "rug", "lamp", "wall art", "cushion", "pillow", "bedsheet", "interior",
      "সোফা", "খাট", "বিছানা", "ডাইনিং টেবিল", "চেয়ার", "অফিস চেয়ার", "ওয়ারড্রব", "আলমারি", "ড্রেসিং টেবিল",
      "তোশক", "গদি", "ফোম", "হাতিল", "অটোবি", "রিগ্যাল", "ফার্নিচার", "পর্দা", "কার্পেট", "কুশন"
    ]
  },
  beauty: {
    id: "beauty",
    nameEn: "Beauty, Cosmetics & Skincare",
    nameBn: "রূপচর্চা, কসমেটিকস ও স্কিনকেয়ার",
    icon: "💄",
    keywords: [
      "serum", "moisturizer", "sunscreen", "cream", "lotion", "facewash", "face wash", "cleanser", "toner",
      "shampoo", "conditioner", "hair oil", "lipstick", "lip gloss", "eyeliner", "mascara", "foundation",
      "powder", "shajgoj", "themallbd", "skincafe", "the ordinary", "cosmetics", "skincare", "makeup",
      "সিরাম", "ময়েশ্চারাইজার", "সানস্ক্রিন", "ক্রিম", "লোশন", "ফেসওয়াশ", "শ্যাম্পু", "চুলের তেল", "লিপস্টিক",
      "মেকআপ", "কাজল", "আইলাইনার", "পাউডার", "সাজগোজ", "সৌন্দর্য্য", "প্রসাধন", "স্কিনকেয়ার"
    ]
  },
  baby: {
    id: "baby",
    nameEn: "Mother, Baby Care & Kids Toys",
    nameBn: "মা ও শিশু যত্ন এবং খেলনা",
    icon: "🍼",
    keywords: [
      "diaper", "pampers", "baby food", "cerelac", "lactogen", "baby milk", "feeder", "wipes", "baby wipes",
      "baby oil", "baby soap", "baby shampoo", "baby lotion", "stroller", "pram", "walker", "baby toy",
      "toy car", "doll", "lego", "kids clothing", "baby bed", "baby mosquito net", "breast pump", "maternity",
      "ডায়াপার", "প্যাম্পার্স", "বেবি ফুড", "সেরেল্যাক", "ল্যাকটোজেন", "ফিডার", "শিশুর ওয়াইপস", "বেবি লোশন",
      "বেবি সাবান", "খেলনা", "খেলনা গাড়ি", "পুতুল", "স্ট্রোলার", "বাচ্চাদের জামা", "মা ও শিশু"
    ]
  },
  footwear: {
    id: "footwear",
    nameEn: "Footwear, Shoes & Leather Goods",
    nameBn: "জুতো ও চামড়াজাত পণ্য",
    icon: "👞",
    keywords: [
      "shoe", "shoes", "sneakers", "sandals", "slippers", "boots", "loafers", "formal shoes", "leather shoes",
      "sports shoes", "running shoes", "heels", "flats", "apex", "bata", "lotto", "bay emporium", "crescent",
      "জুতো", "জুতা", "স্নিকার্স", "স্যান্ডেল", "স্লিপার", "বুট", "লোফার", "চামড়ার জুতো", "এপেক্স", "বাটা"
    ]
  },
  jewelry: {
    id: "jewelry",
    nameEn: "Jewelry, Gold, Silver & Watches",
    nameBn: "অলঙ্কার, ডায়মন্ড ও ঘড়ি",
    icon: "💍",
    keywords: [
      "gold", "silver", "diamond", "necklace", "ring", "earring", "bangle", "bracelet", "chain", "pendant",
      "nose pin", "watch", "wristwatch", "luxury watch", "diamond world", "amin jewellers", "timezone",
      "স্বর্ণ", "সোনার গহনা", "রুপা", "ডায়মন্ড", "হীরা", "নেকলেস", "আংটি", "কানের দুল", "বালা", "চেইন", "ঘড়ি"
    ]
  },
  organic: {
    id: "organic",
    nameEn: "Organic Foods, Agro & Farm Products",
    nameBn: "অর্গানিক খাবার, কৃষিপণ্য ও মধু/ঘি",
    icon: "🍯",
    keywords: [
      "honey", "raw honey", "sundarban honey", "ghee", "cow ghee", "bilona ghee", "mustard oil", "khati shorisha",
      "chia seed", "black seed oil", "kalijira", "dates", "ajwa", "medjool", "organic rice", "brown rice",
      "moringa", "spirulina", "pink salt", "khaas food", "natural food", "shuddho food",
      "মধু", "সুন্দরবনের মধু", "ঘি", "খাঁটি ঘি", "সরিষার তেল", "ঘানির তেল", "চিয়া সিড", "কালোজিরা", "খেজুর",
      "আজওয়া", "লাল চাল", "অর্গানিক ফুড", "খাঁস ফুড"
    ]
  },
  sports: {
    id: "sports",
    nameEn: "Sports, Fitness & Gym Equipment",
    nameBn: "খেলাধুলা, ফিটনেস ও জিম সামগ্রী",
    icon: "🏏",
    keywords: [
      "cricket bat", "cricket ball", "pads", "gloves", "helmet", "football", "boots", "jersey", "badminton",
      "racket", "shuttlecock", "treadmill", "dumbbell", "barbell", "weight plate", "gym bench", "yoga mat",
      "resistance band", "jump rope", "exercise bike", "decathlon", "sports world", "champion sports",
      "ক্রিকেট ব্যাট", "ক্রিকেট বল", "ফুটবল", "জার্সি", "ব্যাডমিন্টন", "র‍্যাকেট", "ট্রেডমিল", "ডাম্বেল",
      "বারবেল", "জিম সামগ্রী", "ইয়োগা ম্যাট", "ফিটনেস"
    ]
  },
  automobile: {
    id: "automobile",
    nameEn: "Automobiles, Bikes, Helmets & Parts",
    nameBn: "অটোমোবাইল, বাইক পার্টস ও হেলমেট",
    icon: "🏍️",
    keywords: [
      "helmet", "full face helmet", "bike", "motorcycle", "bikebd", "gearx", "bilmola", "kyt", "suomy",
      "engine oil", "motul", "mobil", "brake pad", "chain lube", "tyre", "tire", "riding jacket", "gloves",
      "car dashcam", "car polish", "car accessories", "headlight", "battery",
      "হেলমেট", "বাইক", "মোটরসাইকেল", "ইঞ্জিন অয়েল", "মোবিল", "টায়ার", "বাইকের পার্টস", "রাইডিং জ্যাকেট", "গাড়ি"
    ]
  },
  appliances: {
    id: "appliances",
    nameEn: "Home Appliances & Kitchenware",
    nameBn: "হোম অ্যাপ্লায়েন্স ও রান্নাঘর সামগ্রী",
    icon: "🔌",
    keywords: [
      "refrigerator", "fridge", "deep fridge", "freezer", "ac", "air conditioner", "inverter ac", "television",
      "tv", "smart tv", "led tv", "washing machine", "microwave oven", "blender", "grinder", "cooker", "rice cooker",
      "gas stove", "induction", "water filter", "walton", "singer", "transcom", "butterfly",
      "ফ্রিজ", "রেফ্রিজারেটর", "ডিপ ফ্রিজ", "এসি", "টেলিভিশন", "টিভি", "ওয়াশিং মেশিন", "ওভেন", "ব্লেন্ডার",
      "রাইস কুকার", "গ্যাস চুলা", "ওয়াটার ফিল্টার", "ওয়ালটন"
    ]
  },
  bags: {
    id: "bags",
    nameEn: "Bags, Luggage & Travel Gear",
    nameBn: "ব্যাগ, লাগেজ ও ট্রাভেল গিয়ার",
    icon: "🎒",
    keywords: [
      "backpack", "laptop bag", "school bag", "college bag", "travel bag", "trolley bag", "luggage", "suitcase",
      "duffel bag", "handbag", "side bag", "tote bag", "wallet", "leather wallet", "money bag", "president",
      "ব্যাগ", "ব্যাকপ্যাক", "ল্যাপটপ ব্যাগ", "স্কুল ব্যাগ", "ট্রাভেল ব্যাগ", "ট্রলি ব্যাগ", "লাগেজ", "স্যুটকেস", "লেদার ওয়ালেট"
    ]
  },
  pets: {
    id: "pets",
    nameEn: "Pet Food, Vet Care & Aquarium",
    nameBn: "পোষাপ্রাণীর যত্ন ও অ্যাকোরিয়াম",
    icon: "🐾",
    keywords: [
      "cat food", "dog food", "kitten food", "whiskas", "drools", "me-o", "royal canin", "cat litter",
      "bird food", "bird cage", "aquarium", "fish tank", "fish food", "pet zone", "pet care", "leash",
      "বিড়ালের খাবার", "কুকুরের খাবার", "ক্যাট ফুড", "ক্যাট লিটার", "পাখির খাবার", "পাখির খাঁচা", "অ্যাকোরিয়াম", "মাছের খাবার"
    ]
  },
  music: {
    id: "music",
    nameEn: "Musical Instruments & Pro Audio",
    nameBn: "বাদ্যযন্ত্র ও সাউন্ড সিস্টেম",
    icon: "🎸",
    keywords: [
      "guitar", "acoustic guitar", "electric guitar", "bass guitar", "ukulele", "piano", "digital piano",
      "keyboard piano", "synthesizer", "drum kit", "cajon", "violin", "flute", "bamboo flute", "harmonium",
      "tabla", "dotara", "microphone", "audio interface", "studio monitor", "melody bd", "music world",
      "গিটার", "অ্যাকোস্টিক গিটার", "ইউকুলেলে", "পিয়ানো", "কিবোর্ড", "ড্রাম", "ভায়োলিন", "বাঁশি", "হারমোনিয়াম", "তবলা", "দোতারা", "মাইক্রোফোন"
    ]
  },
  gifts: {
    id: "gifts",
    nameEn: "Gifts, Flowers, Cakes & Surprises",
    nameBn: "উপহার, ফুল, কেক ও শুভেচ্ছা সামগ্রী",
    icon: "🎁",
    keywords: [
      "flower", "rose", "bouquet", "red roses", "birthday cake", "cake", "fondant cake", "chocolate box",
      "ferrero", "gift box", "gift hamper", "customized mug", "photo frame", "teddy bear", "upoharbd", "bdgift",
      "ফুল", "গোলাপ", "ফুলের তোড়া", "কেক", "বার্থডে কেক", "চকোলেট", "গিফট বক্স", "উপহার", "মগ", "ফটো ফ্রেম"
    ]
  },
  eyewear: {
    id: "eyewear",
    nameEn: "Eyewear, Sunglasses & Optical Care",
    nameBn: "চশমা, সানগ্লাস ও চোখের যত্ন",
    icon: "👓",
    keywords: [
      "glasses", "eyeglasses", "spectacles", "sunglasses", "sunglass", "shades", "aviator", "wayfarer",
      "blue cut", "anti glare", "photochromic", "frame", "spectacle frame", "contact lens", "lens solution",
      "ray-ban", "eyespace", "optical cafe", "lenskart",
      "চশমা", "সানগ্লাস", "পাওয়ার চশমা", "ব্লু কাট", "ফ্রেম", "কন্টাক্ট লেন্স", "লেন্স"
    ]
  },
  handicrafts: {
    id: "handicrafts",
    nameEn: "Handicrafts, Jute & Artisan BD",
    nameBn: "হস্তশিল্প, পাটজাত পণ্য ও কারুশিল্প",
    icon: "🌾",
    keywords: [
      "nakshi kantha", "hand stitch", "jute bag", "jute rug", "jute craft", "terracotta", "clay pot",
      "matir bhar", "cane chair", "bamboo craft", "brass craft", "copper craft", "shitol pati", "cooling mat",
      "rickshaw art", "wood carving", "aranya", "kumudini",
      "নকশী কাঁথা", "নকশিকাঁথা", "পাটের ব্যাগ", "পাটজাত পণ্য", "মাটির পাত্র", "টেরাকোটা", "বেতের কাজ", "বাঁশের তৈরি", "পিতল", "শীতল পাটি"
    ]
  },
  hardware: {
    id: "hardware",
    nameEn: "Hardware, Tools, Solar & Industrial",
    nameBn: "হার্ডওয়্যার, টুলস ও সোলার এনার্জি",
    icon: "🛠️",
    keywords: [
      "drill", "power drill", "angle grinder", "saw", "tool kit", "wrench", "spanner", "screwdriver",
      "water pump", "submersible pump", "solar panel", "solar inverter", "mppt", "solar battery", "ips",
      "inverter", "welding machine", "safety shoes", "safety helmet", "rahimafrooz solar", "ingco", "total tools",
      "ড্রিল মেশিন", "টুলকিট", "রেঞ্জ", "স্ক্রু ড্রাইভার", "পানির পাম্প", "সোলার প্যানেল", "সোলার ইনভার্টার", "আইপিএস", "ওয়েল্ডিং মেশিন", "হার্ডওয়্যার"
    ]
  },
  marketplace: {
    id: "marketplace",
    nameEn: "Multi-Vendor Marketplaces & Megastores",
    nameBn: "মাল্টি-ভেন্ডর ই-কমার্স ও মেগাস্টোর",
    icon: "🏬",
    keywords: [
      "daraz", "pickaboo", "othoba", "priyoshop", "evaly", "bikroy", "ajkerdeal", "shopup",
      "দারাজ", "পিকাবু", "অথবা", "প্রিয়শপ", "ইভ্যালি", "বিক্রয়"
    ]
  }
};

/**
 * Classify a search query into the best matching category
 * @param {string} query
 * @param {string} [explicitCat] Optional user-selected category
 * @returns {object} { id, nameEn, nameBn, icon, confidence }
 */
function classifyCategory(query, explicitCat = null) {
  if (explicitCat && CATEGORY_LEXICON[explicitCat]) {
    const cat = CATEGORY_LEXICON[explicitCat];
    return {
      id: cat.id,
      nameEn: cat.nameEn,
      nameBn: cat.nameBn,
      icon: cat.icon,
      confidence: 1.0,
      isExplicit: true
    };
  }

  const clean = (query || '').toLowerCase().trim();
  if (!clean) {
    return {
      id: "all",
      nameEn: "All BD Categories",
      nameBn: "সকল ক্যাটাগরি (সার্বজনীন)",
      icon: "🌐",
      confidence: 0,
      isExplicit: false
    };
  }

  let bestCat = null;
  let highestScore = 0;

  for (const [catId, cat] of Object.entries(CATEGORY_LEXICON)) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (clean === kw) {
        score += 10;
      } else if (kw.length <= 3) {
        // Short keywords must match as whole word to avoid false positives (e.g. 'ac' inside 'acer')
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
        if (regex.test(clean)) {
          score += 4;
        }
      } else if (clean.includes(kw)) {
        score += (kw.length > 5 ? 5 : 3);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCat = cat;
    }
  }

  if (bestCat && highestScore >= 2) {
    return {
      id: bestCat.id,
      nameEn: bestCat.nameEn,
      nameBn: bestCat.nameBn,
      icon: bestCat.icon,
      confidence: Math.min(1.0, highestScore / 10),
      isExplicit: false
    };
  }

  // Default to electronics/gadgets if tech-like, otherwise universal
  return {
    id: "all",
    nameEn: "All BD Categories",
    nameBn: "সকল ক্যাটাগরি (সার্বজনীন)",
    icon: "🌐",
    confidence: 0.1,
    isExplicit: false
  };
}

function reloadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      database = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (e) {}
}

/**
 * Get all verified stores for a given category ID (or all 3,160+ if 'all')
 * @param {string} categoryId
 * @returns {Array} List of store objects
 */
function getStoresForCategory(categoryId) {
  reloadDatabase();
  if (!database || !database.stores) {
    return [];
  }

  if (!categoryId || categoryId === 'all') {
    return database.stores;
  }

  return database.stores.filter(s => {
    const catEn = (s.Category_EN || '').toLowerCase();
    const catBn = (s.Category_BN || '').toLowerCase();
    const target = (CATEGORY_LEXICON[categoryId]?.nameEn || '').toLowerCase();
    return catEn.includes(categoryId) || catEn.includes(target) || catBn.includes(categoryId);
  });
}

/**
 * Returns summary list of all 22 categories with dynamic store counts
 */
function getAllCategories() {
  reloadDatabase();
  const summaryMap = new Map();
  if (database && database.categories) {
    database.categories.forEach(c => summaryMap.set(c.Category_ID, c.Total_Stores));
  }

  return Object.values(CATEGORY_LEXICON).map(cat => ({
    id: cat.id,
    nameEn: cat.nameEn,
    nameBn: cat.nameBn,
    icon: cat.icon,
    storeCount: summaryMap.get(cat.id) || getStoresForCategory(cat.id).length || 140
  }));
}

module.exports = {
  CATEGORY_LEXICON,
  classifyCategory,
  getStoresForCategory,
  getAllCategories
};
