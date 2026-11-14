/**
 * TARAS HRYHOROVYCH SHEVCHENKO (1814–1861) — TRIBUTE SITE SCRIPT
 * High performance vanilla JavaScript (zero dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initScrollReveal();
  initBackToTop();
  initQuoteCopy();
  initGalleryFilter();
  initLightbox();
});

/* -------------------------------------------------------------
 * 1. THEME TOGGLE (Dark / Light) with LocalStorage persistence
 * ------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('tribute-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateToggleIcon(toggleBtn, savedTheme);
  } else if (!prefersDark) {
    // If system is explicitly light
    document.documentElement.setAttribute('data-theme', 'light');
    updateToggleIcon(toggleBtn, 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateToggleIcon(toggleBtn, 'dark');
  }

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('tribute-theme', newTheme);
    updateToggleIcon(toggleBtn, newTheme);
  });
}

function updateToggleIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', theme === 'dark' ? 'Перемкнути на світлу тему' : 'Перемкнути на темну тему');
}

/* -------------------------------------------------------------
 * 2. MOBILE NAVIGATION
 * ------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close when clicking a nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('mobile-open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -------------------------------------------------------------
 * 3. SCROLL REVEAL OBSERVER
 * ------------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    elements.forEach(el => el.classList.add('active'));
  }
}

/* -------------------------------------------------------------
 * 4. BACK TO TOP BUTTON
 * ------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 420) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* -------------------------------------------------------------
 * 5. COPY QUOTE TO CLIPBOARD & TOAST NOTIFICATION
 * ------------------------------------------------------------- */
function initQuoteCopy() {
  const copyBtns = document.querySelectorAll('.quote-copy-btn');
  const toast = document.getElementById('toast-notice');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.quote-card');
      if (!card) return;

      const quoteText = card.querySelector('.quote-text')?.innerText || '';
      const quoteSource = card.querySelector('.quote-source')?.innerText || '';
      const fullText = `«${quoteText}» — ${quoteSource}`;

      try {
        await navigator.clipboard.writeText(fullText);
        showToast('Цитату успішно скопійовано!');
      } catch (err) {
        // Fallback for non-HTTPS or file protocol in some browsers
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Цитату скопійовано!');
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

/* -------------------------------------------------------------
 * 6. GALLERY CATEGORY FILTER
 * ------------------------------------------------------------- */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.artwork-card');

  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'flex';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* -------------------------------------------------------------
 * 7. LIGHTBOX MODAL WITH FULLSCREEN ZOOM & ACCESSIBILITY
 * ------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const cards = Array.from(document.querySelectorAll('.artwork-card'));

  if (!modal || !cards.length) return;

  const modalImg = modal.querySelector('.lightbox-image');
  const modalTitle = modal.querySelector('.lightbox-title');
  const modalYear = modal.querySelector('.lightbox-year');
  const modalTech = modal.querySelector('.lightbox-technique');
  const modalDesc = modal.querySelector('.lightbox-desc');
  const modalSource = modal.querySelector('.lightbox-source');
  const closeBtn = modal.querySelector('.lightbox-close-btn');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  let currentIndex = 0;

  function getVisibleCards() {
    return cards.filter(card => card.style.display !== 'none');
  }

  function updateModal(card) {
    if (!card) return;
    const img = card.querySelector('.artwork-thumb');
    const title = card.getAttribute('data-title') || card.querySelector('.artwork-title')?.innerText;
    const year = card.getAttribute('data-year') || '';
    const tech = card.getAttribute('data-technique') || '';
    const desc = card.getAttribute('data-desc') || card.querySelector('.artwork-desc')?.innerText;
    const source = card.getAttribute('data-source') || card.querySelector('.artwork-source')?.innerText;

    if (modalImg && img) {
      modalImg.src = img.src;
      modalImg.alt = title || 'Шевченко твір';
    }
    if (modalTitle) modalTitle.textContent = title;
    if (modalYear) modalYear.textContent = year;
    if (modalTech) modalTech.textContent = tech;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalSource) modalSource.textContent = source;
  }

  function openLightbox(index) {
    const visibleCards = getVisibleCards();
    if (!visibleCards[index]) return;

    currentIndex = index;
    updateModal(visibleCards[currentIndex]);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeLightbox() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext() {
    const visibleCards = getVisibleCards();
    currentIndex = (currentIndex + 1) % visibleCards.length;
    updateModal(visibleCards[currentIndex]);
  }

  function showPrev() {
    const visibleCards = getVisibleCards();
    currentIndex = (currentIndex - 1 + visibleCards.length) % visibleCards.length;
    updateModal(visibleCards[currentIndex]);
  }

  // Bind click on cards
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const visibleCards = getVisibleCards();
      const idx = visibleCards.indexOf(card);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });

    // Keyboard support on card
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Modal controls
  closeBtn?.addEventListener('click', closeLightbox);
  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });
}
