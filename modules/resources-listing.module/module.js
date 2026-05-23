(function () {
  'use strict';

  function buildQuery(section, overrides) {
    var params = new URLSearchParams(window.location.search);

    var filterForm = section.querySelector('[data-res-filters]');
    if (filterForm) {
      ['topic', 'industry', 'resource_type'].forEach(function (name) {
        var el = filterForm.querySelector('[name="' + name + '"]');
        if (!el) return;
        var val = el.value ? el.value.trim() : '';
        if (val) params.set(name, val);
        else params.delete(name);
      });

      var perHidden = filterForm.querySelector('input[name="per_page"]');
      if (perHidden && perHidden.value) {
        params.set('per_page', perHidden.value);
      }
    }

    if (overrides) {
      Object.keys(overrides).forEach(function (key) {
        var v = overrides[key];
        if (v === null || v === undefined || v === '') params.delete(key);
        else params.set(key, String(v));
      });
    }

    var qs = params.toString();
    return qs ? window.location.pathname + '?' + qs : window.location.pathname;
  }

  function navigate(section, overrides) {
    window.location.assign(buildQuery(section, overrides));
  }

  function init(section) {
    if (!section || section.getAttribute('data-res-list-inited') === 'true') return;
    section.setAttribute('data-res-list-inited', 'true');

    var filterForm = section.querySelector('[data-res-filters]');
    if (filterForm) {
      filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        navigate(section, { page: '1' });
      });

      filterForm.querySelectorAll('select').forEach(function (sel) {
        sel.addEventListener('change', function () {
          navigate(section, { page: '1' });
        });
      });
    }

    var perForm = section.querySelector('[data-res-per-form]');
    if (perForm) {
      perForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var perSelect = perForm.querySelector('[data-res-per-page]');
        navigate(section, {
          page: '1',
          per_page: perSelect ? perSelect.value : null
        });
      });

      var perSelect = perForm.querySelector('[data-res-per-page]');
      if (perSelect) {
        perSelect.addEventListener('change', function () {
          navigate(section, {
            page: '1',
            per_page: perSelect.value
          });
        });
      }
    }

    section.querySelectorAll('[data-res-page-link]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var page = link.getAttribute('data-res-page');
        if (!page) return;
        e.preventDefault();
        navigate(section, { page: page });
      });
    });

    var cards = section.querySelectorAll('[data-res-card]');
    cards.forEach(function (card, i) {
      card.style.setProperty('--res-stagger', String(i % 9));
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
    document.querySelectorAll('[data-res-list]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
