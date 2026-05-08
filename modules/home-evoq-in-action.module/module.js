(function () {
  'use strict';

  var BREAKPOINT = 768;

  function qsAll(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function setExpanded(shells, target) {
    shells.forEach(function (s) {
      var open = s === target;
      s.classList.toggle('is-expanded', open);
      s.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initIntro(section) {
    var intro = section.querySelector('[data-evoq-intro]');
    if (!intro) return;
    if (!('IntersectionObserver' in window)) {
      intro.classList.add('is-in-view');
      return;
    }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intro.classList.add('is-in-view');
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in-view');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    io.observe(intro);
  }

  function initSection(section) {
    initIntro(section);
    var shells = qsAll('.home-evoq__shell', section);
    if (!shells.length) return;

    function desktop() {
      return window.innerWidth >= BREAKPOINT;
    }

    function bind() {
      shells.forEach(function (shell, idx) {
        shell.removeEventListener('mouseenter', shell.__evoqMu);
        shell.removeEventListener('click', shell.__evoqMc);
        shell.removeEventListener('keydown', shell.__evoqKd);
      });

      shells.forEach(function (shell, idx) {
        shell.__evoqMu = function () {
          if (desktop()) setExpanded(shells, shell);
        };
        shell.__evoqMc = function () {
          setExpanded(shells, shell);
        };
        shell.__evoqKd = function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          setExpanded(shells, shell);
        };

        if (desktop()) {
          shell.addEventListener('mouseenter', shell.__evoqMu);
        }
        shell.addEventListener('click', shell.__evoqMc);
        shell.addEventListener('keydown', shell.__evoqKd);
      });
    }

    shells.forEach(function (s) {
      if (!s.getAttribute('role')) s.setAttribute('role', 'button');
      var open = s.classList.contains('is-expanded');
      s.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    var rTimer;
    function onResize() {
      window.clearTimeout(rTimer);
      rTimer = window.setTimeout(bind, 120);
    }

    bind();
    window.addEventListener('resize', onResize);
  }

  function onReady() {
    qsAll('.home-evoq').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
