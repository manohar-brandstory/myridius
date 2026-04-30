(function () {
  // HubSpot sometimes executes module JS without a reliable `document.currentScript`.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;
  var sections = scope.querySelectorAll(".cta");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-cta-inited") === "true") return;
    section.setAttribute("data-cta-inited", "true");

    // Smooth scroll for same-page anchors.
    section.addEventListener("click", function (e) {
      var a = e.target && e.target.closest && e.target.closest("a[data-scroll]");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) !== "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

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

