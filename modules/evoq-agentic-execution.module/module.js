(function () {
  var SEL = ".evoq-ae";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function finePointerHover() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function isMobilePillRail() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  /** Center active pill in the horizontal rail without scrolling the page. */
  function scrollActivePillIntoRail(rail, activePill) {
    if (!rail || !activePill || !isMobilePillRail()) return;
    window.requestAnimationFrame(function () {
      var railRect = rail.getBoundingClientRect();
      var pillRect = activePill.getBoundingClientRect();
      var pillCenter =
        pillRect.left - railRect.left + rail.scrollLeft + pillRect.width / 2;
      var target = pillCenter - railRect.width / 2;
      var maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      target = Math.max(0, Math.min(target, maxScroll));
      try {
        rail.scrollTo({
          left: target,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      } catch (e) {
        rail.scrollLeft = target;
      }
    });
  }

  function updateGlide(rail, glide, activePill) {
    if (!rail || !glide || !activePill) return;
    var pills = rail.querySelector("[data-ae-pills]");
    if (!pills) return;
    glide.style.width = activePill.offsetWidth + "px";
    glide.style.height = activePill.offsetHeight + "px";
    glide.style.transform =
      "translate3d(" + activePill.offsetLeft + "px," + activePill.offsetTop + "px,0)";
  }

  function animatePanel(panel) {
    if (!panel || prefersReducedMotion()) return;
    var copy = panel.querySelector("[data-ae-panel-copy]");
    var layers = panel.querySelector("[data-ae-layers]");

    function run(el) {
      if (!el) return;
      el.classList.remove("is-ae-anim");
      void el.offsetWidth;
      el.classList.add("is-ae-anim");
      el.addEventListener(
        "animationend",
        function onEnd() {
          el.classList.remove("is-ae-anim");
          el.removeEventListener("animationend", onEnd);
        },
        { once: true }
      );
    }

    run(copy);
    run(layers);
  }

  function setTab(section, slug, opts) {
    var scroll = opts && opts.scroll;
    var scrollRail = opts && opts.scrollRail;
    var skipAnimate = opts && opts.skipAnimate;
    var prevSlug = section.getAttribute("data-ae-active-slug") || "";
    var pills = section.querySelectorAll("[data-ae-pill]");
    var hotspots = section.querySelectorAll("[data-ae-hotspot]");
    var panels = section.querySelectorAll("[data-panel]");
    var rail = section.querySelector("[data-ae-pill-rail]");
    var glide = section.querySelector("[data-ae-pill-glide]");
    var detail = section.querySelector("[data-ae-detail]");
    var activePill = null;

    for (var i = 0; i < pills.length; i += 1) {
      var p = pills[i];
      var on = p.getAttribute("data-tab") === slug;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-selected", on ? "true" : "false");
      if (on) activePill = p;
    }

    for (var h = 0; h < hotspots.length; h += 1) {
      var hs = hotspots[h];
      var hon = hs.getAttribute("data-tab") === slug;
      hs.classList.toggle("is-active", hon);
      hs.setAttribute("aria-selected", hon ? "true" : "false");
    }

    var activePanel = null;

    for (var j = 0; j < panels.length; j += 1) {
      var panel = panels[j];
      var pon = panel.getAttribute("data-panel") === slug;
      panel.classList.toggle("is-active", pon);
      if (pon) {
        panel.removeAttribute("hidden");
        activePanel = panel;
      } else {
        panel.setAttribute("hidden", "hidden");
      }
    }

    if (!skipAnimate && prevSlug && prevSlug !== slug && activePanel) {
      animatePanel(activePanel);
    }
    section.setAttribute("data-ae-active-slug", slug);

    if (rail && activePill) {
      if (glide) {
        rail.classList.add("is-ready");
        updateGlide(rail, glide, activePill);
      }
      if (scrollRail) scrollActivePillIntoRail(rail, activePill);
    }

    if (scroll && detail && !prefersReducedMotion()) {
      window.setTimeout(function () {
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else if (scroll && detail) {
      detail.scrollIntoView({ block: "start" });
    }
  }

  function initLayers(panel) {
    var stack = panel.querySelector("[data-ae-layers]");
    if (!stack) return;
    var layers = stack.querySelectorAll("[data-ae-layer]");
    if (!layers.length) return;

    function expandIndex(idx) {
      for (var i = 0; i < layers.length; i += 1) {
        var on = i === idx;
        layers[i].classList.toggle("is-expanded", on);
        layers[i].setAttribute("aria-expanded", on ? "true" : "false");
      }
    }

    var useHover = finePointerHover();

    if (useHover) {
      for (var h = 0; h < layers.length; h += 1) {
        (function (index) {
          layers[index].addEventListener("mouseenter", function () {
            expandIndex(index);
          });
        })(h);
      }
      stack.addEventListener("mouseleave", function () {
        expandIndex(0);
      });
    }

    for (var c = 0; c < layers.length; c += 1) {
      (function (index) {
        layers[index].addEventListener("click", function () {
          if (!useHover) expandIndex(index);
        });
        layers[index].addEventListener("focusin", function () {
          expandIndex(index);
        });
      })(c);
    }
  }

  function bindSection(section) {
    if (!section || section.getAttribute("data-evoq-ae-bound")) return;
    section.setAttribute("data-evoq-ae-bound", "1");

    var pills = section.querySelectorAll("[data-ae-pill]");
    var hotspots = section.querySelectorAll("[data-ae-hotspot]");
    var panels = section.querySelectorAll(".evoq-ae__panel");
    var rail = section.querySelector("[data-ae-pill-rail]");
    var glide = section.querySelector("[data-ae-pill-glide]");
    var firstSlug =
      (pills[0] && pills[0].getAttribute("data-tab")) ||
      (hotspots[0] && hotspots[0].getAttribute("data-tab")) ||
      "";

    for (var p = 0; p < pills.length; p += 1) {
      (function (pill) {
        pill.addEventListener("click", function () {
          var slug = pill.getAttribute("data-tab");
          if (slug) setTab(section, slug, { scroll: false, scrollRail: true });
        });
      })(pills[p]);
    }

    for (var q = 0; q < hotspots.length; q += 1) {
      (function (hot) {
        hot.addEventListener("click", function () {
          var slug = hot.getAttribute("data-tab");
          if (slug) setTab(section, slug, { scroll: true, scrollRail: true });
        });
      })(hotspots[q]);
    }

    for (var r = 0; r < panels.length; r += 1) {
      initLayers(panels[r]);
    }

    function onResize() {
      var active = section.querySelector("[data-ae-pill].is-active");
      if (rail && glide && active) updateGlide(rail, glide, active);
    }

    window.addEventListener("resize", onResize);
    if (window.ResizeObserver && rail) {
      var ro = new ResizeObserver(onResize);
      ro.observe(rail);
    }

    function bindMobileSwipe() {
      var slugs = [];
      for (var s = 0; s < pills.length; s += 1) {
        var slug = pills[s].getAttribute("data-tab");
        if (slug) slugs.push(slug);
      }
      if (slugs.length < 2) return;

      var touchX = 0;
      var touchY = 0;

      function onTouchStart(e) {
        if (!isMobilePillRail()) return;
        touchX = e.changedTouches[0].screenX;
        touchY = e.changedTouches[0].screenY;
      }

      function onTouchEnd(e) {
        if (!isMobilePillRail()) return;
        var dx = touchX - e.changedTouches[0].screenX;
        var dy = touchY - e.changedTouches[0].screenY;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.1) return;

        var activeSlug = section.getAttribute("data-ae-active-slug") || slugs[0];
        var idx = slugs.indexOf(activeSlug);
        if (idx < 0) idx = 0;

        if (dx > 0) {
          setTab(section, slugs[(idx + 1) % slugs.length], { scroll: false, scrollRail: true });
        } else {
          setTab(section, slugs[(idx - 1 + slugs.length) % slugs.length], {
            scroll: false,
            scrollRail: true,
          });
        }
      }

      section.addEventListener("touchstart", onTouchStart, { passive: true });
      section.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    bindMobileSwipe();

    if (firstSlug) setTab(section, firstSlug, { scroll: false, skipAnimate: true });
    else onResize();
    window.requestAnimationFrame(onResize);
  }

  function init() {
    var nodes = document.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i += 1) {
      bindSection(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
