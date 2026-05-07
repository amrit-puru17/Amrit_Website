/* ═══════════════════════════════════════
   APP.JS — core interactions (minimal)
   ═══════════════════════════════════════ */
(function () {
  'use strict';

  // ── Theme Toggle ──
  const themeBtn = document.getElementById('theme-btn');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark');
  else if (!saved) document.body.classList.remove('dark'); // default light

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  // ── Mobile Menu ──
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const drawer = document.getElementById('mobile-menu');
  const drawerLinks = drawer.querySelectorAll('.drawer-link');

  function openMenu() {
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    drawer.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 300);
  }

  menuBtn.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  drawerLinks.forEach(l => l.addEventListener('click', closeMenu));

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
  // ── Contact Form (AJAX) ──
  const contactForm = document.querySelector('.contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      const btnText = submitBtn.querySelector('span');
      
      // Client-side validation
      if (!name || name.trim().length < 2) {
        formStatus.textContent = 'Please provide a valid name.';
        formStatus.className = 'form-status error';
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formStatus.textContent = 'Please provide a valid email address.';
        formStatus.className = 'form-status error';
        return;
      }
      if (!message || message.trim().length < 5) {
        formStatus.textContent = 'Please write a brief message so I can help you better.';
        formStatus.className = 'form-status error';
        return;
      }
      
      // Set loading state
      submitBtn.disabled = true;
      btnText.textContent = 'Sending...';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.textContent = 'Thank you so much for reaching out 💛 Your message just made its way to me, and I truly appreciate you taking the time to connect. I’ll get back to you as soon as I can ✨';
          formStatus.classList.add('success');
          contactForm.reset();
        } else {
          throw new Error();
        }
      } catch (err) {
        formStatus.textContent = 'Oops! There was a problem sending your message. Please try again.';
        formStatus.classList.add('error');
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Send Message';
      }
    });
  }
})();