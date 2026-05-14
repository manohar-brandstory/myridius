(function () {
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var navs = scope.querySelectorAll(".home-navbar");
  if (!navs.length) return;

  function init(nav) {
    if (!nav || nav.getAttribute("data-home-navbar-inited") === "true") return;
    nav.setAttribute("data-home-navbar-inited", "true");

    var mega = nav.querySelector("[data-home-mega]");
    var backdrop = nav.querySelector("[data-home-backdrop]");
    var triggers = Array.prototype.slice.call(nav.querySelectorAll("[data-home-nav-trigger]"));
    var panels = Array.prototype.slice.call(nav.querySelectorAll("[data-home-nav-panel]"));

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
        t.setAttribute("aria-expanded", t.getAttribute("data-home-nav-trigger") === String(idx) ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-home-nav-panel") !== String(idx);
      });
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function () {
        var idx = t.getAttribute("data-home-nav-trigger");
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

    nav.addEventListener("click", function (e) {
      var link = e.target && e.target.closest && e.target.closest(".home-navbar__megaLink, .home-navbar__colLink, .home-navbar__subLink, .home-navbar__panelHeader");
      if (link) closeMega();
    });

    nav.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest("[data-home-expander]");
      if (!btn) return;
      var sub = btn.parentElement && btn.parentElement.querySelector(".home-navbar__subList");
      if (!sub) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      sub.hidden = expanded;
    });

    var searchToggle = nav.querySelector("[data-home-search-toggle]");
    var searchBox = nav.querySelector(".home-navbar__searchBox");
    var searchInput = nav.querySelector(".home-navbar__searchInput");
    var searchForm = searchBox && searchBox.querySelector(".home-navbar__searchForm");
    if (searchToggle && searchBox) {
      searchToggle.addEventListener("click", function () {
        var willShow = searchBox.hidden;
        searchBox.hidden = !willShow;
        searchToggle.hidden = willShow;
        if (willShow && searchInput) searchInput.focus();
      });
      if (searchInput) {
        searchInput.addEventListener("blur", function () {
          window.setTimeout(function () {
            if (searchForm && searchForm.contains(document.activeElement)) return;
            searchBox.hidden = true;
            searchToggle.hidden = false;
          }, 200);
        });
      }
    }

    var mobileSearchBtn = nav.querySelector("[data-home-mobile-search]");
    var mobileSearchBox = nav.querySelector("[data-home-mobile-search-box]");
    if (mobileSearchBtn && mobileSearchBox) {
      mobileSearchBtn.addEventListener("click", function () {
        mobileSearchBox.hidden = !mobileSearchBox.hidden;
        var input = mobileSearchBox.querySelector("input");
        if (!mobileSearchBox.hidden && input) input.focus();
      });
    }

    var mobileToggle = nav.querySelector("[data-home-mobile-toggle]");
    var mobile = nav.querySelector("[data-home-mobile]");
    var mobileCloseEls = Array.prototype.slice.call(nav.querySelectorAll("[data-home-mobile-close]"));
    function closeMobile() {
      if (!mobile) return;
      nav.classList.remove("is-home-mobile-open");
      mobile.hidden = true;
      closeMega();
    }
    function openMobile() {
      if (!mobile) return;
      nav.classList.add("is-home-mobile-open");
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

    nav.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest("[data-home-mobile-panel-toggle]");
      if (!btn) return;
      var idx = btn.getAttribute("data-home-mobile-panel-toggle");
      var panel = nav.querySelector('[data-home-mobile-panel="' + idx + '"]');
      if (!panel) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  }

  navs.forEach(init);
})();
