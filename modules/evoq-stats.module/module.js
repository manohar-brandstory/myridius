(function () {
  var VISIBLE_CLASS = 'evoq-stats--visible';
  var CARD_HOVER_CLASS = 'evoq-stats__card--hover';
  var STAT_HOVER_CLASS = 'evoq-stats__stat-item--hover';

  function initScrollAnimations(root) {
    var logoStage = root.querySelector('[data-stage="logo"]');
    var cardsStage = root.querySelector('[data-stage="cards"]');
    var statsStage = root.querySelector('[data-stage="stats"]');
    if (!logoStage && !cardsStage && !statsStage) return;

    var timers = [];

    function runStagedReveal() {
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        if (logoStage) {
          logoStage.classList.add(VISIBLE_CLASS, 'evoq-stats--powered');
        }
        if (cardsStage) cardsStage.classList.add(VISIBLE_CLASS);
        if (statsStage) statsStage.classList.add(VISIBLE_CLASS);
        return;
      }

      if (logoStage) {
        timers.push(setTimeout(function () {
          logoStage.classList.add(VISIBLE_CLASS);
        }, 100));
        timers.push(setTimeout(function () {
          logoStage.classList.add('evoq-stats--powered');
        }, 700));
      }
      if (cardsStage) {
        timers.push(setTimeout(function () {
          cardsStage.classList.add(VISIBLE_CLASS);
        }, 1400));
      }
      if (statsStage) {
        timers.push(setTimeout(function () {
          statsStage.classList.add(VISIBLE_CLASS);
        }, 2600));
      }
    }

    if (!('IntersectionObserver' in window)) {
      runStagedReveal();
      return;
    }

    var started = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || started) return;
          started = true;
          runStagedReveal();
          observer.unobserve(root);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20% 0px' }
    );

    observer.observe(root);
  }

  function initCardHovers(root) {
    var cards = root.querySelectorAll('[data-card]');
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.classList.add(CARD_HOVER_CLASS);
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove(CARD_HOVER_CLASS);
      });
      card.addEventListener('touchstart', function () {
        cards.forEach(function (c) { c.classList.remove(CARD_HOVER_CLASS); });
        card.classList.add(CARD_HOVER_CLASS);
      }, { passive: true });
    });
  }

  function initStatHovers(root) {
    var stats = root.querySelectorAll('[data-stat]');
    stats.forEach(function (stat) {
      stat.addEventListener('mouseenter', function () {
        stat.classList.add(STAT_HOVER_CLASS);
      });
      stat.addEventListener('mouseleave', function () {
        stat.classList.remove(STAT_HOVER_CLASS);
      });
      stat.addEventListener('touchstart', function () {
        stats.forEach(function (s) { s.classList.remove(STAT_HOVER_CLASS); });
        stat.classList.add(STAT_HOVER_CLASS);
      }, { passive: true });
    });
  }

  function init() {
    var sections = document.querySelectorAll('.evoq-stats');
    sections.forEach(function (section) {
      initScrollAnimations(section);
      initCardHovers(section);
      initStatHovers(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
