(function () {
  var sections = document.querySelectorAll("[data-res-detail-impact]");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  sections.forEach(function (section) {
    var srEls = section.querySelectorAll("[data-sr]");
    if (!srEls.length) return;

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
  });
})();
