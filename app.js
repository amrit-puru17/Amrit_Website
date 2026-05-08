/* ═══════════════════════════════════════
   APP.JS — core interactions (minimal)
   ═══════════════════════════════════════ */
(function () {
  'use strict';

  // ── Theme Toggle ──
  const themeBtn = document.getElementById('theme-btn');
  const saved = localStorage.getItem('theme');
  const root = document.documentElement;
  if (saved === 'dark') { document.body.classList.add('dark'); root.classList.add('dark'); }
  else { document.body.classList.remove('dark'); root.classList.remove('dark'); } // default light
  themeBtn?.setAttribute('aria-pressed', document.body.classList.contains('dark') ? 'true' : 'false');

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    root.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  });

  // ── Mobile Menu ──
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const drawer = document.getElementById('mobile-menu');
  const drawerLinks = drawer.querySelectorAll('.drawer-link');
  let lastFocused = null;

  function openMenu() {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog for keyboard users
    setTimeout(() => {
      const firstLink = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
      firstLink?.focus();
    }, 50);
  }
  function closeMenu() {
    drawer.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 300);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = !drawer.hidden && drawer.classList.contains('open');
    if (isOpen) closeMenu();
    else openMenu();
  });
  menuClose.addEventListener('click', closeMenu);
  drawerLinks.forEach(l => l.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!drawer.hidden) closeMenu();
  });

  // ── Sticky Nav subtle shadow ──
  const header = document.getElementById('site-header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Counter Animation ──
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const suffix = target >= 50 ? '+' : '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current + suffix;
      }, 25);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));
  // ── Contact Form (native submit + validation) ──
  const contactForm = document.querySelector('.contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    // Show success state after redirect back.
    const url = new URL(window.location.href);
    if (url.searchParams.get('sent') === '1') {
      formStatus.textContent = 'Thanks — your message has been sent. I’ll get back to you soon.';
      formStatus.className = 'form-status success';
      url.searchParams.delete('sent');
      window.history.replaceState({}, '', url.toString());

      // Ensure users actually see the message after redirect.
      const contact = document.getElementById('contact');
      if (contact) {
        requestAnimationFrame(() => {
          contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus for screen readers/keyboard users (without changing visual layout).
          setTimeout(() => formStatus?.focus?.(), 250);
        });
      }
    }

    contactForm.addEventListener('submit', (e) => {
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      const btnText = submitBtn?.querySelector('span');

      // Client-side validation (only prevent submit when invalid)
      if (!name || String(name).trim().length < 2) {
        e.preventDefault();
        formStatus.textContent = 'Please provide a valid name.';
        formStatus.className = 'form-status error';
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        e.preventDefault();
        formStatus.textContent = 'Please provide a valid email address.';
        formStatus.className = 'form-status error';
        return;
      }
      if (!message || String(message).trim().length < 5) {
        e.preventDefault();
        formStatus.textContent = 'Please write a brief message so I can help you better.';
        formStatus.className = 'form-status error';
        return;
      }

      // Ensure FormSubmit redirects back to this page.
      const existingNext = contactForm.querySelector('input[name="_next"]');
      // FormSubmit requires a public http(s) URL for `_next`.
      // If you're testing via `file:///`, skip `_next` (FormSubmit will use its default redirect).
      if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('sent', '1');
        nextUrl.hash = 'contact';
        const nextValue = nextUrl.toString();
        if (existingNext) existingNext.value = nextValue;
        else {
          const next = document.createElement('input');
          next.type = 'hidden';
          next.name = '_next';
          next.value = nextValue;
          contactForm.appendChild(next);
        }
      } else if (existingNext) {
        existingNext.remove();
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending…';
      formStatus.textContent = 'Sending…';
      formStatus.className = 'form-status';
      // Allow native submit to proceed (reliable for FormSubmit).
    });
  }
})();