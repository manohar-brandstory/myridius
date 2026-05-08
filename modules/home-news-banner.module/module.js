(function () {
  var section = document.querySelector('.home-news');
  if (!section) return;

  var track = section.querySelector('[data-news-track]');
  var cards = Array.prototype.slice.call(section.querySelectorAll('.home-news__card'));
  var newsItems = Array.prototype.slice.call(section.querySelectorAll('.news-card'));
  var playPauseBtn = section.querySelector('.home-news__btn--playpause');
  var prevBtn = section.querySelector('.home-news__btn--prev');
  var nextBtn = section.querySelector('.home-news__btn--next');
  var iconPause = section.querySelector('.home-news__icon-pause');
  var iconPlay = section.querySelector('.home-news__icon-play');

  if (!track) return;

  var isPaused = false;
  var isHovered = false;
  var resumeTimer = null;
  var currentIndex = 0;
  var uniqueCount = Math.max(1, newsItems.length / 3);

  function animationPaused() {
    return isPaused || isHovered;
  }

  function updatePausedState() {
    if (animationPaused()) {
      track.classList.add('is-paused');
    } else {
      track.classList.remove('is-paused');
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

  function scrollToIndex(index) {
    var safe = ((index % uniqueCount) + uniqueCount) % uniqueCount;
    currentIndex = safe;
    var target = track.querySelectorAll('.news-card')[safe];
    if (!target) return;
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
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
