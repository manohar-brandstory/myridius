(function () {
  'use strict';

  /** Mirrors NewHomePage `isItemFocused` (three-card phases, repeating). */
  function focusIndicesForCard(activeIndex) {
    var phase = activeIndex % 3;
    if (phase === 0) return [0, 1];
    if (phase === 1) return [2, 4];
    return [0, 2, 3];
  }

  function parseTooltips(section) {
    var el = section.querySelector('[data-why-tooltips]');
    if (!el || !el.textContent) return [];
    try {
      var data = JSON.parse(el.textContent);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function renderTooltip(panel, tpl) {
    if (!tpl || (!tpl.title && !tpl.body)) {
      panel.innerHTML = '';
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('is-visible');
      return;
    }

    var bulletsHtml = '';
    if (tpl.bullets && tpl.bullets.length) {
      bulletsHtml = '<ul class="home-why__tooltip-list">';
      for (var i = 0; i < tpl.bullets.length; i++) {
        if (!tpl.bullets[i]) continue;
        bulletsHtml +=
          '<li><span class="home-why__tooltip-dot" aria-hidden="true"></span><span>' +
          escapeHtml(String(tpl.bullets[i])) +
          '</span></li>';
      }
      bulletsHtml += '</ul>';
    }

    panel.innerHTML =
      (tpl.title
        ? '<h4 class="home-why__tooltip-title">' + escapeHtml(String(tpl.title)) + '</h4>'
        : '') +
      (tpl.body
        ? '<p class="home-why__tooltip-body">' + escapeHtml(String(tpl.body)) + '</p>'
        : '') +
      bulletsHtml;
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () {
      panel.classList.add('is-visible');
    });
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isWhyMobile() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px)').matches;
  }

  function initWhy(section) {
    var reduced = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var intro = section.querySelector('[data-home-why-intro]');
    if (intro && !reduced && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in-view');
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '-80px', threshold: 0.08 }
      );
      io.observe(intro);
    } else if (intro) {
      intro.classList.add('is-in-view');
    }

    var stack = section.querySelector('[data-why-stack]');
    if (!stack) return;

    var tooltips = parseTooltips(section);
    var cards = Array.prototype.slice.call(stack.querySelectorAll('[data-why-card]'));
    var orbitItems = Array.prototype.slice.call(section.querySelectorAll('[data-why-node]'));
    var center = section.querySelector('[data-why-center]');
    var centerHover = section.querySelector('[data-why-center-hover]');
    var panel = section.querySelector('[data-why-tooltip]');
    var diagram = section.querySelector('[data-why-diagram]');
    var backdrop = section.querySelector('[data-why-tooltip-backdrop]');
    var total = cards.length;
    var activeIndex = 0;
    var isAnimating = false;
    var mobileOpenIdx = null;

    function setMobileTooltipOpen(on) {
      if (backdrop) {
        if (on) {
          backdrop.hidden = false;
          backdrop.setAttribute('aria-hidden', 'false');
        } else {
          backdrop.hidden = true;
          backdrop.setAttribute('aria-hidden', 'true');
        }
      }
    }

    function hideTooltip() {
      mobileOpenIdx = null;
      setMobileTooltipOpen(false);
      if (!panel) return;
      panel.classList.remove('is-visible');
      window.setTimeout(function () {
        if (!panel.classList.contains('is-visible')) {
          panel.innerHTML = '';
          panel.hidden = true;
          panel.setAttribute('aria-hidden', 'true');
        }
      }, 240);
    }

    function showTooltipForIndex(idx) {
      if (!panel || !tooltips[idx]) return;
      renderTooltip(panel, tooltips[idx]);
      if (isWhyMobile()) {
        mobileOpenIdx = idx;
        setMobileTooltipOpen(true);
      }
    }

    function setPositions() {
      cards.forEach(function (card) {
        var idx = parseInt(card.getAttribute('data-index'), 10);
        var pos = (idx - activeIndex + total) % total;
        card.setAttribute('data-position', pos);
      });
    }

    function highlightOrbit() {
      var linked = focusIndicesForCard(activeIndex);
      orbitItems.forEach(function (node) {
        var nodeIdx = parseInt(node.getAttribute('data-why-node'), 10);
        node.classList.toggle('is-focused', linked.indexOf(nodeIdx) !== -1);
      });
    }

    function shuffle() {
      if (total < 2 || isAnimating) return;
      isAnimating = true;
      activeIndex = (activeIndex + 1) % total;
      setPositions();
      highlightOrbit();
      window.setTimeout(function () {
        isAnimating = false;
      }, 520);
    }

    stack.addEventListener('click', function (e) {
      var card = e.target.closest('[data-why-card]');
      if (!card) return;
      if (parseInt(card.getAttribute('data-position'), 10) !== 0) return;
      shuffle();
    });

    orbitItems.forEach(function (orbit) {
      var idx = parseInt(orbit.getAttribute('data-why-node'), 10);
      var hit =
        orbit.querySelector('[data-orbit-hit="' + idx + '"]') || orbit.querySelector('.home-why__node-btn');

      hit.addEventListener('click', function (e) {
        if (!isWhyMobile()) return;
        e.preventDefault();
        e.stopPropagation();
        if (mobileOpenIdx === idx) {
          hideTooltip();
          return;
        }
        showTooltipForIndex(idx);
      });

      hit.addEventListener('mouseenter', function () {
        if (isWhyMobile()) return;
        if (!panel || !tooltips[idx]) return;
        renderTooltip(panel, tooltips[idx]);
      });
      hit.addEventListener('mouseleave', hideTooltip);

      hit.addEventListener(
        'focus',
        function () {
          if (isWhyMobile()) return;
          if (!panel || !tooltips[idx]) return;
          renderTooltip(panel, tooltips[idx]);
        },
        true
      );
      hit.addEventListener(
        'blur',
        function () {
          hideTooltip();
        },
        true
      );
    });

    if (panel) {
      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        hideTooltip();
      });
    }

    if (diagram) {
      diagram.addEventListener('click', function (e) {
        if (!isWhyMobile()) return;
        if (e.target.closest('[data-why-node]')) return;
        if (e.target.closest('[data-why-center]')) return;
        if (e.target.closest('[data-why-tooltip]')) return;
        hideTooltip();
      });
    }

    function setCenterHovered(on) {
      if (!center) return;
      center.classList.toggle('is-hover-internal', on);
      if (centerHover) centerHover.setAttribute('aria-hidden', on ? 'false' : 'true');
    }

    if (center) {
      center.addEventListener('mouseenter', function () {
        setCenterHovered(true);
      });
      center.addEventListener('mouseleave', function () {
        setCenterHovered(false);
      });
      center.addEventListener('focus', function () {
        setCenterHovered(true);
      });
      center.addEventListener('blur', function () {
        setCenterHovered(false);
      });
      center.addEventListener('click', function () {
        if (isWhyMobile()) hideTooltip();
      });
    }

    setPositions();
    highlightOrbit();

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isWhyMobile()) return;
      if (mobileOpenIdx === null) return;
      hideTooltip();
    });
  }

  function onReady() {
    document.querySelectorAll('[data-home-why]').forEach(initWhy);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
