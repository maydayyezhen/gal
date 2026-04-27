/**
 * effect-textShake.js - 对话文字抖动
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function textShake() {
    var dialogText = GG.$('#dialog-text');
    if (!dialogText) return;
    dialogText.style.animation = 'text-shake 0.25s linear 2';
    setTimeout(function () {
      dialogText.style.animation = '';
    }, 520);
  }

  if (GG.effects.register) GG.effects.register('textShake', textShake);
  else GG.effects.textShake = textShake;
})();
