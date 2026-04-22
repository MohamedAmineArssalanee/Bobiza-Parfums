/* ============================
   BOBIZA PARFUMS — APP.JS
   ============================ */

'use strict';

// ── STATE ──────────────────────────────────────────────
let currentLang = 'ar';
let allProducts = [];
let allReviews = [];
let currentFilter = 'all';
let searchQuery = '';

// ── TRANSLATIONS ───────────────────────────────────────
const translations = {
  ar: {
    searchPlaceholder: 'ابحث عن عطر...',
    quickView: 'عرض سريع',
    orderWA: 'اطلب عبر واتساب',
    currency: 'درهم',
    allFilter: 'الكل',
    menFilter: 'رجالي',
    womenFilter: 'نسائي',
    unisexFilter: 'مشترك',
    men: 'رجالي',
    women: 'نسائي',
    unisex: 'مشترك',
    notesTitle: 'ملاحظات العطر',
    topNotes: 'الرأس:',
    heartNotes: 'القلب:',
    baseNotes: 'القاعدة:',
    waMessage: 'سلام، أريد طلب عطر:',
    noResults: 'لم يتم العثور على عطور مطابقة',
    verifiedBuyer: 'مشتري موثق',
  },
  fr: {
    searchPlaceholder: 'Rechercher un parfum...',
    quickView: 'Aperçu rapide',
    orderWA: 'Commander via WhatsApp',
    currency: 'DH',
    allFilter: 'Tous',
    menFilter: 'Homme',
    womenFilter: 'Femme',
    unisexFilter: 'Unisexe',
    men: 'Homme',
    women: 'Femme',
    unisex: 'Unisexe',
    notesTitle: 'Notes Olfactives',
    topNotes: 'Tête:',
    heartNotes: 'Cœur:',
    baseNotes: 'Fond:',
    waMessage: 'Bonjour, je voudrais commander:',
    noResults: 'Aucun parfum trouvé',
    verifiedBuyer: 'Acheteur vérifié',
  }
};

// ── UTILITY ────────────────────────────────────────────
const t = (key) => translations[currentLang][key] || key;

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
};

const buildWAUrl = (productName) => {
  const msg = `${t('waMessage')} ${productName}`;
  return `https://wa.me/212778214962?text=${encodeURIComponent(msg)}`;
};

// ── LOADER ─────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 2000);
});

// ── LANGUAGE SWITCHER ──────────────────────────────────
window.setLang = function(lang) {
  currentLang = lang;
  const html = document.documentElement;

  if (lang === 'ar') {
    html.setAttribute('lang', 'ar');
    html.setAttribute('dir', 'rtl');
    document.getElementById('btn-ar').classList.add('active');
    document.getElementById('btn-fr').classList.remove('active');
  } else {
    html.setAttribute('lang', 'fr');
    html.setAttribute('dir', 'ltr');
    document.getElementById('btn-fr').classList.add('active');
    document.getElementById('btn-ar').classList.remove('active');
  }

  // Update all data-ar/data-fr elements
  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  // Update placeholders
  document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
    el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
  });

  // Update filter buttons
  const filterMap = { all: t('allFilter'), men: t('menFilter'), women: t('womenFilter'), unisex: t('unisexFilter') };
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const f = btn.getAttribute('data-filter');
    if (filterMap[f]) btn.textContent = filterMap[f];
  });

  // Re-render dynamic content
  renderProducts();
  renderReviews();
};

// ── NAVBAR ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ── HERO PARTICLES ─────────────────────────────────────
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const count = 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${6 + Math.random() * 8}s;
      --delay: ${Math.random() * 6}s;
      opacity: ${0.1 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
}

// ── COUNTER ANIMATION ──────────────────────────────────
function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();
  const startVal = 0;

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(startVal + (target - startVal) * eased);
    el.textContent = formatNumber(current);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = formatNumber(target);
  };

  requestAnimationFrame(update);
}

// ── SCROLL REVEAL ──────────────────────────────────────
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');

          // Trigger counters
          const num = entry.target.querySelector('.proof-number');
          if (num && !num.dataset.animated) {
            num.dataset.animated = '1';
            animateCounter(num, parseInt(num.dataset.target));
          }
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .proof-item').forEach(el => observer.observe(el));
}

