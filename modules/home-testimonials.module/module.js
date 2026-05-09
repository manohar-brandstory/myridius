(function () {
  'use strict';

  var section = document.querySelector('.home-test');
  if (!section) return;

  var track = section.querySelector('[data-testimonials-track]');
  var marquee = section.querySelector('.home-test__marquee');
  var cards = Array.prototype.slice.call(section.querySelectorAll('.home-test__card'));
  var playPauseBtn = section.querySelector('.home-test__btn--playpause');
  var prevBtn = section.querySelector('.home-test__btn--prev');
  var nextBtn = section.querySelector('.home-test__btn--next');
  var iconPause = section.querySelector('.home-test__icon-pause');
  var iconPlay = section.querySelector('.home-test__icon-play');

  if (!track || !marquee || !cards.length) return;

  var chunks = track.querySelectorAll('.home-test__chunk');
  var firstChunk = chunks[0];
  var uniqueCount = 1;
  if (firstChunk) {
    var n = firstChunk.querySelectorAll('.home-test__card').length;
    if (n > 0) uniqueCount = n;
  }

  var isPaused = false;
  var isHovered = false;
  var resumeTimer = null;
  var currentIndex = 0;

  function animationPaused() {
    return isPaused || isHovered;
  }

  function updatePausedState() {
    if (animationPaused()) {
      track.classList.add('is-paused');
      marquee.classList.add('home-test__marquee--scrollable');
    } else {
      track.classList.remove('is-paused');
      marquee.classList.remove('home-test__marquee--scrollable');
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

  /**
   * Same testimonial is repeated in each chunk; pick the copy whose center is
   * closest to the marquee center so prev/next works after a paused animation.
   */
  function getTargetCardForSlide(safe) {
    var chs = track.querySelectorAll('.home-test__chunk');
    if (!chs.length) return null;

    var mr = marquee.getBoundingClientRect();
    var centerX = mr.left + mr.width / 2;
    var best = null;
    var bestDist = Infinity;

    for (var i = 0; i < chs.length; i++) {
      var list = chs[i].querySelectorAll('.home-test__card');
      if (safe >= list.length) continue;
      var el = list[safe];
      var r = el.getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var d = Math.abs(mid - centerX);
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    }

    if (!best && firstChunk) {
      var fc = firstChunk.querySelectorAll('.home-test__card');
      if (safe < fc.length) best = fc[safe];
    }
    return best;
  }

  function scrollToIndex(index) {
    var safe = ((index % uniqueCount) + uniqueCount) % uniqueCount;
    currentIndex = safe;
    var target = getTargetCardForSlide(safe);
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
      isHovered = true;
      updatePausedState();
    });
    card.addEventListener('mouseleave', function () {
      isHovered = false;
      updatePausedState();
    });
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
