(function () {
  'use strict';

  function initSolutionCatalog(section) {
    var tabs = section.querySelectorAll('.evoq-catalog__tab');
    var panels = section.querySelectorAll('.evoq-catalog__panel');
    var indicator = section.querySelector('.evoq-catalog__tab-indicator');

    if (!tabs.length || !panels.length || !indicator) return;

    function positionIndicator(tab) {
      indicator.style.left = tab.offsetLeft + 'px';
      indicator.style.width = tab.offsetWidth + 'px';
    }

    function switchTab(index) {
      tabs.forEach(function (t, i) {
        var isActive = i === index;
        t.classList.toggle('evoq-catalog__tab--active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach(function (p, i) {
        p.classList.toggle('evoq-catalog__panel--active', i === index);
      });

      positionIndicator(tabs[index]);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        switchTab(i);
      });

      tab.addEventListener('keydown', function (e) {
        var nextIndex;
        if (e.key === 'ArrowRight') {
          nextIndex = (i + 1) % tabs.length;
          tabs[nextIndex].focus();
          switchTab(nextIndex);
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (i - 1 + tabs.length) % tabs.length;
          tabs[nextIndex].focus();
          switchTab(nextIndex);
        }
      });
    });

    positionIndicator(tabs[0]);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var activeTab = section.querySelector('.evoq-catalog__tab--active');
        if (activeTab) positionIndicator(activeTab);
      }, 100);
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var sections = document.querySelectorAll('.evoq-catalog');
    sections.forEach(function (section) {
      initSolutionCatalog(section);
    });
  });
})();
