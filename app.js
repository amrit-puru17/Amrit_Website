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
      const suffix = (el.dataset.suffix ?? (target >= 50 ? '+' : ''));
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
  // ── Contact Form (Web3Forms + mailto fallback) ──
  const contactForm = document.querySelector('.contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  const CONTACT_EMAIL = contactForm?.dataset.contactEmail || 'acharyapurushottam177@gmail.com';

  function resetSubmitButton() {
    submitBtn.disabled = false;
    const btnText = submitBtn?.querySelector('span');
    if (btnText) btnText.textContent = 'Send Message';
  }

  function showFormSuccess(text) {
    formStatus.textContent = text;
    formStatus.className = 'form-status success';
    const thisRun = Date.now();
    formStatus.dataset.runId = String(thisRun);
    window.setTimeout(() => {
      if (!formStatus?.isConnected) return;
      if (formStatus.dataset.runId !== String(thisRun)) return;
      formStatus.classList.add('fade-out');
      window.setTimeout(() => {
        if (!formStatus?.isConnected) return;
        if (formStatus.dataset.runId !== String(thisRun)) return;
        formStatus.className = 'form-status';
        formStatus.textContent = '';
        formStatus.classList.remove('fade-out');
      }, 450);
    }, 3000);
    contactForm.reset();
    resetSubmitButton();
    setTimeout(() => formStatus?.focus?.(), 50);
  }

  function openMailtoFallback(name, email, message) {
    const subject = `Portfolio message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showFormSuccess(
      'Our message service is temporarily down — your email app should open. Hit Send there and I’ll reply soon.'
    );
  }

  function hasWeb3FormsKey(formData) {
    const key = String(formData.get('access_key') || '').trim();
    return key.length > 10 && !/^(your|replace|paste|xxx)/i.test(key);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      const btnText = submitBtn?.querySelector('span');

      if (formData.get('botcheck')) return;

      if (!name || String(name).trim().length < 2) {
        formStatus.textContent = 'Please provide a valid name.';
        formStatus.className = 'form-status error';
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        formStatus.textContent = 'Please provide a valid email address.';
        formStatus.className = 'form-status error';
        return;
      }
      if (!message || String(message).trim().length < 5) {
        formStatus.textContent = 'Please write a brief message so I can help you better.';
        formStatus.className = 'form-status error';
        return;
      }

      const trimmed = {
        name: String(name).trim(),
        email: String(email).trim(),
        message: String(message).trim()
      };

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending…';
      formStatus.textContent = 'Sending…';
      formStatus.className = 'form-status';

      if (!hasWeb3FormsKey(formData)) {
        openMailtoFallback(trimmed.name, trimmed.email, trimmed.message);
        return;
      }

      const payload = {
        access_key: String(formData.get('access_key')).trim(),
        name: trimmed.name,
        email: trimmed.email,
        message: trimmed.message,
        subject: formData.get('subject') || 'New portfolio message',
        from_name: trimmed.name,
        botcheck: ''
      };

      fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.success) {
            showFormSuccess('Woohoo! Your email is now napping next to my cat. I’ll wake it up and answer ASAP. 😺');
            return;
          }
          throw new Error(data.message || 'Submission failed');
        })
        .catch(() => openMailtoFallback(trimmed.name, trimmed.email, trimmed.message));
    });
  }
})();