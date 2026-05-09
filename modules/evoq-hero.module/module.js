(function () {
  var heroes = document.querySelectorAll(".evoq-hero");
  if (!heroes.length) return;

  function initTyping(hero) {
    var ideBody = hero.querySelector(".evoq-hero__ide-body");
    if (!ideBody) return;

    var pre = ideBody.querySelector("pre");
    if (!pre || pre.getAttribute("data-evoq-typed") === "true") return;
    pre.setAttribute("data-evoq-typed", "true");

    var walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var currentNode = walker.nextNode();

    while (currentNode) {
      nodes.push({
        node: currentNode,
        fullText: currentNode.nodeValue || ""
      });
      currentNode.nodeValue = "";
      currentNode = walker.nextNode();
    }

    var cursor = document.createElement("span");
    cursor.className = "evoq-hero__cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.textContent = "▋";
    pre.appendChild(cursor);

    var nodeIndex = 0;
    var charIndex = 0;
    var baseDelay = 22;

    function nextDelay(char) {
      if (char === "\n") return 70;
      if (char === "," || char === ":" || char === ".") return 40;
      return baseDelay;
    }

    function typeNext() {
      if (nodeIndex >= nodes.length) return;

      var item = nodes[nodeIndex];
      if (!item.fullText.length) {
        nodeIndex += 1;
        charIndex = 0;
        window.setTimeout(typeNext, 0);
        return;
      }

      charIndex += 1;
      item.node.nodeValue = item.fullText.slice(0, charIndex);

      if (charIndex >= item.fullText.length) {
        nodeIndex += 1;
        charIndex = 0;
      }

      var typedChar = item.node.nodeValue.charAt(item.node.nodeValue.length - 1);
      window.setTimeout(typeNext, nextDelay(typedChar));
    }

    typeNext();
  }

  heroes.forEach(function (hero) {
    var glow1 = hero.querySelector(".evoq-hero__glow--1");
    var glow2 = hero.querySelector(".evoq-hero__glow--2");
    initTyping(hero);
    if (!glow1 || !glow2) return;

    var t = 0;
    function animate() {
      t += 0.008;

      var g1x = Math.sin(t) * 40;
      var g1y = Math.cos(t * 0.9) * -24;
      var g1s = 1.12 + Math.sin(t * 1.1) * 0.05;
      glow1.style.transform = "translateX(" + g1x.toFixed(3) + "px) translateY(" + g1y.toFixed(3) + "px) scale(" + g1s.toFixed(5) + ")";

      var g2x = Math.sin(t * 0.7) * -3;
      var g2y = Math.cos(t * 0.7) * 3;
      var g2s = 1.18 + Math.sin(t * 0.8) * 0.01;
      glow2.style.transform = "translateX(" + g2x.toFixed(3) + "px) translateY(" + g2y.toFixed(3) + "px) scale(" + g2s.toFixed(5) + ")";

      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
  });
})();
