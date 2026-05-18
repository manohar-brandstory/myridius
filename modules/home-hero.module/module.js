(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-home-hero]');
  if (!roots.length) return;

  roots.forEach(function (root) {
    var track = root.querySelector('[data-hero-track]');
    var defaultView = root.querySelector('[data-default-view]');
    var expandedView = root.querySelector('[data-expanded-view]');
    var expandedLeft = root.querySelector('[data-expanded-left]');
    var expandedRight = root.querySelector('[data-expanded-right]');
    var bgImages = root.querySelectorAll('[data-bg-index]');
    var pager = root.querySelector('[data-hero-pager]');
    var prevBtn = root.querySelector('[data-hero-prev]');
    var nextBtn = root.querySelector('[data-hero-next]');
    var currentEl = root.querySelector('[data-hero-current]');
    var totalEl = root.querySelector('[data-hero-total]');
    if (!track || !defaultView || !expandedView) return;

    var cards = [];
    try {
      cards = JSON.parse(root.querySelector('[data-hero-cards]').textContent || '[]');
    } catch (e) { cards = []; }
    if (!cards.length) return;

    var interval = parseInt(root.getAttribute('data-interval'), 10) || 6000;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = null;
    var expandedCard = null;
    var isAnimating = false;
    var layoutEase = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
    var layoutEaseMobile = 'cubic-bezier(0.22, 1, 0.36, 1)';
    var layoutDuration = 1800;
    var layoutDurationMobile = 2200;
    var contentSwapMs = 320;
    var contentSwapMsMobile = 480;
    var cardsSwapMs = 280;
    var cardsSwapMsMobile = 420;
    var mobileMq = window.matchMedia('(max-width: 767px)');
    var total = cards.length;
    var heroInView = true;

    function isMobileHero() {
      return mobileMq.matches;
    }

    function getLayoutDuration() {
      return isMobileHero() ? layoutDurationMobile : layoutDuration;
    }

    function getLayoutEase() {
      return isMobileHero() ? layoutEaseMobile : layoutEase;
    }

    function pad2(n) {
      return n < 10 ? '0' + n : String(n);
    }

    function getCollapsedActiveIndex() {
      var first = track.children[0];
      if (!first) return 0;
      var index = parseInt(first.getAttribute('data-card-index'), 10);
      return Number.isFinite(index) ? index : 0;
    }

    function syncPager() {
      if (!pager || !currentEl || !totalEl) return;
      var current = expandedCard !== null ? expandedCard : getCollapsedActiveIndex();
      currentEl.textContent = pad2(current + 1);
      totalEl.textContent = pad2(total);
    }

    function alignTrackToIndex(index) {
      if (!track.children.length) return;
      var guard = 0;
      while (guard < cards.length) {
        var first = track.children[0];
        if (!first) break;
        var firstIndex = parseInt(first.getAttribute('data-card-index'), 10);
        if (firstIndex === index) break;
        track.appendChild(first);
        guard += 1;
      }
      setActiveByPosition();
    }

    function setActiveByPosition() {
      Array.prototype.forEach.call(track.children, function (el, i) {
        el.classList.toggle('is-active', i === 0);
      });
    }

    function captureRects() {
      var map = new Map();
      Array.prototype.forEach.call(track.children, function (el) {
        map.set(el, el.getBoundingClientRect());
      });
      return map;
    }

    function playLayoutAnimation(firstRects) {
      Array.prototype.forEach.call(track.children, function (el) {
        var first = firstRects.get(el);
        var last = el.getBoundingClientRect();
        if (!first || !last) return;

        var dx = first.left - last.left;
        var dy = first.top - last.top;
        var sx = first.width / (last.width || 1);
        var sy = first.height / (last.height || 1);

        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) {
          return;
        }

        el.animate(
          [
            {
              transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(' + sx + ', ' + sy + ')',
              transformOrigin: '50% 50%'
            },
            {
              transform: 'translate(0px, 0px) scale(1, 1)',
              transformOrigin: '50% 50%'
            }
          ],
          {
            duration: getLayoutDuration(),
            easing: getLayoutEase(),
            fill: 'none'
          }
        );
      });
    }

    /** Active card is always first in DOM — keep scroll at start (never scrollIntoView). */
    function resetMobileTrackScroll(smooth) {
      if (expandedCard !== null || !isMobileHero()) return;
      var behavior = smooth !== false && !reduced ? 'smooth' : 'auto';
      var row = root.querySelector('.home-hero__row');

      if (typeof track.scrollTo === 'function') {
        track.scrollTo({ left: 0, behavior: behavior });
      }
      if (row && typeof row.scrollTo === 'function') {
        row.scrollTo({ left: 0, behavior: behavior });
      }
    }

    function animateReorder(mutator, scrollTrackAfter) {
      if (expandedCard !== null || isAnimating) return;

      var firstRects = captureRects();
      mutator();
      setActiveByPosition();

      if (!reduced) {
        playLayoutAnimation(firstRects);
        isAnimating = true;
        window.setTimeout(function () {
          isAnimating = false;
          if (isMobileHero()) resetMobileTrackScroll(scrollTrackAfter);
        }, getLayoutDuration() + 80);
      } else if (isMobileHero()) {
        resetMobileTrackScroll(false);
      }
    }

    function rotateForward(userInitiated) {
      if (track.children.length < 2) return;
      animateReorder(function () {
        track.appendChild(track.children[0]);
      }, userInitiated);
      syncPager();
    }

    function rotateBackward(userInitiated) {
      if (track.children.length < 2) return;
      animateReorder(function () {
        track.insertBefore(track.children[track.children.length - 1], track.children[0]);
      }, userInitiated);
      syncPager();
    }

    function stopAuto() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    function startAuto() {
      stopAuto();
      if (expandedCard !== null || reduced || !heroInView) return;
      timer = setInterval(function () {
        rotateForward(false);
      }, interval);
    }

    function updateExpandedCopy(index, animate) {
      var data = cards[index];
      var tagEl = root.querySelector('[data-expanded-tag]');
      var titleEl = root.querySelector('[data-expanded-title]');
      var descEl = root.querySelector('[data-expanded-desc]');

      function apply() {
        tagEl.textContent = data.tag || '';
        titleEl.textContent = data.title || '';
        descEl.textContent = data.description || '';
      }

      if (!animate || reduced || !expandedLeft) {
        apply();
        return;
      }

      var swapMs = isMobileHero() ? contentSwapMsMobile : contentSwapMs;
      expandedLeft.classList.add('is-content-swapping');
      window.setTimeout(function () {
        apply();
        expandedLeft.classList.remove('is-content-swapping');
      }, swapMs);
    }

    function staggerExpandedCardEnter() {
      Array.prototype.forEach.call(expandedRight.children, function (el, i) {
        el.classList.remove('is-card-enter');
        el.style.removeProperty('--hero-card-enter-delay');
        void el.offsetWidth;
        el.style.setProperty('--hero-card-enter-delay', (i * (isMobileHero() ? 0.1 : 0.06)) + 's');
        el.classList.add('is-card-enter');
      });
    }

    function mountExpandedCards(activeIndex) {
      var frag = document.createDocumentFragment();
      for (var step = 1; step < cards.length; step += 1) {
        var idx = (activeIndex + step) % cards.length;
        var card = cards[idx];
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'home-hero__expanded-card';
        el.setAttribute('aria-label', 'View ' + (card.title || 'card'));
        el.innerHTML =
          '<div class="home-hero__expanded-card-media">' +
          '<img class="home-hero__expanded-card-img" src="' + esc(card.image) + '" alt="' + esc(card.imageAlt) + '">' +
          '<div class="home-hero__expanded-card-tint"></div>' +
          '</div>' +
          '<span class="home-hero__expanded-card-tag">' + esc(card.tag) + '</span>' +
          '<strong class="home-hero__expanded-card-title">' + esc(card.title) + '</strong>';
        (function (targetIndex) {
          el.addEventListener('click', function (e) {
            e.stopPropagation();
            expand(targetIndex);
          });
        })(idx);
        frag.appendChild(el);
      }
      if (typeof expandedRight.replaceChildren === 'function') {
        expandedRight.replaceChildren(frag);
      } else {
        expandedRight.innerHTML = '';
        expandedRight.appendChild(frag);
      }
    }

    function renderExpandedCards(activeIndex, animate) {
      if (!animate || reduced) {
        mountExpandedCards(activeIndex);
        return;
      }

      var swapMs = isMobileHero() ? cardsSwapMsMobile : cardsSwapMs;
      expandedRight.classList.add('is-cards-swapping');
      window.setTimeout(function () {
        mountExpandedCards(activeIndex);
        expandedRight.classList.remove('is-cards-swapping');
        staggerExpandedCardEnter();
      }, swapMs);
    }

    function setExpandedBackground(index) {
      var prev = -1;
      Array.prototype.forEach.call(bgImages, function (bg, i) {
        if (bg.classList.contains('is-active')) prev = i;
      });
      Array.prototype.forEach.call(bgImages, function (bg) {
        bg.classList.remove('is-exiting');
      });
      if (prev !== -1 && prev !== index && bgImages[prev]) {
        bgImages[prev].classList.add('is-exiting');
      }
      Array.prototype.forEach.call(bgImages, function (bg, i) {
        bg.classList.toggle('is-active', i === index);
      });
      if (prev !== -1 && prev !== index && bgImages[prev]) {
        var oldBg = bgImages[prev];
        var done = false;
        function cleanup() {
          if (done) return;
          done = true;
          oldBg.classList.remove('is-exiting');
          oldBg.removeEventListener('transitionend', onEnd);
        }
        function onEnd(e) {
          if (e.propertyName === 'opacity') cleanup();
        }
        oldBg.addEventListener('transitionend', onEnd);
        window.setTimeout(cleanup, 800);
      }
    }

    function expand(index) {
      if (index < 0 || index >= cards.length) return;
      var wasExpanded = expandedCard !== null;
      var switching = wasExpanded && expandedCard !== index;
      var firstExpand = !wasExpanded;
      expandedCard = index;
      isAnimating = false;
      stopAuto();
      root.classList.add('is-expanded');
      expandedView.setAttribute('aria-hidden', 'false');
      setExpandedBackground(index);
      alignTrackToIndex(index);

      if (switching && !reduced) {
        updateExpandedCopy(index, true);
        renderExpandedCards(index, true);
      } else {
        updateExpandedCopy(index, false);
        mountExpandedCards(index);
        if (firstExpand && !reduced) {
          window.requestAnimationFrame(function () {
            staggerExpandedCardEnter();
          });
        }
      }

      syncPager();
      expandedLeft.offsetHeight;
    }

    function collapse() {
      if (expandedCard === null) return;
      expandedCard = null;
      isAnimating = false;
      root.classList.remove('is-expanded');
      expandedView.setAttribute('aria-hidden', 'true');
      syncPager();
      if (isMobileHero()) resetMobileTrackScroll(false);
      if (!reduced) startAuto();
    }

    track.addEventListener('click', function (e) {
      var card = e.target.closest('[data-card-index]');
      if (!card) return;
      expand(parseInt(card.getAttribute('data-card-index'), 10));
    });

    track.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('[data-card-index]');
      if (!card) return;
      e.preventDefault();
      expand(parseInt(card.getAttribute('data-card-index'), 10));
    });

    expandedView.addEventListener('click', function (e) {
      if (expandedCard === null) return;
      if (e.target.closest('.home-hero__expanded-card')) return;
      collapse();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') collapse();
    });

    root.addEventListener('keydown', function (e) {
      if (expandedCard !== null) return;
      if (e.key === 'ArrowRight') rotateForward(true);
      if (e.key === 'ArrowLeft') rotateBackward(true);
    });

    var touchX = 0;
    track.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = touchX - e.changedTouches[0].screenX;
      if (Math.abs(dx) < 50) return;
      if (dx > 0) rotateForward(true);
      else rotateBackward(true);
    }, { passive: true });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (expandedCard !== null) {
          var target = (expandedCard - 1 + total) % total;
          expand(target);
          return;
        }
        rotateBackward(true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (expandedCard !== null) {
          var target = (expandedCard + 1) % total;
          expand(target);
          return;
        }
        rotateForward(true);
      });
    }

    if ('IntersectionObserver' in window) {
      var heroIo = new IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          heroInView = !!(entry && entry.isIntersecting);
          if (heroInView && expandedCard === null && !reduced) {
            startAuto();
          } else {
            stopAuto();
          }
        },
        { root: null, threshold: 0.12, rootMargin: '0px' }
      );
      heroIo.observe(root);
    }

    var animateEls = root.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window && !reduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      Array.prototype.forEach.call(animateEls, function (el) { io.observe(el); });
    } else {
      Array.prototype.forEach.call(animateEls, function (el) { el.classList.add('is-visible'); });
    }

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var onMotionChange = function () {
      reduced = mq.matches;
      if (reduced) stopAuto();
      else if (expandedCard === null && heroInView) startAuto();
    };
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMotionChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onMotionChange);
    }

    setActiveByPosition();
    syncPager();
    if (isMobileHero()) resetMobileTrackScroll(false);
    if (!reduced) startAuto();
  });

  function esc(value) {
    var d = document.createElement('div');
    d.textContent = value || '';
    return d.innerHTML;
  }
})();
