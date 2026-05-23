(function () {
  // HubSpot sometimes executes module JS without a reliable `document.currentScript`.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;
  var sections = scope.querySelectorAll(".industry");
  if (!sections.length) return;

  function init(section) {
    if (!section || section.getAttribute("data-industry-inited") === "true") return;
    section.setAttribute("data-industry-inited", "true");

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

