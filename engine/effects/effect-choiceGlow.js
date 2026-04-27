/**
 * effect-choiceGlow.js - 选项按钮短暂发光
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function choiceGlow(buttonElement) {
    if (!buttonElement) return;
    buttonElement.style.boxShadow = '0 0 20px rgba(255,200,100,0.8)';
    setTimeout(function () {
      buttonElement.style.boxShadow = '';
    }, 300);
  }

  if (GG.effects.register) GG.effects.register('choiceGlow', choiceGlow);
  else GG.effects.choiceGlow = choiceGlow;
})();
