(function () {
  var track = document.querySelector('[data-news-track]');
  if (!track) return;

  track.addEventListener('mouseenter', function () {
    track.classList.add('is-paused');
  });

  track.addEventListener('mouseleave', function () {
    track.classList.remove('is-paused');
  });
})();
