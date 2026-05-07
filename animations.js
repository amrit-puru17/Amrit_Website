/* ═══════════════════════════════════════
   ANIMATIONS.JS — subtle scroll reveals
   ═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Hero heading / sub / actions reveal
  const heroReveals = document.querySelectorAll('.hero-heading.reveal, .hero-sub.reveal, .hero-actions.reveal, .kpi-cluster.reveal');
  if (heroReveals.length) {
    gsap.to(heroReveals, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.2
    });
  }

  // Generic fade-in sections
  gsap.utils.toArray('.fade-section').forEach(el => {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay') || 0);
    gsap.fromTo(el,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Skill bar fills
  gsap.utils.toArray('.skill-fill').forEach(bar => {
    gsap.to(bar, {
      width: bar.style.getPropertyValue('--pct'),
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 95%'
      }
    });
  });
});