(function () {
  var sections = document.querySelectorAll('[data-home-ind]');
  if (!sections.length) return;

  sections.forEach(function (section) {
    var rows = section.querySelectorAll('[data-ind-row]');
    var panelImages = section.querySelectorAll('[data-panel-index]');
    var panelInfos = section.querySelectorAll('[data-info-index]');
    var dots = section.querySelectorAll('[data-dot-index]');
    var activeIndex = 0;
    var hoverTimer = null;
    var isMobile = window.innerWidth <= 1024;

    function setActive(index) {
      if (index === activeIndex && rows[index].classList.contains('is-active')) return;
      activeIndex = index;

      rows.forEach(function (row) {
        row.classList.remove('is-active');
      });
      rows[index].classList.add('is-active');

      panelImages.forEach(function (img) {
        img.classList.remove('is-active');
      });
      if (panelImages[index]) {
        panelImages[index].classList.add('is-active');
      }

      panelInfos.forEach(function (info) {
        info.classList.remove('is-active');
      });
      if (panelInfos[index]) {
        panelInfos[index].classList.add('is-active');
      }

      dots.forEach(function (dot) {
        dot.classList.remove('is-active');
      });
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    }

    rows.forEach(function (row) {
      var index = parseInt(row.getAttribute('data-index'), 10);
      var header = row.querySelector('[data-ind-header]');

      if (!isMobile) {
        row.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(function () {
            setActive(index);
          }, 250);
        });
        row.addEventListener('mouseleave', function () {
          clearTimeout(hoverTimer);
        });
      }

      header.addEventListener('click', function () {
        clearTimeout(hoverTimer);
        setActive(index);
        if (isMobile) {
          row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-dot-index'), 10);
        setActive(index);
      });
    });

    window.addEventListener('resize', function () {
      isMobile = window.innerWidth <= 1024;
    });
  });
})();
