(function () {
  var VISIBLE_CLASS = 'evoq-shift__row--visible';
  var STAGGER_MS = 200;

  function revealRowsSequential(section) {
    var rows = section.querySelectorAll('[data-shift-row]');
    if (!rows.length) return;

    var timers = [];

    function revealAllNow() {
      rows.forEach(function (row) {
        row.classList.add(VISIBLE_CLASS);
      });
    }

    function revealInOrder() {
      rows.forEach(function (row, index) {
        timers.push(
          window.setTimeout(function () {
            row.classList.add(VISIBLE_CLASS);
          }, index * STAGGER_MS)
        );
      });
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealAllNow();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      revealInOrder();
      return;
    }

    var started = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || started) return;
          started = true;
          revealInOrder();
          observer.unobserve(section);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -15% 0px' }
    );

    observer.observe(section);
  }

  function init() {
    var sections = document.querySelectorAll('.evoq-shift');
    if (!sections.length) return;
    sections.forEach(revealRowsSequential);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
