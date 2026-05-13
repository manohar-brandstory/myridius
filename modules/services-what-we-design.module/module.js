(function () {
  var ACTIVE = "is-active";

  function init() {
    var root =
      (document.currentScript &&
        document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
      document;

    var sec = root.querySelector(".swwd[data-swwd]");
    if (!sec) return;

    var tabItems = sec.querySelectorAll(".swwd__tabItem");
    var mockPairs = sec.querySelectorAll(".swwd__mockPair");
    var buttons = sec.querySelectorAll("[data-swwd-tab-btn]");
    var phaseTimers = [];

    if (!tabItems.length) return;

    function clearPhaseTimers() {
      phaseTimers.forEach(function (id) {
        clearTimeout(id);
      });
      phaseTimers = [];
    }

    /** Mirrors React WhatWeDesign: animPhase 0 → @600ms 1 → @1800ms 2 → @3200ms 0 */
    function restartMockPhase(pair) {
      clearPhaseTimers();
      if (!pair) return;
      pair.setAttribute("data-swwd-phase", "0");
      phaseTimers.push(
        setTimeout(function () {
          pair.setAttribute("data-swwd-phase", "1");
        }, 600)
      );
      phaseTimers.push(
        setTimeout(function () {
          pair.setAttribute("data-swwd-phase", "2");
        }, 1800)
      );
      phaseTimers.push(
        setTimeout(function () {
          pair.setAttribute("data-swwd-phase", "0");
        }, 3200)
      );
    }

    function setTab(key) {
      if (!key) return;
      sec.setAttribute("data-swwd-active", key);

      tabItems.forEach(function (item) {
        var match = (item.getAttribute("data-swwd-tab") || "") === key;
        item.classList.toggle(ACTIVE, match);
        var btn = item.querySelector("[data-swwd-tab-btn]");
        if (btn) btn.setAttribute("aria-expanded", match ? "true" : "false");
      });

      mockPairs.forEach(function (pair) {
        var match = (pair.getAttribute("data-swwd-mock") || "") === key;
        pair.classList.toggle(ACTIVE, match);
        pair.setAttribute("aria-hidden", match ? "false" : "true");
        if (match) {
          pair.style.animation = "none";
          void pair.offsetWidth;
          pair.style.animation = "";
          restartMockPhase(pair);
        }
      });

      if (!mockPairs.length) clearPhaseTimers();
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTab(btn.getAttribute("data-swwd-tab-btn") || "");
      });
    });

    var initial = sec.getAttribute("data-swwd-active");
    if (initial) {
      setTab(initial);
    } else if (tabItems[0]) {
      setTab(tabItems[0].getAttribute("data-swwd-tab") || "");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
