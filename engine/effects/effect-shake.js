/**
 * effect-shake.js - 屏幕震动特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function shake(options) {
    options = options || {};
    var intensity = options.intensity || 10;
    var duration = options.duration || 500;
    var gameScreen = GG.$('#game-container');
    if (!gameScreen) return;

    var startTime = Date.now();
    var originalTransform = gameScreen.style.transform || '';

    function animate() {
      var elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        gameScreen.style.transform = originalTransform;
        return;
      }
      var progress = 1 - elapsed / duration;
      var x = (Math.random() - 0.5) * intensity * progress;
      var y = (Math.random() - 0.5) * intensity * progress;
      gameScreen.style.transform = originalTransform + ' translate(' + x + 'px, ' + y + 'px)';
      requestAnimationFrame(animate);
    }

    animate();
  }

  if (GG.effects.register) GG.effects.register('shake', shake);
  else GG.effects.shake = shake;
})();
