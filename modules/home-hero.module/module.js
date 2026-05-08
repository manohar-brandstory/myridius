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
    var layoutEase = 'cubic-bezier(0.22, 1, 0.36, 1)';
    var layoutDuration = 1400;

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
            duration: layoutDuration,
            easing: layoutEase,
            fill: 'none'
          }
        );
      });
    }

    function animateReorder(mutator) {
      if (expandedCard !== null || isAnimating) return;

      var firstRects = captureRects();
      mutator();
      setActiveByPosition();

      if (!reduced) {
        playLayoutAnimation(firstRects);
        isAnimating = true;
        window.setTimeout(function () {
          isAnimating = false;
        }, layoutDuration + 50);
      }
    }

    function rotateForward() {
      if (track.children.length < 2) return;
      animateReorder(function () {
        track.appendChild(track.children[0]);
      });
    }

    function rotateBackward() {
      if (track.children.length < 2) return;
      animateReorder(function () {
        track.insertBefore(track.children[track.children.length - 1], track.children[0]);
      });
    }

    function stopAuto() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(rotateForward, interval);
    }

    function renderExpandedCards(activeIndex) {
      expandedRight.innerHTML = '';
      cards.forEach(function (card, idx) {
        if (idx === activeIndex) return;
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
        el.addEventListener('click', function (e) {
          e.stopPropagation();
          expand(idx);
        });
        expandedRight.appendChild(el);
      });
    }

    function setExpandedBackground(index) {
      Array.prototype.forEach.call(bgImages, function (bg, i) {
        bg.classList.toggle('is-active', i === index);
      });
    }

    function expand(index) {
      if (index < 0 || index >= cards.length) return;
      expandedCard = index;
      isAnimating = false;
      stopAuto();
      root.classList.add('is-expanded');
      expandedView.setAttribute('aria-hidden', 'false');
      setExpandedBackground(index);
      var data = cards[index];
      root.querySelector('[data-expanded-tag]').textContent = data.tag || '';
      root.querySelector('[data-expanded-title]').textContent = data.title || '';
      root.querySelector('[data-expanded-desc]').textContent = data.description || '';
      renderExpandedCards(index);

      expandedLeft.offsetHeight;
    }

    function collapse() {
      if (expandedCard === null) return;
      expandedCard = null;
      isAnimating = false;
      root.classList.remove('is-expanded');
      expandedView.setAttribute('aria-hidden', 'true');
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

    root.addEventListener('click', function (e) {
      if (expandedCard === null) return;
      if (e.target.closest('.home-hero__expanded-card')) return;
      if (e.target.closest('.home-hero__btn')) return;
      if (e.target.closest('[data-expanded-left]')) return;
      collapse();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') collapse();
    });

    root.addEventListener('keydown', function (e) {
      if (expandedCard !== null) return;
      if (e.key === 'ArrowRight') rotateForward();
      if (e.key === 'ArrowLeft') rotateBackward();
    });

    var touchX = 0;
    track.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = touchX - e.changedTouches[0].screenX;
      if (Math.abs(dx) < 50) return;
      if (dx > 0) rotateForward();
      else rotateBackward();
    }, { passive: true });

    root.addEventListener('mouseenter', function () {
      if (expandedCard === null) stopAuto();
    });
    root.addEventListener('mouseleave', function () {
      if (expandedCard === null && !reduced) startAuto();
    });

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
      else if (expandedCard === null) startAuto();
    };
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMotionChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onMotionChange);
    }

    setActiveByPosition();
    if (!reduced) startAuto();
  });

  function esc(value) {
    var d = document.createElement('div');
    d.textContent = value || '';
    return d.innerHTML;
  }
})();
