/**
 * effect-hit.js - 命中特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function hit(options) {
    window.initEffects();
    options = options || {};
    var targetKey = options.target || options.to || 'homework_slime';
    var color = options.color || '#70d0ff';
    var duration = options.duration || 420;
    var size = options.size || 120;
    var delay = options.delay || 0;
    var p = window.getPointOnSprite(targetKey, options.anchor || { x: 0.55, y: 0.50 });
    var ringSrc = window.getRealImgSrc('fx_impact_ring');

    window.later(function () {
      if (ringSrc) {
        var s = Math.max(110, size * 1.9);
        var img = window.createFxImg('fx-img fx-hit-ring-img', ringSrc, p.x - s / 2, p.y - s / 2, s, s);
        img.style.opacity = '0.95';
        img.style.transform = 'rotate(' + ((Math.random() - 0.5) * 18) + 'deg)';
        window.effectLayer.appendChild(img);
        try {
          img.animate([
            { transform: img.style.transform + ' scale(0.35)', opacity: 0.95 },
            { transform: img.style.transform + ' scale(1.05)', opacity: 0.60 },
            { transform: img.style.transform + ' scale(1.35)', opacity: 0 }
          ], { duration: duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }).onfinish = function () {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          };
        } catch (e) {
          setTimeout(function () {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          }, duration + 60);
        }
      } else {
        var ring = document.createElement('div');
        ring.className = 'fx-hit-ring';
        ring.style.left = (p.x - size / 2) + 'px';
        ring.style.top = (p.y - size / 2) + 'px';
        ring.style.width = size + 'px';
        ring.style.height = size + 'px';
        ring.style.borderColor = color;
        ring.style.boxShadow = '0 0 16px ' + color + '66';
        window.effectLayer.appendChild(ring);
        try {
          ring.animate([
            { transform: 'scale(0.35)', opacity: 0.95 },
            { transform: 'scale(1.05)', opacity: 0.6 },
            { transform: 'scale(1.35)', opacity: 0 }
          ], { duration: duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }).onfinish = function () {
            if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
          };
        } catch (e2) {
          setTimeout(function () {
            if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
          }, duration + 60);
        }
      }

      window.spawnSparkBurst(p.x, p.y, {
        count: options.count || 14,
        color: color,
        spread: options.spread || 85,
        duration: Math.max(320, duration - 80),
        sizeMin: 2,
        sizeMax: 7
      });
    }, delay);
  }

  if (GG.effects.register) GG.effects.register('hit', hit);
  else GG.effects.hit = hit;
})();
