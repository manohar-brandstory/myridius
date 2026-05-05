(function () {
  // Scope to this module instance (HubSpot safe pattern)
  var root =
    (document.currentScript &&
      document.currentScript.closest(".hs_cos_wrapper_type_module")) ||
    document;

  var rootEl = root.querySelector && root.querySelector('[data-svc-impact]');
  if (!rootEl) return;

  /* ── Highlight keywords in metric headlines ── */
  var keywords = [
    'unified', 'automated', 'real-time', 'accelerating',
    'modernizing', 'seamless', 'intelligence', 'excellence',
    'luxury', 'infrastructure'
  ];
  rootEl.querySelectorAll('.svc-impact__metric').forEach(function (el) {
    var html = el.innerHTML;
    keywords.forEach(function (kw) {
      var re = new RegExp('(' + kw + ')', 'gi');
      html = html.replace(re, '<span style="color:#52E081">$1</span>');
    });
    el.innerHTML = html;
  });

  /* ── Cache DOM refs ── */
  var slides   = rootEl.querySelectorAll('[data-svc-slide]');
  var bgs      = rootEl.querySelectorAll('[data-svc-bg]');
  var nums     = rootEl.querySelectorAll('[data-svc-go]');
  var pauseBtn = rootEl.querySelector('[data-svc-pause]');
  var body     = rootEl.querySelector('.svc-impact__body');

  var current  = 0;
  var isPaused = false;
  var timer    = null;
  var INTERVAL = 8000;

  /* ── Go to slide ── */
  function goTo(idx) {
    current = idx;
    slides.forEach(function (el, i) {
      el.classList.remove('is-open');
      if (i === idx) {
        el.classList.remove('is-active');
        void el.offsetWidth;
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });
    bgs.forEach(function (el, i) {
      el.classList.toggle('is-active', i === idx);
    });
    nums.forEach(function (el, i) {
      el.classList.toggle('is-active', i === idx);
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  /* ── Tap-to-reveal details on content area ── */
  if (body) {
    body.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;
      var content = target.closest && target.closest('.svc-impact__content');
      if (!content) return;
      if (target.closest('a, button')) return;

      var activeSlide = body.querySelector('[data-svc-slide].is-active');
      if (!activeSlide) return;
      activeSlide.classList.toggle('is-open');
    });
  }

  /* ── Auto-advance ── */
  function next() {
    goTo((current + 1) % slides.length);
  }

  function startAutoplay() {
    stopAutoplay();
    if (!isPaused) {
      timer = setInterval(next, INTERVAL);
    }
  }

  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ── Numbered navigation ── */
  nums.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-svc-go'), 10);
      goTo(idx);
      startAutoplay();
    });
  });

  /* ── Pause / Play toggle ── */
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      isPaused = !isPaused;
      this.classList.toggle('is-paused', isPaused);
      this.setAttribute('aria-label', isPaused ? 'Play slideshow' : 'Pause slideshow');
      if (isPaused) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  startAutoplay();

  /* ── Scroll-reveal for badge ── */
  var srEls = rootEl.querySelectorAll('[data-sr]');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-sr-shown');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    srEls.forEach(function (el) {
      el.classList.add('is-sr-hidden');
      obs.observe(el);
    });
  }
})();
