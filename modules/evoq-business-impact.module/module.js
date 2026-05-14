(function () {
  var SEL = ".evoq-bi";
  /** Match module.css — row layout vs stacked */
  var MQ_DESKTOP = "(min-width: 1024px)";
  /** Figma mobile carousel (module.css) */
  var MQ_MOBILE_CAROUSEL = "(max-width: 767px)";

  function wheelDeltaY(e) {
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight || 800;
    return dy;
  }

  function isScrollable(el) {
    return el.scrollHeight > el.clientHeight + 2;
  }

  function parseAnchorPx(root) {
    var raw = root && root.getAttribute("data-evoq-bi-scroll-anchor");
    if (raw == null || raw === "") return null;
    var n = parseInt(String(raw).replace(/px/gi, "").trim(), 10);
    return !isNaN(n) && n >= 0 ? n : null;
  }

  function pad2(n) {
    n = Math.max(0, Math.min(99, n | 0));
    return (n < 10 ? "0" : "") + n;
  }

  function slideStep(scrollEl, items) {
    if (!items.length) return scrollEl.clientWidth;
    var track = scrollEl.querySelector("[data-evoq-bi-track]");
    var gap = 0;
    if (track) {
      var cs = window.getComputedStyle(track);
      var g = cs.gap || cs.columnGap || "0";
      var m = String(g).match(/([\d.]+)px/);
      if (m) gap = parseFloat(m[1]) || 0;
    }
    return items[0].offsetWidth + gap;
  }

  function closestSlideIndex(scrollEl, items) {
    if (!items.length) return 0;
    var scr = scrollEl.getBoundingClientRect();
    var centerX = scr.left + scr.width / 2;
    var best = 0;
    var bestD = Infinity;
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var d = Math.abs(mid - centerX);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  function setItemsInView(items, idx) {
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-inview", i === idx);
    }
  }

  function updatePager(root, index1, total) {
    var cur = root.querySelector("[data-evoq-bi-pager-cur]");
    var tot = root.querySelector("[data-evoq-bi-pager-tot]");
    if (cur) cur.textContent = pad2(index1);
    if (tot && total) tot.textContent = pad2(total);
  }

  /**
   * Desktop: route wheel into the right column only after the card has scrolled up
   * to the viewport (top near top edge — like the reference frame).
   * Mobile: only after the first accent-green item is fully visible and its bottom
   * sits in the lower viewport (then inner list scroll takes over).
   */
  function shouldRouteWheelToColumn(root, scrollEl) {
    if (!root || !scrollEl) return false;

    var card = root.querySelector("[data-evoq-bi-card]");
    var items = root.querySelectorAll("[data-evoq-bi-item]");
    var isDesktop = window.matchMedia(MQ_DESKTOP).matches;
    var vh = window.innerHeight || 0;

    if (isDesktop) {
      if (!card) return false;
      var custom = parseAnchorPx(root);
      var anchorTop =
        custom != null
          ? custom
          : Math.min(120, Math.max(48, Math.round(vh * 0.06)));
      return card.getBoundingClientRect().top <= anchorTop;
    }

    var first =
      scrollEl.querySelector(".evoq-bi__item--accent-green") ||
      (items.length ? items[0] : null);
    if (!first) return false;

    var r = first.getBoundingClientRect();
    if (r.height <= 0) return false;

    var topOk = r.top >= -12;
    var bottomOnScreen = r.bottom <= vh + 16;
    var fullyVisible = topOk && bottomOnScreen;
    var bottomInLowerBand = r.bottom >= vh * 0.66;

    return fullyVisible && bottomInLowerBand;
  }

  function bindInView(root, scrollEl, items) {
    if (!scrollEl || !items.length) return;

    var mqMob = window.matchMedia(MQ_MOBILE_CAROUSEL);
    var io = null;
    var onScrollMob = null;
    var mobBtnsBound = false;

    function clearIo() {
      if (io) {
        io.disconnect();
        io = null;
      }
    }

    function clearMobScroll() {
      if (onScrollMob && scrollEl) {
        scrollEl.removeEventListener("scroll", onScrollMob);
        onScrollMob = null;
      }
    }

    function syncMobileSlides() {
      var idx = closestSlideIndex(scrollEl, items);
      setItemsInView(items, idx);
      updatePager(root, idx + 1, items.length);
    }

    function onScrollMobRaf() {
      window.requestAnimationFrame(syncMobileSlides);
    }

    function bindMobButtons() {
      if (mobBtnsBound) return;
      var btnP = root.querySelector("[data-evoq-bi-prev]");
      var btnN = root.querySelector("[data-evoq-bi-next]");
      if (!btnP && !btnN) return;
      mobBtnsBound = true;
      if (btnP) {
        btnP.addEventListener("click", function () {
          scrollEl.scrollBy({ left: -slideStep(scrollEl, items), behavior: "smooth" });
        });
      }
      if (btnN) {
        btnN.addEventListener("click", function () {
          scrollEl.scrollBy({ left: slideStep(scrollEl, items), behavior: "smooth" });
        });
      }
    }

    function apply() {
      clearIo();
      clearMobScroll();

      if (mqMob.matches) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          for (var k = 0; k < items.length; k++) items[k].classList.add("is-inview");
          updatePager(root, 1, items.length);
          return;
        }
        onScrollMob = onScrollMobRaf;
        scrollEl.addEventListener("scroll", onScrollMob, { passive: true });
        bindMobButtons();
        syncMobileSlides();
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      io = new IntersectionObserver(
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

    mqMob.addEventListener("change", apply);
    apply();
  }

  /**
   * While the pointer is over this section, route wheel deltas into the
   * right-hand list until it reaches the end; then allow normal page scroll.
   * Skipped on mobile carousel (horizontal track).
   */
  function bindScrollLock(root, scrollEl) {
    if (!scrollEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    function onWheel(e) {
      if (e.ctrlKey) return;

      if (!window.matchMedia(MQ_DESKTOP).matches) {
        if (scrollEl.scrollWidth > scrollEl.clientWidth + 2) return;
      }

      var r = root.getBoundingClientRect();
      var inSection =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;

      if (!inSection) return;

      if (!isScrollable(scrollEl)) return;

      if (!shouldRouteWheelToColumn(root, scrollEl)) {
        return;
      }

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
