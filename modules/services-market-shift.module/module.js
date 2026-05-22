(function () {
  var MOBILE_QUERY = "(max-width: 768px)";

  function init() {
    var root =
      (document.currentScript &&
        document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
      document;

    if (!root.querySelector) return;

    var slider = root.querySelector("[data-shift-slider]");
    if (!slider) return;

    var slides = slider.querySelectorAll("[data-shift-slide]");
    var prevBtn = root.querySelector("[data-shift-prev]");
    var nextBtn = root.querySelector("[data-shift-next]");
    var dotBtns = root.querySelectorAll("[data-shift-dot]");
    if (!slides.length) return;

    var index = 0;
    var mql = window.matchMedia(MOBILE_QUERY);

    function isMobile() {
      return mql.matches;
    }

    function goTo(i, behavior) {
      if (!isMobile()) return;
      index = Math.max(0, Math.min(slides.length - 1, i));
      var target = slides[index];
      slider.scrollTo({
        left: target.offsetLeft,
        behavior: behavior || "smooth",
      });
      updateDots();
      updateNavDisabled();
    }

    function updateDots() {
      dotBtns.forEach(function (dot, i) {
        var on = i === index;
        dot.classList.toggle("is-active", on);
      });
    }

    function updateNavDisabled() {
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= slides.length - 1;
    }

    function syncSlideHeights() {
      if (!isMobile()) {
        slides.forEach(function (slide) {
          slide.style.minHeight = "";
          var card = slide.querySelector(".svc-shift__card");
          if (card) card.style.minHeight = "";
        });
        return;
      }
      var maxH = 0;
      slides.forEach(function (slide) {
        slide.style.minHeight = "";
        var card = slide.querySelector(".svc-shift__card");
        if (card) card.style.minHeight = "";
      });
      slides.forEach(function (slide) {
        var h = slide.getBoundingClientRect().height;
        if (h > maxH) maxH = h;
      });
      if (!maxH) return;
      slides.forEach(function (slide) {
        slide.style.minHeight = Math.ceil(maxH) + "px";
        var card = slide.querySelector(".svc-shift__card");
        if (card) card.style.minHeight = Math.ceil(maxH) + "px";
      });
    }

    slider.addEventListener("scroll", function () {
      if (!isMobile()) return;
      var left = slider.scrollLeft;
      var nearest = 0;
      var minDelta = Number.POSITIVE_INFINITY;
      slides.forEach(function (slide, i) {
        var delta = Math.abs(slide.offsetLeft - left);
        if (delta < minDelta) {
          minDelta = delta;
          nearest = i;
        }
      });
      if (nearest !== index) {
        index = nearest;
        updateDots();
        updateNavDisabled();
      }
    }, { passive: true });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1, "smooth");
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1, "smooth");
      });
    }

    dotBtns.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i, "smooth");
      });
    });

    function handleViewportChange() {
      if (!isMobile()) {
        index = 0;
        slider.scrollLeft = 0;
        syncSlideHeights();
        return;
      }
      goTo(index, "auto");
      syncSlideHeights();
    }

    if (mql.addEventListener) {
      mql.addEventListener("change", handleViewportChange);
    } else if (mql.addListener) {
      mql.addListener(handleViewportChange);
    }

    window.addEventListener("resize", syncSlideHeights);
    slider.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("load", syncSlideHeights);
    });

    updateDots();
    updateNavDisabled();
    syncSlideHeights();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
