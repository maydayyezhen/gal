/**
 * effect-flash.js - 闪屏特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function flash(options) {
    window.initEffects();
    options = options || {};
    var color = options.color || '#ffffff';
    var duration = options.duration || 300;
    var flashDiv = document.createElement('div');
    flashDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:' + color + ';opacity:0.8;';
    window.effectLayer.appendChild(flashDiv);

    setTimeout(function () {
      flashDiv.style.transition = 'opacity ' + (duration / 2) + 'ms';
      flashDiv.style.opacity = '0';
      setTimeout(function () {
        if (flashDiv && flashDiv.parentNode) flashDiv.parentNode.removeChild(flashDiv);
      }, duration / 2);
    }, 50);
  }

  if (GG.effects.register) GG.effects.register('flash', flash);
  else GG.effects.flash = flash;
})();
