(function () {
  'use strict';

  function initHero(root) {
    if (!root || root.getAttribute('data-news-hero-inited') === 'true') return;
    root.setAttribute('data-news-hero-inited', 'true');

    var slides = root.querySelectorAll('[data-news-slide]');
    var nums = root.querySelectorAll('[data-news-go]');
    var pauseBtn = root.querySelector('[data-news-pause]');
    var prevBtn = root.querySelector('[data-news-prev]');
    var nextBtn = root.querySelector('[data-news-next]');
    var currentEl = root.querySelector('[data-news-current]');

    if (!slides.length) return;

    var current = 0;
    var total = slides.length;
    var isPaused = false;
    var timer = null;
    var interval = parseInt(root.getAttribute('data-autoplay'), 10);
    if (isNaN(interval) || interval < 0) interval = 8000;

    function goTo(idx) {
      if (idx < 0) idx = total - 1;
      if (idx >= total) idx = 0;
      current = idx;

      slides.forEach(function (el, i) {
        var active = i === idx;
        el.classList.toggle('is-active', active);
        el.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      nums.forEach(function (btn, i) {
        var active = i === idx;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (currentEl) currentEl.textContent = String(idx + 1);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
      stopAutoplay();
      if (isPaused || interval <= 0 || total <= 1) return;
      timer = setInterval(next, interval);
    }

    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    nums.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-news-go'), 10);
        if (!isNaN(idx)) {
          goTo(idx);
          startAutoplay();
        }
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prev();
        startAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        next();
        startAutoplay();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        isPaused = !isPaused;
        this.classList.toggle('is-paused', isPaused);
        this.setAttribute(
          'aria-label',
          isPaused ? 'Play slideshow' : 'Pause slideshow'
        );
        if (isPaused) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    }

    // Pause on hover (desktop only)
    var slider = root.querySelector('[data-news-slider]');
    if (slider && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', function () {
        if (!isPaused) startAutoplay();
      });
    }

    // Pause when off-screen
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!isPaused) startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      }, { threshold: 0.25 });
      io.observe(root);
    } else {
      startAutoplay();
    }

    // Basic touch swipe
    var touchStartX = null;
    var touchStartY = null;
    var sliderEl = slider || root;
    sliderEl.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches.length) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    sliderEl.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var t = (e.changedTouches && e.changedTouches[0]) || null;
      if (!t) { touchStartX = null; return; }
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) {
        next();
      } else {
        prev();
      }
      startAutoplay();
    }, { passive: true });
  }

  function boot() {
    document.querySelectorAll('[data-news-hero]').forEach(initHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
