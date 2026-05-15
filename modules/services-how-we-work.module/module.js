(function () {
  'use strict';

  var AUTOPLAY_MS = 9000;
  var mqMobile =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 767px)')
      : null;

  document.querySelectorAll('[data-svc-hww]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-panel]'));
    var bgs = Array.prototype.slice.call(root.querySelectorAll('[data-slide-bg]'));
    var panelsWrap = root.querySelector('.svc-hww__panels');

    var toggleBtn = root.querySelector('[data-toggle-autoplay]');
    var mobToggle = root.querySelector('[data-mob-toggle]');
    var mobPrev = root.querySelector('[data-mob-prev]');
    var mobNext = root.querySelector('[data-mob-next]');
    var mobCurrent = root.querySelector('[data-mob-current]');

    var current = 0;
    var total = tabs.length || panels.length;
    var timer = null;
    var playing = true;

    function isMobileView() {
      return mqMobile ? mqMobile.matches : window.innerWidth <= 767;
    }

    function bindControl(el, handler) {
      if (!el) return;
      var lastFire = 0;

      el.addEventListener(
        'mousedown',
        function (e) {
          e.preventDefault();
        },
        true
      );

      function onActivate(e) {
        var now = Date.now();
        if (now - lastFire < 350) return;
        lastFire = now;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        handler(e);
        if (document.activeElement === el) {
          el.blur();
        }
      }

      el.addEventListener('pointerup', onActivate, true);
      el.addEventListener('touchend', onActivate, { passive: false, capture: true });
      el.addEventListener('click', onActivate, true);
    }

    function syncPanelsHeight() {
      if (!panelsWrap || !panels.length) return;
      if (!isMobileView()) {
        panelsWrap.style.minHeight = '';
        return;
      }

      var maxH = 0;
      panels.forEach(function (panel) {
        var card = panel.querySelector('.svc-hww__card');
        if (!card) return;

        var wasActive = panel.classList.contains('svc-hww__panel--active');
        var saved = {
          position: panel.style.position,
          visibility: panel.style.visibility,
          opacity: panel.style.opacity,
          pointerEvents: panel.style.pointerEvents,
        };

        panel.style.position = 'relative';
        panel.style.visibility = 'hidden';
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
        panel.classList.add('svc-hww__panel--active');

        maxH = Math.max(maxH, card.offsetHeight || card.scrollHeight || 0);

        panel.classList.toggle('svc-hww__panel--active', wasActive);
        panel.style.position = saved.position;
        panel.style.visibility = saved.visibility;
        panel.style.opacity = saved.opacity;
        panel.style.pointerEvents = saved.pointerEvents;
      });

      panelsWrap.style.minHeight = maxH ? maxH + 'px' : '';
    }

    function setMobNavDisabled() {
      if (!mobPrev || !mobNext) return;
      if (!isMobileView()) {
        mobPrev.disabled = false;
        mobNext.disabled = false;
        return;
      }
      mobPrev.disabled = current <= 0;
      mobNext.disabled = current >= total - 1;
    }

    function updatePagination() {
      if (mobCurrent) mobCurrent.textContent = current + 1;
      setMobNavDisabled();
    }

    function syncToggleState() {
      root.classList.toggle('is-autoplay-paused', !playing);
    }

    function resetTabFill(tab) {
      if (!tab) return;
      var fill = tab.querySelector('.svc-hww__tab-bar-fill');
      if (fill) fill.style.removeProperty('animation');
      tab.classList.remove('svc-hww__tab--animating', 'svc-hww__tab--paused');
    }

    function startBarAnimation() {
      if (isMobileView()) return;
      var tab = tabs[current];
      if (!tab) return;
      var fill = tab.querySelector('.svc-hww__tab-bar-fill');
      if (!fill) return;

      tab.classList.remove('svc-hww__tab--paused');
      tab.style.setProperty('--autoplay-duration', AUTOPLAY_MS + 'ms');
      tab.classList.add('svc-hww__tab--animating');

      requestAnimationFrame(function () {
        fill.style.animation = 'none';
        requestAnimationFrame(function () {
          fill.style.removeProperty('animation');
        });
      });
    }

    function stopBarAnimation() {
      if (isMobileView()) return;
      var tab = tabs[current];
      if (tab) tab.classList.add('svc-hww__tab--paused');
    }

    function goTo(index) {
      if (isMobileView()) {
        index = Math.max(0, Math.min(total - 1, index));
      } else {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
      }

      if (
        index === current &&
        tabs.length &&
        tabs[current].classList.contains('svc-hww__tab--active')
      ) {
        return;
      }

      var prev = current;

      if (tabs[prev]) {
        tabs[prev].classList.remove('svc-hww__tab--active');
        tabs[prev].setAttribute('aria-selected', 'false');
        resetTabFill(tabs[prev]);
      }

      panels[prev].classList.remove('svc-hww__panel--active');
      if (bgs[prev]) bgs[prev].classList.remove('svc-hww__bg-slide--active');

      current = index;

      if (tabs[current]) {
        tabs[current].classList.add('svc-hww__tab--active');
        tabs[current].setAttribute('aria-selected', 'true');
      }
      panels[current].classList.add('svc-hww__panel--active');
      if (bgs[current]) bgs[current].classList.add('svc-hww__bg-slide--active');

      updatePagination();

      if (playing && !isMobileView()) {
        startBarAnimation();
      }
    }

    function advance() {
      if (isMobileView()) {
        if (current >= total - 1) goTo(0);
        else goTo(current + 1);
        return;
      }
      goTo((current + 1) % total);
    }

    function restartTimer() {
      if (!playing) return;
      clearInterval(timer);
      timer = setInterval(advance, AUTOPLAY_MS);
    }

    function startAutoplay() {
      clearInterval(timer);
      timer = setInterval(advance, AUTOPLAY_MS);
      playing = true;
      if (!isMobileView()) {
        if (tabs[current] && tabs[current].classList.contains('svc-hww__tab--paused')) {
          tabs[current].classList.remove('svc-hww__tab--paused');
        } else {
          startBarAnimation();
        }
      }
      syncToggleState();
    }

    function stopAutoplay() {
      clearInterval(timer);
      timer = null;
      playing = false;
      stopBarAnimation();
      syncToggleState();
    }

    function handleToggle() {
      if (playing) stopAutoplay();
      else startAutoplay();
    }

    tabs.forEach(function (tab, i) {
      bindControl(tab, function () {
        goTo(i);
        restartTimer();
      });
    });

    bindControl(toggleBtn, handleToggle);
    bindControl(mobToggle, handleToggle);

    bindControl(mobPrev, function () {
      goTo(current - 1);
      restartTimer();
    });

    bindControl(mobNext, function () {
      goTo(current + 1);
      restartTimer();
    });

    syncPanelsHeight();
    updatePagination();
    syncToggleState();
    startAutoplay();

    window.addEventListener(
      'resize',
      function () {
        syncPanelsHeight();
        setMobNavDisabled();
      },
      { passive: true }
    );
  });
})();
