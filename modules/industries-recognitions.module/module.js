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
    function setActive(idx) {
      active = (idx + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === active); });
      nums.forEach(function (n, i) { n.classList.toggle("is-active", i === active); });

      // Update link to current item (stored on slide as data attributes)
      var slideEl = slides[active];
      if (link && slideEl) {
        var href = slideEl.getAttribute("data-report-href") || "#";
        var txt = slideEl.getAttribute("data-report-text") || "View Report";
        link.setAttribute("href", href);
        if (linkText) linkText.textContent = txt;
      }
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

    setActive(0);
  }

  sections.forEach(init);
})();

