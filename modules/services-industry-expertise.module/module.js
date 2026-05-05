(function () {
  var root =
    document.currentScript &&
    document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var sections = scope.querySelectorAll(".svc-ind");
  if (!sections.length) return;

  function init(section) {
    if (section.getAttribute("data-svc-ind-inited") === "true") return;
    section.setAttribute("data-svc-ind-inited", "true");

    var cards = section.querySelectorAll(".svc-ind__card");
    if (!cards.length) return;

    var isTouchDevice =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    var isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (!isTouchDevice && !isMobile) {
      cards.forEach(function (card) {
        card.addEventListener("mouseenter", function () {
          var hoveredRow = card.getAttribute("data-svc-ind-row");

          cards.forEach(function (c) {
            var cRow = c.getAttribute("data-svc-ind-row");
            if (cRow === hoveredRow) {
              c.setAttribute("data-svc-ind-row-active", "true");
            } else {
              c.removeAttribute("data-svc-ind-row-active");
            }
            c.removeAttribute("data-svc-ind-active");
          });

          card.setAttribute("data-svc-ind-active", "true");
        });
      });

      var grid = section.querySelector(".svc-ind__grid");
      if (grid) {
        grid.addEventListener("mouseleave", function () {
          cards.forEach(function (c) {
            c.removeAttribute("data-svc-ind-row-active");
            c.removeAttribute("data-svc-ind-active");
          });
        });
      }
    }

    /* Recalculate row indices when the grid column count changes */
    function updateRowIndices() {
      var newIsMobile = window.matchMedia("(max-width: 768px)").matches;
      var isTablet = window.matchMedia("(max-width: 1024px)").matches;
      var cols = newIsMobile ? 1 : isTablet ? 2 : 3;

      cards.forEach(function (card, i) {
        card.setAttribute("data-svc-ind-row", Math.floor(i / cols));
      });
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateRowIndices, 150);
    });
    updateRowIndices();

    /* Scroll reveal */
    var srEls = section.querySelectorAll("[data-sr]");
    if (srEls.length && "IntersectionObserver" in window) {
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
        { threshold: 0.14 }
      );

      srEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  sections.forEach(init);
})();
