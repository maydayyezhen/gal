/**
 * particleSystem.js — 粒子特效系统
 * 
 * 支持效果：
 *   sparkle  — 亮闪闪光点
 *   sakura   — 樱花飘落
 *   snow     — 雪花飘落
 *   firefly  — 萤火虫
 *   rain     — 细雨
 *   petals   — 花瓣（暖色）
 *   dust     — 光尘浮动
 *   stars    — 星空闪烁
 *
 * 剧本中使用：场景添加 "particles": "sakura"
 * 可组合多个效果（逗号分隔）："particles": "sakura,sparkle"
 */
(function () {
  var GG = window.GG = window.GG || {};

  var canvas, ctx;
  var particles = [];
  var animId = null;
  var activeTypes = [];
  var W, H;

  // 每种效果的配置
  var presets = {
    sparkle: {
      count: 35,
      spawn: function () {
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          size: Math.random() * 3 + 1,
          alpha: Math.random(),
          alphaDir: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.02 + 0.008),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          color: randFrom(['#fff', '#fffbe6', '#ffecd2', '#e6f0ff']),
          type: 'sparkle'
        };
      },
      update: function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir;
        if (p.alpha >= 1) { p.alpha = 1; p.alphaDir = -Math.abs(p.alphaDir); }
        if (p.alpha <= 0) { p.alpha = 0; p.alphaDir = Math.abs(p.alphaDir); }
        wrap(p);
      },
      draw: function (p) {
        ctx.save();
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.fillStyle = p.color;
        // 十字星光
        ctx.beginPath();
        var s = p.size;
        ctx.moveTo(p.x, p.y - s * 2);
        ctx.lineTo(p.x + s * 0.4, p.y - s * 0.4);
        ctx.lineTo(p.x + s * 2, p.y);
        ctx.lineTo(p.x + s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x, p.y + s * 2);
        ctx.lineTo(p.x - s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x - s * 2, p.y);
        ctx.lineTo(p.x - s * 0.4, p.y - s * 0.4);
        ctx.closePath();
        ctx.fill();
        // 光晕
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.15;
        ctx.fill();
        ctx.restore();
      }
    },

    sakura: {
      count: 25,
      spawn: function () {
        return {
          x: Math.random() * W * 1.2 - W * 0.1,
          y: -Math.random() * H * 0.3 - 20,
          size: Math.random() * 8 + 5,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.03,
          vx: Math.random() * 0.5 + 0.2,
          vy: Math.random() * 1.2 + 0.6,
          wobble: Math.random() * Math.PI * 2,
          wobbleV: Math.random() * 0.02 + 0.01,
          alpha: Math.random() * 0.4 + 0.5,
          color: randFrom(['#ffb7c5', '#ffc1cc', '#ffa8b8', '#ffd1dc', '#f8a4b8']),
          type: 'sakura'
        };
      },
      update: function (p) {
        p.wobble += p.wobbleV;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.y += p.vy;
        p.rot += p.rotV;
        if (p.y > H + 30) { resetTop(p); }
      },
      draw: function (p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        // 花瓣形状（两个椭圆组合）
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.2, 0, p.size * 0.55, p.size * 0.25, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(p.size * 0.2, 0, p.size * 0.55, p.size * 0.25, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },

    snow: {
      count: 50,
      spawn: function () {
        return {
          x: Math.random() * W,
          y: -Math.random() * H * 0.2 - 10,
          size: Math.random() * 3.5 + 1.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: Math.random() * 0.8 + 0.3,
          wobble: Math.random() * Math.PI * 2,
          wobbleV: Math.random() * 0.015 + 0.005,
          alpha: Math.random() * 0.4 + 0.4,
          type: 'snow'
        };
      },
      update: function (p) {
        p.wobble += p.wobbleV;
        p.x += p.vx + Math.sin(p.wobble) * 0.4;
        p.y += p.vy;
        if (p.y > H + 10) { resetTop(p); }
      },
      draw: function (p) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // 柔光
        ctx.globalAlpha = p.alpha * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },

    firefly: {
      count: 18,
      spawn: function () {
        return {
          x: Math.random() * W,
          y: H * 0.3 + Math.random() * H * 0.6,
          size: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.5,
          alphaDir: (Math.random() * 0.015 + 0.005),
          phase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2,
          driftT: 0,
          color: randFrom(['#c8ff6e', '#b0ff50', '#e0ffa0', '#a0e840']),
          type: 'firefly'
        };
      },
      update: function (p) {
        p.driftT += 0.008;
        p.x += p.vx + Math.sin(p.driftT * 2.3 + p.phase) * 0.3;
        p.y += p.vy + Math.cos(p.driftT * 1.7 + p.phase) * 0.2;
        p.alpha += p.alphaDir;
        if (p.alpha >= 0.9) { p.alphaDir = -Math.abs(p.alphaDir); }
        if (p.alpha <= 0.05) { p.alphaDir = Math.abs(p.alphaDir); }
        wrap(p);
      },
      draw: function (p) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        // 光晕
        var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        grd.addColorStop(0, p.color);
        grd.addColorStop(0.3, p.color.replace(')', ',0.3)').replace('rgb', 'rgba'));
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();
        // 核心亮点
        ctx.globalAlpha = p.alpha * 1.2;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },

    rain: {
      count: 80,
      spawn: function () {
        return {
          x: Math.random() * W * 1.3 - W * 0.15,
          y: -Math.random() * H * 0.5 - 10,
          len: Math.random() * 18 + 10,
          vx: -1.5,
          vy: Math.random() * 6 + 8,
          alpha: Math.random() * 0.25 + 0.1,
          type: 'rain'
        };
      },
      update: function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > H + 20) {
          p.y = -Math.random() * 40 - 10;
          p.x = Math.random() * W * 1.3 - W * 0.15;
        }
      },
      draw: function (p) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = '#a8c8e8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + p.len);
        ctx.stroke();
        ctx.restore();
      }
    },

    petals: {
      count: 20,
      spawn: function () {
        return {
          x: Math.random() * W * 1.2 - W * 0.1,
          y: -Math.random() * H * 0.3 - 20,
          size: Math.random() * 6 + 4,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.04,
          vx: Math.random() * 0.6 + 0.1,
          vy: Math.random() * 1.0 + 0.4,
          wobble: Math.random() * Math.PI * 2,
          wobbleV: Math.random() * 0.018 + 0.008,
          alpha: Math.random() * 0.4 + 0.45,
          color: randFrom(['#ff8c5a', '#ffaa70', '#ffc490', '#ff7a4a', '#e8955a']),
          type: 'petals'
        };
      },
      update: function (p) {
        p.wobble += p.wobbleV;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rot += p.rotV;
        if (p.y > H + 30) { resetTop(p); }
      },
      draw: function (p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        // 单片叶形花瓣
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.3, p.size * 0.3, p.size * 0.5);
        ctx.quadraticCurveTo(0, p.size * 0.8, -p.size * 0.3, p.size * 0.5);
        ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.3, 0, -p.size);
        ctx.fill();
        ctx.restore();
      }
    },

    dust: {
      count: 30,
      spawn: function () {
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          size: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.3,
          alphaDir: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.006 + 0.002),
          vx: (Math.random() - 0.5) * 0.15,
          vy: -Math.random() * 0.15 - 0.02,
          phase: Math.random() * Math.PI * 2,
          type: 'dust'
        };
      },
      update: function (p) {
        p.phase += 0.01;
        p.x += p.vx + Math.sin(p.phase) * 0.1;
        p.y += p.vy;
        p.alpha += p.alphaDir;
        if (p.alpha >= 0.5) p.alphaDir = -Math.abs(p.alphaDir);
        if (p.alpha <= 0.02) p.alphaDir = Math.abs(p.alphaDir);
        wrap(p);
      },
      draw: function (p) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#fffbe6';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },

    stars: {
      count: 40,
      spawn: function () {
        return {
          x: Math.random() * W,
          y: Math.random() * H * 0.65,
          size: Math.random() * 1.8 + 0.5,
          alpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          color: randFrom(['#fff', '#ffe8c0', '#c8d8ff', '#ffe0e0']),
          type: 'stars'
        };
      },
      update: function (p) {
        p.twinklePhase += p.twinkleSpeed;
        p.alpha = 0.2 + Math.abs(Math.sin(p.twinklePhase)) * 0.7;
      },
      draw: function (p) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // 微光
        if (p.alpha > 0.6) {
          ctx.globalAlpha = (p.alpha - 0.6) * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  };

  // ====== 工具函数 ======
  function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function wrap(p) {
    if (p.x < -20) p.x = W + 20;
    if (p.x > W + 20) p.x = -20;
    if (p.y < -20) p.y = H + 20;
    if (p.y > H + 20) p.y = -20;
  }

  function resetTop(p) {
    p.y = -Math.random() * 40 - 20;
    p.x = Math.random() * W * 1.2 - W * 0.1;
  }

  // ====== 核心控制 ======
  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;';
    var sceneLayer = document.querySelector('#scene-layer');
    if (sceneLayer) {
      sceneLayer.appendChild(canvas);
    } else {
      document.querySelector('#game-container').appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawnParticles(typeNames) {
    particles = [];
    activeTypes = [];

    var names = typeNames.split(',').map(function (s) { return s.trim().toLowerCase(); });

    for (var n = 0; n < names.length; n++) {
      var name = names[n];
      var preset = presets[name];
      if (!preset) { console.warn('[particles] 未知效果:', name); continue; }
      activeTypes.push(name);
      for (var i = 0; i < preset.count; i++) {
        var p = preset.spawn();
        // 初始时随机分布在画面中（部分已飘落状态），避免开场一片空白
        if (p.type === 'sakura' || p.type === 'snow' || p.type === 'petals' || p.type === 'rain') {
          p.y = Math.random() * H;
        }
        particles.push(p);
      }
    }
  }

  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var preset = presets[p.type];
      if (preset) {
        preset.update(p);
        preset.draw(p);
      }
    }

    animId = requestAnimationFrame(loop);
  }

  /**
   * 启动粒子效果
   * @param {string} typeStr — 效果名，多个用逗号分隔，如 "sakura,sparkle"
   */
  GG.startParticles = function (typeStr) {
    if (!typeStr) { GG.stopParticles(); return; }
    ensureCanvas();
    GG.stopParticles();
    resize();
    spawnParticles(typeStr);
    loop();
  };

  /**
   * 停止并清除粒子
   */
  GG.stopParticles = function () {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    particles = [];
    activeTypes = [];
    if (ctx) ctx.clearRect(0, 0, W, H);
  };

})();
