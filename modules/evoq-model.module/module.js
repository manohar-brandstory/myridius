(function () {
  var modules = document.querySelectorAll('.evoq-model');
  if (!modules.length) return;

  modules.forEach(function (moduleEl) {
    var intentNodes = moduleEl.querySelectorAll('[data-intent-node]');
    var outcomeNodes = moduleEl.querySelectorAll('[data-outcome-node]');
    var corePulse = moduleEl.querySelector('.evoq-model__circle--core-pulse');
    var rafId = null;

    function clearState(group) {
      group.nodes.forEach(function (node) { node.classList.remove('is-active'); });
      group.connectors.forEach(function (connector) {
        if (connector.classList.contains('is-active')) {
          connector.classList.remove('is-active');
          connector.classList.add('is-reverting');
          window.setTimeout(function () {
            connector.classList.remove('is-reverting');
          }, 260);
        } else {
          connector.classList.remove('is-reverting');
        }
      });
    }

    function wireGroup(group) {
      group.nodes.forEach(function (node) {
        var index = node.getAttribute(group.nodeAttr);
        var connector = moduleEl.querySelector('[' + group.connectorAttr + '="' + index + '"]');
        if (!connector) return;

        node.addEventListener('mouseenter', function () {
          clearState(group);
          node.classList.add('is-active');
          connector.classList.add('is-active');
        });

        node.addEventListener('mouseleave', function () {
          node.classList.remove('is-active');
          connector.classList.remove('is-active');
        });

        node.addEventListener('focusin', function () {
          clearState(group);
          node.classList.add('is-active');
          connector.classList.add('is-active');
        });

        node.addEventListener('focusout', function () {
          node.classList.remove('is-active');
          connector.classList.remove('is-active');
        });

        node.addEventListener('click', function () {
          clearState(group);
          node.classList.add('is-active');
          connector.classList.add('is-active');
        });
      });
    }

    function animateCorePulse() {
      if (!corePulse) return;
      var t = 0;
      var step = function () {
        t += 0.045;
        var scale = 1 + (Math.sin(t) * 0.055);
        var opacity = 0.20 + (Math.cos(t * 0.85) * 0.09);
        corePulse.style.transform = 'scale(' + scale.toFixed(5) + ')';
        corePulse.style.opacity = Math.max(0.09, Math.min(0.32, opacity)).toFixed(5);
        rafId = window.requestAnimationFrame(step);
      };
      rafId = window.requestAnimationFrame(step);
    }

    wireGroup({
      nodes: intentNodes,
      connectors: moduleEl.querySelectorAll('[data-intent-connector]'),
      nodeAttr: 'data-intent-node',
      connectorAttr: 'data-intent-connector'
    });

    wireGroup({
      nodes: outcomeNodes,
      connectors: moduleEl.querySelectorAll('[data-outcome-connector]'),
      nodeAttr: 'data-outcome-node',
      connectorAttr: 'data-outcome-connector'
    });

    function startCorePulse() {
      if (rafId != null) return;
      animateCorePulse();
    }

    if ('IntersectionObserver' in window) {
      var pulseObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            startCorePulse();
            pulseObserver.unobserve(moduleEl);
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -15% 0px' }
      );
      pulseObserver.observe(moduleEl);
    } else {
      startCorePulse();
    }

    moduleEl.addEventListener('mouseleave', function () {
      clearState({
        nodes: intentNodes,
        connectors: moduleEl.querySelectorAll('[data-intent-connector]')
      });
      clearState({
        nodes: outcomeNodes,
        connectors: moduleEl.querySelectorAll('[data-outcome-connector]')
      });
    });

    window.addEventListener('beforeunload', function () {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  });
})();