// ── LOAD DATA ──────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    allProducts = data.products;
    allReviews = data.reviews;
  } catch (e) {
    console.warn('Could not load data.json, using fallback');
    allProducts = [];
    allReviews = [];
  }
  renderProducts();
  renderReviews();
}

// ── RENDER PRODUCTS ────────────────────────────────────
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const filtered = allProducts.filter(p => {
    const matchFilter = currentFilter === 'all' || p.category === currentFilter;
    const name = currentLang === 'ar' ? p.name_ar : p.name_fr;
    const desc = currentLang === 'ar' ? p.description_ar : p.description_fr;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted);font-family:var(--serif);font-size:1.1rem;">${t('noResults')}</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => {
    const name = currentLang === 'ar' ? p.name_ar : p.name_fr;
    const desc = currentLang === 'ar' ? p.description_ar : p.description_fr;
    const catLabel = t(p.category);
    const waUrl = buildWAUrl(name);

    return `
      <article class="product-card" style="animation-delay:${i * 0.1}s" data-id="${p.id}">
        <div class="product-image-wrap" onclick="openModal(${p.id})">
          <img src="${p.image}" alt="${name}" loading="lazy" />
          <div class="product-overlay"></div>
          <div class="product-category-tag">${catLabel}</div>
          <button class="quick-view-btn" onclick="openModal(${p.id})">${t('quickView')}</button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${name}</h3>
          <p class="product-desc">${desc}</p>
          <div class="product-footer">
            <div class="product-price">${p.price} <span>${t('currency')}</span></div>
            <a href="${waUrl}" target="_blank" class="card-order-btn" onclick="event.stopPropagation()">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              ${t('orderWA')}
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ── RENDER REVIEWS ─────────────────────────────────────
function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid || !allReviews.length) return;

  grid.innerHTML = allReviews.map((r, i) => {
    const name = currentLang === 'ar' ? r.name_ar : r.name_fr;
    const text = currentLang === 'ar' ? r.text_ar : r.text_fr;
    const stars = '★'.repeat(r.rating);
    const initial = name.charAt(0);

    return `
      <div class="review-card" style="animation-delay:${i * 0.15}s">
        <div class="review-quote">"</div>
        <div class="review-stars">
          ${Array.from({length: r.rating}).map(() => `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`).join('')}
        </div>
        <p class="review-text">${text}</p>
        <div class="review-author">
          <div class="review-avatar">${initial}</div>
          <div>
            <div class="review-name">${name}</div>
            <div style="font-size:0.72rem;color:var(--gold);margin-top:2px;">${t('verifiedBuyer')} ✓</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── PRODUCT MODAL ──────────────────────────────────────
window.openModal = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const name = currentLang === 'ar' ? product.name_ar : product.name_fr;
  const desc = currentLang === 'ar' ? product.description_ar : product.description_fr;
  const catLabel = t(product.category);
  const notes = currentLang === 'ar' ? product.notes : (product.notes_fr || product.notes);
  const waUrl = buildWAUrl(name);

  const noteRow = (label, items) => items && items.length ? `
    <div class="notes-row">
      <span class="note-type">${label}</span>
      <div class="note-values">${items.map(n => `<span class="note-tag">${n}</span>`).join('')}</div>
    </div>
  ` : '';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-image">
      <img src="${product.image}" alt="${name}" />
    </div>
    <div class="modal-details">
      <div class="modal-category">${catLabel}</div>
      <h2 class="modal-name">${name}</h2>
      <div class="modal-price">${product.price} ${t('currency')}</div>
      <p class="modal-desc">${desc}</p>
      <div class="modal-notes">
        <div class="modal-notes-title">✦ ${t('notesTitle')}</div>
        ${noteRow(t('topNotes'), notes.top)}
        ${noteRow(t('heartNotes'), notes.heart)}
        ${noteRow(t('baseNotes'), notes.base)}
      </div>
      <a href="${waUrl}" target="_blank" class="modal-order-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        ${t('orderWA')}
      </a>
    </div>
  `;

  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('productModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── FILTER & SEARCH ────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderProducts();
  });
});

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderProducts();
  });
}

// ── SMOOTH SCROLL ──────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadData();
  setupReveal();

  // Set initial data-ar text on all elements
  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = el.getAttribute('data-ar');
  });

  // Set initial placeholder
  const inp = document.getElementById('searchInput');
  if (inp) inp.placeholder = translations.ar.searchPlaceholder;
});
