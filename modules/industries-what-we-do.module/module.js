(function () {
  // HubSpot sometimes executes module JS without a reliable `document.currentScript`.
  // Initialize defensively by scanning for `.wwd` and guarding against double-init.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var sections = scope.querySelectorAll(".wwd");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-wwd-inited") === "true") return;
    section.setAttribute("data-wwd-inited", "true");

    var track = section.querySelector("[data-wwd-track]");
    var cards = section.querySelectorAll("[data-wwd-card]");
    var btnPrev = section.querySelector("[data-wwd-prev]");
    var btnNext = section.querySelector("[data-wwd-next]");
    var curEl = section.querySelector("[data-wwd-cur]");
    var totalEl = section.querySelector("[data-wwd-total]");

    var active = 0;
    var isApplyingFromScroll = false;

    function setCounter() {
      if (curEl) curEl.textContent = String(active + 1);
      if (totalEl) totalEl.textContent = String(cards.length || 0);
    }

    function isMobileSlider() {
      return track && getComputedStyle(track).display === "flex";
    }

    function setActive(idx, opts) {
      if (!cards.length) return;
      active = (idx + cards.length) % cards.length;
      cards.forEach(function (c, i) {
        var isActive = i === active;
        c.classList.toggle("is-active", isActive);
        if (!isActive) c.classList.remove("is-open");
        c.setAttribute("aria-expanded", isActive ? "true" : "false");
      });
      setCounter();

      if ((opts && opts.skipScroll) || !track || !isMobileSlider()) return;

      var doScroll = function () {
        var el = cards[active];
        if (!el) return;
        var left = el.offsetLeft - track.offsetLeft;
        if (typeof track.scrollTo === "function") {
          try {
            track.scrollTo({ left: left, behavior: (opts && opts.instant) ? "auto" : "smooth" });
            return;
          } catch (e) {}
        }
        track.scrollLeft = left;
      };

      if (typeof requestAnimationFrame === "function") requestAnimationFrame(doScroll);
      else setTimeout(doScroll, 0);
    }

    function getClosestIndexFromScroll() {
      if (!track || !cards.length) return 0;
      // Pick the slide whose leading edge is closest to scrollLeft (snap start)
      var x = track.scrollLeft;
      var bestIdx = 0;
      var bestDist = Infinity;
      cards.forEach(function (el, i) {
        var d = Math.abs((el.offsetLeft - track.offsetLeft) - x);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      return bestIdx;
    }

    function bindScrollSync() {
      if (!track) return;
      var raf = 0;
      var lastIdx = -1;
      function onScroll() {
        if (!isMobileSlider()) return;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var idx = getClosestIndexFromScroll();
          if (idx === lastIdx || idx === active) return;
          lastIdx = idx;
          isApplyingFromScroll = true;
          setActive(idx, { instant: true, skipScroll: true });
          isApplyingFromScroll = false;
        });
      }
      track.addEventListener("scroll", onScroll, { passive: true });
    }

    function bindNav(btn, dir) {
      if (!btn) return;
      var lastFire = 0;
      var handler = function (e) {
        var now = Date.now();
        if (now - lastFire < 350) return; // dedupe touchend/click double-fire
        lastFire = now;
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setActive(active + dir);
      };
      // Mobile reliability: pointerup + touchend + click
      btn.addEventListener("pointerup", handler, true);
      btn.addEventListener("touchend", handler, { passive: false, capture: true });
      btn.addEventListener("click", handler, true);
    }

    if (cards.length) {
      setActive(0, { instant: true });
      bindNav(btnPrev, -1);
      bindNav(btnNext, 1);
      bindScrollSync();

      cards.forEach(function (card, idx) {
        function onActivate() {
          if (isMobileSlider()) {
            if (idx === active) {
              card.classList.toggle("is-open");
            } else {
              setActive(idx);
              if (typeof requestAnimationFrame === "function") {
                requestAnimationFrame(function(){ card.classList.add("is-open"); });
              } else {
                setTimeout(function(){ card.classList.add("is-open"); }, 0);
              }
            }
          } else {
            setActive(idx, { instant: true });
          }
        }
        card.addEventListener("click", onActivate);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        });
      });

      window.addEventListener("resize", function () {
        setActive(active, { instant: true, skipScroll: true });
      });
    }

    // Scroll reveal
    var srEls = section.querySelectorAll("[data-sr]");
    if (srEls.length && "IntersectionObserver" in window) {
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

