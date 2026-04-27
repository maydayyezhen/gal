/**
 * effect-beam.js - 光束特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function beam(options) {
    window.initEffects();
    options = options || {};
    var fromKey = options.from || 'princess';
    var toKey = options.to || options.target || 'homework_slime';
    var color = options.color || '#d080ff';
    var duration = options.duration || 360;
    var width = options.width || 8;
    var delay = options.delay || 0;
    var a = window.getPointOnSprite(fromKey, options.fromAnchor || { x: 0.70, y: 0.42 });
    var b = window.getPointOnSprite(toKey, options.toAnchor || { x: 0.50, y: 0.48 });
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    var beamSrc = window.getRealImgSrc('fx_beam');

    if (beamSrc) {
      var h = Math.max(26, width * 7);
      var img = window.createFxImg('fx-img fx-beam-img', beamSrc, a.x, a.y, len, h);
      img.style.transformOrigin = '0 50%';
      img.style.opacity = '0';
      img.style.transform = 'translateY(-50%) rotate(' + angle + 'deg)';
      window.effectLayer.appendChild(img);
      window.later(function () {
        try {
          img.animate([
            { opacity: 0, transform: 'translateY(-50%) rotate(' + angle + 'deg) scaleX(0.12)' },
            { opacity: 1, transform: 'translateY(-50%) rotate(' + angle + 'deg) scaleX(1)' },
            { opacity: 0, transform: 'translateY(-50%) rotate(' + angle + 'deg) scaleX(1)' }
          ], { duration: duration, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          };
        } catch (e) {
          setTimeout(function () {
            if (img && img.parentNode) img.parentNode.removeChild(img);
          }, duration + 60);
        }
      }, delay);
      return;
    }

    var line = document.createElement('div');
    line.className = 'fx-beam';
    line.style.left = a.x + 'px';
    line.style.top = (a.y - width / 2) + 'px';
    line.style.width = len + 'px';
    line.style.height = width + 'px';
    line.style.background = 'linear-gradient(90deg, ' + color + '00, ' + color + 'cc, ' + color + '00)';
    line.style.filter = 'blur(0.3px) drop-shadow(0 0 10px ' + color + '88)';
    line.style.transformOrigin = '0 50%';
    line.style.transform = 'rotate(' + angle + 'deg)';
    window.effectLayer.appendChild(line);
    window.later(function () {
      try {
        line.animate([
          { opacity: 0, transform: 'rotate(' + angle + 'deg) scaleX(0.2)' },
          { opacity: 1, transform: 'rotate(' + angle + 'deg) scaleX(1)' },
          { opacity: 0, transform: 'rotate(' + angle + 'deg) scaleX(1)' }
        ], { duration: duration, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
          if (line && line.parentNode) line.parentNode.removeChild(line);
        };
      } catch (e) {
        setTimeout(function () {
          if (line && line.parentNode) line.parentNode.removeChild(line);
        }, duration + 60);
      }
    }, delay);
  }

  if (GG.effects.register) GG.effects.register('beam', beam);
  else GG.effects.beam = beam;
})();
