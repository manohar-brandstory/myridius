(function () {
  'use strict';

  var hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mobileMedia = window.matchMedia('(max-width: 767px)');

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
    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    function applyMode() {
      if (isMobileLayout() || !useHoverExpand()) {
        expandAll(cards);
      } else {
        collapseAll(cards);
      }
    }

    function onEnter(card) {
      if (!useHoverExpand() || isMobileLayout()) return;
      expandOne(cards, card);
    }

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        onEnter(card);
      });
      card.addEventListener('focus', function () {
        onEnter(card);
      });
    });

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
