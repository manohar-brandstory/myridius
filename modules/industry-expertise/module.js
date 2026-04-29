(function () {
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  if (!root) return;
  var section = root.querySelector(".industry");
  if (!section) return;

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
})();

