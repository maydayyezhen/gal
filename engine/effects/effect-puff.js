/**
 * effect-puff.js - 烟雾消散特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function puff(options) {
    window.initEffects();
    options = options || {};
    var targetKey = options.target || 'homework_slime';
    var color = options.color || '#ffb0d0';
    var duration = options.duration || 520;
    var p = window.getPointOnSprite(targetKey, options.anchor || { x: 0.55, y: 0.55 });
    var count = options.count || 8;

    for (var i = 0; i < count; i++) {
      var b = document.createElement('div');
      b.className = 'fx-smoke';
      var size = 28 + Math.random() * 40;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = (p.x - size / 2 + (Math.random() - 0.5) * 30) + 'px';
      b.style.top = (p.y - size / 2 + (Math.random() - 0.5) * 24) + 'px';
      b.style.background = color;
      window.effectLayer.appendChild(b);

      var tx = (Math.random() - 0.5) * 80;
      var ty = -(40 + Math.random() * 60);
      try {
        var a = b.animate([
          { transform: 'translate(0px,0px) scale(0.7)', opacity: 0.5 },
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(1.2)', opacity: 0 }
        ], { duration: duration, easing: 'ease-out', fill: 'forwards' });
        a.onfinish = (function(node) {
          return function() {
            if (node && node.parentNode) node.parentNode.removeChild(node);
          };
        })(b);
      } catch (e) {
        setTimeout((function(node) {
          return function() {
            if (node && node.parentNode) node.parentNode.removeChild(node);
          };
        })(b), duration + 40);
      }
    }
  }

  if (GG.effects.register) GG.effects.register('puff', puff);
  else GG.effects.puff = puff;
})();
