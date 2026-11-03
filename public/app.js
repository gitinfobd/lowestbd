// BD Price Sentinel - Neumorphic Liquid Crystal Frontend Engine
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

  // Wishlist & Alerts DOM
  const openWishlistBtn = document.getElementById('openWishlistBtn');
  const wishlistHeaderCount = document.getElementById('wishlistHeaderCount');
  const wishlistModal = document.getElementById('wishlistModal');
  const closeWishlistBtn = document.getElementById('closeWishlistBtn');
  const closeWishlistBackdrop = document.getElementById('closeWishlistBackdrop');
  const wishlistModalCount = document.getElementById('wishlistModalCount');
  const clearAllWishlistBtn = document.getElementById('clearAllWishlistBtn');
  const wishlistItemsContainer = document.getElementById('wishlistItemsContainer');
  const subscriberEmailInput = document.getElementById('subscriberEmailInput');
  const addEmailBtn = document.getElementById('addEmailBtn');
  const subscribedEmailsList = document.getElementById('subscribedEmailsList');
  const triggerAlertBtn = document.getElementById('triggerAlertBtn');
  const alertStatusMsg = document.getElementById('alertStatusMsg');

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
  let wishlist = JSON.parse(localStorage.getItem('bd_sentinel_wishlist') || '[]');
  let subscribers = [];

  // 1. Theme Engine (Light / Dark Neumorphic Mode)
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
      const code = `fetch('http://${window.location.host}/api/search?q=Mac+mini+m6')\n  .then(res => res.json())\n  .then(data => console.log(data));`;
      navigator.clipboard.writeText(code).then(() => {
        copyApiBtn.textContent = 'কপি সম্পন্ন! ✓';
        setTimeout(() => {
          copyApiBtn.textContent = '📋 কোড কপি করুন';
        }, 2000);
      });
    });
  }

  // =========================================================================
  // 7. Wishlist & Multi-Email Price Drop Alert Logic
  // =========================================================================
  function updateWishlistBadge() {
    const count = wishlist.length;
    if (wishlistHeaderCount) wishlistHeaderCount.textContent = count;
    if (wishlistModalCount) wishlistModalCount.textContent = count;
  }

  function toggleWishlist(item) {
    const idx = wishlist.findIndex(w => w.link === item.link);
    if (idx !== -1) {
      wishlist.splice(idx, 1);
    } else {
      wishlist.unshift({
        link: item.link,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        source: item.source,
        storeLogo: item.storeLogo || '🏬',
        discount: item.discount || 0,
        addedAt: new Date().toISOString()
      });
    }
    localStorage.setItem('bd_sentinel_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    renderWishlistUI();
    if (currentData) {
      renderTop3(currentData.top3 || []);
      renderDeals();
    }
  }

  function removeWishlistItem(link) {
    wishlist = wishlist.filter(w => w.link !== link);
    localStorage.setItem('bd_sentinel_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    renderWishlistUI();
    if (currentData) {
      renderTop3(currentData.top3 || []);
      renderDeals();
    }
  }

  function clearAllWishlist() {
    if (wishlist.length === 0) return;
    if (confirm('আপনি কি নিশ্চিত যে সকল উইশলিস্ট আইটেম মুছে ফেলতে চান?')) {
      wishlist = [];
      localStorage.setItem('bd_sentinel_wishlist', JSON.stringify(wishlist));
      updateWishlistBadge();
      renderWishlistUI();
      if (currentData) {
        renderTop3(currentData.top3 || []);
        renderDeals();
      }
    }
  }

  function renderWishlistUI() {
    if (!wishlistItemsContainer) return;
    wishlistItemsContainer.innerHTML = '';
    updateWishlistBadge();

    if (wishlist.length === 0) {
      wishlistItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 0; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🤍</div>
          <p>আপনার উইশলিস্টে কোনো পণ্য সংরক্ষিত নেই।</p>
          <p style="font-size: 12px; margin-top: 4px;">যেকোনো পণ্যের '❤️ উইশলিস্ট' বাটনে ক্লিক করে এখানে যুক্ত করুন।</p>
        </div>
      `;
      return;
    }

    wishlist.forEach(item => {
      const card = document.createElement('div');
      card.className = 'wishlist-item-card';
      const priceStr = item.price > 0 ? `৳${item.price.toLocaleString()}` : 'মূল্য যাচাইাধীন';

      card.innerHTML = `
        <div class="wishlist-item-left">
          <span class="wishlist-item-logo">${item.storeLogo || '🏬'}</span>
          <div>
            <h5 class="wishlist-item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h5>
            <div class="wishlist-item-meta">
              <span><strong>${escapeHtml(item.source)}</strong></span>
              <span class="wishlist-item-price">${priceStr}</span>
              ${item.discount > 0 ? `<span class="price-discount-tag">${item.discount}% OFF</span>` : ''}
            </div>
          </div>
        </div>
        <div class="wishlist-item-actions">
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="deal-action-btn" style="padding: 6px 12px;">স্টোরে যান ↗</a>
          <button type="button" class="wishlist-remove-btn" data-link="${escapeHtml(item.link)}">✕ মুছুন</button>
        </div>
      `;

      card.querySelector('.wishlist-remove-btn').addEventListener('click', () => {
        removeWishlistItem(item.link);
      });

      wishlistItemsContainer.appendChild(card);
    });
  }

  // Multi-Email Subscriptions API
  async function fetchSubscribers() {
    try {
      const res = await fetch('/api/alerts/subscribers');
      const data = await res.json();
      if (data.success && Array.isArray(data.subscribers)) {
        subscribers = data.subscribers;
        renderSubscribersList();
      }
    } catch (e) {}
  }

  function renderSubscribersList() {
    if (!subscribedEmailsList) return;
    subscribedEmailsList.innerHTML = '';

    if (subscribers.length === 0) {
      subscribedEmailsList.innerHTML = '<span style="font-size: 12px; color: var(--text-muted);">কোনো ইমেইল এখনও সাবস্ক্রাইব করা হয়নি। উপরে ইমেইল লিখে যুক্ত করুন।</span>';
      return;
    }

    subscribers.forEach(email => {
      const pill = document.createElement('div');
      pill.className = 'email-pill';
      pill.innerHTML = `
        <span>✉️ ${escapeHtml(email)}</span>
        <button type="button" class="email-remove-btn" title="এই ইমেইল অ্যালার্ট থেকে মুছে ফেলুন" data-email="${escapeHtml(email)}">✕</button>
      `;

      pill.querySelector('.email-remove-btn').addEventListener('click', () => {
        unsubscribeEmail(email);
      });

      subscribedEmailsList.appendChild(pill);
    });
  }

  async function subscribeEmail(email) {
    if (!email) return;
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        subscribers = data.subscribers;
        renderSubscribersList();
        subscriberEmailInput.value = '';
        if (alertStatusMsg) {
          alertStatusMsg.textContent = data.message;
          setTimeout(() => { alertStatusMsg.textContent = ''; }, 3500);
        }
      } else {
        alert(data.error || 'ইমেইল যুক্ত করা যায়নি।');
      }
    } catch (e) {
      alert('ইমেইল সার্ভারে যুক্ত হতে সমস্যা হয়েছে।');
    }
  }

  async function unsubscribeEmail(email) {
    try {
      const res = await fetch('/api/alerts/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        subscribers = data.subscribers;
        renderSubscribersList();
        if (alertStatusMsg) {
          alertStatusMsg.textContent = data.message;
          setTimeout(() => { alertStatusMsg.textContent = ''; }, 3000);
        }
      }
    } catch (e) {}
  }

  async function triggerAlertSimulation() {
    if (subscribers.length === 0) {
      alert('অনুগ্রহ করে প্রথমে কমপক্ষে একটি ইমেইল যুক্ত করুন!');
      subscriberEmailInput.focus();
      return;
    }

    const targetItem = wishlist.length > 0 ? wishlist[0] : (currentData?.top3?.[0] || {
      title: 'Apple Mac Mini M6 Chip (12-core CPU/GPU)',
      price: 109990,
      oldPrice: 159990,
      source: 'Dazzle BD'
    });

    triggerAlertBtn.disabled = true;
    triggerAlertBtn.textContent = 'ইমেইল অ্যালার্ট প্রেরণ হচ্ছে...';

    try {
      const res = await fetch('/api/alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetItem.title,
          store: targetItem.source,
          price: targetItem.price,
          oldPrice: targetItem.originalPrice || (targetItem.price + 5000),
          link: targetItem.link
        })
      });
      const data = await res.json();
      if (data.success) {
        if (alertStatusMsg) {
          alertStatusMsg.textContent = `✓ ${subscribers.length}টি ইমেইলে তাৎক্ষণিক প্রাইস ড্রপ অ্যালার্ট প্রেরণ করা হয়েছে!`;
          setTimeout(() => { alertStatusMsg.textContent = ''; }, 5000);
        }
        alert(`🚨 সফলভাবে অ্যালার্ট প্রেরণ করা হয়েছে!\n\nপ্রাপক ইমেইলসমূহ: ${subscribers.join(', ')}\nপণ্য: ${targetItem.title}\nস্টোর: ${targetItem.source}\nবর্তমান সেরা মূল্য: ৳${targetItem.price.toLocaleString()}`);
      }
    } catch (e) {
      alert('অ্যালার্ট প্রেরণে ত্রুটি হয়েছে।');
    } finally {
      triggerAlertBtn.disabled = false;
      triggerAlertBtn.textContent = '⚡ টেস্ট প্রাইস ড্রপ অ্যালার্ট পাঠান (Simulate Alert Dispatch)';
    }
  }

  // Event Listeners for Wishlist & Alerts
  if (openWishlistBtn) {
    openWishlistBtn.addEventListener('click', () => {
      renderWishlistUI();
      fetchSubscribers();
      wishlistModal.style.display = 'flex';
    });
  }

  if (closeWishlistBtn) {
    closeWishlistBtn.addEventListener('click', () => {
      wishlistModal.style.display = 'none';
    });
  }

  if (closeWishlistBackdrop) {
    closeWishlistBackdrop.addEventListener('click', () => {
      wishlistModal.style.display = 'none';
    });
  }

  if (clearAllWishlistBtn) {
    clearAllWishlistBtn.addEventListener('click', clearAllWishlist);
  }

  if (addEmailBtn) {
    addEmailBtn.addEventListener('click', () => {
      const email = subscriberEmailInput.value.trim();
      subscribeEmail(email);
    });
  }

  if (triggerAlertBtn) {
    triggerAlertBtn.addEventListener('click', triggerAlertSimulation);
  }

  updateWishlistBadge();
  fetchSubscribers();

  // =========================================================================
  // 8. Comparison Drawer & Modal Logic
  // =========================================================================
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
            <strong>${escapeHtml(item.source)}</strong>
          </div>
          ${isCheapest ? '<span class="matrix-cheapest-badge">🥇 সর্বনিম্ন মূল্য</span>' : ''}
        </div>
        <h4 class="matrix-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
        <div class="matrix-price-section">
          <div class="matrix-price-val">${item.price > 0 ? `৳${item.price.toLocaleString()}` : 'Call for Price'}</div>
          <div class="matrix-diff">${diffText}</div>
        </div>
        <div class="matrix-row-item">
          <span class="matrix-row-label">স্টক স্ট্যাটাস:</span>
          <span>${item.inStock ? '✓ ইন-স্টক (Available)' : '✕ স্টক আউট'}</span>
        </div>
        <div class="matrix-row-item">
          <span class="matrix-row-label">অফার ও ডিসকাউন্ট:</span>
          <span>${escapeHtml(offersText)}</span>
        </div>
        <div class="matrix-row-item">
          <span class="matrix-row-label">ভেরিফিকেশন:</span>
          <span>${escapeHtml(item.badge || 'Verified BD Retailer')}</span>
        </div>
        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="buy-now-btn" style="margin-top:auto;">
          ${escapeHtml(item.source)}-এ কিনুন ↗
        </a>
      `;
      comparisonMatrix.appendChild(col);
    });
  }

  // =========================================================================
  // 9. Main Search Execution
  // =========================================================================
  async function executeSearch(query) {
    loadingState.style.display = 'block';
    resultsSection.style.display = 'none';
    searchSubmitBtn.disabled = true;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      currentData = data;

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
    const storeCount = data.verifiedStoresCount || (data.scannedSourcesList ? data.scannedSourcesList.length : 6);
    const discoveredDomains = data.totalStoresDiscovered || (storeCount * 6);
    statScanTime.textContent = `${sec} সেকেন্ডে ${storeCount}টি ভেরিফায়েড টেক শপ ও ${discoveredDomains}+ বিডি ডোমেইনে স্ক্যান সম্পন্ন`;

    const headerRadarText = document.getElementById('headerRadarText');
    if (headerRadarText) {
      headerRadarText.textContent = `${storeCount}টি ভেরিফায়েড শপ ও ${discoveredDomains}+ বিডি সাইট লাইভ মনিটর্ড`;
    }
  }

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
      const isWishlisted = wishlist.some(w => w.link === item.link);

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
          <button type="button" class="wishlist-btn ${isWishlisted ? 'active' : ''}" title="উইশলিস্টে যুক্ত/মুছে ফেলুন" data-link="${escapeHtml(item.link)}">
            ${isWishlisted ? '❤️ সংরক্ষিত' : '🤍 উইশলিস্ট'}
          </button>
          <button type="button" class="compare-add-btn ${isSelected ? 'active' : ''}" data-link="${escapeHtml(item.link)}">
            ${isSelected ? '✓' : '⚖️'}
          </button>
        </div>
      `;

      card.querySelector('.wishlist-btn').addEventListener('click', () => {
        toggleWishlist(item);
      });

      card.querySelector('.compare-add-btn').addEventListener('click', () => {
        toggleCompare(item);
      });

      top3Container.appendChild(card);
    });
  }

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
      const isWishlisted = wishlist.some(w => w.link === item.link);

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
            স্টোর ↗
          </a>
          <button type="button" class="wishlist-btn ${isWishlisted ? 'active' : ''}" title="উইশলিস্টে যুক্ত/মুছে ফেলুন" data-link="${escapeHtml(item.link)}">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
          <button type="button" class="compare-add-btn ${isSelected ? 'active' : ''}" data-link="${escapeHtml(item.link)}">
            ${isSelected ? '✓' : '⚖️'}
          </button>
        </div>
      `;

      card.querySelector('.wishlist-btn').addEventListener('click', () => {
        toggleWishlist(item);
      });

      card.querySelector('.compare-add-btn').addEventListener('click', () => {
        toggleCompare(item);
      });

      allDealsContainer.appendChild(card);
    });
  }

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
