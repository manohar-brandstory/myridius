(function () {
  'use strict';

  var track = document.getElementById('homeStoriesTrack');
  var prevBtn = document.getElementById('homeStoriesPrev');
  var nextBtn = document.getElementById('homeStoriesNext');
  var pagesWrap = document.getElementById('homeStoriesPages');
  var mobilePagesWrap = document.getElementById('homeStoriesMobilePages');

  if (!track || !prevBtn || !nextBtn || !pagesWrap || !mobilePagesWrap) return;

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

  function updateMobilePager() {
    var current = String(currentIndex + 1).padStart(2, '0');
    var total = String(n).padStart(2, '0');
    mobilePagesWrap.innerHTML = '<span class="is-current">' + current + '</span>&nbsp;/&nbsp;<span>' + total + '</span>';
  }

  function scrollToIndex(i, smooth) {
    i = Math.max(0, Math.min(i, n - 1));
    currentIndex = i;
    var target = cards[i];
    var left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: smooth === false ? 'auto' : 'smooth' });
    updateArrowState();
    updatePageDots();
    updateMobilePager();
  }

  function nearestIndexFromScroll() {
    var center = track.scrollLeft + track.clientWidth / 2;
    var best = 0;
    var bestDelta = Infinity;
    for (var i = 0; i < n; i++) {
      var cardCenter = cards[i].offsetLeft + cards[i].clientWidth / 2;
      var d = Math.abs(cardCenter - center);
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
      updateMobilePager();
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

  updateMobilePager();

  function isTouchUi() {
    if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) return true;
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return true;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    return false;
  }

  function closeOtherStoryHovers(active) {
    Array.prototype.forEach.call(cards, function (c) {
      if (c !== active) c.classList.remove('is-hovered');
    });
  }

  Array.prototype.forEach.call(cards, function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.home-stories__cta')) return;
      if (!isTouchUi()) return;
      var on = !card.classList.contains('is-hovered');
      closeOtherStoryHovers(card);
      card.classList.toggle('is-hovered', on);
    });
  });
})();
