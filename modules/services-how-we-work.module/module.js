(function () {
  'use strict';

  var AUTOPLAY_MS = 9000;

  document.querySelectorAll('[data-svc-hww]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-panel]'));
    var bgs = Array.prototype.slice.call(root.querySelectorAll('[data-slide-bg]'));
    var toggleBtn = root.querySelector('[data-toggle-autoplay]');
    var pauseIcon = toggleBtn ? toggleBtn.querySelector('.svc-hww__toggle-pause') : null;
    var playIcon = toggleBtn ? toggleBtn.querySelector('.svc-hww__toggle-play') : null;

    var current = 0;
    var total = tabs.length;
    var timer = null;
    var playing = true;

    function goTo(index) {
      if (index === current && tabs[current].classList.contains('svc-hww__tab--active')) return;

      tabs[current].classList.remove('svc-hww__tab--active', 'svc-hww__tab--animating');
      tabs[current].setAttribute('aria-selected', 'false');
      panels[current].classList.remove('svc-hww__panel--active');
      bgs[current].classList.remove('svc-hww__bg-slide--active');

      current = index;

      tabs[current].classList.add('svc-hww__tab--active');
      tabs[current].setAttribute('aria-selected', 'true');
      panels[current].classList.add('svc-hww__panel--active');
      bgs[current].classList.add('svc-hww__bg-slide--active');

      if (playing) {
        startBarAnimation();
      }
    }

    function startBarAnimation() {
      tabs[current].classList.remove('svc-hww__tab--animating');
      void tabs[current].offsetWidth;
      tabs[current].style.setProperty('--autoplay-duration', AUTOPLAY_MS + 'ms');
      tabs[current].classList.add('svc-hww__tab--animating');
    }

    function stopBarAnimation() {
      tabs.forEach(function (t) {
        t.classList.remove('svc-hww__tab--animating');
      });
    }

    function advance() {
      goTo((current + 1) % total);
    }

    function startAutoplay() {
      clearInterval(timer);
      timer = setInterval(advance, AUTOPLAY_MS);
      playing = true;
      startBarAnimation();
      if (pauseIcon) pauseIcon.style.display = '';
      if (playIcon) playIcon.style.display = 'none';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Pause autoplay');
    }

    function stopAutoplay() {
      clearInterval(timer);
      timer = null;
      playing = false;
      stopBarAnimation();
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (playIcon) playIcon.style.display = '';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Play autoplay');
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        goTo(i);
        if (playing) {
          clearInterval(timer);
          timer = setInterval(advance, AUTOPLAY_MS);
        }
      });
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        if (playing) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    }

    startAutoplay();
  });
})();
