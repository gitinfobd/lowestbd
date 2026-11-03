// BD Price Sentinel Frontend Engine
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const searchSubmitBtn = document.getElementById('searchSubmitBtn');
  const loadingState = document.getElementById('loadingState');
  const resultsSection = document.getElementById('resultsSection');
  const top3Container = document.getElementById('top3Container');
  const allDealsContainer = document.getElementById('allDealsContainer');
  const allDealsCount = document.getElementById('allDealsCount');
  const storeFilter = document.getElementById('storeFilter');
  const stockFilter = document.getElementById('stockFilter');
  const sortBy = document.getElementById('sortBy');
  const copyApiBtn = document.getElementById('copyApiBtn');

  // Telemetry DOM
  const statLowest = document.getElementById('statLowest');
  const statLowestStore = document.getElementById('statLowestStore');
  const statAvg = document.getElementById('statAvg');
  const statSavings = document.getElementById('statSavings');
  const statTotalDeals = document.getElementById('statTotalDeals');
  const statScanTime = document.getElementById('statScanTime');

  let currentData = null;

  // Clear button toggle
  searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value.trim() ? 'flex' : 'none';
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
  });

  // Preset keyword chips
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (q) {
        searchInput.value = q;
        clearBtn.style.display = 'flex';
        executeSearch(q);
      }
    });
  });

  // Form submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) {
      executeSearch(q);
    }
  });

  // Filter & sort change handlers
  storeFilter.addEventListener('change', renderDeals);
  stockFilter.addEventListener('change', renderDeals);
  sortBy.addEventListener('change', renderDeals);

  // Copy API code
  if (copyApiBtn) {
    copyApiBtn.addEventListener('click', () => {
      const code = `fetch('http://${window.location.host}/api/search?q=RTX+4060')\n  .then(res => res.json())\n  .then(data => console.log(data));`;
      navigator.clipboard.writeText(code).then(() => {
        copyApiBtn.textContent = 'কপি সম্পন্ন! ✓';
        setTimeout(() => {
          copyApiBtn.textContent = '📋 কোড কপি করুন';
        }, 2000);
      });
    });
  }

  // Execute Search
  async function executeSearch(query) {
    // Show loading
    loadingState.style.display = 'block';
    resultsSection.style.display = 'none';
    searchSubmitBtn.disabled = true;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      currentData = data;

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

  // Render Top 3 Podium
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

      // Offers tags HTML
      const offersHtml = (item.offers || []).map(o => `<span class="offer-tag">${escapeHtml(o)}</span>`).join('');

      // Discount tag
      const discountHtml = item.discount > 0 
        ? `<span class="price-discount-tag">${item.discount}% OFF</span>` 
        : '';

      const oldPriceHtml = item.originalPrice > item.price && item.discount > 0
        ? `<span class="price-old">৳${item.originalPrice.toLocaleString()}</span>`
        : '';

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
        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="buy-now-btn">
          <span>${item.source} থেকে কিনুন</span>
          <span>→</span>
        </a>
      `;

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

    // Filter by store
    if (selectedStore !== 'all') {
      deals = deals.filter(d => d.source === selectedStore);
    }

    // Filter by stock
    if (inStockOnly) {
      deals = deals.filter(d => d.inStock === true);
    }

    // Sort
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
          <div>
            ${priceHtml}
          </div>
          ${discountTag}
        </div>
        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="deal-action-btn">
          স্টোর ভিজিট ও কিনুন ↗
        </a>
      `;

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
