(function () {
  function initAccordions() {
    var accordions = document.querySelectorAll("[data-applied-ins-accordion]");
    var container = accordions.length
      ? accordions[0].closest(".applied-ins-detail-content__sections")
      : null;

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
      for (var i = 0; i < accordions.length; i++) {
        closeAccordion(accordions[i]);
      }
    }

    document.addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-applied-ins-toggle]");
      if (!toggle) return;

      var accordion = toggle.closest("[data-applied-ins-accordion]");
      if (!accordion) return;

      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeAccordion(accordion);
      } else {
        openAccordion(accordion);
      }
    });

    for (var i = 0; i < accordions.length; i++) {
      (function (acc) {
        acc.addEventListener("mouseenter", function () {
          var toggle = acc.querySelector("[data-applied-ins-toggle]");
          if (!toggle) return;
          var expanded = toggle.getAttribute("aria-expanded") === "true";
          if (!expanded) {
            openAccordion(acc);
          }
        });
      })(accordions[i]);
    }

    document.addEventListener("mousedown", function (e) {
      if (container && !container.contains(e.target)) {
        closeAll();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordions);
  } else {
    initAccordions();
  }
})();
