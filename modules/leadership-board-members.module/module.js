(function () {
  var SECTION_SELECTOR = "[data-leadership-board]";
  var TRANSITION_MS = 320;
  var MOBILE_QUERY = "(max-width: 768px)";
  var activeKey = "__leadershipActiveModal";

  function isMobileViewport() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function getScrollbarWidth() {
    return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  }

  var scrollLock = {
    y: 0,
    paddingNodes: [],
  };

  function applyScrollbarPadding() {
    var width = getScrollbarWidth();
    if (!width) return;

    document
      .querySelectorAll("header, [data-global-header], .header, .site-header")
      .forEach(function (node) {
        var style = window.getComputedStyle(node);
        var position = style.position;
        if (position !== "fixed" && position !== "sticky") return;

        var current = parseFloat(style.paddingRight) || 0;
        scrollLock.paddingNodes.push({
          node: node,
          paddingRight: node.style.paddingRight,
        });
        node.style.paddingRight = current + width + "px";
      });
  }

  function clearScrollbarPadding() {
    scrollLock.paddingNodes.forEach(function (entry) {
      entry.node.style.paddingRight = entry.paddingRight;
    });
    scrollLock.paddingNodes = [];
    document.documentElement.style.removeProperty("--leadership-scrollbar-width");
  }

  function lockPageScroll() {
    scrollLock.y = window.scrollY || window.pageYOffset || 0;
    var scrollbarWidth = getScrollbarWidth();

    document.documentElement.classList.add("leadership-modal-open");
    document.body.classList.add("leadership-modal-open");

    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty(
        "--leadership-scrollbar-width",
        scrollbarWidth + "px"
      );
      applyScrollbarPadding();
    }

    if (isMobileViewport()) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = "-" + scrollLock.y + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove("leadership-modal-open");
    document.body.classList.remove("leadership-modal-open");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    clearScrollbarPadding();
    window.scrollTo(0, scrollLock.y);
  }

  function createModalController(section) {
    var modal = section.querySelector("[data-leadership-modal]");
    var modalBody = section.querySelector("[data-leadership-modal-body]");
    if (!modal || !modalBody) return null;

    var state = "closed";
    var closeTimer = null;

    function portalModal() {
      if (modal.parentNode !== document.body) {
        document.body.appendChild(modal);
      }
    }

    function finishClose() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      modal.classList.remove("leadership-modal--closing");
      modal.classList.remove("leadership-modal--open");
      modal.classList.add("leadership-modal--closed");
      modal.setAttribute("aria-hidden", "true");
      unlockPageScroll();
      state = "closed";
      if (window[activeKey] === controller) window[activeKey] = null;
    }

    function openModal(index) {
      if (state === "opening" || state === "open") return;

      if (state === "closing") {
        finishClose();
      }

      var template = section.querySelector(
        '[data-leadership-modal-template="' + index + '"]'
      );
      if (!template) return;

      modalBody.innerHTML = "";
      if (template.content) {
        modalBody.appendChild(template.content.cloneNode(true));
      } else {
        modalBody.innerHTML = template.innerHTML;
      }

      portalModal();
      modal.classList.remove("leadership-modal--closed");
      modal.classList.remove("leadership-modal--closing");
      modal.setAttribute("aria-hidden", "false");
      lockPageScroll();
      state = "opening";
      window[activeKey] = controller;

      void modal.offsetHeight;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          modal.classList.add("leadership-modal--open");
          state = "open";
        });
      });

      var dialog = modal.querySelector(".leadership-modal__dialog");
      if (dialog) dialog.scrollTop = 0;

      var closeBtn = modal.querySelector(".leadership-modal__close");
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function closeModal() {
      if (state === "closed" || state === "closing") return;
      state = "closing";
      modal.classList.remove("leadership-modal--open");
      modal.classList.add("leadership-modal--closing");

      closeTimer = setTimeout(finishClose, TRANSITION_MS + 40);
    }

    function bindModalEvents() {
      if (modal.getAttribute("data-leadership-modal-bound") === "true") return;
      modal.setAttribute("data-leadership-modal-bound", "true");

      var closeBtn = modal.querySelector(".leadership-modal__close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
        });
      }

      var backdrop = modal.querySelector(".leadership-modal__backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", function (e) {
          e.preventDefault();
          closeModal();
        });
      }

      var dialog = modal.querySelector(".leadership-modal__dialog");
      if (dialog) {
        dialog.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    }

    bindModalEvents();

    var controller = {
      close: closeModal,
      isOpen: function () {
        return state === "open" || state === "opening";
      },
    };

    section.addEventListener("click", function (e) {
      var knowMore = e.target.closest("[data-leadership-know-more]");
      if (!knowMore) return;
      e.preventDefault();
      e.stopPropagation();
      openModal(knowMore.getAttribute("data-leadership-know-more"));
    });

    return controller;
  }

  function initCarousel(section) {
    var slides = section.querySelectorAll("[data-leadership-board-slide]");
    if (!slides.length) return;

    var active = 0;
    var curEl = section.querySelector("[data-leadership-board-cur]");
    var btnPrev = section.querySelector("[data-leadership-board-prev]");
    var btnNext = section.querySelector("[data-leadership-board-next]");

    function setActive(idx) {
      active = (idx + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      if (curEl) curEl.textContent = String(active + 1);
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", function () {
        setActive(active - 1);
      });
    }
    if (btnNext) {
      btnNext.addEventListener("click", function () {
        setActive(active + 1);
      });
    }

    setActive(0);
  }

  if (!window.__leadershipModalEscapeBound) {
    window.__leadershipModalEscapeBound = true;
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !window[activeKey]) return;
      window[activeKey].close();
    });
  }

  document.querySelectorAll(SECTION_SELECTOR).forEach(function (section) {
    if (section.getAttribute("data-leadership-board-inited") === "true") return;
    section.setAttribute("data-leadership-board-inited", "true");
    initCarousel(section);
    createModalController(section);
  });
})();
