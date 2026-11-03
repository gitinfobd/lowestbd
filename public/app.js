// BD Price Sentinel - Liquid Crystal Frontend Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const searchSubmitBtn = document.getElementById('searchSubmitBtn');
  const searchIcon = document.getElementById('searchIcon');
  const urlDetectBanner = document.getElementById('urlDetectBanner');
  const loadingState = document.getElementById('loadingState');
  const resultsSection = document.getElementById('resultsSection');
  const inspectedBox = document.getElementById('inspectedBox');
  const top3Container = document.getElementById('top3Container');
  const allDealsContainer = document.getElementById('allDealsContainer');
  const allDealsCount = document.getElementById('allDealsCount');
  const storeFilter = document.getElementById('storeFilter');
  const stockFilter = document.getElementById('stockFilter');
  const sortBy = document.getElementById('sortBy');
  const copyApiBtn = document.getElementById('copyApiBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Inspected DOM
  const inspectedTitle = document.getElementById('inspectedTitle');
  const inspectedPrice = document.getElementById('inspectedPrice');
  const inspectedStoreName = document.getElementById('inspectedStoreName');
  const inspectedLink = document.getElementById('inspectedLink');

  // Telemetry DOM
  const statLowest = document.getElementById('statLowest');
  const statLowestStore = document.getElementById('statLowestStore');
  const statAvg = document.getElementById('statAvg');
  const statSavings = document.getElementById('statSavings');
  const statTotalDeals = document.getElementById('statTotalDeals');
  const statScanTime = document.getElementById('statScanTime');

  // Comparison Drawer & Modal DOM
  const comparisonDrawer = document.getElementById('comparisonDrawer');
  const compareCount = document.getElementById('compareCount');
  const drawerThumbnails = document.getElementById('drawerThumbnails');
  const clearCompareBtn = document.getElementById('clearCompareBtn');
  const openCompareModalBtn = document.getElementById('openCompareModalBtn');
  const compareModal = document.getElementById('compareModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalBackdrop = document.getElementById('closeModalBackdrop');
  const comparisonMatrix = document.getElementById('comparisonMatrix');

  // Application State
  let currentData = null;
  let compareList = []; // Up to 3 products

  // 1. Theme Engine (Light / Dark Crystal Mode)
  const savedTheme = localStorage.getItem('bd_sentinel_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bd_sentinel_theme', newTheme);
  });

  // 2. URL Link Detection in Search Input
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    clearBtn.style.display = val ? 'flex' : 'none';

    const isUrl = /^https?:\/\//i.test(val);
    if (isUrl) {
      searchIcon.textContent = '🔗';
      urlDetectBanner.style.display = 'block';
    } else {
      searchIcon.textContent = '🔍';
      urlDetectBanner.style.display = 'none';
    }
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchIcon.textContent = '🔍';
    urlDetectBanner.style.display = 'none';
    searchInput.focus();
  });

  // 3. Preset Keyword Chips
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (q) {
        searchInput.value = q;
        clearBtn.style.display = 'flex';
        const isUrl = /^https?:\/\//i.test(q);
        searchIcon.textContent = isUrl ? '🔗' : '🔍';
        urlDetectBanner.style.display = isUrl ? 'block' : 'none';
        executeSearch(q);
      }
    });
  });

  // 4. Form Submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) {
      executeSearch(q);
    }
  });

  // 5. Filter & Sort Handlers
  storeFilter.addEventListener('change', renderDeals);
  stockFilter.addEventListener('change', renderDeals);
  sortBy.addEventListener('change', renderDeals);

  // 6. Copy API Code
  if (copyApiBtn) {
    copyApiBtn.addEventListener('click', () => {
      const code = `fetch('http://${window.location.host}/api/search?q=Acer+Nitro+V15')\n  .then(res => res.json())\n  .then(data => console.log(data));`;
      navigator.clipboard.writeText(code).then(() => {
        copyApiBtn.textContent = 'কপি সম্পন্ন! ✓';
        setTimeout(() => {
          copyApiBtn.textContent = '📋 কোড কপি করুন';
        }, 2000);
      });
    });
  }

  // 7. Comparison Drawer & Modal Logic
  clearCompareBtn.addEventListener('click', () => {
    compareList = [];
    updateCompareUI();
    renderDeals();
    renderTop3(currentData ? currentData.top3 : []);
  });

  openCompareModalBtn.addEventListener('click', () => {
    if (compareList.length === 0) return;
    renderComparisonMatrix();
    compareModal.style.display = 'flex';
  });

  closeModalBtn.addEventListener('click', () => {
    compareModal.style.display = 'none';
  });

  closeModalBackdrop.addEventListener('click', () => {
    compareModal.style.display = 'none';
  });

  // Toggle item in comparison list (max 3)
  function toggleCompare(item) {
    const existingIndex = compareList.findIndex(x => x.link === item.link);
    if (existingIndex !== -1) {
      compareList.splice(existingIndex, 1);
    } else {
      if (compareList.length >= 3) {
        alert('আপনি সর্বোচ্চ ৩টি প্রোডাক্ট একসাথে তুলনা করতে পারবেন। অন্যটি যুক্ত করতে একটি মুছে ফেলুন।');
        return;
      }
      compareList.push(item);
    }
    updateCompareUI();
    renderDeals();
    renderTop3(currentData ? currentData.top3 : []);
  }

  function updateCompareUI() {
    compareCount.textContent = compareList.length;
    drawerThumbnails.innerHTML = '';

    if (compareList.length > 0) {
      comparisonDrawer.style.display = 'block';
      compareList.forEach((item, idx) => {
        const chip = document.createElement('div');
        chip.className = 'drawer-item-chip';
        const priceStr = item.price > 0 ? `৳${item.price.toLocaleString()}` : 'Call';
        chip.innerHTML = `
          <span>${item.storeLogo || '🏬'}</span>
          <span><strong>${escapeHtml(item.source)}:</strong> ${priceStr}</span>
          <button class="remove-item-btn" data-index="${idx}">✕</button>
        `;
        chip.querySelector('.remove-item-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          compareList.splice(idx, 1);
          updateCompareUI();
          renderDeals();
          renderTop3(currentData ? currentData.top3 : []);
        });
        drawerThumbnails.appendChild(chip);
      });
    } else {
      comparisonDrawer.style.display = 'none';
    }
  }

  // Render Side-by-Side Comparison Matrix (Up to 3 Columns in One Row)
  function renderComparisonMatrix() {
    comparisonMatrix.style.setProperty('--cols', compareList.length);
    comparisonMatrix.innerHTML = '';

    const validPrices = compareList.map(i => i.price).filter(p => p > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

    compareList.forEach(item => {
      const isCheapest = item.price > 0 && item.price === minPrice;
      const col = document.createElement('div');
      col.className = `matrix-col ${isCheapest ? 'matrix-col-cheapest' : ''}`;

      let diffText = 'সবচেয়ে কম দাম!';
      if (item.price > minPrice && minPrice > 0) {
        const diff = item.price - minPrice;
        diffText = `+৳${diff.toLocaleString()} বেশি`;
      } else if (!item.price) {
        diffText = 'মূল্য যাচাইাধীন';
      }

      const offersText = (item.offers && item.offers.length > 0)
        ? item.offers.join(' • ')
        : 'স্টোর স্ট্যান্ডার্ড পলিসি';

      col.innerHTML = `
        <div class="matrix-col-header">
          <div class="deal-store-pill">
            <span>${item.storeLogo || '🏬'}</span>
            <span>${escapeHtml(item.source)}</span>
          </div>
          ${isCheapest ? '<span class="matrix-cheapest-badge">🏆 সর্বনিম্ন মূল্য</span>' : ''}
        </div>

        <h4 class="matrix-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>

        <div class="matrix-price-section">
          <div class="matrix-row-label">মূল্য (BDT)</div>
          <div class="matrix-price-val">${item.price > 0 ? '৳' + item.price.toLocaleString() : 'Call for Price'}</div>
          <div class="matrix-diff">${diffText}</div>
        </div>

        <div class="matrix-row-item">
          <span class="matrix-row-label">স্টক স্ট্যাটাস</span>
          <span class="${item.inStock ? 'text-emerald' : 'text-rose'}" style="font-weight:700;">
            ${item.inStock ? '✓ ইন-স্টক (In Stock)' : '✕ স্টক শেষ (Out of Stock)'}
          </span>
        </div>

        <div class="matrix-row-item">
          <span class="matrix-row-label">ডিসকাউন্ট ও অফার</span>
          <span>${item.discount > 0 ? `${item.discount}% OFF • ` : ''}${escapeHtml(offersText)}</span>
        </div>

        <div class="matrix-row-item">
          <span class="matrix-row-label">স্টোর ভেরিফিকেশন</span>
          <span>✓ ${escapeHtml(item.badge || 'Verified')}</span>
        </div>

        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="buy-now-btn" style="margin-top:auto;">
          <span>${escapeHtml(item.source)} থেকে কিনুন</span>
          <span>↗</span>
        </a>
      `;

      comparisonMatrix.appendChild(col);
    });
  }

  // 8. Execute Search
  async function executeSearch(query) {
    loadingState.style.display = 'block';
    resultsSection.style.display = 'none';
    searchSubmitBtn.disabled = true;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      currentData = data;

      // Handle Inspected URL display
      if (data.inspectedProduct) {
        inspectedBox.style.display = 'block';
        inspectedTitle.textContent = data.inspectedProduct.title;
        inspectedStoreName.textContent = data.inspectedProduct.source;
        inspectedPrice.textContent = data.inspectedProduct.price > 0 
          ? `৳${data.inspectedProduct.price.toLocaleString()}` 
          : 'স্টোরে বিস্তারিত দেখুন';
        inspectedLink.href = data.inspectedProduct.link;
      } else {
        inspectedBox.style.display = 'none';
      }

      populateStoreFilter(data.allDeals || []);
      renderTelemetry(data);
      renderTop3(data.top3 || []);
      renderDeals();

      loadingState.style.display = 'none';
      resultsSection.style.display = 'block';
    } catch (err) {
      loadingState.style.display = 'none';
      alert('অনুসন্ধানে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      searchSubmitBtn.disabled = false;
    }
  }

  // Populate store filter dropdown
  function populateStoreFilter(deals) {
    const stores = new Set();
    deals.forEach(d => {
      if (d.source) stores.add(d.source);
    });

    storeFilter.innerHTML = '<option value="all">সকল স্টোর (All Stores)</option>';
    Array.from(stores).sort().forEach(storeName => {
      const opt = document.createElement('option');
      opt.value = storeName;
      opt.textContent = storeName;
      storeFilter.appendChild(opt);
    });
  }

  // Render Telemetry
  function renderTelemetry(data) {
    const summary = data.summary;
    if (summary) {
      statLowest.textContent = `৳${summary.minPrice.toLocaleString()}`;
      statLowestStore.textContent = summary.bestDealStore ? `সেরা ডিল: ${summary.bestDealStore}` : '';
      statAvg.textContent = `৳${summary.avgPrice.toLocaleString()}`;
      statSavings.textContent = summary.maxSavings > 0 ? `৳${summary.maxSavings.toLocaleString()}` : '৳০';
    } else {
      statLowest.textContent = 'মূল্য যাচাইাধীন';
      statLowestStore.textContent = '';
      statAvg.textContent = '-';
      statSavings.textContent = '০';
    }

    statTotalDeals.textContent = `${data.totalFound || 0}টি`;
    const sec = (data.executionTimeMs / 1000).toFixed(1);
    statScanTime.textContent = `${sec} সেকেন্ডে ${data.storesScannedCount || '৩০০+'} সাইট স্ক্যান সম্পন্ন`;
  }

  // Render Top 3 Podium Cards
  function renderTop3(top3) {
    top3Container.innerHTML = '';
    if (!top3 || top3.length === 0) {
      top3Container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">কোনো শীর্ষ ডিল পাওয়া যায়নি।</p>';
      return;
    }

    top3.forEach((item, idx) => {
      const card = document.createElement('div');
      const rankClass = idx === 0 ? 'podium-gold' : (idx === 1 ? 'podium-silver' : 'podium-bronze');
      card.className = `podium-card ${rankClass}`;

      const offersHtml = (item.offers || []).map(o => `<span class="offer-tag">${escapeHtml(o)}</span>`).join('');
      const discountHtml = item.discount > 0 
        ? `<span class="price-discount-tag">${item.discount}% OFF</span>` 
        : '';
      const oldPriceHtml = item.originalPrice > item.price && item.discount > 0
        ? `<span class="price-old">৳${item.originalPrice.toLocaleString()}</span>`
        : '';

      const isSelected = compareList.some(c => c.link === item.link);

      card.innerHTML = `
        <div class="crown-badge">${escapeHtml(item.crown || `#${idx + 1}`)}</div>
        <div class="podium-store">
          <span class="store-logo">${item.storeLogo || '🏬'}</span>
          <div>
            <div class="store-name-text">${escapeHtml(item.source)}</div>
            <span class="store-badge-verified">✓ ${escapeHtml(item.badge || 'Verified')}</span>
          </div>
        </div>
        <h4 class="podium-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
        <div class="podium-price-box">
          <div class="price-main">৳${item.price.toLocaleString()}</div>
          <div class="price-old-wrapper">
            ${oldPriceHtml}
            ${discountHtml}
          </div>
        </div>
        <div class="podium-offers">
          ${offersHtml || '<span class="offer-tag" style="opacity:0.6;">সরাসরি স্টোর ভেরিফাইড</span>'}
        </div>
        <div class="podium-actions">
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="buy-now-btn">
            <span>${escapeHtml(item.source)} থেকে কিনুন</span>
            <span>→</span>
          </a>
          <button class="compare-add-btn ${isSelected ? 'active' : ''}" data-link="${escapeHtml(item.link)}">
            ${isSelected ? '✓ নির্বাচিত' : '⚖️ তুলনা'}
          </button>
        </div>
      `;

      card.querySelector('.compare-add-btn').addEventListener('click', () => {
        toggleCompare(item);
      });

      top3Container.appendChild(card);
    });
  }

  // Render All Deals
  function renderDeals() {
    if (!currentData || !currentData.allDeals) return;

    let deals = [...currentData.allDeals];
    const selectedStore = storeFilter.value;
    const inStockOnly = stockFilter.checked;
    const sort = sortBy.value;

    if (selectedStore !== 'all') {
      deals = deals.filter(d => d.source === selectedStore);
    }

    if (inStockOnly) {
      deals = deals.filter(d => d.inStock === true);
    }

    if (sort === 'price-asc') {
      deals.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return a.price - b.price;
      });
    } else if (sort === 'price-desc') {
      deals.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'discount-desc') {
      deals.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sort === 'relevance') {
      deals.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    allDealsCount.textContent = deals.length;
    allDealsContainer.innerHTML = '';

    if (deals.length === 0) {
      allDealsContainer.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px 0;">কোনো ফিল্টার করা ডিল পাওয়া যায়নি।</p>';
      return;
    }

    deals.forEach(item => {
      const card = document.createElement('div');
      card.className = 'deal-card';

      const stockBadge = item.inStock 
        ? '<span class="deal-stock-pill stock-in">In Stock</span>' 
        : '<span class="deal-stock-pill stock-out">Out of Stock</span>';

      const priceHtml = item.price > 0 
        ? `<span class="deal-price">৳${item.price.toLocaleString()}</span>` 
        : `<span class="deal-price-unpriced">Call for Price</span>`;

      const discountTag = item.discount > 0 
        ? `<span class="price-discount-tag">${item.discount}% OFF</span>` 
        : '';

      const isSelected = compareList.some(c => c.link === item.link);

      card.innerHTML = `
        <div class="deal-card-header">
          <div class="deal-store-pill">
            <span>${item.storeLogo || '🏬'}</span>
            <span>${escapeHtml(item.source)}</span>
          </div>
          ${stockBadge}
        </div>
        <h5 class="deal-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h5>
        <div class="deal-price-row">
          <div>${priceHtml}</div>
          ${discountTag}
        </div>
        <div class="deal-actions">
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="deal-action-btn">
            স্টোর ভিজিট ↗
          </a>
          <button class="compare-add-btn ${isSelected ? 'active' : ''}" data-link="${escapeHtml(item.link)}">
            ${isSelected ? '✓' : '⚖️ তুলনা'}
          </button>
        </div>
      `;

      card.querySelector('.compare-add-btn').addEventListener('click', () => {
        toggleCompare(item);
      });

      allDealsContainer.appendChild(card);
    });
  }

  // Safe HTML Escaping (Alibaba Security Standard)
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
