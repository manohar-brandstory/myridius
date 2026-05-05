(function () {
  var ACTIVE = "is-active";

  function init() {
    var root =
      (document.currentScript &&
        document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
      document;

    if (!root.querySelectorAll) return;

    var items = root.querySelectorAll("[data-svc-cap-item]");
    if (!items.length) return;

    var section = root.querySelector(".svc-cap");

    function setActive(item) {
      items.forEach(function (el) {
        el.classList.remove(ACTIVE);
      });
      if (item) item.classList.add(ACTIVE);
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        setActive(item);
      });

      var collapsed = item.querySelector(".svc-cap__collapsed");
      if (collapsed) {
        collapsed.addEventListener("click", function () {
          var wasActive = item.classList.contains(ACTIVE);
          items.forEach(function (el) {
            el.classList.remove(ACTIVE);
          });
          if (!wasActive) item.classList.add(ACTIVE);
        });
      }
    });

    if (section) {
      document.addEventListener("click", function (e) {
        if (!section.contains(e.target)) {
          items.forEach(function (el) {
            el.classList.remove(ACTIVE);
          });
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
