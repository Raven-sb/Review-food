/* Vị Việt - web review ẩm thực Việt Nam (HTML/CSS/JS thuần) */
(() => {
  'use strict';

  const { CURATED_PLACES, CITY_CENTERS, CUISINE_EMOJI } = window.FOOD_DATA;

  const LS = {
    reviews: 'vi-viet-reviews-v1',
    favorites: 'vi-viet-favorites-v1',
    apiKey: 'vi-viet-google-key',
    apiCache: 'vi-viet-google-places-v1'
  };

  const FIELDS = [
    'places.id', 'places.displayName', 'places.formattedAddress', 'places.rating',
    'places.userRatingCount', 'places.location', 'places.priceLevel', 'places.types',
    'places.googleMapsUri', 'places.photos', 'places.regularOpeningHours',
    'places.nationalPhoneNumber', 'places.websiteUri', 'places.reviews',
    'places.editorialSummary'
  ].join(',');

  const TYPE_LABELS = {
    restaurant: 'Nhà hàng', cafe: 'Cà phê', bakery: 'Bánh', food: 'Đường phố',
    meal_takeaway: 'Mang đi', meal_delivery: 'Giao hàng', bar: 'Bar',
    ice_cream_shop: 'Kem', juice_shop: 'Nước ép', grocery_or_supermarket: 'Tạp hóa'
  };

  const PRICE_LABELS = ['Miễn phí', 'Tiết kiệm', 'Trung bình', 'Cao', 'Rất cao'];

  const state = {
    source: 'curated',
    favorites: new Set(loadJSON(LS.favorites, [])),
    userReviews: loadJSON(LS.reviews, {}),
    apiCache: loadJSON(LS.apiCache, {}),
    filters: { q: '', city: '', cuisine: '', minRating: 0, sort: 'rating', favOnly: false }
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- Tiện ích ---------- */
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('Không đọc được dữ liệu lưu:', key, e);
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn('Không lưu được:', key, e); }
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function compact(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + 'tr';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + 'k';
    return String(n);
  }

  function emojiFor(place) {
    return CUISINE_EMOJI[place.cuisine] || (place.cuisine === 'Nhà hàng' ? '🍽️' : '🍜');
  }

  function starString(rating) {
    const full = Math.round(Number(rating) || 0);
    return '★'.repeat(Math.max(0, Math.min(5, full))) + '☆'.repeat(Math.max(0, 5 - full));
  }

  let toastTimer;
  function toast(message, isError = false) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  /* ---------- Dữ liệu ---------- */
  function currentPlaces() {
    if (state.source === 'curated') return CURATED_PLACES;
    const seen = new Set();
    const list = [];
    Object.values(state.apiCache).forEach((group) => {
      (group.places || []).forEach((place) => {
        if (!seen.has(place.id)) { seen.add(place.id); list.push(place); }
      });
    });
    return list;
  }

  function findPlace(id) {
    return currentPlaces().find((p) => p.id === id) || null;
  }

  function filteredPlaces() {
    const f = state.filters;
    const q = norm(f.q.trim());
    let list = currentPlaces().filter((p) => {
      if (f.city && p.city !== f.city) return false;
      if (f.cuisine && p.cuisine !== f.cuisine) return false;
      if (Number(p.rating) < f.minRating) return false;
      if (f.favOnly && !state.favorites.has(p.id)) return false;
      if (q) {
        const haystack = norm([p.name, p.city, p.district, p.address, p.cuisine,
          p.description, (p.tags || []).join(' '), (p.dishes || []).join(' ')].join(' '));
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    switch (f.sort) {
      case 'reviews': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name, 'vi')); break;
      case 'price': list.sort((a, b) => (a.priceLevel || 0) - (b.priceLevel || 0) || b.rating - a.rating); break;
      default: list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }
    return list;
  }

  /* ---------- Render ---------- */
  function renderStats() {
    const places = currentPlaces();
    const cities = new Set(places.map((p) => p.city)).size;
    const avg = places.length
      ? (places.reduce((s, p) => s + (Number(p.rating) || 0), 0) / places.length).toFixed(1)
      : '0';
    const total = places.reduce((s, p) => s + (Number(p.reviewCount) || 0), 0);
    $('#heroStats').innerHTML = [
      [places.length, 'quán trong danh sách'],
      [cities, 'thành phố'],
      [avg + ' ★', 'điểm trung bình'],
      [compact(total), 'lượt đánh giá']
    ].map(([value, label]) => `
      <div class="stat-box"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>
    `).join('');
  }

  function cardImage(place, extraClass = '') {
    const emoji = emojiFor(place);
    return `
      <div class="card-image ${extraClass}">
        <span class="img-fallback" aria-hidden="true">${esc(emoji)}</span>
        ${place.image ? `<img src="${esc(place.image)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
        <button class="fav-btn ${state.favorites.has(place.id) ? 'active' : ''}" type="button"
          data-fav="${esc(place.id)}" aria-label="Yêu thích ${esc(place.name)}"
          title="Lưu vào yêu thích">${state.favorites.has(place.id) ? '♥' : '♡'}</button>
        <span class="rating-pill"><span class="star">★</span>${Number(place.rating).toFixed(1)}</span>
      </div>`;
  }

  function placeCard(place) {
    const emoji = emojiFor(place);
    return `
      <article class="place-card" data-detail="${esc(place.id)}" tabindex="0" role="button"
        aria-label="Xem chi tiết ${esc(place.name)}">
        ${cardImage(place)}
        <div class="card-content">
          <div class="card-kicker">
            <span>${esc(emoji)} ${esc(place.cuisine)}</span><span class="dot"></span>
            <span>${esc(place.district || place.city)}</span>
          </div>
          <h3>${esc(place.name)}</h3>
          <p class="card-desc">${esc(place.description)}</p>
          <div class="card-tags">${(place.tags || []).slice(0, 3).map((t) => `<span class="mini-tag">${esc(t)}</span>`).join('')}</div>
          <div class="card-footer">
            <span class="card-meta">${esc(place.price)}<br><strong>${compact(place.reviewCount)}</strong> review</span>
            <span class="card-actions">
              <a class="small-btn" href="${esc(place.mapsUrl)}" target="_blank" rel="noopener"
                data-maps="1" title="Mở trong Google Maps">📍 Maps</a>
              <button class="small-btn primary" type="button" data-detail="${esc(place.id)}">Chi tiết</button>
            </span>
          </div>
        </div>
      </article>`;
  }

  function renderCards() {
    const list = filteredPlaces();
    const grid = $('#placeGrid');
    const empty = $('#emptyState');
    grid.innerHTML = list.map(placeCard).join('');
    empty.hidden = list.length > 0;
    if (!list.length) {
      $('#emptyText').textContent = state.source === 'api' && !currentPlaces().length
        ? 'Chưa có dữ liệu Google Maps. Nhấn biểu tượng ⚙ để nhập API key và tải quán.'
        : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm nhé.';
    }
    $('#resultSummary').textContent = `Hiển thị ${list.length} / ${currentPlaces().length} quán` +
      (state.source === 'api' ? ' · dữ liệu từ Google Maps API' : ' · dữ liệu mẫu');
  }

  function renderTop() {
    const top = [...currentPlaces()]
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, 3);
    const medals = ['🥇', '🥈', '🥉'];
    $('#topGrid').innerHTML = top.map((place, i) => `
      <article class="top-card" data-detail="${esc(place.id)}" tabindex="0" role="button">
        <span class="medal">${medals[i]} Top ${i + 1}</span>
        ${cardImage(place)}
        <div class="card-content">
          <div class="card-kicker"><span>${esc(emojiFor(place))} ${esc(place.cuisine)}</span><span class="dot"></span><span>${esc(place.city)}</span></div>
          <h3>${esc(place.name)}</h3>
          <p class="card-desc">${esc(place.description)}</p>
          <div class="card-footer">
            <span class="card-meta"><strong>★ ${Number(place.rating).toFixed(1)}</strong> · ${compact(place.reviewCount)} review</span>
            <button class="small-btn primary" type="button" data-detail="${esc(place.id)}">Xem</button>
          </div>
        </div>
      </article>`).join('');
  }

  function renderFilters() {
    const places = currentPlaces();
    const citySelect = $('#cityFilter');
    const previousCity = state.filters.city;
    const cities = [...new Set(places.map((p) => p.city))].sort((a, b) => a.localeCompare(b, 'vi'));
    citySelect.innerHTML = '<option value="">Tất cả thành phố</option>' +
      cities.map((c) => `<option value="${esc(c)}"${c === previousCity ? ' selected' : ''}>${esc(c)}</option>`).join('');
    if (previousCity && !cities.includes(previousCity)) {
      state.filters.city = '';
      citySelect.value = '';
    }

    const counts = {};
    places.forEach((p) => { counts[p.cuisine] = (counts[p.cuisine] || 0) + 1; });
    const cuisines = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    if (state.filters.cuisine && !cuisines.includes(state.filters.cuisine)) state.filters.cuisine = '';

    $('#cuisineChips').innerHTML = `
      <button class="chip ${!state.filters.cuisine ? 'active' : ''}" type="button" data-cuisine="">Tất cả món</button>
      ${cuisines.map((c) => `<button class="chip ${state.filters.cuisine === c ? 'active' : ''}" type="button" data-cuisine="${esc(c)}">${esc(emojiFor({ cuisine: c }))} ${esc(c)} <small>(${counts[c]})</small></button>`).join('')}
    `;
  }

  function updateSourceUI() {
    $$('.source-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.source === state.source));
    $('#sourceBadge').textContent = state.source === 'api'
      ? `Google Maps API · ${currentPlaces().length} quán`
      : 'Dữ liệu mẫu';
    $('#favFilter').classList.toggle('active', state.filters.favOnly);
    $('#favFilter').setAttribute('aria-pressed', String(state.filters.favOnly));
  }

  function renderAll() {
    renderStats();
    renderTop();
    renderFilters();
    renderCards();
    updateSourceUI();
  }

  /* ---------- Chi tiết & review ---------- */
  function relativeDate(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
  }

  function reviewHTML(review, mine = false, index = -1) {
    const initial = (review.author || 'K').trim().charAt(0).toUpperCase();
    return `
      <div class="review-item ${mine ? 'mine' : ''}">
        <div class="review-head">
          <span class="avatar">${esc(initial)}</span>
          <strong>${esc(review.author)}</strong>
          ${mine ? '<span class="badge-mine">Review của bạn</span>' : ''}
          <span class="stars">${starString(review.rating)}</span>
          <small>${esc(review.date || '')}</small>
          ${mine ? `<button class="close-btn" type="button" data-del-review="${index}" title="Xóa review" aria-label="Xóa review">✕</button>` : ''}
        </div>
        <p>${esc(review.text)}</p>
      </div>`;
  }

  function openDetail(id) {
    const p = findPlace(id);
    if (!p) return;
    $('#detailDialog').dataset.currentId = id;
    const own = state.userReviews[id] || [];
    const official = p.reviewsSample || [];
    const allReviews = [...own.map((r, i) => reviewHTML(r, true, i)), ...official.map((r) => reviewHTML(r))].join('');

    $('#detailBody').innerHTML = `
      <div class="modal-head">
        <div><span class="section-kicker">${esc(p.city)} · ${esc(p.cuisine)}</span><h2 id="detailTitle">${esc(p.name)}</h2></div>
        <button class="close-btn" type="button" data-close-detail aria-label="Đóng">✕</button>
      </div>
      <div class="detail-hero ${p.image ? '' : 'no-image'}">
        <span class="img-fallback" aria-hidden="true">${esc(emojiFor(p))}</span>
        ${p.image ? `<img src="${esc(p.image)}" alt="" onerror="this.style.display='none'">` : ''}
      </div>
      <div class="detail-title-row">
        <div class="detail-meta">
          <span>📍 ${esc(p.address)}</span>
          <span>🕒 ${esc(p.hours || 'Đang cập nhật')}</span>
          <span>💰 ${esc(p.price)}</span>
          ${p.phone ? `<span>☎ ${esc(p.phone)}</span>` : ''}
        </div>
        <div class="detail-rating"><b>${Number(p.rating).toFixed(1)}</b><span><span class="stars">${starString(p.rating)}</span><small>${compact(p.reviewCount)} lượt đánh giá</small></span></div>
      </div>
      <p class="detail-desc">${esc(p.description)}</p>
      <div class="detail-grid">
        <div class="detail-panel"><h4>Món nên thử</h4><ul>${(p.dishes || []).length ? p.dishes.map((d) => `<li>${esc(d)}</li>`).join('') : '<li>Xem thực đơn tại quán</li>'}</ul></div>
        <div class="detail-panel"><h4>Điểm cộng</h4><ul>${(p.tags || []).map((t) => `<li>${esc(t)}</li>`).join('') || '<li>Được đánh giá cao</li>'}</ul></div>
      </div>
      <div class="detail-links">
        <a class="btn btn-primary" href="${esc(p.mapsUrl)}" target="_blank" rel="noopener">📍 Xem trên Google Maps</a>
        ${p.website ? `<a class="btn btn-outline" href="${esc(p.website)}" target="_blank" rel="noopener">🌐 Website</a>` : ''}
        <button class="btn btn-outline" type="button" data-fav="${esc(p.id)}">${state.favorites.has(p.id) ? '♥ Đã yêu thích' : '♡ Lưu yêu thích'}</button>
      </div>
      <section class="review-section">
        <h3>Đánh giá (${own.length + official.length})</h3>
        ${allReviews || '<p class="card-meta">Chưa có đánh giá nào.</p>'}
        <form class="review-form" id="reviewForm">
          <h4>Viết review của bạn</h4>
          <div class="form-grid">
            <label class="control"><span>Tên hiển thị</span><input name="author" maxlength="40" placeholder="Tên của bạn" required></label>
            <div class="control"><span>Điểm của bạn</span><div class="star-picker" id="starPicker">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" class="${n === 5 ? 'on' : ''}" aria-label="${n} sao">★</button>`).join('')}</div></div>
          </div>
          <label class="control" style="margin-top:12px"><span>Cảm nhận</span><textarea name="text" rows="3" maxlength="500" placeholder="Món gì ngon? Giá cả, không gian thế nào?" required></textarea></label>
          <button class="btn btn-primary" type="submit" style="margin-top:12px">Gửi đánh giá</button>
        </form>
      </section>`;

    const dialog = $('#detailDialog');
    dialog.showModal();

    let chosen = 5;
    $('#starPicker').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-star]');
      if (!btn) return;
      chosen = Number(btn.dataset.star);
      $$('#starPicker button').forEach((b) => b.classList.toggle('on', Number(b.dataset.star) <= chosen));
    });

    $('#reviewForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const author = form.elements.author.value.trim();
      const text = form.elements.text.value.trim();
      if (!author || !text) { toast('Vui lòng điền tên và cảm nhận.', true); return; }
      if (!state.userReviews[id]) state.userReviews[id] = [];
      state.userReviews[id].unshift({ author, rating: chosen, text, date: 'vừa xong' });
      saveJSON(LS.reviews, state.userReviews);
      openDetail(id);
      toast('Cảm ơn bạn đã gửi đánh giá!');
    });
  }

  /* ---------- Google Maps API ---------- */
  function initApiDialog() {
    $('#apiCity').innerHTML = Object.keys(CITY_CENTERS)
      .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    $('#apiKeyInput').value = localStorage.getItem(LS.apiKey) || '';
  }

  function setApiStatus(message, isError = false) {
    const el = $('#apiStatus');
    el.textContent = message;
    el.classList.toggle('error', isError);
  }

  function mapApiPlace(api, key, fallbackCity) {
    const types = api.types || [];
    const cuisine = types.map((t) => TYPE_LABELS[t]).find(Boolean) || 'Nhà hàng';
    const address = api.formattedAddress || fallbackCity;
    const parts = address.split(',').map((s) => s.trim());
    const city = Object.keys(CITY_CENTERS).find((c) => norm(address).includes(norm(c))) ||
      (norm(address).includes('ho chi minh') ? 'TP. Hồ Chí Minh' : fallbackCity);
    const photoName = api.photos && api.photos[0] && api.photos[0].name;
    const reviews = (api.reviews || []).slice(0, 3).map((r) => ({
      author: r.authorAttribution?.displayName || 'Khách Google Maps',
      rating: r.rating || Number(api.rating) || 5,
      date: relativeDate(r.publishTime),
      text: r.text?.text || ''
    }));

    return {
      id: api.id,
      name: api.displayName?.text || 'Quán ăn',
      city,
      district: parts.length > 1 ? parts[parts.length - 2] : '',
      address,
      cuisine,
      priceLevel: typeof api.priceLevel === 'number' ? api.priceLevel : 0,
      price: PRICE_LABELS[typeof api.priceLevel === 'number' ? api.priceLevel : 0] || 'Đang cập nhật',
      rating: Number(api.rating) || 0,
      reviewCount: Number(api.userRatingCount) || 0,
      lat: api.location?.latitude || 0,
      lng: api.location?.longitude || 0,
      image: photoName ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${encodeURIComponent(key)}` : '',
      tags: types.slice(0, 3).map((t) => TYPE_LABELS[t] || t.replaceAll('_', ' ')),
      description: api.editorialSummary?.text || reviews[0]?.text || 'Quán ăn được Google Maps đánh giá cao. Ghé xem thực đơn và giờ mở cửa nhé.',
      dishes: [],
      hours: api.regularOpeningHours?.weekdayDescriptions?.[0] || 'Xem giờ mở cửa trên Google Maps',
      phone: api.nationalPhoneNumber || '',
      website: api.websiteUri || '',
      mapsUrl: api.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(api.displayName?.text || '')}`,
      source: 'api',
      reviewsSample: reviews
    };
  }

  async function fetchFromGoogle() {
    const key = $('#apiKeyInput').value.trim();
    const city = $('#apiCity').value;
    const minRating = Number($('#apiMinRating').value);
    const btn = $('#btnFetchApi');

    if (!key) { setApiStatus('Vui lòng nhập API key.', true); return; }
    if ($('#apiRemember').checked) localStorage.setItem(LS.apiKey, key);
    else localStorage.removeItem(LS.apiKey);

    setApiStatus('Đang tải dữ liệu từ Google Maps…');
    btn.disabled = true;
    try {
      const [lat, lng] = CITY_CENTERS[city] || [0, 0];
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': FIELDS
        },
        body: JSON.stringify({
          textQuery: `nhà hàng quán ăn ngon ở ${city}, Việt Nam`,
          languageCode: 'vi',
          regionCode: 'VN',
          maxResultCount: 20,
          minRating,
          locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 25000 } }
        })
      });

      if (!response.ok) {
        const detail = (await response.text()).slice(0, 220);
        throw new Error(`Google trả về HTTP ${response.status}. ${detail}`);
      }

      const data = await response.json();
      const places = (data.places || [])
        .map((item) => mapApiPlace(item, key, city))
        .filter((p) => p.rating >= minRating);

      if (!places.length) {
        throw new Error('Không tìm thấy quán nào đạt điểm yêu cầu. Hãy thử giảm điểm tối thiểu.');
      }

      state.apiCache[`${city}|${minRating}`] = { city, minRating, places, fetchedAt: Date.now() };
      saveJSON(LS.apiCache, state.apiCache);
      state.source = 'api';
      $('#apiDialog').close();
      renderAll();
      toast(`Đã tải ${places.length} quán tại ${city} từ Google Maps.`);
    } catch (err) {
      console.error(err);
      setApiStatus(`Lỗi: ${err.message}. Kiểm tra API key, quyền Places API (New) và giới hạn referrer.`, true);
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------- Sự kiện ---------- */
  function bindEvents() {
    $('#heroSearch').addEventListener('submit', (e) => {
      e.preventDefault();
      state.filters.q = $('#searchInput').value;
      renderCards();
      $('#kham-pha').scrollIntoView({ behavior: 'smooth' });
    });

    $$('.tag-link').forEach((btn) => btn.addEventListener('click', () => {
      const value = btn.dataset.quickSearch;
      $('#searchInput').value = value;
      state.filters.q = value;
      renderCards();
      $('#kham-pha').scrollIntoView({ behavior: 'smooth' });
    }));

    $('#cityFilter').addEventListener('change', (e) => { state.filters.city = e.target.value; renderCards(); });
    $('#ratingFilter').addEventListener('change', (e) => { state.filters.minRating = Number(e.target.value); renderCards(); });
    $('#sortFilter').addEventListener('change', (e) => { state.filters.sort = e.target.value; renderCards(); });

    $('#cuisineChips').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cuisine]');
      if (!chip) return;
      state.filters.cuisine = chip.dataset.cuisine;
      renderFilters();
      renderCards();
    });

    $('#favFilter').addEventListener('click', () => {
      state.filters.favOnly = !state.filters.favOnly;
      updateSourceUI();
      renderCards();
    });

    $('#btnClearFilters').addEventListener('click', () => {
      Object.assign(state.filters, { q: '', city: '', cuisine: '', minRating: 0, favOnly: false });
      $('#searchInput').value = '';
      $('#ratingFilter').value = '0';
      renderFilters();
      renderCards();
      updateSourceUI();
    });

    const handleCardClick = (container) => (e) => {
      if (e.target.closest('[data-maps]')) return;
      const fav = e.target.closest('[data-fav]');
      if (fav) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(fav.dataset.fav);
        return;
      }
      const item = e.target.closest('[data-detail]');
      if (item) openDetail(item.dataset.detail);
    };
    ['#placeGrid', '#topGrid'].forEach((sel) => {
      $(sel).addEventListener('click', handleCardClick($(sel)));
      $(sel).addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const item = e.target.closest('[data-detail]');
        if (item && e.target === item) { e.preventDefault(); openDetail(item.dataset.detail); }
      });
    });

    $('#detailDialog').addEventListener('click', (e) => {
      if (e.target.id === 'detailDialog') e.target.close();
      if (e.target.closest('[data-close-detail]')) $('#detailDialog').close();
      const fav = e.target.closest('[data-fav]');
      if (fav) { toggleFavorite(fav.dataset.fav); openDetail(fav.dataset.fav); return; }
      const del = e.target.closest('[data-del-review]');
      if (del) {
        const placeId = $('#detailDialog').dataset.currentId;
        if (placeId && state.userReviews[placeId]) {
          state.userReviews[placeId].splice(Number(del.dataset.delReview), 1);
          saveJSON(LS.reviews, state.userReviews);
          openDetail(placeId);
          toast('Đã xóa review.');
        }
      }
    });

    $$('.source-btn').forEach((btn) => btn.addEventListener('click', () => {
      const source = btn.dataset.source;
      if (source === 'api' && !Object.keys(state.apiCache).length && state.source !== 'api') {
        $('#apiDialog').showModal();
        toast('Nhập API key để tải dữ liệu từ Google Maps.', false);
        return;
      }
      state.source = source;
      renderAll();
    }));

    $('#btnSettings').addEventListener('click', () => $('#apiDialog').showModal());
    $('#btnFetchApi').addEventListener('click', fetchFromGoogle);
    $('#btnClearApiCache').addEventListener('click', () => {
      localStorage.removeItem(LS.apiCache);
      state.apiCache = {};
      state.source = 'curated';
      renderAll();
      setApiStatus('Đã xóa dữ liệu Google Maps đã lưu.');
      toast('Đã xóa cache dữ liệu Google Maps.');
    });

    $$('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
    });
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    saveJSON(LS.favorites, [...state.favorites]);
    renderTop();
    renderCards();
    updateSourceUI();
    toast(state.favorites.has(id) ? 'Đã lưu vào yêu thích ❤️' : 'Đã bỏ khỏi yêu thích');
  }

  /* ---------- Khởi động ---------- */
  initApiDialog();
  bindEvents();
  renderAll();
})();
