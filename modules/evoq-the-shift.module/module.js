(function () {
  function revealRows(section) {
    var rows = section.querySelectorAll('[data-shift-row]');
    if (!rows.length) return;

    if (!('IntersectionObserver' in window)) {
      rows.forEach(function (row) {
        row.classList.add('evoq-shift__row--visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var row = entry.target;
          var index = Array.prototype.indexOf.call(rows, row);
          window.setTimeout(function () {
            row.classList.add('evoq-shift__row--visible');
          }, Math.max(0, index) * 120);
          observer.unobserve(row);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    rows.forEach(function (row) {
      observer.observe(row);
    });
  }

  function init() {
    var sections = document.querySelectorAll('.evoq-shift');
    if (!sections.length) return;
    sections.forEach(revealRows);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
