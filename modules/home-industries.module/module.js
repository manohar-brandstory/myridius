(function () {
  'use strict';

  var sections = document.querySelectorAll('[data-home-ind]');
  if (!sections.length) return;

  var mobileMedia = window.matchMedia('(max-width: 767px)');

  function isMobileLayout() {
    return mobileMedia.matches;
  }

  sections.forEach(function (section) {
    var rows = section.querySelectorAll('[data-ind-row]');
    var panel = section.querySelector('[data-ind-panel]');
    var panelImages = section.querySelectorAll('[data-panel-index]');
    var panelInfos = section.querySelectorAll('[data-info-index]');
    var dots = section.querySelectorAll('[data-dot-index]');
    var activeIndex = 0;

    function setActive(index) {
      if (index < 0 || index >= rows.length) return;
      if (index === activeIndex && rows[index].classList.contains('is-active')) return;
      activeIndex = index;

      rows.forEach(function (row, i) {
        row.classList.toggle('is-active', i === index);
        var hdr = row.querySelector('[data-ind-header]');
        if (hdr) hdr.setAttribute('aria-expanded', i === index ? 'true' : 'false');
      });

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
      if (!header) return;

      function activateFromHeader() {
        setActive(index);
        if (isMobileLayout()) {
          row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      header.addEventListener('click', activateFromHeader);

      header.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        activateFromHeader();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-dot-index'), 10);
        setActive(index);
        if (isMobileLayout() && panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  });
})();
