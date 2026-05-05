(function () {
  var moduleScript = document.currentScript;

  var COLS_DESKTOP = 3;
  var COLS_TABLET = 2;
  var COLS_MOBILE = 1;
  var BREAKPOINT_TABLET = 1024;
  var BREAKPOINT_MOBILE = 640;

  function getColCount() {
    var width = window.innerWidth;
    if (width <= BREAKPOINT_MOBILE) return COLS_MOBILE;
    if (width <= BREAKPOINT_TABLET) return COLS_TABLET;
    return COLS_DESKTOP;
  }

  function init() {
    var root =
      (moduleScript &&
        moduleScript.closest('.hs_cos_wrapper_type_module')) ||
      document;

    var sections = root.querySelectorAll
      ? root.querySelectorAll('.svc-why')
      : [];

    sections.forEach(function (section) {
      var cards = section.querySelectorAll('.svc-why__card');

      cards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
          var cols = getColCount();
          if (cols === COLS_MOBILE) return;

          var index = parseInt(card.getAttribute('data-index'), 10);
          var row = Math.floor(index / cols);

          cards.forEach(function (c) {
            var cIndex = parseInt(c.getAttribute('data-index'), 10);
            var cRow = Math.floor(cIndex / cols);

            if (cRow === row) {
              c.classList.add('svc-why__card--row-active');
            }
          });

          card.classList.add('svc-why__card--active');
        });

        card.addEventListener('mouseleave', function () {
          cards.forEach(function (c) {
            c.classList.remove('svc-why__card--row-active');
            c.classList.remove('svc-why__card--active');
          });
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
