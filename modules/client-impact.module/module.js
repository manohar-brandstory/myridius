(function () {
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  if (!root) return;
  var section = root.querySelector(".impact");
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

  var bg = section.querySelector("[data-impact-bg]");
  var items = Array.prototype.slice.call(section.querySelectorAll("[data-impact-item]"));
  var goBtns = Array.prototype.slice.call(section.querySelectorAll("[data-impact-go]"));
  var pauseBtn = section.querySelector("[data-impact-pause]");
  var srcMap = {};
  Array.prototype.slice.call(section.querySelectorAll("[data-impact-src]")).forEach(function (n) {
    srcMap[n.getAttribute("data-impact-src")] = n.getAttribute("data-src");
  });

  var idx = 0;
  var paused = false;
  var timer = null;
  var intervalMs = 15000;

  function setActive(next) {
    next = (next + items.length) % items.length;
    idx = next;
    items.forEach(function (el) { el.hidden = el.getAttribute("data-impact-item") !== String(idx); });
    goBtns.forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-impact-go") === String(idx) ? "true" : "false"); });
    if (bg && srcMap[String(idx)]) {
      bg.style.opacity = "0";
      window.setTimeout(function () {
        bg.setAttribute("src", srcMap[String(idx)]);
        bg.style.opacity = "0.30";
      }, 250);
    }
  }

  function start() {
    if (timer) window.clearInterval(timer);
    if (paused) return;
    timer = window.setInterval(function () { setActive(idx + 1); }, intervalMs);
  }

  goBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      setActive(Number(b.getAttribute("data-impact-go") || 0));
      start();
    });
  });

  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      section.classList.toggle("is-paused", paused);
      if (pauseBtn) pauseBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
      start();
    });
  }

  setActive(0);
  start();
})();

