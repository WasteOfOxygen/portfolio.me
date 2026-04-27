/* ═══════════════════════════════════════════════════════════
   PORTFOLIO — SCRIPT
   Matrix rain · Typewriter · Scroll FX · Form · Nav
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── THEME TOGGLE ───────────────────────────────────────── */
(function initTheme() {
  const root    = document.documentElement;
  const btn     = document.getElementById('theme-toggle');
  const label   = document.getElementById('theme-label');

  const DARK_LABEL  = '◑ LIGHT';   // currently dark → click to go light
  const LIGHT_LABEL = '◐ DARK';    // currently light → click to go dark

  // Restore saved preference, fallback to dark
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(saved);

  btn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (label) label.textContent = theme === 'light' ? LIGHT_LABEL : DARK_LABEL;
    // Clear canvas so matrix repaints with correct bg color
    const canvas = document.getElementById('matrix-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
})();

/* ─── MATRIX RAIN ─────────────────────────────────────────── */
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Character pool: katakana + latin + digits + symbols
  const CHARS =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
    '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼';

  const FONT_SIZE = 13;
  let cols, drops, rafId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / FONT_SIZE);
    drops = Array.from({ length: cols }, () => Math.random() * -80 | 0);
  }

  function isLight() {
    return document.documentElement.dataset.theme === 'light';
  }

  function draw() {
    const light = isLight();
    // Dim previous frame — creates the trail fade
    ctx.fillStyle = light ? 'rgba(245, 245, 240, 0.07)' : 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char  = CHARS[Math.random() * CHARS.length | 0];
      const x     = i * FONT_SIZE;
      const y     = drops[i] * FONT_SIZE;

      // Lead character is brighter
      const alpha = drops[i] > 0 ? (Math.random() * 0.4 + 0.05) : 0;
      ctx.fillStyle = light
        ? `rgba(0, 0, 0, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.fillText(char, x, y);

      // Bright head
      if (Math.random() > 0.96) {
        ctx.fillStyle = light ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(CHARS[Math.random() * CHARS.length | 0], x, y);
      }

      // Reset column randomly once it passes bottom
      if (y > canvas.height && Math.random() > 0.978) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    rafId = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      resize();
      draw();
    }, 150);
  });

  resize();
  draw();
})();

/* ─── TYPEWRITER ─────────────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('hero-sub');
  if (!el) return;

  const lines = [
    'CRAFTING VISUAL IDENTITIES THAT ENDURE.',
    'WHERE FORM MEETS FUNCTION.',
    'DESIGN AS A LANGUAGE — PRECISE, INTENTIONAL.',
    'BASED IN NEW YORK. WORKING WORLDWIDE.',
  ];

  let lineIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseTick = 0;
  const PAUSE = 60; // frames to pause at full line

  function tick() {
    const line = lines[lineIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = line.slice(0, charIdx);

      if (charIdx === line.length) {
        if (pauseTick < PAUSE) { pauseTick++; setTimeout(tick, 50); return; }
        pauseTick = 0;
        deleting = true;
      }
    } else {
      charIdx--;
      el.textContent = line.slice(0, charIdx);

      if (charIdx === 0) {
        deleting = false;
        lineIdx  = (lineIdx + 1) % lines.length;
      }
    }

    setTimeout(tick, deleting ? 28 : 55);
  }

  setTimeout(tick, 1200);
})();

/* ─── NAV: ACTIVE LINK ON SCROLL + SCROLL CLASS ─────────── */
(function initNav() {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link');
  const sections = Array.from(document.querySelectorAll('.section'));

  // Smooth-scroll on click + close mobile menu
  links.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        // close mobile menu
        document.querySelector('.nav-links')?.classList.remove('open');
      }
    });
  });

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // IntersectionObserver to highlight active section
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));

  // Add shadow/border on scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ─── REVEAL ON SCROLL ───────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.project-card, .about-grid, .contact-grid, .section-header, .hero-inner > *'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 60}ms`;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => obs.observe(el));
})();

/* ─── PROJECT CARD CLICK-THROUGH ────────────────────────── */
(function initCardLinks() {
  document.querySelectorAll('.project-card[data-href]').forEach(card => {
    card.addEventListener('click', e => {
      // Don't double-trigger if user clicks the card-link directly
      if (e.target.closest('.card-link')) return;
      const url = card.dataset.href;
      if (url) window.location.href = url;
    });
  });
})();

/* ─── SKILL BAR ANIMATION ────────────────────────────────── */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => obs.observe(f));
})();

/* ─── NAV CURSOR BLINK ───────────────────────────────────── */
// Already handled via CSS @keyframes blink on .nav-cursor


/* ─── PROJECT CARD: DATA-INDEX COUNTER ───────────────────── */
(function initCardIndex() {
  // Already set via data-index in HTML — used purely for CSS if needed
  // Add hover class for extra flair
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('hovered'));
    card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
  });
})();

/* ─── CURSOR TRAIL (subtle) ──────────────────────────────── */
(function initCursorTrail() {
  const dots = [];
  const MAX  = 8;
  let   mx   = 0, my = 0;

  for (let i = 0; i < MAX; i++) {
    const d = document.createElement('div');
    d.style.cssText = `
      position:fixed; width:3px; height:3px; border-radius:50%;
      background:#fff; pointer-events:none; z-index:9999;
      opacity:0; transition:opacity 0.3s;
    `;
    document.body.appendChild(d);
    dots.push({ el: d, x: 0, y: 0 });
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dots[0].el.style.opacity = '0.35';
  });

  document.addEventListener('mouseleave', () => {
    dots.forEach(d => { d.el.style.opacity = '0'; });
  });

  function animateTrail() {
    let px = mx, py = my;
    dots.forEach((dot, i) => {
      const ease = 0.28 - i * 0.025;
      dot.x += (px - dot.x) * ease;
      dot.y += (py - dot.y) * ease;
      dot.el.style.left      = `${dot.x - 1}px`;
      dot.el.style.top       = `${dot.y - 1}px`;
      dot.el.style.opacity   = Math.max(0, 0.35 - i * 0.04).toFixed(2);
      dot.el.style.transform = `scale(${1 - i * 0.1})`;
      px = dot.x;
      py = dot.y;
    });
    requestAnimationFrame(animateTrail);
  }

  animateTrail();
})();
