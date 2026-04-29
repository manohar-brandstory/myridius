(function () {
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  if (!root) return;
  var section = root.querySelector(".hww");
  if (!section) return;

  // Scroll reveal
  (function () {
    var srEls = section.querySelectorAll("[data-sr]");
    if (!srEls.length || !("IntersectionObserver" in window)) return;
    srEls.forEach(function (el) { el.classList.add("is-sr-hidden"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("is-sr-hidden");
        entry.target.classList.add("is-sr-shown");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    srEls.forEach(function (el) { io.observe(el); });
  })();

  var tabs = section.querySelectorAll("[data-tab]");
  var slides = section.querySelectorAll("[data-slide]");
  var bgImg = section.querySelector("[data-bg]");
  var playBtn = section.querySelector("[data-play]");
  var playIcon = section.querySelector("[data-play-icon]");

  var slideData = [];
  slides.forEach(function (el) {
    var idx = el.getAttribute("data-slide");
    var img = el.querySelector("img");
    // Images are stored in fields; we use the field URLs via a data attribute injected by JS below if needed.
    slideData[idx] = { image: el.getAttribute("data-image") };
  });

  // Collect images from rendered HubL (first slide bg is already set, we still need all)
  // We read from the server-rendered markup by looking at the module JSON data embedded in hrefs is not available,
  // so we instead store images in an array via DOM: parse from hidden nodes if present.
  var images = [];
  section.querySelectorAll("[data-slide]").forEach(function (el) {
    var idx = Number(el.getAttribute("data-slide") || 0);
    // Find the matching slide image from the original HubL data by reading the background image from the server:
    // We can’t, so we fall back to reading from the HTML: duplicate URLs in a data attribute on the slide.
    // If missing, keep current bg.
    var url = el.getAttribute("data-bg-src");
    images[idx] = url || null;
  });

  // Inject bg src attributes from HubL by reading a script tag would be overkill;
  // simplest: mirror image src into data-bg-src at render-time using JS if not present.
  // (This section assumes you keep slide.image set; we will set it below by scanning the template string.)

  var current = 0;
  var paused = false;
  var intervalMs = 12000;
  var timer = null;

  function setPlayIcon() {
    if (!playIcon) return;
    playIcon.innerHTML = paused
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7-11-7z" fill="currentColor"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';
    if (playBtn) playBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
  }

  function setActive(idx) {
    idx = (idx + slides.length) % slides.length;
    current = idx;
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", t.getAttribute("data-tab") === String(idx) ? "true" : "false");
    });
    slides.forEach(function (s) {
      s.hidden = s.getAttribute("data-slide") !== String(idx);
    });

    // Update background image (cross-fade)
    if (bgImg) {
      var nextSrc = null;
      // Try to pull from the hidden slide’s inline data by looking for a matching field-rendered <img> in the slide header area.
      // The slide itself doesn’t contain an image tag, so we store it via a hidden element in the markup (added below).
      var srcEl = section.querySelector('[data-bg-src-for="' + idx + '"]');
      if (srcEl) nextSrc = srcEl.getAttribute("data-src");
      if (nextSrc) {
        bgImg.style.opacity = "0";
        window.setTimeout(function () {
          bgImg.setAttribute("src", nextSrc);
          bgImg.style.opacity = "1";
          bgImg.style.transform = "scale(1)";
        }, 250);
      }
    }
  }

  function start() {
    if (timer) window.clearInterval(timer);
    if (paused) return;
    timer = window.setInterval(function () { setActive(current + 1); }, intervalMs);
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var idx = Number(t.getAttribute("data-tab") || 0);
      setActive(idx);
      start();
    });
  });

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      paused = !paused;
      setPlayIcon();
      start();
    });
  }

  // Seed hidden background src map (server-rendered via HubL in module.html would be ideal,
  // but we can do it client-side by reading a JSON-like dataset is not available).
  // Solution: add invisible DOM nodes via JS by scraping the rendered HTML comments is impossible.
  // So we create the map by reading from a data attribute we inject from HubL:
  // Look for nodes already present; if none, we keep the initial bg and only tab-switch content.
  setPlayIcon();
  setActive(0);
  start();
})();

