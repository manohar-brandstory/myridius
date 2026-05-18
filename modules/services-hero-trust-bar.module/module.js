(function () {
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var srEls = scope.querySelectorAll(".svc-trust [data-sr]");
  if (!srEls.length) return;

  if (!("IntersectionObserver" in window)) {
    srEls.forEach(function (el) {
      el.classList.add("is-sr-shown");
    });
    return;
  }

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
    { threshold: 0.12 }
  );

  srEls.forEach(function (el) {
    io.observe(el);
  });
})();
