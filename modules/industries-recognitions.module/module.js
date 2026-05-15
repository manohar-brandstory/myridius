(function () {
  // HubSpot sometimes executes module JS without a reliable `document.currentScript`.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var sections = scope.querySelectorAll("[data-recog]");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-recog-inited") === "true") return;
    section.setAttribute("data-recog-inited", "true");

    var slides = Array.prototype.slice.call(section.querySelectorAll("[data-recog-slide]"));
    var btnPrev = section.querySelector("[data-recog-prev]");
    var btnNext = section.querySelector("[data-recog-next]");
    var nums = Array.prototype.slice.call(section.querySelectorAll("[data-recog-go]"));
    var link = section.querySelector("[data-recog-link]");
    var linkText = section.querySelector("[data-recog-link-text]");

    if (!slides.length) return;
    if (slides.length <= 1) {
      var nav = section.querySelector(".recog__nav");
      if (nav) nav.style.display = "none";
    }

    var active = 0;
    var isAnimating = false;
    var ANIM_MS = 400;
    var content = section.querySelector(".recog__content");
    var resizeTimer;

    function measureSlideHeight(slide) {
      if (!slide || !content) return 0;

      slides.forEach(function (s) {
        s.style.position = "relative";
        s.style.inset = "auto";
        s.style.height = "auto";
        s.style.display = s === slide ? "block" : "none";
      });

      content.style.height = "auto";
      var height = slide.offsetHeight;

      slides.forEach(function (s) {
        s.style.position = "";
        s.style.inset = "";
        s.style.height = "";
        s.style.display = "";
      });

      return height;
    }

    function syncContentHeight() {
      if (!content) return;
      var slide = slides[active];
      if (!slide) return;
      var height = measureSlideHeight(slide);
      if (height > 0) {
        content.style.height = height + "px";
      }
    }

    function scheduleHeightSync() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(syncContentHeight, 50);
    }

    function setActive(idx) {
      var next = (idx + slides.length) % slides.length;
      if (next === active) return;
      if (isAnimating) return;
      isAnimating = true;

      var prev = active;
      var prevEl = slides[prev];
      var nextEl = slides[next];

      // Exit previous
      if (prevEl) {
        prevEl.classList.remove("is-entering");
        prevEl.classList.remove("is-exiting");
        prevEl.classList.add("is-active");
        void prevEl.offsetWidth; // ensure animation restarts
        prevEl.classList.add("is-exiting");
      }

      // After exit completes, swap to next (AnimatePresence mode="wait")
      window.setTimeout(function () {
        if (prevEl) {
          prevEl.classList.remove("is-exiting");
          prevEl.classList.remove("is-active");
        }

        active = next;

        slides.forEach(function (s, i) {
          if (i !== active) {
            s.classList.remove("is-entering");
            s.classList.remove("is-exiting");
            s.classList.remove("is-active");
          }
        });

        if (nextEl) {
          nextEl.classList.remove("is-exiting");
          nextEl.classList.add("is-active");
          nextEl.classList.remove("is-entering");
          void nextEl.offsetWidth;
          nextEl.classList.add("is-entering");
        }

        nums.forEach(function (n, i) { n.classList.toggle("is-active", i === active); });

        // Update link to current item (stored on slide as data attributes)
        var slideEl = slides[active];
        if (link && slideEl) {
          var href = slideEl.getAttribute("data-report-href") || "#";
          var txt = slideEl.getAttribute("data-report-text") || "View Report";
          link.setAttribute("href", href);
          if (linkText) linkText.textContent = txt;
        }

        syncContentHeight();

        window.setTimeout(function () {
          if (nextEl) nextEl.classList.remove("is-entering");
          isAnimating = false;
          syncContentHeight();
        }, ANIM_MS);
      }, ANIM_MS);
    }

    function bind(btn, dir) {
      if (!btn) return;
      var lastFire = 0;
      var handler = function (e) {
        var now = Date.now();
        if (now - lastFire < 350) return;
        lastFire = now;
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setActive(active + dir);
      };
      btn.addEventListener("pointerup", handler, true);
      btn.addEventListener("touchend", handler, { passive: false, capture: true });
      btn.addEventListener("click", handler, true);
    }

    bind(btnPrev, -1);
    bind(btnNext, 1);

    nums.forEach(function (btn) {
      var idx = parseInt(btn.getAttribute("data-recog-go"), 10);
      btn.addEventListener("click", function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setActive(idx);
      });
    });

    syncContentHeight();
    window.addEventListener("resize", scheduleHeightSync);
    window.addEventListener("orientationchange", scheduleHeightSync);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncContentHeight);
    }
  }

  sections.forEach(init);
})();

