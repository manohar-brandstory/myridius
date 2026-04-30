(function(){
  var root = document.querySelector('[data-hww]');
  if (!root) return;

  var tabs = root.querySelectorAll('[data-hww-tab]');
  var slides = root.querySelectorAll('[data-hww-slide]');
  var bgs = root.querySelectorAll('[data-hww-bg]');
  var pauseBtn = root.querySelector('[data-hww-pause]');
  var btnPrev = root.querySelector('[data-hww-prev]');
  var btnNext = root.querySelector('[data-hww-next]');
  var curEl = root.querySelector('[data-hww-cur]');
  var totalEl = root.querySelector('[data-hww-total]');
  var current = 0;
  var isPaused = false;
  var timer = null;
  var INTERVAL = 12000;

  function setCounter() {
    if (curEl) curEl.textContent = String(current + 1);
    if (totalEl) totalEl.textContent = String(slides.length || 0);
  }

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    tabs.forEach(function(t, i) {
      t.classList.toggle('is-active', i === current);
    });
    slides.forEach(function(s, i) {
      if (i === current) {
        s.classList.remove('is-active');
        void s.offsetWidth;
        s.classList.add('is-active');
      } else {
        s.classList.remove('is-active');
      }
    });
    bgs.forEach(function(b, i) {
      b.classList.toggle('is-active', i === current);
    });
    setCounter();
  }

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

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var idx = parseInt(this.getAttribute('data-hww-tab'), 10);
      goTo(idx);
      startAutoplay();
    });
  });

  function bindNav(btn, dir) {
    if (!btn) return;
    var handler = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      goTo(current + dir);
      startAutoplay();
    };
    btn.addEventListener('pointerup', handler);
    btn.addEventListener('click', handler);
    btn.addEventListener('touchend', handler, { passive: false });
  }
  bindNav(btnPrev, -1);
  bindNav(btnNext, 1);

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function() {
      isPaused = !isPaused;
      this.classList.toggle('is-paused', isPaused);
      if (isPaused) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  setCounter();
  startAutoplay();

  var srEls = root.querySelectorAll('[data-sr]');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-sr-shown');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    srEls.forEach(function(el) { el.classList.add('is-sr-hidden'); obs.observe(el); });
  }
})();
