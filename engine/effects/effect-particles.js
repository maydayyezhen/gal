/**
 * effect-particles.js - 一次性粒子特效
 */
(function () {
  var GG = window.GG = window.GG || {};
  GG.effects = GG.effects || {};

  function particles(options) {
    window.initEffects();
    options = options || {};
    var type = options.type || 'sparkle';
    var count = options.count || 30;
    var duration = options.duration || 3000;
    var parts = [];

    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * window.particlesCanvas.width,
        y: Math.random() * window.particlesCanvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 4 + 2,
        alpha: Math.random() * 0.5 + 0.5,
        color: window.getParticleColor(type)
      });
    }

    var startTime = Date.now();

    function animate() {
      var elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        window.particlesCtx.clearRect(0, 0, window.particlesCanvas.width, window.particlesCanvas.height);
        return;
      }

      window.particlesCtx.clearRect(0, 0, window.particlesCanvas.width, window.particlesCanvas.height);
      parts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > window.particlesCanvas.height) p.y = 0;
        if (p.x < 0) p.x = window.particlesCanvas.width;
        if (p.x > window.particlesCanvas.width) p.x = 0;
        window.particlesCtx.globalAlpha = p.alpha;
        window.particlesCtx.fillStyle = p.color;
        window.particlesCtx.beginPath();
        window.particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        window.particlesCtx.fill();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  if (GG.effects.register) GG.effects.register('particles', particles);
  else GG.effects.particles = particles;
})();
