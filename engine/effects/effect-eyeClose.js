/**
 * effect-eyeClose.js - 闭眼黑场特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function eyeClose(options) {
    window.initEffects();
    options = options || {};
    var duration = options.duration || 520;
    var hold = options.hold || 0;
    var persist = !!options.persist;
    var blur = options.blur || 0;

    var wrap = document.getElementById('fx-eye-wrap');
    var top;
    var bottom;

    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'fx-eye-wrap';
      wrap.id = 'fx-eye-wrap';
      window.effectLayer.appendChild(wrap);
      top = document.createElement('div');
      top.className = 'fx-eyelid top';
      bottom = document.createElement('div');
      bottom.className = 'fx-eyelid bottom';
      wrap.appendChild(top);
      wrap.appendChild(bottom);
    } else {
      top = wrap.querySelector('.fx-eyelid.top');
      bottom = wrap.querySelector('.fx-eyelid.bottom');
    }

    if (!top || !bottom) return;
    top.style.transform = 'translateY(-100%)';
    bottom.style.transform = 'translateY(100%)';

    var gameScreen = GG.$('#game-container');
    var oldFilter = gameScreen ? (gameScreen.style.filter || '') : '';
    if (gameScreen && blur) {
      gameScreen.style.transition = 'filter 180ms ease';
      gameScreen.style.filter = (oldFilter ? oldFilter + ' ' : '') + 'blur(' + blur + 'px) brightness(0.95)';
      setTimeout(function () {
        gameScreen.style.filter = oldFilter;
        setTimeout(function () { gameScreen.style.transition = ''; }, 220);
      }, Math.min(240, duration));
    }

    function removeWrap() {
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }

    try {
      top.animate([{ transform: 'translateY(-100%)' }, { transform: 'translateY(0%)' }], {
        duration: duration,
        easing: 'cubic-bezier(0.2,0.8,0.2,1)',
        fill: 'forwards'
      });
      bottom.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0%)' }], {
        duration: duration,
        easing: 'cubic-bezier(0.2,0.8,0.2,1)',
        fill: 'forwards'
      }).onfinish = function () {
        if (!persist) setTimeout(removeWrap, hold);
      };
    } catch (e) {
      top.style.transform = 'translateY(0%)';
      bottom.style.transform = 'translateY(0%)';
      if (!persist) setTimeout(removeWrap, duration + hold + 40);
    }
  }

  if (GG.effects.register) GG.effects.register('eyeClose', eyeClose);
  else GG.effects.eyeClose = eyeClose;
})();
