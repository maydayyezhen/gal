/**
 * effect-dialogShake.js - 对话框抖动
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function dialogShake() {
    var dialogBox = GG.$('#dialog-box');
    if (!dialogBox) return;
    var originalTransform = dialogBox.style.transform || '';
    var start = Date.now();
    var duration = 280;

    function doShake() {
      var elapsed = Date.now() - start;
      if (elapsed >= duration) {
        dialogBox.style.transform = originalTransform;
        return;
      }
      var x = (Math.random() - 0.5) * 6;
      dialogBox.style.transform = originalTransform + ' translateX(' + x + 'px)';
      requestAnimationFrame(doShake);
    }

    doShake();
  }

  if (GG.effects.register) GG.effects.register('dialogShake', dialogShake);
  else GG.effects.dialogShake = dialogShake;
})();
