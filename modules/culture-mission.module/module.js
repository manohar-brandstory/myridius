(function () {
  var sections = document.querySelectorAll("[data-culture-mission]");
  if (!sections.length) return;

  sections.forEach(function (section) {
    var media = section.querySelector(".cult-mission__media--video[data-video-src]");
    var playBtn = section.querySelector(".cult-mission__play");

    if (media && playBtn) {
      playBtn.addEventListener("click", function () {
        var src = media.getAttribute("data-video-src");
        if (!src) return;

        var video = document.createElement("video");
        video.className = "cult-mission__video";
        video.setAttribute("controls", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("autoplay", "");

        var source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";
        video.appendChild(source);

        media.classList.add("is-playing");
        media.appendChild(video);
        video.play();
      });
    }

    if ("IntersectionObserver" in window) {
      var srEls = section.querySelectorAll("[data-sr]");
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
  });
})();
