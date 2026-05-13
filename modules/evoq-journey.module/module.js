(function () {
  var sections = document.querySelectorAll('.evoq-journey');
  if (!sections.length) return;

  function pad2(n) {
    var v = Math.max(0, parseInt(n, 10) || 0);
    return v < 10 ? '0' + v : String(v);
  }

  function normalizeWheelDeltaY(e) {
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= (window.innerHeight || 600);
    return dy;
  }

  sections.forEach(function (section) {
    var stages = section.querySelectorAll('.evoq-journey__stage');
    var cards = section.querySelectorAll('.evoq-journey__card');
    var cardsTrack = section.querySelector('.evoq-journey__cards');
    var cardsViewport = section.querySelector('.evoq-journey__cards-viewport');
    var cardsSlider = section.querySelector('.evoq-journey__cards-slider');
    var toolbar = section.querySelector('.evoq-journey__cards-toolbar');
    var cardsCount = parseInt(cardsTrack && cardsTrack.getAttribute('data-card-count'), 10) || cards.length;
    var prevBtn = section.querySelector('.evoq-journey__cards-nav--prev');
    var nextBtn = section.querySelector('.evoq-journey__cards-nav--next');
    var indexCurrentEl = section.querySelector('[data-evoq-journey-index-current]');
    var indexTotalEl = section.querySelector('[data-evoq-journey-index-total]');
    var isMobile = window.matchMedia('(max-width: 640px)');
    var isTabletOrMobile = window.matchMedia('(max-width: 1024px)');

    stages.forEach(function (stage) {
      stage.addEventListener('mouseenter', function () {
        stages.forEach(function (s) {
          s.classList.remove('evoq-journey__stage--active');
        });
        stage.classList.add('evoq-journey__stage--active');
      });

      stage.addEventListener('mouseleave', function () {
        stage.classList.remove('evoq-journey__stage--active');
      });
    });

    function expandCard(targetCard) {
      cards.forEach(function (card) {
        card.classList.remove('evoq-journey__card--active');
      });
      targetCard.classList.add('evoq-journey__card--active');
    }

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        if (!isMobile.matches) {
          expandCard(card);
        }
      });

      card.addEventListener('click', function () {
        if (isMobile.matches) {
          if (card.classList.contains('evoq-journey__card--active')) return;
          expandCard(card);
        } else {
          expandCard(card);
        }
      });

      card.addEventListener('focusin', function () {
        expandCard(card);
      });
    });

    isMobile.addEventListener('change', function () {
      cards.forEach(function (card) {
        card.classList.remove('evoq-journey__card--active');
      });
      if (cards.length > 0) {
        var defaultIndex = cards.length - 1;
        cards[defaultIndex].classList.add('evoq-journey__card--active');
      }
    });

    var indexRaf = null;
    function dominantCardIndex() {
      if (!cardsViewport || !cards.length) return 0;
      var v = cardsViewport.getBoundingClientRect();
      var bestIdx = 0;
      var bestVis = -1;
      for (var i = 0; i < cards.length; i += 1) {
        var c = cards[i].getBoundingClientRect();
        var left = Math.max(c.left, v.left);
        var right = Math.min(c.right, v.right);
        var vis = Math.max(0, right - left);
        if (vis > bestVis) {
          bestVis = vis;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    function updatePagination() {
      if (!indexCurrentEl || !indexTotalEl) return;
      var idx = dominantCardIndex();
      indexCurrentEl.textContent = pad2(idx + 1);
      indexTotalEl.textContent = pad2(cardsCount);
    }

    function schedulePaginationUpdate() {
      if (indexRaf != null) return;
      indexRaf = window.requestAnimationFrame(function () {
        indexRaf = null;
        updatePagination();
      });
    }

    function updateNavState() {
      if (!cardsViewport || !toolbar || !prevBtn || !nextBtn) return;
      var enabled =
        cardsSlider && cardsSlider.classList.contains('evoq-journey__cards-slider--enabled');
      if (!enabled) {
        toolbar.style.display = 'none';
        return;
      }
      var canScroll = cardsViewport.scrollWidth > cardsViewport.clientWidth + 2;
      var showNav = isTabletOrMobile.matches && cardsCount > 1 && canScroll;
      toolbar.style.display = showNav ? '' : 'none';
      if (showNav) {
        schedulePaginationUpdate();
      }
    }

    if (cardsViewport && prevBtn && nextBtn && toolbar) {
      prevBtn.addEventListener('click', function () {
        var step = Math.max(220, cardsViewport.clientWidth * 0.8);
        cardsViewport.scrollBy({ left: -step, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', function () {
        var step = Math.max(220, cardsViewport.clientWidth * 0.8);
        cardsViewport.scrollBy({ left: step, behavior: 'smooth' });
      });

      cardsViewport.addEventListener('scroll', function () {
        updateNavState();
        schedulePaginationUpdate();
      });
      isTabletOrMobile.addEventListener('change', function () {
        updateNavState();
        schedulePaginationUpdate();
      });
      window.addEventListener('resize', function () {
        updateNavState();
        schedulePaginationUpdate();
      });
      updateNavState();
      updatePagination();
    }

    if (cardsViewport) {
      cardsViewport.addEventListener(
        'wheel',
        function (event) {
          if (isTabletOrMobile.matches) return;
          if (event.ctrlKey) return;
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

          var el = cardsViewport;
          var maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
          if (maxScroll <= 0) return;

          var dy = normalizeWheelDeltaY(event);
          var st = el.scrollLeft;
          var atStart = st <= 0;
          var atEnd = st >= maxScroll - 1;

          if (dy < 0 && atStart) return;
          if (dy > 0 && atEnd) return;

          event.preventDefault();
          el.scrollLeft = st + dy;
        },
        { passive: false }
      );
    }
  });
})();
