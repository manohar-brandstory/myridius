(function () {
  var HOVER_CAPABLE = window.matchMedia("(hover: hover) and (pointer: fine)");
  var lastTouchAt = 0;

  function isTouchDerivedHover() {
    return Date.now() - lastTouchAt < 700;
  }

  function initAccordions() {
    var sectionsRoot = document.querySelector(".applied-ins-detail-content__sections");
    if (!sectionsRoot || sectionsRoot.dataset.appliedInsAccordionInit === "true") {
      return;
    }
    sectionsRoot.dataset.appliedInsAccordionInit = "true";

    var accordions = sectionsRoot.querySelectorAll("[data-applied-ins-accordion]");

    function openAccordion(accordion) {
      var toggle = accordion.querySelector("[data-applied-ins-toggle]");
      var panel = accordion.querySelector("[data-applied-ins-panel]");
      if (!toggle || !panel) return;
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }

    function closeAccordion(accordion) {
      var toggle = accordion.querySelector("[data-applied-ins-toggle]");
      var panel = accordion.querySelector("[data-applied-ins-panel]");
      if (!toggle || !panel) return;
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }

    function closeAll() {
      for (var i = 0; i < accordions.length; i += 1) {
        closeAccordion(accordions[i]);
      }
    }

    function isExpanded(accordion) {
      var toggle = accordion.querySelector("[data-applied-ins-toggle]");
      return toggle && toggle.getAttribute("aria-expanded") === "true";
    }

    document.addEventListener(
      "touchstart",
      function () {
        lastTouchAt = Date.now();
      },
      { passive: true, capture: true }
    );

    for (var i = 0; i < accordions.length; i += 1) {
      (function (accordion) {
        var toggle = accordion.querySelector("[data-applied-ins-toggle]");
        if (!toggle) return;

        toggle.addEventListener("click", function () {
          if (isExpanded(accordion)) {
            closeAccordion(accordion);
          } else {
            openAccordion(accordion);
          }
        });

        /* Desktop only — Figma onMouseEnter; skip touch (phantom mouseenter breaks first tap) */
        if (HOVER_CAPABLE.matches) {
          accordion.addEventListener("mouseenter", function () {
            if (isTouchDerivedHover()) return;
            if (!isExpanded(accordion)) {
              openAccordion(accordion);
            }
          });
        }
      })(accordions[i]);
    }

    document.addEventListener(
      "pointerdown",
      function (e) {
        if (sectionsRoot.contains(e.target)) {
          if (e.target.closest("[data-applied-ins-toggle]")) return;
          if (e.target.closest("[data-applied-ins-panel]")) return;
          return;
        }
        closeAll();
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordions);
  } else {
    initAccordions();
  }
})();
