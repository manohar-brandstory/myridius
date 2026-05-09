(function () {
  var root = document.querySelector('.evoq-nav');
  if (!root) return;

  var SMALL_THRESHOLD = 5;
  var mobilePanel = root.querySelector('[data-evoq-mobile]');
  var mobileToggleBtn = root.querySelector('[data-evoq-mobile-toggle]');
  var searchBox = root.querySelector('[data-evoq-search]');
  var searchToggleBtn = root.querySelector('[data-evoq-search-toggle]');
  var searchCloseBtn = root.querySelector('[data-evoq-search-close]');
  var searchInput = root.querySelector('.evoq-nav__search-input');
  var backdrop = root.querySelector('[data-evoq-backdrop]');
  var desktopTriggers = root.querySelectorAll('[data-evoq-trigger]');
  var megaPanels = root.querySelectorAll('[data-evoq-panel]');
  var accordionToggles = root.querySelectorAll('[data-evoq-accordion]');
  var mobileLinks = root.querySelectorAll('.evoq-nav__mobile-link, .evoq-nav__mobile-sub-link');

  var activePanelIndex = null;
  var mobileOpen = false;
  var searchOpen = false;

  /* ── Helpers ── */

  function closeAllMega() {
    desktopTriggers.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    megaPanels.forEach(function (p) {
      p.hidden = true;
    });
    backdrop.hidden = true;
    activePanelIndex = null;
  }

  function openMega(index) {
    closeAllMega();
    closeSearch();
    var btn = root.querySelector('[data-evoq-trigger="' + index + '"]');
    var panel = root.querySelector('[data-evoq-panel="' + index + '"]');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    backdrop.hidden = false;
    activePanelIndex = index;

    var itemCount = panel.querySelectorAll('.evoq-nav__mega-item').length;
    if (itemCount <= SMALL_THRESHOLD) {
      panel.classList.add('evoq-nav__mega--small');
    } else {
      panel.classList.remove('evoq-nav__mega--small');
    }
  }

  function closeMobile() {
    if (!mobilePanel) return;
    mobilePanel.hidden = true;
    mobileOpen = false;
    mobileToggleBtn.setAttribute('aria-label', 'Open menu');
    backdrop.hidden = true;
  }

  function openMobile() {
    if (!mobilePanel) return;
    closeAllMega();
    closeSearch();
    mobilePanel.hidden = false;
    mobileOpen = true;
    mobileToggleBtn.setAttribute('aria-label', 'Close menu');
    backdrop.hidden = false;
  }

  function closeSearch() {
    if (!searchBox) return;
    searchBox.hidden = true;
    searchOpen = false;
  }

  function openSearch() {
    closeAllMega();
    closeMobile();
    searchBox.hidden = false;
    searchOpen = true;
    if (searchInput) searchInput.focus();
  }

  /* ── Desktop mega menu triggers ── */

  desktopTriggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var idx = btn.getAttribute('data-evoq-trigger');
      if (activePanelIndex === idx) {
        closeAllMega();
      } else {
        openMega(idx);
      }
    });
  });

  /* ── Search toggle ── */

  if (searchToggleBtn) {
    searchToggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (searchOpen) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  }

  if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', function () {
      closeSearch();
    });
  }

  /* ── Mobile menu toggle ── */

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (mobileOpen) {
        closeMobile();
      } else {
        openMobile();
      }
    });
  }

  /* ── Mobile accordion ── */

  accordionToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = btn.getAttribute('data-evoq-accordion');
      var panel = root.querySelector('[data-evoq-accordion-panel="' + idx + '"]');
      if (!panel) return;

      var isOpen = !panel.hidden;
      panel.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobile();
      closeSearch();
    });
  });

  /* ── Backdrop click ── */

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      closeAllMega();
      closeMobile();
    });
  }

  /* ── Click outside to close ── */

  document.addEventListener('click', function (e) {
    if (!root.contains(e.target)) {
      closeAllMega();
      closeSearch();
      closeMobile();
    }
  });

  /* ── Escape key ── */

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllMega();
      closeSearch();
      closeMobile();
    }
  });
})();
