(function () {
  // Scope to this module instance (HubSpot safe pattern)
  var root =
    (document.currentScript &&
      document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
    document;

  var sections = root.querySelectorAll
    ? root.querySelectorAll('.svc-res[data-animate]')
    : [];

  if (!sections.length) return;

  if (!("IntersectionObserver" in window)) {
    sections.forEach(function (section) {
      section.classList.add("svc-res--visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('svc-res--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
