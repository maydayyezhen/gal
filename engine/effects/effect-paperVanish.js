/**
 * effect-paperVanish.js - 纸张消散特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function paperVanish(options) {
    window.initEffects();
    options = options || {};
    var targetKey = options.target || 'homework_slime';
    var variant = options.variant || 'stack';
    var duration = options.duration || 420;
    var size = options.size || 180;
    var delay = options.delay || 0;
    var p = window.getPointOnSprite(targetKey, options.anchor || { x: 0.56, y: 0.48 });
    var id = variant === 'sheet' ? 'fx_paper_sheet' : 'fx_paper_stack';
    var src = window.getRealImgSrc(id);

    window.later(function () {
      if (!src) {
        window.spawnSparkBurst(p.x, p.y, {
          count: 14,
          color: '#ffffff',
          spread: 90,
          duration: Math.max(280, duration - 60)
        });
        return;
      }

      var w = Math.max(120, size);
      var img = window.createFxImg('fx-img fx-paper-img', src, p.x - w / 2, p.y - w / 2, w, w);
      img.style.opacity = '0.95';
      img.style.transform = 'rotate(' + ((Math.random() - 0.5) * 12) + 'deg)';
      window.effectLayer.appendChild(img);

      try {
        img.animate([
          { transform: img.style.transform + ' scale(1)', opacity: 0.95, filter: 'blur(0px)' },
          { transform: img.style.transform + ' scale(1.05)', opacity: 0.9, filter: 'blur(0px)' },
          { transform: img.style.transform + ' scale(0.75)', opacity: 0, filter: 'blur(1.2px)' }
        ], { duration: duration, easing: 'cubic-bezier(0.18,0.9,0.2,1)', fill: 'forwards' }).onfinish = function () {
          if (img && img.parentNode) img.parentNode.removeChild(img);
        };
      } catch (e) {
        setTimeout(function () {
          if (img && img.parentNode) img.parentNode.removeChild(img);
        }, duration + 60);
      }

      window.spawnSparkBurst(p.x, p.y, {
        count: 8,
        color: '#ffffff',
        spread: 120,
        duration: Math.max(260, duration - 80),
        sizeMin: 2,
        sizeMax: 5
      });
    }, delay);
  }

  if (GG.effects.register) GG.effects.register('paperVanish', paperVanish);
  else GG.effects.paperVanish = paperVanish;
})();
