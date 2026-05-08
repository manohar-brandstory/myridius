(function () {
  'use strict';

  var track = document.getElementById('homeStoriesTrack');
  var prevBtn = document.getElementById('homeStoriesPrev');
  var nextBtn = document.getElementById('homeStoriesNext');
  var pagesWrap = document.getElementById('homeStoriesPages');

  if (!track || !prevBtn || !nextBtn || !pagesWrap) return;

  var cards = track.querySelectorAll('.home-stories__card');
  var n = cards.length;
  if (!n) return;

  var currentIndex = 0;
  var scrollSyncTimer;

  function updateArrowState() {
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= n - 1;
  }

  function updatePageDots() {
    var btns = pagesWrap.querySelectorAll('.home-stories__page');
    btns.forEach(function (b, idx) {
      b.classList.toggle('is-active', idx === currentIndex);
    });
  }

  function scrollToIndex(i, smooth) {
    i = Math.max(0, Math.min(i, n - 1));
    currentIndex = i;
    var target = cards[i];
    track.scrollTo({
      left: target.offsetLeft,
      behavior: smooth === false ? 'auto' : 'smooth'
    });
    updateArrowState();
    updatePageDots();
  }

  function nearestIndexFromScroll() {
    var sl = track.scrollLeft;
    var best = 0;
    var bestDelta = Infinity;
    for (var i = 0; i < n; i++) {
      var d = Math.abs(cards[i].offsetLeft - sl);
      if (d < bestDelta) {
        bestDelta = d;
        best = i;
      }
    }
    return best;
  }

  function onScrollEndSync() {
    var idx = nearestIndexFromScroll();
    if (idx !== currentIndex) {
      currentIndex = idx;
      updateArrowState();
      updatePageDots();
    }
  }

  track.addEventListener('scroll', function () {
    window.clearTimeout(scrollSyncTimer);
    scrollSyncTimer = window.setTimeout(onScrollEndSync, 72);
  });

  prevBtn.addEventListener('click', function () {
    scrollToIndex(currentIndex - 1);
  });

  nextBtn.addEventListener('click', function () {
    scrollToIndex(currentIndex + 1);
  });

  function buildDots() {
    pagesWrap.innerHTML = '';
    for (var i = 0; i < n; i++) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'home-stories__page';
        btn.textContent = String(idx + 1).padStart(2, '0');
        btn.setAttribute('aria-label', 'View story ' + (idx + 1));
        if (idx === currentIndex) btn.classList.add('is-active');
        btn.addEventListener('click', function () {
          scrollToIndex(idx);
        });
        pagesWrap.appendChild(btn);
      })(i);
    }
  }

  buildDots();
  scrollToIndex(0, false);

  var resizeTimer;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      scrollToIndex(nearestIndexFromScroll(), false);
    }, 120);
  });

  // Tap-to-toggle hover state on touch devices (matches export onClick).
  var coarsePointer = window.matchMedia && window.matchMedia('(hover: none)').matches;
  Array.prototype.forEach.call(cards, function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.home-stories__cta')) return;
      if (!coarsePointer) return;
      card.classList.toggle('is-hovered');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('.home-stories__cta')) return;
      e.preventDefault();
      card.classList.toggle('is-hovered');
    });
  });
})();
