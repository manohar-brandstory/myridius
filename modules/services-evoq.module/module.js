(function () {
  var root =
    document.currentScript &&
    document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var sections = scope.querySelectorAll(".svc-evoq");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-svc-evoq-inited") === "true")
      return;
    section.setAttribute("data-svc-evoq-inited", "true");

    /* ── Scroll Reveal ── */
    var srEls = section.querySelectorAll("[data-sr]");
    if (srEls.length && "IntersectionObserver" in window) {
      srEls.forEach(function (el) {
        el.classList.add("is-sr-hidden");
      });

      var srObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove("is-sr-hidden");
            entry.target.classList.add("is-sr-shown");
            srObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12 }
      );

      srEls.forEach(function (el) {
        srObserver.observe(el);
      });
    }

    /* ── Mobile Tap-to-Reveal ── */
    var isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      var itemCards = section.querySelectorAll(".svc-evoq__card--item");
      itemCards.forEach(function (card) {
        card.addEventListener("click", function () {
          var wasActive = card.classList.contains("is-touched");
          itemCards.forEach(function (c) {
            c.classList.remove("is-touched");
          });
          if (!wasActive) {
            card.classList.add("is-touched");
          }
        });
      });
    }
  }

  sections.forEach(init);
})();
