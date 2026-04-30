(function () {
  // HubSpot sometimes executes module JS without a reliable `document.currentScript`.
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var navs = scope.querySelectorAll(".navbar");
  if (!navs.length) return;

  function init(nav) {
    if (!nav || nav.getAttribute("data-navbar-inited") === "true") return;
    nav.setAttribute("data-navbar-inited", "true");

    var mega = nav.querySelector("[data-mega]");
    var backdrop = nav.querySelector("[data-backdrop]");
    var triggers = Array.prototype.slice.call(nav.querySelectorAll("[data-nav-trigger]"));
    var panels = Array.prototype.slice.call(nav.querySelectorAll("[data-nav-panel]"));

    function closeMega() {
      triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
      panels.forEach(function (p) { p.hidden = true; });
      if (mega) mega.hidden = true;
      if (backdrop) backdrop.hidden = true;
    }

    function openMega(idx) {
      if (!mega) return;
      mega.hidden = false;
      if (backdrop) backdrop.hidden = false;
      triggers.forEach(function (t) {
        t.setAttribute("aria-expanded", t.getAttribute("data-nav-trigger") === String(idx) ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-nav-panel") !== String(idx);
      });
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function () {
        var idx = t.getAttribute("data-nav-trigger");
        var isOpen = t.getAttribute("aria-expanded") === "true";
        if (isOpen) closeMega();
        else openMega(idx);
      });
    });

    if (backdrop) backdrop.addEventListener("click", closeMega);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMega();
    });
    document.addEventListener("click", function (e) {
      if (!mega || mega.hidden) return;
      if (nav.contains(e.target)) return;
      closeMega();
    });

    // Expanders in mega menu
    nav.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest(".navbar__expander");
      if (!btn) return;
      var sub = btn.parentElement && btn.parentElement.querySelector(".navbar__subList");
      if (!sub) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      sub.hidden = expanded;
    });

    // Search toggle
    var searchToggle = nav.querySelector("[data-search-toggle]");
    var searchBox = nav.querySelector(".navbar__searchBox");
    var searchInput = nav.querySelector(".navbar__searchInput");
    if (searchToggle && searchBox) {
      searchToggle.addEventListener("click", function () {
        var willShow = searchBox.hidden;
        searchBox.hidden = !willShow;
        if (willShow && searchInput) searchInput.focus();
      });
      if (searchInput) {
        searchInput.addEventListener("blur", function () {
          window.setTimeout(function () { searchBox.hidden = true; }, 150);
        });
      }
    }

    // Mobile tray
    var mobileToggle = nav.querySelector("[data-mobile-toggle]");
    var mobile = nav.querySelector("[data-mobile]");
    var mobileCloseEls = Array.prototype.slice.call(nav.querySelectorAll("[data-mobile-close]"));
    function closeMobile() {
      if (!mobile) return;
      nav.classList.remove("is-mobile-open");
      mobile.hidden = true;
      closeMega();
    }
    function openMobile() {
      if (!mobile) return;
      nav.classList.add("is-mobile-open");
      mobile.hidden = false;
      closeMega();
    }
    function bindMobileToggle(btn) {
      if (!btn || !mobile) return;
      var lastFire = 0;
      var handler = function (e) {
        var now = Date.now();
        if (now - lastFire < 350) return;
        lastFire = now;
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (mobile.hidden) openMobile();
        else closeMobile();
      };
      btn.addEventListener("pointerup", handler, true);
      btn.addEventListener("touchend", handler, { passive: false, capture: true });
      btn.addEventListener("click", handler, true);
    }
    bindMobileToggle(mobileToggle);
    mobileCloseEls.forEach(function (el) { el.addEventListener("click", closeMobile); });

    // Mobile accordion panels
    nav.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest("[data-mobile-panel-toggle]");
      if (!btn) return;
      var idx = btn.getAttribute("data-mobile-panel-toggle");
      var panel = nav.querySelector('[data-mobile-panel="' + idx + '"]');
      if (!panel) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  }

  navs.forEach(init);
})();

