/**
 * effect-spell.js - 施法光环特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function spell(options) {
    window.initEffects();
    options = options || {};
    var caster = options.caster || 'princess';
    var color = options.color || '#d080ff';
    var duration = options.duration || 650;
    var size = options.size || 160;
    var delay = options.delay || 0;
    var p = window.getPointOnSprite(caster, options.anchor || { x: 0.68, y: 0.42 });
    var magicSrc = window.getRealImgSrc('fx_magic_circle');

    if (magicSrc) {
      var s = Math.max(140, size * 1.9);
      var img = window.createFxImg('fx-img fx-magic-circle-img', magicSrc, p.x - s / 2, p.y - s / 2, s, s);
      img.style.opacity = '0';
      window.effectLayer.appendChild(img);
      window.later(function () {
        try {
          img.animate([
            { transform: 'scale(0.55) rotate(0deg)', opacity: 0 },
            { transform: 'scale(1) rotate(120deg)', opacity: 0.92 },
            { transform: 'scale(1.18) rotate(260deg)', opacity: 0 }
          ], { duration: duration, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          };
        } catch (e) {
          setTimeout(function () {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          }, duration + 60);
        }
      }, delay);
    } else {
      var ring = document.createElement('div');
      ring.className = 'fx-magic-ring';
      ring.style.left = (p.x - size / 2) + 'px';
      ring.style.top = (p.y - size / 2) + 'px';
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
      ring.style.borderColor = color;
      ring.style.boxShadow = '0 0 18px ' + color + '66, 0 0 40px ' + color + '33';
      window.effectLayer.appendChild(ring);
      window.later(function () {
        try {
          ring.animate([
            { transform: 'scale(0.6) rotate(0deg)', opacity: 0 },
            { transform: 'scale(1) rotate(110deg)', opacity: 0.9 },
            { transform: 'scale(1.15) rotate(220deg)', opacity: 0 }
          ], { duration: duration, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
            if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
          };
        } catch (e) {
          setTimeout(function () {
            if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
          }, duration + 60);
        }
      }, delay);
    }

    window.later(function () {
      window.spawnSparkBurst(p.x, p.y, {
        count: options.count || 20,
        color: color,
        spread: options.spread || 95,
        duration: Math.max(420, duration - 80)
      });
    }, delay);
  }

  if (GG.effects.register) GG.effects.register('spell', spell);
  else GG.effects.spell = spell;
})();
