/**
 * effect-ripple.js - 波纹扩散特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function ripple(options) {
    window.initEffects();
    options = options || {};
    var x = options.x || window.innerWidth * 0.5;
    var y = options.y || window.innerHeight * 0.5;
    var size = options.size || 160;
    var duration = options.duration || 680;
    var color = options.color || 'rgba(255,255,255,0.38)';

    var ring = document.createElement('div');
    ring.className = 'fx-ripple';
    ring.style.left = (x - size / 2) + 'px';
    ring.style.top = (y - size / 2) + 'px';
    ring.style.width = size + 'px';
    ring.style.height = size + 'px';
    ring.style.borderColor = color;
    window.effectLayer.appendChild(ring);

    try {
      ring.animate([
        { transform: 'scale(0.2)', opacity: 0.85 },
        { transform: 'scale(1.15)', opacity: 0 }
      ], { duration: duration, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
        if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
      };
    } catch (e) {
      setTimeout(function () {
        if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
      }, duration + 40);
    }
  }

  if (GG.effects.register) GG.effects.register('ripple', ripple);
  else GG.effects.ripple = ripple;
})();
