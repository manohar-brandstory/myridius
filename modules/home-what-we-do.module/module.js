(function () {
  'use strict';

  function initIntro(section) {
    var intro = section.querySelector('[data-wwd-intro]');
    if (!intro) return;
    if (!('IntersectionObserver' in window)) {
      intro.classList.add('is-in-view');
      return;
    }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intro.classList.add('is-in-view');
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in-view');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-80px', threshold: 0.06 }
    );
    io.observe(intro);
  }

  function initGrid(root) {
    var accItems = root.querySelectorAll('[data-wwd-acc]');
    var panels = root.querySelectorAll('[data-wwd-panel]');
    if (!accItems.length) return;

    var activeIdx = 0;

    function activate(idx) {
      if (idx === activeIdx) return;
      activeIdx = idx;

      accItems.forEach(function (item) {
        var i = parseInt(item.getAttribute('data-wwd-acc'), 10);
        var on = i === idx;
        item.classList.toggle('is-active', on);
        var tr = item.querySelector('.home-wwd__acc-trigger');
        if (tr) tr.setAttribute('aria-expanded', on ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        var i = parseInt(panel.getAttribute('data-wwd-panel'), 10);
        panel.classList.toggle('is-active', i === idx);
      });
    }

    accItems.forEach(function (item) {
      var idx = parseInt(item.getAttribute('data-wwd-acc'), 10);
      var trigger = item.querySelector('.home-wwd__acc-trigger');
      if (!trigger) return;

      item.addEventListener('mouseenter', function () {
        activate(idx);
      });

      trigger.addEventListener('click', function () {
        activate(idx);
      });

      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(idx);
        }
      });
    });
  }

  function onReady() {
    document.querySelectorAll('.home-wwd').forEach(function (section) {
      initIntro(section);
      var root = section.querySelector('[data-wwd-root]');
      if (root) initGrid(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
