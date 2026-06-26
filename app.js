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
  // ── Contact Form (Web3Forms — iframe POST + fetch) ──
  const contactForm = document.querySelector('.contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const formIframe = document.getElementById('w3f-iframe');
  const formRedirect = document.getElementById('form-redirect');
  const SUCCESS_MSG = 'Woohoo! Your email is now napping next to my cat. I’ll wake it up and answer ASAP. 😺';
  const SUBMIT_COOLDOWN_MS = 45000;
  const SUBMIT_COOLDOWN_KEY = 'contactFormLastSubmit';
  let iframePending = false;
  let iframeTimeoutId = null;

  function isSubmitOnCooldown() {
    const last = Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY) || 0);
    return Date.now() - last < SUBMIT_COOLDOWN_MS;
  }

  function markFormSubmitted() {
    localStorage.setItem(SUBMIT_COOLDOWN_KEY, String(Date.now()));
  }

  function syncReplyFields(name, email) {
    const fromName = document.getElementById('form-from-name');
    const replyto = document.getElementById('form-replyto');
    if (fromName) fromName.value = String(name).trim();
    if (replyto) replyto.value = String(email).trim();
  }

  function isHoneypotTripped(formData) {
    const botcheck = String(formData.get('botcheck') || '').trim();
    const website = String(formData.get('website') || '').trim();
    return Boolean(botcheck || website);
  }

  function resetSubmitButton() {
    submitBtn.disabled = false;
    const btnText = submitBtn?.querySelector('span');
    if (btnText) btnText.textContent = 'Send Message';
  }

  function showFormSuccess(text) {
    iframePending = false;
    if (iframeTimeoutId) window.clearTimeout(iframeTimeoutId);
    iframeTimeoutId = null;
    formStatus.textContent = text || SUCCESS_MSG;
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
    markFormSubmitted();
    contactForm.reset();
    resetSubmitButton();
    setTimeout(() => formStatus?.focus?.(), 50);
  }

  function showFormError(text) {
    iframePending = false;
    if (iframeTimeoutId) window.clearTimeout(iframeTimeoutId);
    iframeTimeoutId = null;
    formStatus.textContent = text;
    formStatus.className = 'form-status error';
    resetSubmitButton();
  }

  function setRedirectUrl() {
    if (!formRedirect) return;
    try {
      formRedirect.value = new URL('thanks.html', window.location.href).href;
    } catch {
      formRedirect.value = '';
    }
  }

  function submitViaIframe() {
    if (!formIframe || !contactForm.action) {
      showFormError('Unable to send right now. Please email acharyapurushottam177@gmail.com directly.');
      return;
    }
    setRedirectUrl();
    iframePending = true;
    contactForm.setAttribute('target', 'w3f-iframe');
    if (iframeTimeoutId) window.clearTimeout(iframeTimeoutId);
    iframeTimeoutId = window.setTimeout(() => {
      if (!iframePending) return;
      showFormError('Sending is taking longer than expected. Please try again.');
    }, 20000);
    contactForm.submit();
  }

  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin) return;
    if (!iframePending || e.data?.type !== 'web3forms-success') return;
    showFormSuccess(SUCCESS_MSG);
  });

  if (formIframe) {
    formIframe.addEventListener('load', () => {
      if (!iframePending) return;
      try {
        const path = formIframe.contentWindow?.location?.pathname || '';
        if (path.endsWith('thanks.html')) showFormSuccess(SUCCESS_MSG);
      } catch {
        /* cross-origin until redirect completes */
      }
    });
  }

  if (contactForm) {
    setRedirectUrl();

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      const btnText = submitBtn?.querySelector('span');

      if (isHoneypotTripped(formData)) return;

      if (!name || String(name).trim().length < 2) {
        showFormError('Please provide a valid name.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        showFormError('Please provide a valid email address.');
        return;
      }
      if (!message || String(message).trim().length < 5) {
        showFormError('Please write a brief message so I can help you better.');
        return;
      }

      const accessKey = String(formData.get('access_key') || '').trim();
      if (!accessKey) {
        showFormError('Contact form is not configured yet. Please email acharyapurushottam177@gmail.com.');
        return;
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending…';
      formStatus.textContent = 'Sending…';
      formStatus.className = 'form-status';

      if (window.location.protocol === 'file:') {
        showFormError('Open this site via http://localhost or your live URL (not as a saved file) to send messages.');
        return;
      }

      setRedirectUrl();
      if (!formRedirect?.value) {
        showFormError('Unable to send from this page. Please use your deployed portfolio URL.');
        return;
      }

      if (isSubmitOnCooldown()) {
        showFormError('Please wait a moment before sending another message.');
        return;
      }
      syncReplyFields(name, email);

      // Native POST + redirect (Web3Forms does not apply redirect for fetch/AJAX).
      submitViaIframe();
    });
  }
})();