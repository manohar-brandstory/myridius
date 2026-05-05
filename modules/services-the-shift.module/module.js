(function () {
  "use strict";

  var CHILD_VISIBLE = "svc-theshift--item-visible";

  function init() {
    if (!("IntersectionObserver" in window)) return;

    var root =
      (document.currentScript &&
        document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
      document;

    var sections = root.querySelectorAll ? root.querySelectorAll(".svc-theshift") : [];
    if (!sections.length) return;

    sections.forEach(function (section) {
      if (section.getAttribute("data-shift-inited")) return;
      section.setAttribute("data-shift-inited", "true");

      var orbits = section.querySelectorAll(".svc-theshift__orbit");
      var core = section.querySelector(".svc-theshift__core");
      var nodes = section.querySelectorAll(".svc-theshift__node");
      var cards = section.querySelectorAll(".svc-theshift__card");
      var nodesMobile = section.querySelectorAll(".svc-theshift__node-mobile");
      var bottomItems = section.querySelectorAll(".svc-theshift__bottom-item");

      var sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            sectionObserver.unobserve(entry.target);
            revealSection();
          });
        },
        { threshold: 0.1 }
      );

      sectionObserver.observe(section);

      function revealSection() {
        var delay = 0;

        orbits.forEach(function (orbit, i) {
          setTimeout(function () {
            orbit.classList.add(CHILD_VISIBLE);
          }, delay + i * 200);
        });

        delay += orbits.length * 200;

        if (core) {
          setTimeout(function () {
            core.classList.add(CHILD_VISIBLE);
          }, 500);
        }

        nodes.forEach(function (node, i) {
          setTimeout(function () {
            node.classList.add(CHILD_VISIBLE);
          }, 800 + i * 100);
        });

        cards.forEach(function (card, i) {
          setTimeout(function () {
            card.classList.add(CHILD_VISIBLE);
          }, 700);
        });

        nodesMobile.forEach(function (node, i) {
          setTimeout(function () {
            node.classList.add(CHILD_VISIBLE);
          }, 100 + i * 80);
        });

        bottomItems.forEach(function (item, i) {
          setTimeout(function () {
            item.classList.add(CHILD_VISIBLE);
          }, 200 + i * 100);
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
