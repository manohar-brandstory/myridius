(function () {
  'use strict';

  var BREAKPOINT_MD = 768;
  var PAGE_SLOTS = 3;
  var AUTOPLAY_MS = 5500;
  var AUTOPLAY_RESUME_MS = 9000;

  function clamp(n, lo, hi) {
    return Math.min(Math.max(n, lo), hi);
  }

  function init(section) {
    var track = section.querySelector('[data-ins-track]');
    var prevBtn = section.querySelector('[data-ins-prev]');
    var nextBtn = section.querySelector('[data-ins-next]');
    var pagesContainer = section.querySelector('[data-ins-pages]');
    if (!track || !pagesContainer) return;

    var cards = track.querySelectorAll('.home-ins__card');
    var totalCards = cards.length || 1;
    var currentSlot = 0;
    var autoTimer = null;
    var resumeAutoTimer = null;
    var reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function desktopPager() {
      return window.innerWidth >= BREAKPOINT_MD;
    }

    function halfStep() {
      var w = track.offsetWidth;
      return Math.max(w * 0.5, 1);
    }

    function cardStep() {
      var card = track.querySelector('.home-ins__card');
      if (!card) return Math.max(track.clientWidth, 1);
      var cs = window.getComputedStyle(track);
      var gap = parseFloat(cs.gap || cs.columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function currentCardIndex() {
      var step = cardStep();
      if (step <= 1) return 0;
      var maxIdx = totalCards - 1;
      var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      var idx = Math.round(track.scrollLeft / step);
      if (track.scrollLeft >= maxScroll - 2) idx = maxIdx;
      return clamp(idx, 0, maxIdx);
    }

    function scrollByHalf(dir) {
      var d = dir === 'next' ? 1 : -1;
      track.scrollBy({ left: d * halfStep(), behavior: 'smooth' });
    }

    function scrollToSlot(slot, smooth) {
      if (!desktopPager()) return;

      currentSlot = clamp(slot, 0, PAGE_SLOTS - 1);
      track.scrollTo({
        left: currentSlot * halfStep(),
        behavior: smooth === false ? 'auto' : 'smooth'
      });
      syncPagerUI();
    }

    function scrollToCard(index, smooth) {
      var step = cardStep();
      var i = clamp(index, 0, totalCards - 1);
      track.scrollTo({
        left: i * step,
        behavior: smooth === false ? 'auto' : 'smooth'
      });
      syncPagerUI();
    }

    function renderMobileCounter(idx) {
      var cur = String(idx + 1).padStart(2, '0');
      var tot = String(totalCards).padStart(2, '0');
      pagesContainer.innerHTML =
        '<span class="home-ins__pager-count" aria-live="polite">' +
        '<span class="home-ins__count-cur">' +
        cur +
        '</span>' +
        '<span class="home-ins__count-sep"> / </span>' +
        '<span class="home-ins__count-tot">' +
        tot +
        '</span></span>';
    }

    function snapScrollIndex() {
      var step = cardStep();
      if (step <= 1) return;
      var maxIdx = totalCards - 1;
      var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      var raw = track.scrollLeft / step;
      var idx = Math.round(raw);
      if (track.scrollLeft >= maxScroll - 2) idx = maxIdx;
      idx = clamp(idx, 0, maxIdx);
      var target = idx * step;
      if (Math.abs(track.scrollLeft - target) > 2) {
        track.scrollTo({ left: target, behavior: 'auto' });
      }
    }

    function syncPagerUI() {
      if (!pagesContainer) return;

      if (desktopPager()) {
        pagesContainer.innerHTML = '';
        for (var i = 0; i < PAGE_SLOTS; i++) {
          (function (idx) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className =
              'home-ins__page-num' + (idx === currentSlot ? ' home-ins__page-num--active' : '');
            btn.textContent = String(idx + 1).padStart(2, '0');
            btn.setAttribute('aria-label', 'View page ' + (idx + 1));
            btn.addEventListener('click', function () {
              scrollToSlot(idx);
            });
            pagesContainer.appendChild(btn);
          })(i);
        }

        if (prevBtn) prevBtn.disabled = currentSlot <= 0;
        if (nextBtn) nextBtn.disabled = currentSlot >= PAGE_SLOTS - 1;
        return;
      }

      var idx = currentCardIndex();
      renderMobileCounter(idx);
      if (prevBtn) prevBtn.disabled = idx <= 0;
      if (nextBtn) nextBtn.disabled = idx >= totalCards - 1;
    }

    function slotFromScroll() {
      var step = halfStep();
      return clamp(Math.round(track.scrollLeft / step), 0, PAGE_SLOTS - 1);
    }

    function stopAutoplay() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function scheduleAutoplayResume() {
      window.clearTimeout(resumeAutoTimer);
      if (reducedMotion || desktopPager() || totalCards <= 1) return;
      resumeAutoTimer = window.setTimeout(startAutoplay, AUTOPLAY_RESUME_MS);
    }

    function startAutoplay() {
      window.clearTimeout(resumeAutoTimer);
      resumeAutoTimer = null;
      stopAutoplay();
      if (reducedMotion || desktopPager() || totalCards <= 1) return;
      autoTimer = window.setInterval(function () {
        var idx = currentCardIndex();
        var next = idx + 1 >= totalCards ? 0 : idx + 1;
        scrollToCard(next, true);
      }, AUTOPLAY_MS);
    }

    function onUserInteractTrack() {
      stopAutoplay();
      scheduleAutoplayResume();
    }

    track.addEventListener(
      'scroll',
      function () {
        window.clearTimeout(track._insScrollT);
        track._insScrollT = window.setTimeout(function () {
          if (desktopPager()) {
            var slot = slotFromScroll();
            if (slot !== currentSlot) {
              currentSlot = slot;
              syncPagerUI();
            }
          } else {
            snapScrollIndex();
            syncPagerUI();
          }
        }, 80);
      },
      { passive: true }
    );

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        onUserInteractTrack();
        if (desktopPager()) {
          scrollToSlot(currentSlot - 1);
        } else {
          scrollToCard(currentCardIndex() - 1, true);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        onUserInteractTrack();
        if (desktopPager()) {
          scrollToSlot(currentSlot + 1);
        } else {
          scrollToCard(currentCardIndex() + 1, true);
        }
      });
    }

    track.addEventListener('touchstart', onUserInteractTrack, { passive: true });
    track.addEventListener('wheel', onUserInteractTrack, { passive: true });

    var resizeT;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(function () {
        stopAutoplay();
        if (desktopPager()) {
          currentSlot = slotFromScroll();
          scrollToSlot(currentSlot, false);
        } else {
          scrollToCard(currentCardIndex(), false);
          syncPagerUI();
        }
        startAutoplay();
      }, 120);
    });

    syncPagerUI();
    if (desktopPager()) {
      scrollToSlot(0, false);
    } else {
      scrollToCard(0, false);
      startAutoplay();
    }
  }

  function boot() {
    document.querySelectorAll('.home-ins').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
