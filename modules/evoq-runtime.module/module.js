(function () {
  /* All legs together: each path “draws” from one card to the other (stroke reveals along the arc). */
  var TRAVEL_MS = 1100;
  var FADE_MS = 750;
  var GAP_MS = 400;

  /** Geometric length for CSS vars; dash animation uses dashSpaceLength() so pathLength matches SVG dash math. */
  function syncOrbitArcLengths(section) {
    var arcs = section.querySelectorAll(".evoq-runtime__orbitArc");
    for (var i = 0; i < arcs.length; i += 1) {
      try {
        var len = arcs[i].getTotalLength();
        if (len && len > 0) {
          arcs[i].style.setProperty("--orbit-len", String(len));
        }
      } catch (e) {
        /* ignore */
      }
    }
  }

  /**
   * When path has pathLength="1", stroke-dash* use that author length (not geometric getTotalLength()).
   * Mixing the two breaks the “line drawing” reveal.
   */
  function dashSpaceLength(path) {
    var attr = path.getAttribute && path.getAttribute("pathLength");
    if (attr != null && String(attr).trim() !== "") {
      var n = parseFloat(attr);
      if (!isNaN(n) && n > 0) {
        return n;
      }
    }
    try {
      return path.getTotalLength();
    } catch (e2) {
      return 0;
    }
  }

  function cancelOrbitArcAnims(section) {
    var arcs = section.querySelectorAll(".evoq-runtime__orbitArc");
    for (var i = 0; i < arcs.length; i += 1) {
      var p = arcs[i];
      if (p && p._evoqOrbitAnim) {
        try {
          p._evoqOrbitAnim.cancel();
        } catch (e) {
          /* ignore */
        }
        p._evoqOrbitAnim = null;
      }
    }
  }

  /**
   * One cycle: hidden → line draws along path (dashoffset L→0, linear = even reveal) → full line fades → gap → repeat.
   * dasharray L L masks the whole stroke; offset reveals it progressively from path start to path end.
   */
  function buildKeyframes(L, travelMs, fadeMs, gapMs) {
    var total = travelMs + fadeMs + gapMs;
    var tTravel = travelMs / total;
    var tFadeEnd = (travelMs + fadeMs) / total;

    return [
      { strokeDashoffset: L, opacity: 0, offset: 0, easing: "linear" },
      { strokeDashoffset: L, opacity: 1, offset: 0.008, easing: "linear" },
      { strokeDashoffset: 0, opacity: 1, offset: tTravel, easing: "linear" },
      { strokeDashoffset: 0, opacity: 0, offset: tFadeEnd, easing: "linear" },
      { strokeDashoffset: L, opacity: 0, offset: Math.min(tFadeEnd + 0.006, 0.999), easing: "linear" },
      { strokeDashoffset: L, opacity: 0, offset: 1 },
    ];
  }

  function buildKeyframesKebab(L, travelMs, fadeMs, gapMs) {
    var total = travelMs + fadeMs + gapMs;
    var tTravel = travelMs / total;
    var tFadeEnd = (travelMs + fadeMs) / total;

    return [
      { "stroke-dashoffset": L, opacity: 0, offset: 0, easing: "linear" },
      { "stroke-dashoffset": L, opacity: 1, offset: 0.008, easing: "linear" },
      { "stroke-dashoffset": 0, opacity: 1, offset: tTravel, easing: "linear" },
      { "stroke-dashoffset": 0, opacity: 0, offset: tFadeEnd, easing: "linear" },
      { "stroke-dashoffset": L, opacity: 0, offset: Math.min(tFadeEnd + 0.006, 0.999), easing: "linear" },
      { "stroke-dashoffset": L, opacity: 0, offset: 1 },
    ];
  }

  function startOrbitArcAnims(section) {
    cancelOrbitArcAnims(section);

    if (!section.classList.contains("evoq-runtime--inview")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var arcs = section.querySelectorAll(".evoq-runtime__orbitArc");
    if (!arcs.length || typeof arcs[0].animate !== "function") return;

    var seg = TRAVEL_MS + FADE_MS + GAP_MS;

    for (var i = 0; i < arcs.length; i += 1) {
      var path = arcs[i];
      var L = dashSpaceLength(path);
      if (!L || L <= 0) continue;

      /* One dash = full path in dash space → offset L→0 reveals stroke progressively (card → card). */
      path.style.strokeDasharray = L + " " + L;
      path.style.strokeDashoffset = String(L);

      var kf = buildKeyframes(L, TRAVEL_MS, FADE_MS, GAP_MS);

      try {
        path._evoqOrbitAnim = path.animate(kf, {
          duration: seg,
          delay: 0,
          iterations: Infinity,
          easing: "linear",
        });
      } catch (e1) {
        try {
          path._evoqOrbitAnim = path.animate(buildKeyframesKebab(L, TRAVEL_MS, FADE_MS, GAP_MS), {
            duration: seg,
            delay: 0,
            iterations: Infinity,
            easing: "linear",
          });
        } catch (e2) {
          /* no WAAPI */
        }
      }
    }
  }

  var SIDE_SLIDE_PX = 20;
  var SIDE_DURATION_MS = 600;
  var SIDE_BASE_DELAY_MS = 300;
  var SIDE_STAGGER_MS = 150;
  var SIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  function sideCardIndex(card) {
    var match = card.className.match(/evoq-runtime__sideCard--in-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  function primeSideCards(section) {
    var cards = section.querySelectorAll(".evoq-runtime__sideCard");
    for (var i = 0; i < cards.length; i += 1) {
      var card = cards[i];
      var fromX = card.classList.contains("evoq-runtime__sideCard--left")
        ? -SIDE_SLIDE_PX
        : SIDE_SLIDE_PX;
      card.style.opacity = "0";
      card.style.transform = "translateX(" + fromX + "px)";
    }
  }

  function finishSideCard(card) {
    card.classList.add("evoq-runtime__sideCard--entered");
    card.style.opacity = "";
    card.style.transform = "";
  }

  /** Left: -20px → 0. Right: +20px → 0. Stagger matches EvoqRuntime.tsx SideCard. */
  function animateSideCards(section) {
    var cards = section.querySelectorAll(".evoq-runtime__sideCard");
    if (!cards.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (var r = 0; r < cards.length; r += 1) {
        finishSideCard(cards[r]);
      }
      return;
    }

    for (var i = 0; i < cards.length; i += 1) {
      (function (card) {
        var fromX = card.classList.contains("evoq-runtime__sideCard--left")
          ? -SIDE_SLIDE_PX
          : SIDE_SLIDE_PX;
        var delay = SIDE_BASE_DELAY_MS + sideCardIndex(card) * SIDE_STAGGER_MS;

        if (typeof card.animate !== "function") {
          finishSideCard(card);
          return;
        }

        try {
          var anim = card.animate(
            [
              { opacity: 0, transform: "translateX(" + fromX + "px)" },
              { opacity: 1, transform: "translateX(0)" },
            ],
            {
              duration: SIDE_DURATION_MS,
              delay: delay,
              easing: SIDE_EASE,
              fill: "forwards",
            }
          );
          anim.onfinish = function () {
            finishSideCard(card);
          };
          anim.oncancel = function () {
            finishSideCard(card);
          };
        } catch (e) {
          finishSideCard(card);
        }
      })(cards[i]);
    }
  }

  function activateInView(section) {
    if (!section || section.classList.contains("evoq-runtime--inview")) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      animateSideCards(section);
    } else {
      primeSideCards(section);
    }

    section.classList.add("evoq-runtime--inview");
    syncOrbitArcLengths(section);

    void section.offsetWidth;

    window.requestAnimationFrame(function () {
      if (!reduced) {
        animateSideCards(section);
      }
      startOrbitArcAnims(section);
    });
  }

  function activateInViewAfterPaint(section) {
    if (!section || section.classList.contains("evoq-runtime--inview")) return;

    window.requestAnimationFrame(function () {
      activateInView(section);
    });
  }

  function useSideCardTapToggle() {
    return (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("only screen and (max-width: 1024px)").matches
    );
  }

  /** Mobile / touch: tap toggles expanded state (avoids sticky :hover). */
  function bindSideCardToggle(section) {
    if (!useSideCardTapToggle()) return;

    var cards = section.querySelectorAll(".evoq-runtime__sideCard");
    if (!cards.length) return;

    for (var i = 0; i < cards.length; i += 1) {
      (function (card) {
        if (!card.hasAttribute("tabindex")) {
          card.setAttribute("tabindex", "0");
        }
        if (!card.hasAttribute("aria-expanded")) {
          card.setAttribute("aria-expanded", "false");
        }

        function setExpanded(target, on) {
          target.classList.toggle("is-expanded", on);
          target.setAttribute("aria-expanded", on ? "true" : "false");
        }

        card.addEventListener("click", function () {
          var wasExpanded = card.classList.contains("is-expanded");
          for (var j = 0; j < cards.length; j += 1) {
            setExpanded(cards[j], false);
          }
          if (!wasExpanded) {
            setExpanded(card, true);
          }
        });
      })(cards[i]);
    }
  }

  function observeSection(section) {
    if (!section || section.getAttribute("data-evoq-runtime-observed")) return;
    section.setAttribute("data-evoq-runtime-observed", "1");

    bindSideCardToggle(section);
    syncOrbitArcLengths(section);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      activateInView(section);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      activateInViewAfterPaint(section);
      return;
    }

    var activated = false;

    function onIntersect(entry) {
      if (activated || !entry.isIntersecting) return;
      activated = true;
      activateInViewAfterPaint(section);
      io.disconnect();
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i += 1) {
          onIntersect(entries[i]);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    io.observe(section);
  }

  function init() {
    var nodes = document.querySelectorAll(".evoq-runtime");
    for (var j = 0; j < nodes.length; j += 1) {
      observeSection(nodes[j]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
