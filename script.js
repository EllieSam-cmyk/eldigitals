/* ============================================
   ELDIGITALS — script.js v2
   ============================================ */

'use strict';

/* ─── 1. NAVBAR: scroll glass + mobile toggle ─── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close on outside click
document.addEventListener('click', e => {
  if (
    navLinks?.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) closeNav();
});

// Close on resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeNav();
});

function closeNav() {
  navLinks?.classList.remove('open');
  navToggle?.classList.remove('active');
  navToggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ─── 2. ACTIVE NAV LINK ─── */
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.scrollY + 130;
  sections.forEach(section => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (!link) return;
    const top = section.offsetTop;
    const height = section.offsetHeight;
    link.classList.toggle('active-link', scrollY >= top && scrollY < top + height);
  });
}
updateActiveLink();

/* ─── 3. SMOOTH SCROLL (offset for fixed navbar) ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = (navbar?.offsetHeight ?? 80) + 20;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ─── 4. SCROLL REVEAL ─── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    // Stagger siblings in the same grid
    const parent = entry.target.parentElement;
    const siblings = parent?.querySelectorAll('.reveal') ?? [];
    siblings.forEach((el, i) => {
      el.style.transitionDelay = `${i * 75}ms`;
    });
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll(
  '.service-card, .process-card, .package-card, .result-card, .testi-card, .why-item, .faq-item, .sp-benefit-card, .sp-step'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ─── 5. COUNTER ANIMATION ─── */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const raw = el.getAttribute('data-target');
  const suffix = el.getAttribute('data-suffix') || '';
  const target = parseFloat(raw);
  if (isNaN(target)) return;

  const duration = 1800;
  const steps = 60;
  const stepTime = duration / steps;
  let current = 0;
  let count = 0;

  const timer = setInterval(() => {
    count++;
    current = target * easeOutCubic(count / steps);
    const display = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);
    el.textContent = display + suffix;
    if (count >= steps) {
      el.textContent = target + suffix;
      clearInterval(timer);
    }
  }, stepTime);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

/* ─── 6. FAQ ACCORDION ─── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all open
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ─── 7. SERVICE CARD TILT (desktop only) ─── */
const isMobile = () => window.matchMedia('(hover: none)').matches;

document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (isMobile()) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-5px) rotateX(${dy * -5}deg) rotateY(${dx * 5}deg)`;
    card.style.transition = 'transform .08s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
  });
});

/* ─── 8. HERO PARALLAX ─── */
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  if (isMobile() || !heroBg) return;
  heroBg.style.transform = `translateY(${window.scrollY * 0.22}px)`;
}, { passive: true });

/* ─── 9. TYPED HERO EFFECT ─── */
const heroTitle = document.querySelector('.title-line--accent');
if (heroTitle) {
  const phrases = ['Engineered.', 'Amplified.', 'Optimized.', 'Unstoppable.'];
  let pi = 0, ci = 0, deleting = false;

  // Inject cursor
  heroTitle.innerHTML = `<span class="typed-out">${phrases[0]}</span><span class="typed-cur">|</span>`;
  const typedOut = heroTitle.querySelector('.typed-out');
  const typedCur = heroTitle.querySelector('.typed-cur');

  const curStyle = document.createElement('style');
  curStyle.textContent = `.typed-cur{animation:blink .7s step-end infinite;color:var(--purple)} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`;
  document.head.appendChild(curStyle);

  function typeLoop() {
    const phrase = phrases[pi];
    if (!deleting) {
      typedOut.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(typeLoop, 2000); return; }
    } else {
      typedOut.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(typeLoop, deleting ? 55 : 95);
  }
  setTimeout(typeLoop, 1200);
}

/* ─── 10. LOGO MARQUEE PAUSE on hover ─── */
const logosInner = document.querySelector('.logos-inner');
logosInner?.closest('.logos-track')?.addEventListener('mouseenter', () => {
  logosInner.style.animationPlayState = 'paused';
});
logosInner?.closest('.logos-track')?.addEventListener('mouseleave', () => {
  logosInner.style.animationPlayState = 'running';
});

/* ─── 11. NAVBAR scroll to top on logo click ─── */
document.querySelector('.nav-logo')?.addEventListener('click', e => {
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

/* ─── 12. Service page: back navigation ─── */
const backBtn = document.querySelector('.sp-back');
backBtn?.addEventListener('click', e => {
  e.preventDefault();
  if (document.referrer) history.back();
  else window.location.href = 'index.html';
});

/* ─── 13. CURSOR GLOW (subtle, desktop) ─── */
if (!isMobile()) {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position:fixed;width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle,rgba(139,92,246,.06),transparent 70%);
    pointer-events:none;z-index:0;transform:translate(-50%,-50%);
    transition:opacity .3s ease;top:0;left:0;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
}
