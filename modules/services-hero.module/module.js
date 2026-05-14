(function () {
  var CLICK_FLAG = "__myridiusSvcHeroSmoothScroll";

  function init() {
    var root =
      (document.currentScript &&
        document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
      document;

    if (!root.querySelectorAll) return;

    if (!window[CLICK_FLAG]) {
      window[CLICK_FLAG] = true;
      document.addEventListener("click", function (e) {
        var a = e.target && e.target.closest && e.target.closest("a[data-scroll]");
        if (!a) return;
        var href = a.getAttribute("href") || "";
        if (!href || href.charAt(0) !== "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    var reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var heroes = root.querySelectorAll(".svc-hero");
    if (!heroes.length && root !== document) {
      heroes = document.querySelectorAll(".svc-hero");
    }

    heroes.forEach(function (hero) {
      if (hero.getAttribute("data-sr-init") === "1") return;
      hero.setAttribute("data-sr-init", "1");

      var srEls = hero.querySelectorAll('[data-sr="nav"], [data-sr="main"], [data-sr="media"]');
      if (!srEls.length) return;

      function revealAll() {
        srEls.forEach(function (el) {
          el.classList.add("is-visible");
        });
      }

      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealAll();
        return;
      }

      /* One trigger for the whole hero (like React mount): all layers start together; CSS delays match Figma */
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            revealAll();
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
      );

      io.observe(hero);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
