(function () {
  var SEL = ".evoq-bi";

  function wheelDeltaY(e) {
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight || 800;
    return dy;
  }

  function isScrollable(el) {
    return el.scrollHeight > el.clientHeight + 2;
  }

  function bindInView(root, scrollEl, items) {
    if (!scrollEl || !items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i += 1) {
          var e = entries[i];
          e.target.classList.toggle("is-inview", e.isIntersecting);
        }
      },
      {
        root: scrollEl,
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0,
      }
    );

    for (var j = 0; j < items.length; j += 1) {
      io.observe(items[j]);
    }
  }

  /**
   * While the pointer is over this section, route wheel deltas into the
   * right-hand list until it reaches the end; then allow normal page scroll.
   */
  function bindScrollLock(root, scrollEl) {
    if (!scrollEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    function onWheel(e) {
      if (e.ctrlKey) return;

      var r = root.getBoundingClientRect();
      var inSection =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;

      if (!inSection) return;

      if (!isScrollable(scrollEl)) return;

      var dy = wheelDeltaY(e);
      if (dy === 0) return;

      var st = scrollEl.scrollTop;
      var sh = scrollEl.scrollHeight;
      var ch = scrollEl.clientHeight;
      var maxScroll = Math.max(0, sh - ch);
      var atTop = st <= 1;
      var atBottom = st >= maxScroll - 1;

      if (dy > 0 && !atBottom) {
        e.preventDefault();
        scrollEl.scrollTop = Math.min(maxScroll, st + dy);
        return;
      }

      if (dy < 0 && !atTop) {
        e.preventDefault();
        scrollEl.scrollTop = Math.max(0, st + dy);
      }
    }

    root.addEventListener("wheel", onWheel, { passive: false, capture: true });
  }

  function initSection(root) {
    if (!root || root.getAttribute("data-evoq-bi-bound")) return;
    root.setAttribute("data-evoq-bi-bound", "1");

    var scrollEl = root.querySelector("[data-evoq-bi-scroll]");
    var items = root.querySelectorAll("[data-evoq-bi-item]");

    bindInView(root, scrollEl, items);
    bindScrollLock(root, scrollEl);
  }

  function init() {
    var nodes = document.querySelectorAll(SEL);
    for (var k = 0; k < nodes.length; k += 1) {
      initSection(nodes[k]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
