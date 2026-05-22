(function () {
  var sections = document.querySelectorAll('[data-careers-genius]');
  if (!sections.length) return;

  sections.forEach(function (section) {
    var playBtn = section.querySelector('.careers-genius__play');
    var media = section.querySelector('.careers-genius__media:not(.careers-genius__media--video)');
    if (!playBtn || !media) return;

    playBtn.addEventListener('click', function () {
      media.classList.add('is-playing');
    });
  });
})();
