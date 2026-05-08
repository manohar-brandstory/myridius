(function () {
  'use strict';

  var BREAKPOINT_MD = 768;
  var PAGE_SLOTS = 3;

  function clamp(n, lo, hi) {
    return Math.min(Math.max(n, lo), hi);
  }

  function init(section) {
    var track = section.querySelector('[data-ins-track]');
    var prevBtn = section.querySelector('[data-ins-prev]');
    var nextBtn = section.querySelector('[data-ins-next]');
    var pagesContainer = section.querySelector('[data-ins-pages]');
    if (!track) return;

    var currentSlot = 0;

    function desktopPager() {
      return window.innerWidth >= BREAKPOINT_MD;
    }

    function halfStep() {
      var w = track.offsetWidth;
      return Math.max(w * 0.5, 1);
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

    function syncPagerUI() {
      if (!pagesContainer) return;

      pagesContainer.innerHTML = '';
      if (desktopPager()) {
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
      } else {
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      }
    }

    function slotFromScroll() {
      var step = halfStep();
      return clamp(Math.round(track.scrollLeft / step), 0, PAGE_SLOTS - 1);
    }

    track.addEventListener('scroll', function () {
      if (!desktopPager()) return;
      window.clearTimeout(track._insScrollT);
      track._insScrollT = window.setTimeout(function () {
        var slot = slotFromScroll();
        if (slot !== currentSlot) {
          currentSlot = slot;
          syncPagerUI();
        }
      }, 80);
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (desktopPager()) {
          scrollToSlot(currentSlot - 1);
        } else {
          scrollByHalf('prev');
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (desktopPager()) {
          scrollToSlot(currentSlot + 1);
        } else {
          scrollByHalf('next');
        }
      });
    }

    var resizeT;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(function () {
        if (desktopPager()) {
          currentSlot = slotFromScroll();
          scrollToSlot(currentSlot, false);
        } else {
          syncPagerUI();
        }
      }, 120);
    });

    syncPagerUI();
    if (desktopPager()) {
      scrollToSlot(0, false);
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
