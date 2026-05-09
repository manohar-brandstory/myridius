(function () {
  'use strict';

  var MOBILE_MAX = 768;

  var section = document.querySelector('.home-news');
  if (!section) return;

  var track = section.querySelector('[data-news-track]');
  var marquee = section.querySelector('.home-news__marquee-wrapper');
  var cards = Array.prototype.slice.call(section.querySelectorAll('.home-news__card'));
  var playPauseBtn = section.querySelector('.home-news__btn--playpause');
  var prevBtn = section.querySelector('.home-news__btn--prev');
  var nextBtn = section.querySelector('.home-news__btn--next');
  var iconPause = section.querySelector('.home-news__icon-pause');
  var iconPlay = section.querySelector('.home-news__icon-play');

  if (!track || !marquee) return;

  var firstSet = section.querySelectorAll('.news-card[data-news-copy="0"]');
  if (!firstSet.length) return;
  var uniqueCount = firstSet.length;

  var isPaused = false;
  var isHovered = false;
  var resumeTimer = null;
  var currentIndex = 0;

  function isNewsMobile() {
    return window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches;
  }

  function animationPaused() {
    return isPaused || isHovered;
  }

  function updatePausedState() {
    if (isNewsMobile()) {
      track.classList.add('is-paused');
      marquee.classList.add('home-news__marquee-wrapper--scrollable');
      return;
    }
    if (animationPaused()) {
      track.classList.add('is-paused');
      marquee.classList.add('home-news__marquee-wrapper--scrollable');
    } else {
      track.classList.remove('is-paused');
      marquee.classList.remove('home-news__marquee-wrapper--scrollable');
      marquee.scrollLeft = 0;
    }
  }

  function clearResumeTimer() {
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  }

  function scheduleResume() {
    clearResumeTimer();
    resumeTimer = setTimeout(function () {
      isPaused = false;
      if (iconPause) iconPause.style.display = 'block';
      if (iconPlay) iconPlay.style.display = 'none';
      if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Pause');
      updatePausedState();
    }, 3000);
  }

  function getTargetSlide(safe) {
    var sel = isNewsMobile()
      ? '.news-card[data-news-copy="0"][data-news-slide="' + safe + '"]'
      : '.news-card[data-news-slide="' + safe + '"]';
    var nodes = section.querySelectorAll(sel);
    if (!nodes.length) return null;
    if (isNewsMobile()) {
      return nodes[0];
    }
    var mr = marquee.getBoundingClientRect();
    var centerX = mr.left + mr.width / 2;
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var r = el.getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var d = Math.abs(mid - centerX);
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    }
    return best;
  }

  function scrollToIndex(index) {
    var safe = ((index % uniqueCount) + uniqueCount) % uniqueCount;
    currentIndex = safe;

    if (isNewsMobile()) {
      var slideW = marquee.clientWidth || window.innerWidth;
      window.requestAnimationFrame(function () {
        marquee.scrollTo({ left: safe * slideW, behavior: 'smooth' });
      });
      return;
    }

    var target = getTargetSlide(safe);
    if (!target) return;

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var tr = target.getBoundingClientRect();
        var mr = marquee.getBoundingClientRect();
        var delta = tr.left + tr.width / 2 - (mr.left + mr.width / 2);
        var next = marquee.scrollLeft + delta;
        var maxScroll = Math.max(0, marquee.scrollWidth - marquee.clientWidth);
        next = Math.max(0, Math.min(maxScroll, next));
        marquee.scrollTo({ left: next, behavior: 'smooth' });
      });
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', function () {
      clearResumeTimer();
      isPaused = !isPaused;
      if (isPaused) {
        if (iconPause) iconPause.style.display = 'none';
        if (iconPlay) iconPlay.style.display = 'block';
        playPauseBtn.setAttribute('aria-label', 'Play');
      } else {
        if (iconPause) iconPause.style.display = 'block';
        if (iconPlay) iconPlay.style.display = 'none';
        playPauseBtn.setAttribute('aria-label', 'Pause');
      }
      updatePausedState();
    });
  }

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (isNewsMobile()) return;
      isHovered = true;
      updatePausedState();
    });
    card.addEventListener('mouseleave', function () {
      if (isNewsMobile()) return;
      isHovered = false;
      updatePausedState();
    });
  });

  function syncMobileIndexFromScroll() {
    if (!isNewsMobile()) return;
    var slideW = marquee.clientWidth || 1;
    currentIndex = Math.round(marquee.scrollLeft / slideW);
    currentIndex = Math.max(0, Math.min(uniqueCount - 1, currentIndex));
  }

  marquee.addEventListener('scroll', function () {
    if (!isNewsMobile()) return;
    window.clearTimeout(marquee._newsScrollT);
    marquee._newsScrollT = window.setTimeout(syncMobileIndexFromScroll, 80);
  });

  var resizeNewsT;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeNewsT);
    resizeNewsT = window.setTimeout(function () {
      updatePausedState();
      if (isNewsMobile()) {
        scrollToIndex(currentIndex);
      }
    }, 120);
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      isPaused = true;
      if (iconPause) iconPause.style.display = 'none';
      if (iconPlay) iconPlay.style.display = 'block';
      if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Play');
      updatePausedState();
      scrollToIndex(currentIndex - 1);
      scheduleResume();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      isPaused = true;
      if (iconPause) iconPause.style.display = 'none';
      if (iconPlay) iconPlay.style.display = 'block';
      if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Play');
      updatePausedState();
      scrollToIndex(currentIndex + 1);
      scheduleResume();
    });
  }

  updatePausedState();
})();
