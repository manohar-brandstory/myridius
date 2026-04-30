(function(){
  var root = document.querySelector('[data-hww]');
  if (!root) return;

  var tabs = root.querySelectorAll('[data-hww-tab]');
  var slides = root.querySelectorAll('[data-hww-slide]');
  var bgs = root.querySelectorAll('[data-hww-bg]');
  var pauseBtn = root.querySelector('[data-hww-pause]');
  var current = 0;
  var isPaused = false;
  var timer = null;
  var INTERVAL = 12000;

  function goTo(idx) {
    current = idx;
    tabs.forEach(function(t, i) {
      t.classList.toggle('is-active', i === idx);
    });
    slides.forEach(function(s, i) {
      s.classList.toggle('is-active', i === idx);
    });
    bgs.forEach(function(b, i) {
      b.classList.toggle('is-active', i === idx);
    });
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
