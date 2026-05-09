(function () {
  var cards = document.querySelectorAll('[data-action-card]');
  if (!cards.length) return;

  function setActive(card) {
    cards.forEach(function (c) { c.classList.remove('evoq-action__card--active'); });
    card.classList.add('evoq-action__card--active');
  }

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 769px)').matches) {
        setActive(card);
      }
    });
    card.addEventListener('click', function () {
      setActive(card);
    });
  });
})();
