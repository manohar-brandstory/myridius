(function () {
  // Defensive init: HubSpot can run without reliable `document.currentScript`.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;
  var sections = scope.querySelectorAll(".evoq");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-evoq-inited") === "true") return;
    section.setAttribute("data-evoq-inited", "true");

    var track = section.querySelector("[data-evoq-track]");
    var cards = section.querySelectorAll("[data-evoq-card]");
    var btnPrev = section.querySelector("[data-evoq-prev]");
    var btnNext = section.querySelector("[data-evoq-next]");
    var curEl = section.querySelector("[data-evoq-cur]");
    var totalEl = section.querySelector("[data-evoq-total]");

    var active = 0;
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

      if (!track || !isMobileSlider()) return;
      var doScroll = function () {
        var el = cards[active];
        if (!el) return;
        if (typeof el.scrollIntoView === "function") {
          try {
            el.scrollIntoView({
              behavior: (opts && opts.instant) ? "auto" : "smooth",
              block: "nearest",
              inline: "start"
            });
            return;
          } catch (e) {}
        }
        track.scrollLeft = el.offsetLeft - track.offsetLeft;
      };
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(doScroll);
      else setTimeout(doScroll, 0);
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
      btn.addEventListener("pointerup", handler, true);
      btn.addEventListener("touchend", handler, { passive: false, capture: true });
      btn.addEventListener("click", handler, true);
    }

    if (cards.length) {
      setActive(0, { instant: true });
      bindNav(btnPrev, -1);
      bindNav(btnNext, 1);

      cards.forEach(function (card, idx) {
        function onActivate() {
          if (isMobileSlider()) {
            if (idx === active) {
              card.classList.toggle("is-open");
            } else {
              setActive(idx);
              // Open details on first tap after selecting
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
        setActive(active, { instant: true });
      });
    }

  // Scroll reveal
    var srEls = section.querySelectorAll("[data-sr]");
    if (!srEls.length || !("IntersectionObserver" in window)) return;
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

  sections.forEach(init);
})();

