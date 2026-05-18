(function () {
  'use strict';

  var sections = document.querySelectorAll('.evoq-journey');
  if (!sections.length) return;

  var hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mobileMedia = window.matchMedia('only screen and (max-width: 767px)');
  var tabletMedia = window.matchMedia(
    'only screen and (min-width: 768px) and (max-width: 1024px)'
  );
  var carouselNavMedia = window.matchMedia('only screen and (max-width: 1024px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function pad2(n) {
    var v = Math.max(0, parseInt(n, 10) || 0);
    return v < 10 ? '0' + v : String(v);
  }

  function normalizeWheelDeltaY(e) {
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= (window.innerHeight || 600);
    return dy;
  }

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

  function scrollCardIntoViewport(viewport, card, smooth) {
    if (!viewport || !card) return;
    var pad = isMobileLayout() ? 20 : 0;
    var vR = viewport.getBoundingClientRect();
    var cR = card.getBoundingClientRect();
    var delta = cR.left - vR.left - pad;
    var nextLeft = viewport.scrollLeft + delta;
    var useSmooth = smooth && !reduceMotion.matches;
    viewport.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: useSmooth ? 'smooth' : 'auto',
    });
  }

  sections.forEach(function (section) {
    var stages = section.querySelectorAll('.evoq-journey__stage');
    var cardsContainer = section.querySelector('[data-evoq-journey-cards]');
    var cards = cardsContainer
      ? Array.prototype.slice.call(cardsContainer.querySelectorAll('[data-journey-card]'))
      : [];
    var cardsTrack = section.querySelector('[data-evoq-journey-track]');
    var cardsViewport = section.querySelector('.evoq-journey__cards-viewport');
    var cardsSlider = section.querySelector('.evoq-journey__cards-slider');
    var toolbar = section.querySelector('.evoq-journey__cards-toolbar');
    var cardsCount =
      parseInt(cardsTrack && cardsTrack.getAttribute('data-card-count'), 10) || cards.length;
    var prevBtn = section.querySelector('.evoq-journey__cards-nav--prev');
    var nextBtn = section.querySelector('.evoq-journey__cards-nav--next');
    var indexCurrentEl = section.querySelector('[data-evoq-journey-index-current]');
    var indexTotalEl = section.querySelector('[data-evoq-journey-index-tot]');
    var activeMobileIndex = 0;

    stages.forEach(function (stage) {
      stage.addEventListener('mouseenter', function () {
        stages.forEach(function (s) {
          s.classList.remove('evoq-journey__stage--active');
        });
        stage.classList.add('evoq-journey__stage--active');
      });

      stage.addEventListener('mouseleave', function () {
        stage.classList.remove('evoq-journey__stage--active');
      });
    });

    function applyCardMode() {
      if (!cards.length) return;

      if (isMobileLayout()) {
        activeMobileIndex = 0;
        if (reduceMotion.matches) {
          expandAll(cards);
        } else {
          expandOne(cards, cards[0]);
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
              scrollCardIntoViewport(cardsViewport, cards[0], false);
            });
          });
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
      if (related && cardsContainer && cardsContainer.contains(related)) return;
      collapseAll(cards);
    }

    if (cardsContainer && cards.length) {
      cardsContainer.addEventListener('mouseleave', onLeaveHoverGroup);

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
          if (card.getAttribute('data-expanded') === 'true') return;
          activeMobileIndex = idx;
          expandOne(cards, card);
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
              scrollCardIntoViewport(cardsViewport, card, !reduceMotion.matches);
            });
          });
        });
      });

      applyCardMode();

      function onModeChange() {
        applyCardMode();
      }

      if (hoverMedia.addEventListener) {
        hoverMedia.addEventListener('change', onModeChange);
      } else if (hoverMedia.addListener) {
        hoverMedia.addListener(onModeChange);
      }
      if (mobileMedia.addEventListener) {
        mobileMedia.addEventListener('change', onModeChange);
      } else if (mobileMedia.addListener) {
        mobileMedia.addListener(onModeChange);
      }
      if (reduceMotion.addEventListener) {
        reduceMotion.addEventListener('change', onModeChange);
      } else if (reduceMotion.addListener) {
        reduceMotion.addListener(onModeChange);
      }
    }

    var indexRaf = null;
    function dominantCardIndex() {
      if (!cardsViewport || !cards.length) return 0;
      var v = cardsViewport.getBoundingClientRect();
      var bestIdx = 0;
      var bestVis = -1;
      for (var i = 0; i < cards.length; i += 1) {
        var c = cards[i].getBoundingClientRect();
        var left = Math.max(c.left, v.left);
        var right = Math.min(c.right, v.right);
        var vis = Math.max(0, right - left);
        if (vis > bestVis) {
          bestVis = vis;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    function updatePagination() {
      if (!indexCurrentEl || !indexTotalEl) return;
      var idx = dominantCardIndex();
      indexCurrentEl.textContent = pad2(idx + 1);
      indexTotalEl.textContent = pad2(cardsCount);
    }

    function schedulePaginationUpdate() {
      if (indexRaf != null) return;
      indexRaf = window.requestAnimationFrame(function () {
        indexRaf = null;
        updatePagination();
      });
    }

    function updateNavState() {
      if (!cardsViewport || !toolbar || !prevBtn || !nextBtn) return;
      var enabled =
        cardsSlider && cardsSlider.classList.contains('evoq-journey__cards-slider--enabled');
      if (!enabled) {
        toolbar.style.display = 'none';
        return;
      }
      var canScroll = cardsViewport.scrollWidth > cardsViewport.clientWidth + 2;
      var showNav =
        cardsCount > 1 &&
        ((mobileMedia.matches && canScroll) || tabletMedia.matches);
      toolbar.style.display = showNav ? '' : 'none';
      if (showNav) {
        schedulePaginationUpdate();
      }
    }

    function scrollStepPx() {
      if (!cardsViewport || cards.length < 2) {
        return Math.max(
          220,
          cardsViewport && cardsViewport.clientWidth ? cardsViewport.clientWidth * 0.8 : 220
        );
      }
      var a = cards[0].getBoundingClientRect();
      var b = cards[1].getBoundingClientRect();
      var d = Math.round(b.left - a.left);
      return d > 0 ? d : 220;
    }

    if (cardsViewport && prevBtn && nextBtn && toolbar) {
      prevBtn.addEventListener('click', function () {
        cardsViewport.scrollBy({ left: -scrollStepPx(), behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', function () {
        cardsViewport.scrollBy({ left: scrollStepPx(), behavior: 'smooth' });
      });

      var mobileScrollTimer = null;
      cardsViewport.addEventListener('scroll', function () {
        updateNavState();
        schedulePaginationUpdate();
        if (!isMobileLayout() || !cards.length) return;
        if (mobileScrollTimer) window.clearTimeout(mobileScrollTimer);
        mobileScrollTimer = window.setTimeout(function () {
          mobileScrollTimer = null;
          var idx = dominantCardIndex();
          if (cards[idx] && cards[idx].getAttribute('data-expanded') !== 'true') {
            expandOne(cards, cards[idx]);
            activeMobileIndex = idx;
          }
        }, 120);
      });
      carouselNavMedia.addEventListener('change', function () {
        updateNavState();
        schedulePaginationUpdate();
      });
      window.addEventListener('resize', function () {
        updateNavState();
        schedulePaginationUpdate();
      });
      updateNavState();
      updatePagination();
    }

    if (cardsViewport) {
      cardsViewport.addEventListener(
        'wheel',
        function (event) {
          if (carouselNavMedia.matches) return;
          if (event.ctrlKey) return;
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

          var el = cardsViewport;
          var maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
          if (maxScroll <= 0) return;

          var dy = normalizeWheelDeltaY(event);
          var st = el.scrollLeft;
          var atStart = st <= 0;
          var atEnd = st >= maxScroll - 1;

          if (dy < 0 && atStart) return;
          if (dy > 0 && atEnd) return;

          event.preventDefault();
          el.scrollLeft = st + dy;
        },
        { passive: false }
      );
    }
  });
})();
