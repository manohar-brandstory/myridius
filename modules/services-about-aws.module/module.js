(function () {
  'use strict';

  var root =
    (document.currentScript &&
      document.currentScript.closest('.hs_cos_wrapper_type_module')) ||
    document;

  var ctaLinks = root.querySelectorAll
    ? root.querySelectorAll('.svc-about__cta')
    : [];
  if (!ctaLinks.length) return;

  ctaLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      this.style.transform = 'translateX(4px)';
    });

    link.addEventListener('mouseleave', function () {
      this.style.transform = 'translateX(0)';
    });
  });
})();
