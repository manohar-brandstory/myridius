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
  var slidesWrap = root.querySelector('.hww__slides');
  var current = 0;
  var isPaused = false;
  var timer = null;
  var INTERVAL = 12000;
  var mqMobile = (typeof window.matchMedia === 'function')
    ? window.matchMedia('(max-width: 767px)')
    : null;

  function setCounter() {
    if (curEl) curEl.textContent = String(current + 1);
    if (totalEl) totalEl.textContent = String(slides.length || 0);
  }

  function setNavDisabled() {
    if (!btnPrev || !btnNext) return;
    // Mobile UX: clamp at ends (prevents wrap + accidental scroll jumps near section boundary).
    var isMobile = mqMobile ? mqMobile.matches : (window.innerWidth <= 767);
    btnPrev.disabled = isMobile && current <= 0;
    btnNext.disabled = isMobile && current >= (slides.length - 1);
  }

  function syncSlidesHeight() {
    if (!slidesWrap || !slides.length) return;
    var isMobile = mqMobile ? mqMobile.matches : (window.innerWidth <= 767);
    if (!isMobile) {
      slidesWrap.style.minHeight = '';
      return;
    }

    // Prevent layout shift (jerky scroll) when switching slides on mobile:
    // normalize the container height to the tallest slide.
    var maxH = 0;
    slides.forEach(function (s) {
      var prev = {
        display: s.style.display,
        position: s.style.position,
        visibility: s.style.visibility,
        pointerEvents: s.style.pointerEvents,
        left: s.style.left,
        top: s.style.top,
        width: s.style.width
      };
      s.style.display = 'block';
      s.style.position = 'absolute';
      s.style.visibility = 'hidden';
      s.style.pointerEvents = 'none';
      s.style.left = '0';
      s.style.top = '0';
      s.style.width = '100%';

      maxH = Math.max(maxH, s.scrollHeight || s.offsetHeight || 0);

      s.style.display = prev.display;
      s.style.position = prev.position;
      s.style.visibility = prev.visibility;
      s.style.pointerEvents = prev.pointerEvents;
      s.style.left = prev.left;
      s.style.top = prev.top;
      s.style.width = prev.width;
    });
    if (maxH) slidesWrap.style.minHeight = maxH + 'px';
  }

  function goTo(idx) {
    var isMobile = mqMobile ? mqMobile.matches : (window.innerWidth <= 767);
    if (isMobile) {
      // Clamp on mobile (no wrap). Wrapping at the end can cause a perceived "jump"
      // when the section height changes near the viewport boundary.
      current = Math.max(0, Math.min(slides.length - 1, idx));
    } else {
      current = (idx + slides.length) % slides.length;
    }

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
    setNavDisabled();
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
    var lastFire = 0;
    var handler = function(e) {
      var now = Date.now();
      if (now - lastFire < 350) return; // dedupe touchend/click double-fire
      lastFire = now;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (btn.disabled) return;
      goTo(current + dir);
      startAutoplay();
    };
    btn.addEventListener('pointerup', handler, true);
    btn.addEventListener('touchend', handler, { passive: false, capture: true });
    btn.addEventListener('click', handler, true);
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
  syncSlidesHeight();
  setNavDisabled();
  startAutoplay();

  window.addEventListener('resize', function () {
    syncSlidesHeight();
    setNavDisabled();
  }, { passive: true });

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
