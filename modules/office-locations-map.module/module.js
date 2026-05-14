(function () {
  var MQ = '(max-width: 1023px)';
  var ZOOM_MIN = 0.65;
  var ZOOM_MAX = 1.35;
  var STEP = 0.1;

  function clampZoom(z) {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
  }

  function initSection(section) {
    if (section.getAttribute('data-office-map-zoom-init') === '1') return;
    section.setAttribute('data-office-map-zoom-init', '1');

    var controls = section.querySelector('.map-section__zoom-controls');
    var btnOut = section.querySelector('[data-map-zoom="out"]');
    var btnIn = section.querySelector('[data-map-zoom="in"]');
    if (!controls || !btnOut || !btnIn) return;

    var zoom = 1;

    function apply() {
      section.style.setProperty('--map-zoom', String(zoom));
      btnOut.disabled = zoom <= ZOOM_MIN + 0.001;
      btnIn.disabled = zoom >= ZOOM_MAX - 0.001;
    }

    controls.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-map-zoom]');
      if (!btn || btn.disabled) return;
      var dir = btn.getAttribute('data-map-zoom');
      if (dir === 'in') zoom = clampZoom(zoom + STEP);
      else if (dir === 'out') zoom = clampZoom(zoom - STEP);
      apply();
    });

    var mq = window.matchMedia(MQ);
    function onMqChange() {
      if (!mq.matches) {
        zoom = 1;
        apply();
      }
    }

    if (mq.addEventListener) {
      mq.addEventListener('change', onMqChange);
    } else if (mq.addListener) {
      mq.addListener(onMqChange);
    }

    apply();
  }

  function boot() {
    document.querySelectorAll('[data-office-locations-map]').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
