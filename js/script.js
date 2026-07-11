// ===== Respect reduced-motion preference =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Scroll progress bar =====
(function () {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = max > 0 ? `${(scrolled / max) * 100}%` : '0%';
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
})();

// ===== Header shrink on scroll =====
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 40);
  document.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

// ===== Cursor-reactive glow in hero =====
(function () {
  const hero = document.querySelector('.hero');
  if (!hero || prefersReducedMotion) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', `${x}%`);
    hero.style.setProperty('--my', `${y}%`);
  });
})();

// ===== Magnetic buttons =====
(function () {
  if (prefersReducedMotion) return;
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      btn.style.setProperty('--mx', `${relX * 0.12}px`);
      btn.style.setProperty('--my', `${relY * 0.12}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
})();

// ===== Count-up numbers (hero stats + stats bar) =====
(function () {
  const targets = document.querySelectorAll('.hero-stats strong, .stats-bar strong');
  if (!targets.length) return;

  const animateCount = (el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\D*)(\d[\d\s]*)(\D*)$/);
    if (!match) return; // no digits found, leave as-is
    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits.replace(/\s/g, ''), 10);
    if (Number.isNaN(target) || prefersReducedMotion) return;

    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = raw; // restore exact original formatting
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    targets.forEach(el => io.observe(el));
  }
})();

// ===== Nav mobile toggle =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('is-open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
  }));
}

// ===== Highlight active nav link =====
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');

// Stagger: elements sharing the same parent get an incremental delay,
// so grids (cards, pillars, values...) cascade in instead of popping at once.
(function () {
  const groups = new Map();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    const idx = groups.has(parent) ? groups.get(parent) : 0;
    groups.set(parent, idx + 1);
    el.style.setProperty('--d', `${Math.min(idx, 5) * 90}ms`);
  });
})();

if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ===== Generic filter buttons (projects page) =====
function initFilters(filterSelector, cardSelector) {
  const buttons = document.querySelectorAll(filterSelector);
  const cards = document.querySelectorAll(cardSelector);
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('hide', !show);
      });
    });
  });
}
initFilters('.filters button', '.card[data-cat]');

// ===== Generic tabs (team page departments) =====
function initTabs(tabSelector, panelSelector) {
  const tabs = document.querySelectorAll(tabSelector);
  const panels = document.querySelectorAll(panelSelector);
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}
initTabs('.dept-tabs button', '.team-panel');

// ===== Contact form (static demo — no backend) =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Message envoyé ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; contactForm.reset(); }, 2600);
  });
}
