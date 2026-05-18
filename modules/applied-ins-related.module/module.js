(function () {
  function pad2(num) {
    var k = typeof num === "number" ? num : parseInt(num, 10);
    if (isNaN(k)) return "01";
    return k < 10 ? "0" + k : String(k);
  }

  function slidesToShow() {
    var w = window.innerWidth;
    if (w <= 767) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function readRealCount(carousel, track) {
    var fromAttr = parseInt(carousel.getAttribute("data-total"), 10);
    if (!isNaN(fromAttr) && fromAttr > 0) return fromAttr;
    return track.querySelectorAll("[data-applied-ins-slide]").length;
  }

  function removeClones(track) {
    var clones = Array.prototype.slice.call(
      track.querySelectorAll("[data-applied-ins-clone]")
    );
    for (var i = 0; i < clones.length; i += 1) {
      var p = clones[i].parentNode;
      if (p) p.removeChild(clones[i]);
    }
  }

  function decorateClone(node) {
    node.setAttribute("data-applied-ins-clone", "");
    node.setAttribute("aria-hidden", "true");
    node.removeAttribute("data-applied-ins-slide");
    var link = node.querySelector("a");
    if (link) link.setAttribute("tabindex", "-1");
  }

  function setupClones(track, reals, n, st) {
    if (n <= st) return;
    var j;
    for (j = st - 1; j >= 0; j -= 1) {
      var pre = reals[n - st + j].cloneNode(true);
      decorateClone(pre);
      track.insertBefore(pre, track.firstChild);
    }
    for (j = 0; j < st; j += 1) {
      var post = reals[j].cloneNode(true);
      decorateClone(post);
      track.appendChild(post);
    }
  }

  function shouldUseSlider(carousel) {
    var n = parseInt(carousel.getAttribute("data-total"), 10) || 0;
    if (!n) return false;
    if (window.matchMedia("(max-width: 1024px)").matches) return n > 1;
    return n > 3;
  }

  function initCarousel(carousel) {
    var track = carousel.querySelector("[data-applied-ins-track]");
    var viewport = carousel.querySelector("[data-applied-ins-viewport]");
    var prev = carousel.querySelector("[data-applied-ins-prev]");
    var next = carousel.querySelector("[data-applied-ins-next]");
    var mobPrev = carousel.querySelector("[data-applied-ins-mob-prev]");
    var mobNext = carousel.querySelector("[data-applied-ins-mob-next]");
    var mobCur = carousel.querySelector("[data-applied-ins-mob-cur]");
    var mobTotal = carousel.querySelector("[data-applied-ins-mob-total]");

    if (!track || !viewport) return;

    var n = readRealCount(carousel, track);

    function syncSliderMode() {
      var active = shouldUseSlider(carousel);
      carousel.classList.toggle("is-slider", active);
      if (!active) {
        removeClones(track);
        track.style.transform = "";
        track.style.transition = "";
        if (mobCur) mobCur.textContent = pad2(1);
        if (mobTotal) mobTotal.textContent = pad2(n || 1);
        return false;
      }
      return true;
    }

    if (!syncSliderMode()) return;

    var prevBtn = prev || mobPrev;
    var nextBtn = next || mobNext;
    if (!prevBtn || !nextBtn) return;

    var extendedIndex = 0;
    var isSnapping = false;

    function stepPercent() {
      var st = slidesToShow();
      return 100 / st;
    }

    function applyTransform(instant) {
      var step = stepPercent();
      if (instant) {
        track.style.transition = "none";
      } else {
        track.style.transition = "";
      }
      track.style.transform = "translateX(-" + extendedIndex * step + "%)";
      if (instant) {
        void track.offsetWidth;
        track.style.transition = "";
      }
    }

    function settleInfinitePosition() {
      var st = slidesToShow();
      if (n <= st) return;
      var changed = false;
      if (extendedIndex < st) {
        extendedIndex += n;
        changed = true;
      } else if (extendedIndex >= st + n) {
        extendedIndex -= n;
        changed = true;
      }
      if (changed) {
        isSnapping = true;
        applyTransform(true);
        isSnapping = false;
      }
    }

    function logicalFirst0() {
      var st = slidesToShow();
      if (n <= st) return 0;
      return ((extendedIndex - st) % n + n) % n;
    }

    function updateMobNavState() {
      if (!mobPrev || !mobNext) return;
      mobPrev.disabled = false;
      mobNext.disabled = false;
    }

    function updateMobPager() {
      if (!mobCur || !mobTotal || !n) return;
      mobTotal.textContent = pad2(n);
      mobCur.textContent = pad2(Math.min(n, logicalFirst0() + 1));
    }

    function rebuildClonesAndPosition() {
      removeClones(track);
      var reals = track.querySelectorAll("[data-applied-ins-slide]");
      var st = slidesToShow();
      if (n <= st) {
        extendedIndex = 0;
        applyTransform(true);
        updateMobNavState();
        updateMobPager();
        return;
      }
      setupClones(track, reals, n, st);
      extendedIndex = st;
      applyTransform(true);
      updateMobNavState();
      updateMobPager();
    }

    function move(delta) {
      var st = slidesToShow();
      if (n <= st) return;
      extendedIndex += delta;
      applyTransform(false);
      updateMobPager();
    }

    function onTransitionEnd(e) {
      if (e.target !== track || e.propertyName !== "transform" || isSnapping) return;
      settleInfinitePosition();
      updateMobPager();
    }

    function onPrevClick() {
      move(-1);
    }

    function onNextClick() {
      move(1);
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!syncSliderMode()) return;
        rebuildClonesAndPosition();
      }, 120);
    }

    prevBtn.addEventListener("click", onPrevClick);
    nextBtn.addEventListener("click", onNextClick);
    if (mobPrev && mobPrev !== prevBtn) mobPrev.addEventListener("click", onPrevClick);
    if (mobNext && mobNext !== nextBtn) mobNext.addEventListener("click", onNextClick);
    track.addEventListener("transitionend", onTransitionEnd);
    window.addEventListener("resize", onResize);

    prevBtn.removeAttribute("disabled");
    nextBtn.removeAttribute("disabled");
    prevBtn.disabled = false;
    nextBtn.disabled = false;

    rebuildClonesAndPosition();
  }

  function init() {
    var carousels = document.querySelectorAll("[data-applied-ins-carousel]");
    for (var i = 0; i < carousels.length; i += 1) {
      initCarousel(carousels[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
