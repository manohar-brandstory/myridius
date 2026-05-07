(function () {
  'use strict';

  var AUTOPLAY_MS = 9000;

  document.querySelectorAll('[data-svc-hww]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-panel]'));
    var bgs = Array.prototype.slice.call(root.querySelectorAll('[data-slide-bg]'));

    /* Desktop toggle */
    var toggleBtn = root.querySelector('[data-toggle-autoplay]');
    var pauseIcon = toggleBtn ? toggleBtn.querySelector('.svc-hww__toggle-pause') : null;
    var playIcon = toggleBtn ? toggleBtn.querySelector('.svc-hww__toggle-play') : null;

    /* Mobile nav elements */
    var mobToggle = root.querySelector('[data-mob-toggle]');
    var mobPause = mobToggle ? mobToggle.querySelector('.svc-hww__mob-pause') : null;
    var mobPlay = mobToggle ? mobToggle.querySelector('.svc-hww__mob-play') : null;
    var mobPrev = root.querySelector('[data-mob-prev]');
    var mobNext = root.querySelector('[data-mob-next]');
    var mobCurrent = root.querySelector('[data-mob-current]');

    var current = 0;
    var total = tabs.length || panels.length;
    var timer = null;
    var playing = true;

    function updatePagination() {
      if (mobCurrent) mobCurrent.textContent = current + 1;
    }

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      if (index === current && tabs.length && tabs[current].classList.contains('svc-hww__tab--active')) return;

      if (tabs[current]) {
        tabs[current].classList.remove('svc-hww__tab--active', 'svc-hww__tab--animating');
        tabs[current].setAttribute('aria-selected', 'false');
      }
      panels[current].classList.remove('svc-hww__panel--active');
      if (bgs[current]) bgs[current].classList.remove('svc-hww__bg-slide--active');

      current = index;

      if (tabs[current]) {
        tabs[current].classList.add('svc-hww__tab--active');
        tabs[current].setAttribute('aria-selected', 'true');
      }
      panels[current].classList.add('svc-hww__panel--active');
      if (bgs[current]) bgs[current].classList.add('svc-hww__bg-slide--active');

      updatePagination();

      if (playing) {
        startBarAnimation();
      }
    }

    function startBarAnimation() {
      if (!tabs[current]) return;
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

    function syncToggleIcons() {
      if (playing) {
        if (pauseIcon) pauseIcon.style.display = '';
        if (playIcon) playIcon.style.display = 'none';
        if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Pause autoplay');
        if (mobPause) mobPause.style.display = '';
        if (mobPlay) mobPlay.style.display = 'none';
        if (mobToggle) mobToggle.setAttribute('aria-label', 'Pause autoplay');
      } else {
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (playIcon) playIcon.style.display = '';
        if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Play autoplay');
        if (mobPause) mobPause.style.display = 'none';
        if (mobPlay) mobPlay.style.display = '';
        if (mobToggle) mobToggle.setAttribute('aria-label', 'Play autoplay');
      }
    }

    function startAutoplay() {
      clearInterval(timer);
      timer = setInterval(advance, AUTOPLAY_MS);
      playing = true;
      startBarAnimation();
      syncToggleIcons();
    }

    function stopAutoplay() {
      clearInterval(timer);
      timer = null;
      playing = false;
      stopBarAnimation();
      syncToggleIcons();
    }

    function handleToggle() {
      if (playing) { stopAutoplay(); } else { startAutoplay(); }
    }

    /* Desktop tab clicks */
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        goTo(i);
        if (playing) {
          clearInterval(timer);
          timer = setInterval(advance, AUTOPLAY_MS);
        }
      });
    });

    /* Desktop toggle */
    if (toggleBtn) {
      toggleBtn.addEventListener('click', handleToggle);
    }

    /* Mobile toggle */
    if (mobToggle) {
      mobToggle.addEventListener('click', handleToggle);
    }

    /* Mobile prev / next */
    if (mobPrev) {
      mobPrev.addEventListener('click', function () {
        goTo(current - 1);
        if (playing) {
          clearInterval(timer);
          timer = setInterval(advance, AUTOPLAY_MS);
        }
      });
    }

    if (mobNext) {
      mobNext.addEventListener('click', function () {
        goTo(current + 1);
        if (playing) {
          clearInterval(timer);
          timer = setInterval(advance, AUTOPLAY_MS);
        }
      });
    }

    updatePagination();
    startAutoplay();
  });
})();
