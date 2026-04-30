(function(){
  var root = document.querySelector('[data-impact]');
  if (!root) return;

  var keywords = ['intelligence','real time','agile','rapid','accelerated','effectiveness','reduced','automation'];
  root.querySelectorAll('.impact__metric').forEach(function(el) {
    var html = el.innerHTML;
    keywords.forEach(function(kw) {
      var re = new RegExp('(' + kw + ')', 'gi');
      html = html.replace(re, '<span style="color:#52E081">$1</span>');
    });
    el.innerHTML = html;
  });

  var items = root.querySelectorAll('[data-impact-item]');
  var bgs = root.querySelectorAll('[data-impact-bg]');
  var nums = root.querySelectorAll('[data-impact-go]');
  var pauseBtn = root.querySelector('[data-impact-pause]');
  var current = 0;
  var isPaused = false;
  var timer = null;
  var INTERVAL = 15000;

  function goTo(idx) {
    current = idx;
    items.forEach(function(el, i) {
      el.classList.toggle('is-active', i === idx);
    });
    bgs.forEach(function(el, i) {
      el.classList.toggle('is-active', i === idx);
    });
    nums.forEach(function(el, i) {
      el.classList.toggle('is-active', i === idx);
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  function next() {
    goTo((current + 1) % items.length);
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

  nums.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(this.getAttribute('data-impact-go'), 10);
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
