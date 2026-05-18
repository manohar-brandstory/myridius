(function () {
  var SEL = ".evoq-ae";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function finePointerHover() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function isMobilePillRail() {
    return window.matchMedia("only screen and (max-width: 767px)").matches;
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

  /** EvoqBusiness_1.tsx — left copy from bottom, right layer stack from right */
  var PANEL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var PANEL_COPY_MS = 450;
  var PANEL_LAYERS_MS = 400;

  var PANEL_COPY_ENTER = [
    { opacity: 0, transform: "translate3d(0, 16px, 0)", filter: "blur(6px)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0px)" },
  ];
  var PANEL_COPY_EXIT = [
    { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0px)" },
    { opacity: 0, transform: "translate3d(0, -12px, 0)", filter: "blur(6px)" },
  ];
  var PANEL_LAYERS_ENTER = [
    { opacity: 0, transform: "translate3d(20px, 0, 0)", filter: "blur(10px)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0px)" },
  ];
  var PANEL_LAYERS_EXIT = [
    { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0px)" },
    { opacity: 0, transform: "translate3d(-20px, 0, 0)", filter: "blur(10px)" },
  ];

  function cancelPanelMotion(el) {
    if (!el) return;
    if (el._aePanelAnim) {
      try {
        el._aePanelAnim.cancel();
      } catch (e) {}
      el._aePanelAnim = null;
    }
    el.classList.remove("is-ae-anim-in", "is-ae-anim-out");
  }

  function runPanelKeyframe(el, className, onEnd) {
    if (!el) {
      if (onEnd) onEnd();
      return;
    }
    cancelPanelMotion(el);
    el.classList.add(className);
    el.addEventListener(
      "animationend",
      function handler(ev) {
        if (ev.target !== el) return;
        el.classList.remove(className);
        el.removeEventListener("animationend", handler);
        if (onEnd) onEnd();
      },
      { once: true }
    );
  }

  function runPanelMotion(el, keyframes, durationMs, cssClass, onEnd) {
    if (!el) {
      if (onEnd) onEnd();
      return;
    }
    cancelPanelMotion(el);

    if (prefersReducedMotion() || !el.animate) {
      runPanelKeyframe(el, cssClass, onEnd);
      return;
    }

    var anim = el.animate(keyframes, {
      duration: durationMs,
      easing: PANEL_EASE,
      fill: "forwards",
    });
    el._aePanelAnim = anim;

    function done() {
      if (el._aePanelAnim === anim) el._aePanelAnim = null;
      if (onEnd) onEnd();
    }

    anim.addEventListener("finish", done, { once: true });
    anim.addEventListener("cancel", done, { once: true });
  }

  function getPanelParts(panel) {
    return {
      copy: panel && panel.querySelector("[data-ae-panel-copy]"),
      layers: panel && panel.querySelector("[data-ae-layers]"),
    };
  }

  /** Left column: title + description block enters from bottom */
  function animatePanelCopyEnter(copy, onEnd) {
    runPanelMotion(copy, PANEL_COPY_ENTER, PANEL_COPY_MS, "is-ae-anim-in", onEnd);
  }

  function animatePanelCopyExit(copy, onEnd) {
    runPanelMotion(copy, PANEL_COPY_EXIT, PANEL_COPY_MS, "is-ae-anim-out", onEnd);
  }

  /** Right column: 4-card stack container enters from the right */
  function animatePanelLayersEnter(layers, onEnd) {
    runPanelMotion(
      layers,
      PANEL_LAYERS_ENTER,
      PANEL_LAYERS_MS,
      "is-ae-anim-in",
      onEnd
    );
  }

  function animatePanelLayersExit(layers, onEnd) {
    runPanelMotion(
      layers,
      PANEL_LAYERS_EXIT,
      PANEL_LAYERS_MS,
      "is-ae-anim-out",
      onEnd
    );
  }

  function animatePanelEnter(panel) {
    if (!panel || prefersReducedMotion()) return;
    var parts = getPanelParts(panel);
    animatePanelCopyEnter(parts.copy);
    animatePanelLayersEnter(parts.layers);
  }

  function animatePanelExit(panel, done) {
    if (!panel || prefersReducedMotion()) {
      if (done) done();
      return;
    }
    var parts = getPanelParts(panel);
    var pending = 0;
    var finished = false;

    function finish() {
      pending -= 1;
      if (pending > 0 || finished) return;
      finished = true;
      if (done) done();
    }

    if (!parts.copy && !parts.layers) {
      if (done) done();
      return;
    }

    if (parts.copy) pending += 1;
    if (parts.layers) pending += 1;
    animatePanelCopyExit(parts.copy, finish);
    animatePanelLayersExit(parts.layers, finish);
  }

  function transitionPanels(prevPanel, nextPanel) {
    if (!nextPanel) return;
    if (prefersReducedMotion() || !prevPanel || prevPanel === nextPanel) {
      animatePanelEnter(nextPanel);
      return;
    }

    animatePanelExit(prevPanel, function () {
      prevPanel.setAttribute("hidden", "hidden");
      animatePanelEnter(nextPanel);
    });
  }

  function observeDetailPanelEntrance(section) {
    var wrap = section.querySelector(".evoq-ae__panelsWrap");
    if (!wrap || wrap.getAttribute("data-ae-detail-io")) return;
    wrap.setAttribute("data-ae-detail-io", "1");

    function playOnce() {
      if (wrap.getAttribute("data-ae-detail-played")) return;
      var panel =
        section.querySelector(".evoq-ae__panel.is-active") ||
        section.querySelector("[data-panel]:not([hidden])");
      if (!panel) return;
      wrap.setAttribute("data-ae-detail-played", "1");
      animatePanelEnter(panel);
    }

    if (prefersReducedMotion()) return;

    if (!("IntersectionObserver" in window)) {
      playOnce();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            playOnce();
            io.disconnect();
          }
        });
      },
      { rootMargin: "-60px", threshold: 0.12 }
    );
    io.observe(wrap);
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
    var prevPanel = null;

    for (var j = 0; j < panels.length; j += 1) {
      var panel = panels[j];
      var panelSlug = panel.getAttribute("data-panel");
      var pon = panelSlug === slug;
      panel.classList.toggle("is-active", pon);
      if (pon) {
        activePanel = panel;
      } else if (panelSlug === prevSlug) {
        prevPanel = panel;
      }
    }

    var shouldAnimate =
      !skipAnimate && prevSlug && prevSlug !== slug && activePanel;

    if (shouldAnimate) {
      activePanel.removeAttribute("hidden");
      if (prevPanel && prevPanel !== activePanel) {
        prevPanel.removeAttribute("hidden");
      }
      for (var k = 0; k < panels.length; k += 1) {
        if (
          panels[k] !== activePanel &&
          panels[k] !== prevPanel
        ) {
          panels[k].setAttribute("hidden", "hidden");
        }
      }
      transitionPanels(prevPanel, activePanel);
    } else {
      for (var m = 0; m < panels.length; m += 1) {
        var pnl = panels[m];
        if (pnl.getAttribute("data-panel") === slug) {
          pnl.removeAttribute("hidden");
        } else {
          pnl.setAttribute("hidden", "hidden");
        }
      }
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
      }, 100);
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

  var HERO_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var HERO_IO_RATIO = 0.12;

  function isStackedHeroLayout() {
    return (
      window.matchMedia("only screen and (max-width: 767px)").matches ||
      window.matchMedia(
        "only screen and (min-width: 768px) and (max-width: 1024px)"
      ).matches
    );
  }

  function heroVisibleRatio(hero) {
    var rect = hero.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return visible / Math.max(rect.height, 1);
  }

  function finishRevealed(el) {
    if (!el) return;
    el.classList.add("evoq-ae__revealed");
    el.style.opacity = "";
    el.style.transform = "";
  }

  function runHeroAnim(el, keyframes, options) {
    if (!el) return;
    if (!el.animate || prefersReducedMotion()) {
      finishRevealed(el);
      return;
    }
    try {
      var anim = el.animate(keyframes, options);
      anim.onfinish = function () {
        finishRevealed(el);
      };
      anim.oncancel = function () {
        finishRevealed(el);
      };
    } catch (e) {
      finishRevealed(el);
    }
  }

  function finishHeroInstant(hero, section) {
    if (!hero) return;
    hero.classList.add("evoq-ae__hero--played");
    if (section) section.classList.add("evoq-ae--inview");
    var nodes = hero.querySelectorAll(
      ".evoq-ae__eyebrowRow, .evoq-ae__heroTitle, .evoq-ae__hub, .evoq-ae__hotspot"
    );
    for (var i = 0; i < nodes.length; i += 1) {
      finishRevealed(nodes[i]);
    }
  }

  /** EvoqBusiness_1.tsx — eyebrow, title, hub, hotspots when hero enters viewport. */
  function playHeroEntrance(hero, section) {
    if (!hero || hero.classList.contains("evoq-ae__hero--played")) return;

    hero.classList.add("evoq-ae__hero--played");
    if (section) section.classList.add("evoq-ae--inview");

    if (prefersReducedMotion()) {
      finishHeroInstant(hero, section);
      return;
    }

    var stacked = isStackedHeroLayout();
    var eyebrow = hero.querySelector(".evoq-ae__eyebrowRow");
    var title = hero.querySelector(".evoq-ae__heroTitle");
    var hub = hero.querySelector(".evoq-ae__hub");
    var hotspots = hero.querySelectorAll(".evoq-ae__hotspot");
    var opts = { easing: HERO_EASE, fill: "forwards" };

    if (eyebrow) {
      eyebrow.style.opacity = "0";
      eyebrow.style.transform = "translateY(18px)";
    }
    if (title) {
      title.style.opacity = "0";
      title.style.transform = "translateY(22px)";
    }
    if (hub) {
      hub.style.opacity = "0";
      hub.style.transform = stacked
        ? "scale(0.85) translateY(20px)"
        : "translate(-50%, calc(-50% + 20px)) scale(0.85)";
    }
    for (var h = 0; h < hotspots.length; h += 1) {
      hotspots[h].style.opacity = "0";
      hotspots[h].style.transform = stacked
        ? "scale(0.7)"
        : "translate(-50%, -50%) scale(0.7)";
    }

    void hero.offsetWidth;

    runHeroAnim(
      eyebrow,
      [
        { opacity: 0, transform: "translateY(18px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      Object.assign({ duration: 700 }, opts)
    );

    runHeroAnim(
      title,
      [
        { opacity: 0, transform: "translateY(22px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      Object.assign({ duration: 800, delay: 100 }, opts)
    );

    if (stacked) {
      runHeroAnim(
        hub,
        [
          { opacity: 0, transform: "scale(0.85) translateY(20px)" },
          { opacity: 1, transform: "none" },
        ],
        Object.assign({ duration: 750, delay: 350 }, opts)
      );
    } else {
      runHeroAnim(
        hub,
        [
          {
            opacity: 0,
            transform: "translate(-50%, calc(-50% + 20px)) scale(0.85)",
          },
          { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        ],
        Object.assign({ duration: 750, delay: 350 }, opts)
      );
    }

    for (var i = 0; i < hotspots.length; i += 1) {
      (function (hotspot, index) {
        var delay = 550 + index * 120;
        if (stacked) {
          runHeroAnim(
            hotspot,
            [
              { opacity: 0, transform: "scale(0.7)" },
              { opacity: 1, transform: "none" },
            ],
            Object.assign({ duration: 550, delay: delay }, opts)
          );
        } else {
          runHeroAnim(
            hotspot,
            [
              { opacity: 0, transform: "translate(-50%, -50%) scale(0.7)" },
              { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
            ],
            Object.assign({ duration: 550, delay: delay }, opts)
          );
        }
      })(hotspots[i], i);
    }
  }

  function triggerHeroEntrance(hero, section) {
    if (!hero || hero.classList.contains("evoq-ae__hero--played")) return;
    window.requestAnimationFrame(function () {
      playHeroEntrance(hero, section);
    });
  }

  /** Observe hero only — full section IO fired while detail was on screen and hero was off-screen. */
  function observeHeroInView(section) {
    var hero = section.querySelector(".evoq-ae__hero");
    if (!section || !hero || section.getAttribute("data-evoq-ae-observed")) return;
    section.setAttribute("data-evoq-ae-observed", "1");

    if (prefersReducedMotion()) {
      finishHeroInstant(hero, section);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      triggerHeroEntrance(hero, section);
      return;
    }

    var activated = false;

    function maybeActivate(entry) {
      if (activated || !entry.isIntersecting) return;
      if (entry.intersectionRatio < HERO_IO_RATIO) return;
      activated = true;
      triggerHeroEntrance(hero, section);
      io.disconnect();
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i += 1) {
          maybeActivate(entries[i]);
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: [0, 0.12, 0.25, 0.4, 0.55] }
    );

    io.observe(hero);

    window.requestAnimationFrame(function () {
      if (activated || hero.classList.contains("evoq-ae__hero--played")) return;
      if (heroVisibleRatio(hero) >= HERO_IO_RATIO) {
        activated = true;
        io.disconnect();
        triggerHeroEntrance(hero, section);
      }
    });
  }

  function bindSection(section) {
    if (!section || section.getAttribute("data-evoq-ae-bound")) return;
    section.setAttribute("data-evoq-ae-bound", "1");

    observeHeroInView(section);
    observeDetailPanelEntrance(section);

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
