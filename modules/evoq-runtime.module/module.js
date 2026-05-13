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

  function observeSection(section) {
    if (!section || section.getAttribute("data-evoq-runtime-observed")) return;
    section.setAttribute("data-evoq-runtime-observed", "1");

    function measureAndMaybePlay() {
      syncOrbitArcLengths(section);
      if (section.classList.contains("evoq-runtime--inview")) {
        window.requestAnimationFrame(function () {
          startOrbitArcAnims(section);
        });
      }
    }

    measureAndMaybePlay();
    window.requestAnimationFrame(measureAndMaybePlay);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("evoq-runtime--inview");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i += 1) {
          if (entries[i].isIntersecting) {
            section.classList.add("evoq-runtime--inview");
            measureAndMaybePlay();
            io.disconnect();
            return;
          }
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
