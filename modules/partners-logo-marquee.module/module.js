(function () {
  var INIT = 'data-partners-logos-init';
  var MAX_TILES = 120;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function fillStrip(strip, minWidth) {
    var tiles = Array.prototype.slice.call(strip.children);
    if (!tiles.length) return;

    var seed = tiles.map(function (tile) {
      return tile.cloneNode(true);
    });

    strip.innerHTML = '';
    function appendSeed() {
      seed.forEach(function (tile) {
        strip.appendChild(tile.cloneNode(true));
      });
    }

    appendSeed();
    while (strip.scrollWidth < minWidth && strip.children.length < MAX_TILES) {
      appendSeed();
    }
  }

  function syncRow(row) {
    var track = row.querySelector('[data-marquee-track]');
    if (!track) return;

    var strips = track.querySelectorAll('[data-marquee-strip]');
    if (strips.length < 2) return;

    var stripPrimary = strips[0];
    var stripClone = strips[1];
    if (!stripPrimary.children.length) {
      row.hidden = true;
      return;
    }

    row.hidden = false;
    var minWidth = Math.max(row.getBoundingClientRect().width * 2, 1);

    fillStrip(stripPrimary, minWidth);
    stripClone.innerHTML = stripPrimary.innerHTML;
  }

  function initSection(section) {
    if (!section || section.getAttribute(INIT) === 'true') return;
    section.setAttribute(INIT, 'true');

    if (prefersReducedMotion()) return;

    section.querySelectorAll('.partners-logos__row').forEach(syncRow);
  }

  function initAll() {
    document.querySelectorAll('[data-partners-logos]').forEach(initSection);
  }

  var resizeTimer;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      document.querySelectorAll('[data-partners-logos]').forEach(function (section) {
        section.removeAttribute(INIT);
        initSection(section);
      });
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('load', initAll);
})();
