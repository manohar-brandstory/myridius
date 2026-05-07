(function () {
  var root =
    document.currentScript &&
    document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  var sections = scope.querySelectorAll(".svc-ind");
  if (!sections.length) return;

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function init(section) {
    if (section.getAttribute("data-svc-ind-inited") === "true") return;
    section.setAttribute("data-svc-ind-inited", "true");

    var cards = section.querySelectorAll(".svc-ind__card");
    if (!cards.length) return;

    var grid = section.querySelector(".svc-ind__grid");
    var mobNav = section.querySelector(".svc-ind__mob-nav");
    var isTouchDevice =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    var mobileQuery = window.matchMedia("(max-width: 768px)");

    /* ── Desktop: row-hover logic ── */
    if (!isTouchDevice && !mobileQuery.matches) {
      cards.forEach(function (card) {
        card.addEventListener("mouseenter", function () {
          var hoveredRow = card.getAttribute("data-svc-ind-row");

          cards.forEach(function (c) {
            var cRow = c.getAttribute("data-svc-ind-row");
            if (cRow === hoveredRow) {
              c.setAttribute("data-svc-ind-row-active", "true");
            } else {
              c.removeAttribute("data-svc-ind-row-active");
            }
            c.removeAttribute("data-svc-ind-active");
          });

          card.setAttribute("data-svc-ind-active", "true");
        });
      });

      if (grid) {
        grid.addEventListener("mouseleave", function () {
          cards.forEach(function (c) {
            c.removeAttribute("data-svc-ind-row-active");
            c.removeAttribute("data-svc-ind-active");
          });
        });
      }
    }

    /* ── Mobile: carousel navigation ── */
    if (mobNav && grid) {
      var prevBtn = mobNav.querySelector(".svc-ind__mob-prev");
      var nextBtn = mobNav.querySelector(".svc-ind__mob-next");
      var currentEl = mobNav.querySelector(".svc-ind__mob-current");
      var totalEl = mobNav.querySelector(".svc-ind__mob-total");
      var cardCount = cards.length;
      var currentIndex = 0;

      if (totalEl) totalEl.textContent = pad(cardCount);

      function scrollToCard(index) {
        if (index < 0) index = 0;
        if (index >= cardCount) index = cardCount - 1;
        currentIndex = index;
        var card = cards[index];
        if (card && grid) {
          grid.scrollTo({
            left: card.offsetLeft - grid.offsetLeft,
            behavior: "smooth"
          });
        }
        if (currentEl) currentEl.textContent = pad(currentIndex + 1);
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
          e.preventDefault();
          scrollToCard(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
          e.preventDefault();
          scrollToCard(currentIndex + 1);
        });
      }

      var scrollTimer;
      grid.addEventListener("scroll", function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          var scrollLeft = grid.scrollLeft;
          var closestIdx = 0;
          var closestDist = Infinity;
          cards.forEach(function (card, i) {
            var dist = Math.abs(card.offsetLeft - grid.offsetLeft - scrollLeft);
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = i;
            }
          });
          currentIndex = closestIdx;
          if (currentEl) currentEl.textContent = pad(currentIndex + 1);
        }, 80);
      });
    }

    /* Recalculate row indices when the grid column count changes */
    function updateRowIndices() {
      var newIsMobile = mobileQuery.matches;
      var isTablet = window.matchMedia("(max-width: 1024px)").matches;
      var cols = newIsMobile ? 1 : isTablet ? 2 : 3;

      cards.forEach(function (card, i) {
        card.setAttribute("data-svc-ind-row", Math.floor(i / cols));
      });
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateRowIndices, 150);
    });
    updateRowIndices();

    /* Scroll reveal */
    var srEls = section.querySelectorAll("[data-sr]");
    if (srEls.length && "IntersectionObserver" in window) {
      srEls.forEach(function (el) {
        el.classList.add("is-sr-hidden");
      });

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove("is-sr-hidden");
            entry.target.classList.add("is-sr-shown");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.14 }
      );

      srEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  sections.forEach(init);
})();
