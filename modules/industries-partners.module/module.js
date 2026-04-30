(function () {
  // HubSpot sometimes executes module JS without a reliable `document.currentScript`.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var sections = scope.querySelectorAll(".partners");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-partners-inited") === "true") return;
    section.setAttribute("data-partners-inited", "true");

    // Mobile logo carousel autoplay
    var logos = section.querySelector(".partners__logos");
    if (logos && typeof window.requestAnimationFrame === "function") {
      var isRunning = false;
      var isPaused = false;
      var rafId = 0;
      var lastTs = 0;
      var resumeTimer = 0;
      var SPEED_PX_PER_SEC = 10; // slow continuous scroll

      function isMobileCarousel() {
        try { return getComputedStyle(logos).display === "flex"; }
        catch (e) { return false; }
      }

      function pause(ms) {
        isPaused = true;
        if (resumeTimer) window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(function () { isPaused = false; }, ms || 1200);
      }

      function tick(ts) {
        if (!isRunning) return;
        if (!isMobileCarousel()) {
          rafId = window.requestAnimationFrame(tick);
          return;
        }
        if (!lastTs) lastTs = ts;
        var dt = Math.min(64, ts - lastTs);
        lastTs = ts;

        if (!isPaused) {
          var max = logos.scrollWidth - logos.clientWidth;
          if (max > 0) {
            var next = logos.scrollLeft + (SPEED_PX_PER_SEC * dt) / 1000;
            if (next >= max - 1) next = 0;
            logos.scrollLeft = next;
          }
        }
        rafId = window.requestAnimationFrame(tick);
      }

      function start() {
        if (isRunning) return;
        isRunning = true;
        lastTs = 0;
        rafId = window.requestAnimationFrame(tick);
      }
      function stop() {
        isRunning = false;
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = 0;
        if (resumeTimer) window.clearTimeout(resumeTimer);
        resumeTimer = 0;
      }

      // Pause on user interaction
      logos.addEventListener("pointerdown", function () { pause(2000); }, { passive: true });
      logos.addEventListener("touchstart", function () { pause(2000); }, { passive: true });
      logos.addEventListener("wheel", function () { pause(2000); }, { passive: true });
      logos.addEventListener("scroll", function () { pause(800); }, { passive: true });
      window.addEventListener("resize", function () { pause(1200); }, { passive: true });

      start();

      // Ensure we clean up if section is removed (rare, but safe)
      section.addEventListener("hs:destroy", stop);
    }

    // Scroll reveal (optional)
    var srEls = section.querySelectorAll("[data-sr]");
    if (srEls.length && ("IntersectionObserver" in window)) {
      srEls.forEach(function (el) { el.classList.add("is-sr-hidden"); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-sr-hidden");
          entry.target.classList.add("is-sr-shown");
          io.unobserve(entry.target);
        });
      }, { threshold: 0.14 });
      srEls.forEach(function (el) { io.observe(el); });
    }
  }

  sections.forEach(init);
})();

