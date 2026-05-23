(function () {
  var root = document.currentScript && document.currentScript.closest(".hs_cos_wrapper_type_module");
  var scope = root || document;
  if (!scope.querySelectorAll) return;

  scope.querySelectorAll(".evt").forEach(function (section) {
    if (!section || section.getAttribute("data-evt-inited") === "true") return;
    section.setAttribute("data-evt-inited", "true");

    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-evt-card]"));
    var tabs = section.querySelectorAll(".evt__tab");
    var filterSelect = section.querySelector("[data-evt-filter-select]");
    var list = section.querySelector("[data-evt-list]");
    var perPageSelect = section.querySelector("[data-evt-per-page]");
    var rangeEl = section.querySelector("[data-evt-range]");
    var pageNumsEl = section.querySelector("[data-evt-page-nums]");
    var prevBtn = section.querySelector("[data-evt-prev]");
    var nextBtn = section.querySelector("[data-evt-next]");
    var countEls = section.querySelectorAll("[data-evt-count]");
    var filterCountEl = section.querySelector("[data-evt-filter-count]");
    var filterLabelEl = section.querySelector("[data-evt-filter-label]");

    var singleFilterEl = section.querySelector("[data-evt-single-filter]");
    var defaultFilter = "all";
    if (tabs.length) {
      defaultFilter = tabs[0].getAttribute("data-evt-filter") || "all";
    } else if (singleFilterEl) {
      defaultFilter = singleFilterEl.getAttribute("data-evt-single-filter") || "all";
    }

    var activeFilter = defaultFilter;
    var currentPage = 1;

    function getFilteredCards() {
      if (activeFilter === "all") return cards;
      return cards.filter(function (card) {
        return card.getAttribute("data-evt-status") === activeFilter;
      });
    }

    function getCountForFilter(filter) {
      if (!filter || filter === "all") return cards.length;
      return cards.filter(function (c) {
        return c.getAttribute("data-evt-status") === filter;
      }).length;
    }

    function updateTabCounts() {
      countEls.forEach(function (el) {
        var key = el.getAttribute("data-evt-count");
        el.textContent = String(getCountForFilter(key));
      });
      if (filterCountEl) {
        filterCountEl.textContent = String(getCountForFilter(activeFilter));
      }
      if (filterSelect && filterLabelEl) {
        var selectedOption = filterSelect.options[filterSelect.selectedIndex];
        if (selectedOption) {
          filterLabelEl.textContent = selectedOption.textContent;
        }
      }
    }

    function getPerPage() {
      var val = perPageSelect ? parseInt(perPageSelect.value, 10) : 4;
      return isNaN(val) || val < 1 ? 4 : val;
    }

    function render() {
      var filtered = getFilteredCards();
      var perPage = getPerPage();
      var total = filtered.length;
      var totalPages = Math.max(1, Math.ceil(total / perPage));

      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      var start = (currentPage - 1) * perPage;
      var end = start + perPage;

      cards.forEach(function (card) {
        card.classList.add("is-hidden");
        card.setAttribute("hidden", "hidden");
      });

      filtered.forEach(function (card, index) {
        var visible = index >= start && index < end;
        if (visible) {
          card.classList.remove("is-hidden");
          card.removeAttribute("hidden");
        }
      });

      if (rangeEl) {
        if (!total) {
          rangeEl.textContent = "0-0 of 0 items";
        } else {
          var from = start + 1;
          var to = Math.min(end, total);
          rangeEl.textContent = from + "-" + to + " of " + total + " items";
        }
      }

      if (pageNumsEl) {
        pageNumsEl.innerHTML = "";
        for (var p = 1; p <= totalPages; p++) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "evt__pageNum" + (p === currentPage ? " is-active" : "");
          btn.textContent = String(p);
          btn.setAttribute("data-evt-page", String(p));
          btn.setAttribute("aria-label", "Page " + p);
          if (p === currentPage) btn.setAttribute("aria-current", "page");
          pageNumsEl.appendChild(btn);
        }
      }

      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    function setActiveFilter(filter) {
      activeFilter = filter || defaultFilter;
      currentPage = 1;
      tabs.forEach(function (t) {
        var isActive = t.getAttribute("data-evt-filter") === activeFilter;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      if (filterSelect && filterSelect.value !== activeFilter) {
        filterSelect.value = activeFilter;
      }
      updateTabCounts();
      render();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        setActiveFilter(tab.getAttribute("data-evt-filter") || "all");
      });
    });

    if (filterSelect) {
      filterSelect.addEventListener("change", function () {
        setActiveFilter(filterSelect.value || "all");
      });
    }

    if (perPageSelect) {
      perPageSelect.addEventListener("change", function () {
        currentPage = 1;
        render();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage -= 1;
          render();
          if (list) list.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var totalPages = Math.max(1, Math.ceil(getFilteredCards().length / getPerPage()));
        if (currentPage < totalPages) {
          currentPage += 1;
          render();
          if (list) list.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }

    section.addEventListener("click", function (e) {
      var pageBtn = e.target.closest("[data-evt-page]");
      if (pageBtn && section.contains(pageBtn)) {
        currentPage = parseInt(pageBtn.getAttribute("data-evt-page"), 10) || 1;
        render();
        return;
      }

      var moreBtn = e.target.closest("[data-evt-more-btn]");
      if (moreBtn && section.contains(moreBtn)) {
        var attendeesWrap = moreBtn.closest("[data-evt-attendees]");
        if (attendeesWrap) {
          var expanded = attendeesWrap.classList.toggle("is-expanded");
          var labelEl = moreBtn.querySelector("[data-evt-more-label]");
          var openText = moreBtn.getAttribute("data-evt-more-open") || (labelEl ? labelEl.textContent.trim() : moreBtn.textContent.trim());
          var closeText = moreBtn.getAttribute("data-evt-more-close") || "Close";
          moreBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
          if (labelEl) {
            labelEl.textContent = expanded ? closeText : openText;
          } else {
            moreBtn.textContent = expanded ? closeText : openText;
          }
        }
        return;
      }
    });

    updateTabCounts();
    render();
  });
})();
