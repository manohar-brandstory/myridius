(function () {
  function pad2(n) {
    var k = typeof n === "number" ? n : parseInt(n, 10);
    if (isNaN(k)) return "01";
    return k < 10 ? "0" + k : String(k);
  }

  function desktopSlidesToShow() {
    if (window.innerWidth <= 1023) return 2;
    return 3;
  }

  function isMobileUi() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function maxIndexDesktop(slidesLength, slidesToShow) {
    return Math.max(0, slidesLength - slidesToShow);
  }

  function scrollSlideIntoView(viewport, slide) {
    if (!viewport || !slide) return;
    viewport.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });
  }

  function currentMobileSlideIndex(viewport, slides) {
    if (!viewport || !slides.length) return 0;
    var x = viewport.scrollLeft;
    var best = 0;
    for (var i = 0; i < slides.length; i += 1) {
      if (slides[i].offsetLeft <= x + 12) best = i;
    }
    return best;
  }

  function initCarousel(carousel) {
    if (!carousel.classList.contains("is-slider")) return;

    var track = carousel.querySelector("[data-applied-ins-track]");
    var viewport = carousel.querySelector("[data-applied-ins-viewport]");
    var prev = carousel.querySelector("[data-applied-ins-prev]");
    var next = carousel.querySelector("[data-applied-ins-next]");
    var mobPrev = carousel.querySelector("[data-applied-ins-mob-prev]");
    var mobNext = carousel.querySelector("[data-applied-ins-mob-next]");
    var mobCur = carousel.querySelector("[data-applied-ins-mob-cur]");
    var mobTotal = carousel.querySelector("[data-applied-ins-mob-total]");

    if (!track || !viewport || !prev || !next) return;

    var slides = carousel.querySelectorAll("[data-applied-ins-slide]");
    var index = 0;

    function applyDesktopTransform() {
      var st = desktopSlidesToShow();
      var step = 100 / st;
      track.style.transform = "translateX(-" + index * step + "%)";
    }

    function wrapDesktopIndex(delta) {
      var st = desktopSlidesToShow();
      var maxIdx = maxIndexDesktop(slides.length, st);
      if (maxIdx <= 0) return;
      index += delta;
      if (index < 0) index = maxIdx;
      else if (index > maxIdx) index = 0;
    }

    function syncDesktopAfterResize() {
      var maxIdx = maxIndexDesktop(slides.length, desktopSlidesToShow());
      if (index > maxIdx) index = maxIdx;
      applyDesktopTransform();
    }

    function updateMobNavState() {
      if (!mobPrev || !mobNext) return;
      var cur = currentMobileSlideIndex(viewport, slides);
      mobPrev.disabled = cur <= 0;
      mobNext.disabled = cur >= slides.length - 1;
    }

    function updateMobPager() {
      if (!mobCur || !mobTotal || !slides.length) return;
      mobTotal.textContent = pad2(slides.length);
      var curIdx = isMobileUi()
        ? currentMobileSlideIndex(viewport, slides)
        : index;
      mobCur.textContent = pad2(Math.min(slides.length, curIdx + 1));
    }

    function onResize() {
      if (isMobileUi()) {
        track.style.transform = "";
      } else {
        syncDesktopAfterResize();
      }
      updateMobNavState();
      updateMobPager();
    }

    prev.addEventListener("click", function () {
      if (isMobileUi()) return;
      wrapDesktopIndex(-1);
      applyDesktopTransform();
      updateMobPager();
    });

    next.addEventListener("click", function () {
      if (isMobileUi()) return;
      wrapDesktopIndex(1);
      applyDesktopTransform();
      updateMobPager();
    });

    if (mobPrev) {
      mobPrev.addEventListener("click", function () {
        if (!isMobileUi()) return;
        var cur = currentMobileSlideIndex(viewport, slides);
        var nextIdx = Math.max(0, cur - 1);
        scrollSlideIntoView(viewport, slides[nextIdx]);
      });
    }

    if (mobNext) {
      mobNext.addEventListener("click", function () {
        if (!isMobileUi()) return;
        var cur = currentMobileSlideIndex(viewport, slides);
        var nextIdx = Math.min(slides.length - 1, cur + 1);
        scrollSlideIntoView(viewport, slides[nextIdx]);
      });
    }

    viewport.addEventListener("scroll", function () {
      if (!isMobileUi()) return;
      updateMobPager();
      updateMobNavState();
    });

    window.addEventListener("resize", function () {
      onResize();
    });

    prev.removeAttribute("disabled");
    next.removeAttribute("disabled");
    prev.disabled = false;
    next.disabled = false;

    onResize();
    if (!isMobileUi()) applyDesktopTransform();
    updateMobNavState();
    updateMobPager();
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
