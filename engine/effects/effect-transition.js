/**
 * effect-transition.js - 通用转场特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function transition(options) {
    window.initEffects();
    options = options || {};
    var duration = options.duration || 500;
    var color = options.color || '#000000';
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;background:' + color + ';opacity:0;pointer-events:none;';
    window.effectLayer.appendChild(overlay);

    try {
      overlay.animate([
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: duration,
        easing: 'ease-in-out',
        fill: 'forwards'
      }).onfinish = function () {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };
    } catch (e) {
      setTimeout(function () {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, duration + 40);
    }
  }

  if (GG.effects.register) GG.effects.register('transition', transition);
  else GG.effects.transition = transition;
})();
