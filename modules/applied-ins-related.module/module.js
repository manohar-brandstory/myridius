(function () {
  function getSlidesToShow() {
    if (window.innerWidth <= 639) return 1;
    if (window.innerWidth <= 1023) return 2;
    return 3;
  }

  function initCarousel(carousel) {
    if (!carousel.classList.contains("is-slider")) return;

    var track = carousel.querySelector("[data-applied-ins-track]");
    var prev = carousel.querySelector("[data-applied-ins-prev]");
    var next = carousel.querySelector("[data-applied-ins-next]");
    if (!track || !prev || !next) return;

    var slides = track.querySelectorAll(".applied-ins-related__slide");
    var index = 0;
    var slidesToShow = getSlidesToShow();

    function maxIndex() {
      return Math.max(0, slides.length - slidesToShow);
    }

    function applyPosition() {
      var step = 100 / slidesToShow;
      track.style.transform = "translateX(-" + index * step + "%)";
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex();
    }

    function handleResize() {
      slidesToShow = getSlidesToShow();
      if (index > maxIndex()) index = maxIndex();
      applyPosition();
    }

    prev.addEventListener("click", function () {
      if (index > 0) {
        index -= 1;
        applyPosition();
      }
    });

    next.addEventListener("click", function () {
      if (index < maxIndex()) {
        index += 1;
        applyPosition();
      }
    });

    window.addEventListener("resize", handleResize);
    applyPosition();
  }

  function init() {
    var carousels = document.querySelectorAll("[data-applied-ins-carousel]");
    for (var i = 0; i < carousels.length; i += 1) {
      initCarousel(carousels[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
