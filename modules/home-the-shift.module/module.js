(function () {
  'use strict';

  var hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mobileMedia = window.matchMedia('(max-width: 767px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var AUTOPLAY_MS = 5000;
  var SCROLL_RESUME_MS = 8000;

  function isMobileLayout() {
    return mobileMedia.matches;
  }

  function useHoverExpand() {
    return hoverMedia.matches && !isMobileLayout();
  }

  function expandOne(cards, target) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i] === target) {
        cards[i].setAttribute('data-expanded', 'true');
      } else {
        cards[i].removeAttribute('data-expanded');
      }
    }
  }

  function expandAll(cards) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].setAttribute('data-expanded', 'true');
    }
  }

  function collapseAll(cards) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].removeAttribute('data-expanded');
    }
  }

  function initIntro(section) {
    var intro = section.querySelector('[data-shift-intro]');
    if (!intro || !('IntersectionObserver' in window)) {
      if (intro) intro.classList.add('is-in-view');
      return;
    }
    var reduced = reduceMotion.matches;
    if (reduced) {
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
      { rootMargin: '-80px', threshold: 0.08 }
    );
    io.observe(intro);
  }

  function bindCards(section) {
    var container = section.querySelector('[data-shift-cards]');
    if (!container) return;
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-shift-card]'));
    if (!cards.length) return;

    var autoplayTimer = null;
    var scrollResumeTimer = null;
    var activeMobileIndex = 0;
    /** Ignore track scroll events right after programmatic scroll (avoids thrashing timers / page nudge) */
    var ignoreTrackScrollUntil = 0;

    function scrollCardIntoTrack(container, card, smooth) {
      if (!container || !card) return;
      var pad = 24;
      var cR = container.getBoundingClientRect();
      var rR = card.getBoundingClientRect();
      var delta = rR.left - cR.left - pad;
      var nextLeft = container.scrollLeft + delta;
      var useSmooth = smooth && !reduceMotion.matches;
      ignoreTrackScrollUntil = Date.now() + (useSmooth ? 650 : 80);
      container.scrollTo({
        left: Math.max(0, nextLeft),
        behavior: useSmooth ? 'smooth' : 'auto',
      });
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function clearScrollResume() {
      if (scrollResumeTimer) {
        clearTimeout(scrollResumeTimer);
        scrollResumeTimer = null;
      }
    }

    function startMobileAutoplay() {
      stopAutoplay();
      clearScrollResume();
      if (!isMobileLayout()) return;
      if (reduceMotion.matches) return;
      if (cards.length < 2) return;

      autoplayTimer = window.setInterval(function () {
        activeMobileIndex = (activeMobileIndex + 1) % cards.length;
        var c = cards[activeMobileIndex];
        expandOne(cards, c);
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            scrollCardIntoTrack(container, c, true);
          });
        });
      }, AUTOPLAY_MS);
    }

    function pauseAutoplayForScroll() {
      if (!isMobileLayout()) return;
      stopAutoplay();
      clearScrollResume();
      scrollResumeTimer = window.setTimeout(function () {
        startMobileAutoplay();
      }, SCROLL_RESUME_MS);
    }

    function applyMode() {
      stopAutoplay();
      clearScrollResume();

      if (isMobileLayout()) {
        activeMobileIndex = 0;
        if (reduceMotion.matches) {
          expandAll(cards);
        } else {
          expandOne(cards, cards[0]);
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
              scrollCardIntoTrack(container, cards[0], false);
            });
          });
          startMobileAutoplay();
        }
      } else if (!useHoverExpand()) {
        expandAll(cards);
      } else {
        collapseAll(cards);
      }
    }

    function onEnter(card) {
      if (!useHoverExpand() || isMobileLayout()) return;
      expandOne(cards, card);
    }

    function onLeaveHoverGroup(e) {
      if (!useHoverExpand() || isMobileLayout()) return;
      var related = e.relatedTarget;
      if (related && container.contains(related)) return;
      collapseAll(cards);
    }

    container.addEventListener('mouseleave', onLeaveHoverGroup);

    cards.forEach(function (card, idx) {
      card.addEventListener('mouseenter', function () {
        onEnter(card);
      });
      card.addEventListener('focus', function () {
        onEnter(card);
      });
      card.addEventListener('focusout', onLeaveHoverGroup);

      card.addEventListener('click', function () {
        if (!isMobileLayout()) return;
        activeMobileIndex = idx;
        expandOne(cards, card);
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            scrollCardIntoTrack(container, card, !reduceMotion.matches);
          });
        });
        pauseAutoplayForScroll();
      });
    });

    container.addEventListener(
      'scroll',
      function () {
        if (!isMobileLayout()) return;
        if (Date.now() < ignoreTrackScrollUntil) return;
        pauseAutoplayForScroll();
      },
      { passive: true }
    );

    applyMode();

    if (hoverMedia.addEventListener) {
      hoverMedia.addEventListener('change', applyMode);
    } else if (hoverMedia.addListener) {
      hoverMedia.addListener(applyMode);
    }
    if (mobileMedia.addEventListener) {
      mobileMedia.addEventListener('change', applyMode);
    } else if (mobileMedia.addListener) {
      mobileMedia.addListener(applyMode);
    }
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', applyMode);
    } else if (reduceMotion.addListener) {
      reduceMotion.addListener(applyMode);
    }
  }

  function init() {
    document.querySelectorAll('[data-home-shift]').forEach(function (section) {
      initIntro(section);
      bindCards(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
