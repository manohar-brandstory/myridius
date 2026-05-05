(function () {
  var SELECTOR = '[data-reveal]';
  var VISIBLE_CLASS = 'is-visible';

  function initReveals() {
    // Scope to this module instance (HubSpot safe pattern)
    var root =
      (document.currentScript &&
        document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
      document;

    var items = root.querySelectorAll ? root.querySelectorAll(SELECTOR) : [];
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add(VISIBLE_CLASS); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add(VISIBLE_CLASS);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveals);
  } else {
    initReveals();
  }
})();
