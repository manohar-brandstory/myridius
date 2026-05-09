(function () {
  var sections = document.querySelectorAll('.evoq-journey');
  if (!sections.length) return;

  sections.forEach(function (section) {
    var stages = section.querySelectorAll('.evoq-journey__stage');
    var cards = section.querySelectorAll('.evoq-journey__card');
    var cardsTrack = section.querySelector('.evoq-journey__cards');
    var cardsViewport = section.querySelector('.evoq-journey__cards-viewport');
    var cardsCount = parseInt(cardsTrack && cardsTrack.getAttribute('data-card-count'), 10) || cards.length;
    var prevBtn = section.querySelector('.evoq-journey__cards-nav--prev');
    var nextBtn = section.querySelector('.evoq-journey__cards-nav--next');
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

    function updateNavState() {
      if (!cardsViewport || !prevBtn || !nextBtn) return;
      var canScroll = cardsViewport.scrollWidth > cardsViewport.clientWidth + 2;
      var showNav = isTabletOrMobile.matches && cardsCount > 1 && canScroll;
      prevBtn.style.display = showNav ? 'inline-flex' : 'none';
      nextBtn.style.display = showNav ? 'inline-flex' : 'none';
    }

    if (cardsViewport && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function () {
        var step = Math.max(220, cardsViewport.clientWidth * 0.8);
        cardsViewport.scrollBy({ left: -step, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', function () {
        var step = Math.max(220, cardsViewport.clientWidth * 0.8);
        cardsViewport.scrollBy({ left: step, behavior: 'smooth' });
      });

      cardsViewport.addEventListener('scroll', updateNavState);
      isTabletOrMobile.addEventListener('change', updateNavState);
      window.addEventListener('resize', updateNavState);
      updateNavState();
    }

    if (cardsViewport) {
      cardsViewport.addEventListener('wheel', function (event) {
        if (isTabletOrMobile.matches) return;
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          cardsViewport.scrollBy({ left: event.deltaY, behavior: 'smooth' });
        }
      }, { passive: false });
    }
  });
})();
