(function () {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initIntro(section) {
    var intro = section.querySelector('[data-wwd-intro]');
    if (!intro) return;
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
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
      { rootMargin: '-100px', threshold: 0.06 }
    );
    io.observe(intro);
  }

  function initGrid(root) {
    var accItems = root.querySelectorAll('[data-wwd-acc]');
    var panels = root.querySelectorAll('[data-wwd-panel]');
    if (!accItems.length) return;

    var initialActive = root.querySelector('[data-wwd-acc].is-active');
    var activeIdx = initialActive ? parseInt(initialActive.getAttribute('data-wwd-acc'), 10) : null;

    function measureBodies() {
      accItems.forEach(function (item) {
        var body = item.querySelector('.home-wwd__acc-body');
        var sheet = body && body.querySelector('.home-wwd__acc-sheet');
        if (!body || !sheet) return;

        if (item.classList.contains('is-active')) {
          // Measure full intrinsic height: a clamped max-height + overflow on the body
          // can under-report on mobile when the sheet includes the mobile-only grid/copy.
          body.style.maxHeight = 'none';
          body.style.overflow = 'visible';
          void body.offsetHeight;
          var h = sheet.scrollHeight;
          var rectH = Math.ceil(sheet.getBoundingClientRect().height);
          if (rectH > h) h = rectH;
          h = Math.ceil(h) + 4;
          body.style.setProperty('--wwd-open-h', h + 'px');
          body.style.removeProperty('max-height');
          body.style.removeProperty('overflow');
        } else {
          body.style.removeProperty('--wwd-open-h');
        }
      });
    }

    function scheduleMeasure() {
      requestAnimationFrame(function () {
        requestAnimationFrame(measureBodies);
      });
    }

    function applyState(nextActiveIdx) {
      activeIdx = Number.isFinite(nextActiveIdx) ? nextActiveIdx : null;

      accItems.forEach(function (item) {
        var i = parseInt(item.getAttribute('data-wwd-acc'), 10);
        var on = activeIdx !== null && i === activeIdx;
        item.classList.toggle('is-active', on);
        var tr = item.querySelector('.home-wwd__acc-trigger');
        if (tr) tr.setAttribute('aria-expanded', on ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        var i = parseInt(panel.getAttribute('data-wwd-panel'), 10);
        panel.classList.toggle('is-active', activeIdx !== null && i === activeIdx);
      });

      scheduleMeasure();
    }

    function toggle(idx) {
      if (!Number.isFinite(idx)) return;
      if (activeIdx === idx) {
        applyState(null);
      } else {
        applyState(idx);
      }
    }

    accItems.forEach(function (item) {
      var idx = parseInt(item.getAttribute('data-wwd-acc'), 10);
      var trigger = item.querySelector('.home-wwd__acc-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () { toggle(idx); });
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(idx);
        }
      });
    });

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        scheduleMeasure();
      });
      accItems.forEach(function (item) {
        var sheet = item.querySelector('.home-wwd__acc-sheet');
        var body = item.querySelector('.home-wwd__acc-body');
        if (sheet) ro.observe(sheet);
        if (body) ro.observe(body);
      });
    }

    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('orientationchange', scheduleMeasure);

    applyState(activeIdx);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleMeasure);
    }
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
