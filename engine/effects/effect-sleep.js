/**
 * effect-sleep.js - 睡眠 / 梦境氛围特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function sleep(options) {
    window.initEffects();
    options = options || {};
    var duration = options.duration || 900;
    var hold = options.hold || 0;
    var fadeIn = options.fadeIn != null ? options.fadeIn : 260;
    var fadeOut = options.fadeOut != null ? options.fadeOut : 360;
    var strength = options.strength || 0.55;
    var zCount = options.zCount || 7;
    var zColor = options.zColor || 'rgba(255,255,255,0.22)';
    var delay = options.delay || 0;
    var bokehSrc = window.getRealImgSrc('fx_dream_bokeh');
    var zzzSrc = window.getRealImgSrc('fx_zzz');

    var overlay = document.createElement('div');
    overlay.className = 'fx-sleep-overlay';
    overlay.style.opacity = '0';
    if (bokehSrc) {
      overlay.style.backgroundImage = 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.0) 0%, rgba(0,0,0,' + (strength * 0.85) + ') 70%, rgba(0,0,0,' + strength + ') 100%), url(' + bokehSrc + ')';
      overlay.style.backgroundSize = 'cover, cover';
      overlay.style.backgroundPosition = 'center, center';
    } else {
      overlay.style.background = 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.0) 0%, rgba(0,0,0,' + (strength * 0.85) + ') 70%, rgba(0,0,0,' + strength + ') 100%)';
    }
    window.effectLayer.appendChild(overlay);

    for (var i = 0; i < zCount; i++) {
      var x = window.innerWidth * (0.62 + Math.random() * 0.28);
      var y = window.innerHeight * (0.62 + Math.random() * 0.20);
      var node;
      if (zzzSrc) {
        var s = 42 + Math.random() * 34;
        node = window.createFxImg('fx-img fx-zzz-img', zzzSrc, x, y, s, s);
        node.style.opacity = '0';
      } else {
        node = document.createElement('div');
        node.className = 'fx-zzz';
        node.textContent = i % 3 === 0 ? 'Z' : 'z';
        node.style.color = zColor;
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.style.fontSize = (18 + Math.random() * 16) + 'px';
      }
      window.effectLayer.appendChild(node);
      (function (n) {
        var tx = (Math.random() - 0.5) * 90;
        var ty = -(120 + Math.random() * 80);
        try {
          n.animate([
            { transform: 'translate(0px,0px)', opacity: 0 },
            { transform: 'translate(' + (tx * 0.2) + 'px,' + (ty * 0.2) + 'px)', opacity: 0.65 },
            { transform: 'translate(' + tx + 'px,' + ty + 'px)', opacity: 0 }
          ], { duration: duration, easing: 'ease-out', fill: 'forwards', delay: Math.random() * 140 }).onfinish = function () {
            if (n && n.parentNode) n.parentNode.removeChild(n);
          };
        } catch (e) {
          setTimeout(function () {
            if (n && n.parentNode) n.parentNode.removeChild(n);
          }, duration + 200);
        }
      })(node);
    }

    window.later(function () {
      try {
        overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeIn, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
          setTimeout(function () {
            overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeOut, easing: 'ease-in', fill: 'forwards' }).onfinish = function () {
              if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            };
          }, hold);
        };
      } catch (e) {
        setTimeout(function () {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, fadeIn + hold + fadeOut);
      }
    }, delay);
  }

  if (GG.effects.register) GG.effects.register('sleep', sleep);
  else GG.effects.sleep = sleep;
})();
