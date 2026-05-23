(function () {
  var sections = document.querySelectorAll("[data-culture-values]");
  if (!sections.length) return;

  sections.forEach(function (section) {
    var slides = section.querySelectorAll("[data-cult-values-slide]");
    var bgs = section.querySelectorAll("[data-cult-values-bg]");
    var nums = section.querySelectorAll("[data-cult-values-go]");
    var pauseBtn = section.querySelector("[data-cult-values-pause]");
    var current = 0;
    var isPaused = false;
    var timer = null;
    var INTERVAL = 4500;

    if (!slides.length) return;

    function goTo(idx) {
      current = idx;
      slides.forEach(function (el, i) {
        el.classList.toggle("is-active", i === idx);
      });
      bgs.forEach(function (el, i) {
        el.classList.toggle("is-active", i === idx);
      });
      nums.forEach(function (el, i) {
        el.classList.toggle("is-active", i === idx);
        el.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    function startAutoplay() {
      stopAutoplay();
      if (!isPaused) {
        timer = setInterval(next, INTERVAL);
      }
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    nums.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-cult-values-go"), 10);
        if (isNaN(idx)) return;
        goTo(idx);
        startAutoplay();
      });
    });

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        isPaused = !isPaused;
        this.classList.toggle("is-paused", isPaused);
        this.setAttribute("aria-label", isPaused ? "Play autoplay" : "Pause autoplay");
        if (isPaused) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    }

    startAutoplay();

    if ("IntersectionObserver" in window) {
      var srEls = section.querySelectorAll("[data-sr]");
      srEls.forEach(function (el) {
        el.classList.add("is-sr-hidden");
      });

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove("is-sr-hidden");
            entry.target.classList.add("is-sr-shown");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.1 }
      );

      srEls.forEach(function (el) {
        io.observe(el);
      });
    }
  });
})();
