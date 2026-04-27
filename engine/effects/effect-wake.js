/**
 * effect-wake.js - 醒来柔光特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function wake(options) {
    window.initEffects();
    options = options || {};
    var duration = options.duration || 780;
    var color = options.color || 'rgba(240,198,116,0.22)';
    var delay = options.delay || 0;
    var glowSrc = window.getRealImgSrc('fx_eye_glow');

    var overlay = document.createElement('div');
    overlay.className = 'fx-wake-overlay';
    overlay.style.opacity = '0';
    overlay.style.background = 'radial-gradient(ellipse at 50% 40%, ' + color + ' 0%, rgba(0,0,0,0) 62%), radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0) 55%)';
    window.effectLayer.appendChild(overlay);

    var glow = null;
    if (glowSrc) {
      var s = Math.min(window.innerWidth, window.innerHeight) * 0.48;
      glow = window.createFxImg('fx-img fx-eye-glow-img', glowSrc, window.innerWidth / 2 - s / 2, window.innerHeight * 0.42 - s / 2, s, s);
      glow.style.opacity = '0';
      window.effectLayer.appendChild(glow);
    }

    window.spawnSparkBurst(window.innerWidth * 0.5, window.innerHeight * 0.42, {
      count: options.count || 16,
      color: options.sparkColor || '#f0c674',
      spread: options.spread || 120,
      duration: Math.min(620, duration)
    });

    window.later(function () {
      try {
        overlay.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
          duration: duration,
          easing: 'ease-out',
          fill: 'forwards'
        }).onfinish = function () {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };
      } catch (e) {
        setTimeout(function () {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, duration + 60);
      }

      if (glow) {
        try {
          glow.animate([
            { opacity: 0, transform: 'scale(0.88)' },
            { opacity: 0.85, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(1.06)' }
          ], { duration: Math.min(720, duration), easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
            if (glow && glow.parentNode) glow.parentNode.removeChild(glow);
          };
        } catch (e2) {
          setTimeout(function () {
            if (glow && glow.parentNode) glow.parentNode.removeChild(glow);
          }, duration + 60);
        }
      }
    }, delay);
  }

  if (GG.effects.register) GG.effects.register('wake', wake);
  else GG.effects.wake = wake;
})();
