(function () {
  'use strict';

  function init(section) {
    if (!section || section.getAttribute('data-news-list-inited') === 'true') return;
    section.setAttribute('data-news-list-inited', 'true');

    var perSelect = section.querySelector('[data-news-per-page]');
    if (perSelect) {
      perSelect.addEventListener('change', function () {
        var form = perSelect.closest('form');
        if (form) form.submit();
      });
    }

    var cards = section.querySelectorAll('[data-news-card]');
    cards.forEach(function (card, i) {
      card.style.setProperty('--news-stagger', String(i % 9));
    });

    var reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced && 'IntersectionObserver' in window) {
      section.classList.add('is-sr-pending');
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            section.classList.add('is-sr-ready');
            section.classList.remove('is-sr-pending');
            io.disconnect();
          });
        },
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      io.observe(section);
    } else {
      section.classList.add('is-sr-ready');
    }
  }

  function boot() {
    document.querySelectorAll('[data-news-list]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
