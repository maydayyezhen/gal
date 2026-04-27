/**
 * effectsCore.js - 特效系统核心与公共工具
 *
 * 本文件只负责公共状态、工具函数和注册表。
 * 具体特效实现放在 engine/effects/effect-*.js 中。
 */
(function () {
  var GG = window.GG = window.GG || {};

  window.effectLayer = window.effectLayer || null;
  window.particlesCanvas = window.particlesCanvas || null;
  window.particlesCtx = window.particlesCtx || null;

  window.initEffects = function initEffects() {
    if (window.effectLayer) return;

    var game = document.getElementById('game-container') || document.body;
    var scene = document.getElementById('scene-layer') || game;

    window.effectLayer = document.createElement('div');
    window.effectLayer.id = 'effect-layer';
    window.effectLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:8;';
    scene.appendChild(window.effectLayer);

    window.particlesCanvas = document.createElement('canvas');
    var rect = scene.getBoundingClientRect ? scene.getBoundingClientRect() : {
      width: window.innerWidth,
      height: window.innerHeight
    };
    window.particlesCanvas.width = Math.max(1, Math.floor(rect.width || window.innerWidth));
    window.particlesCanvas.height = Math.max(1, Math.floor(rect.height || window.innerHeight));
    window.particlesCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    window.effectLayer.appendChild(window.particlesCanvas);
    window.particlesCtx = window.particlesCanvas.getContext('2d');
  };

  window.getRealImgSrc = function getRealImgSrc(id, fallbackPath) {
    if (GG.getImage) {
      var src = GG.getImage(id);
      if (src && typeof src === 'string' && src.indexOf('data:image') !== 0) return src;
    }
    return fallbackPath || null;
  };

  window.createFxImg = function createFxImg(className, src, left, top, w, h) {
    var img = document.createElement('img');
    img.className = className || 'fx-img';
    img.src = src;
    img.style.left = left + 'px';
    img.style.top = top + 'px';
    img.style.width = w + 'px';
    img.style.height = h + 'px';
    return img;
  };

  window.later = function later(fn, delay) {
    if (!delay) {
      fn();
      return;
    }
    setTimeout(fn, delay);
  };

  window.getParticleColor = function getParticleColor(type) {
    switch (type) {
      case 'sparkle': return '#70d0ff';
      case 'snow': return '#ffffff';
      case 'petals': return '#ffb0d0';
      case 'magic': return '#d080ff';
      default: return '#ffffff';
    }
  };

  window.findSpriteByKey = function findSpriteByKey(key) {
    if (!key) return null;
    var sprites = GG.$$('.character-sprite');
    for (var i = 0; i < sprites.length; i++) {
      var cid = sprites[i].dataset.charId || '';
      if (cid.indexOf(key) >= 0) return sprites[i];
    }
    return null;
  };

  window.getPointOnSprite = function getPointOnSprite(key, anchor) {
    var el = window.findSpriteByKey(key);
    anchor = anchor || { x: 0.5, y: 0.42 };
    if (!el) {
      return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, el: null };
    }
    var rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width * (anchor.x == null ? 0.5 : anchor.x),
      y: rect.top + rect.height * (anchor.y == null ? 0.42 : anchor.y),
      el: el,
      rect: rect
    };
  };

  window.spawnSparkBurst = function spawnSparkBurst(x, y, options) {
    window.initEffects();
    options = options || {};
    var count = options.count || 18;
    var color = options.color || '#d080ff';
    var spread = options.spread || 90;
    var duration = options.duration || 520;
    var sizeMin = options.sizeMin || 3;
    var sizeMax = options.sizeMax || 8;

    for (var i = 0; i < count; i++) {
      var d = document.createElement('div');
      d.className = 'fx-spark';
      var size = sizeMin + Math.random() * (sizeMax - sizeMin);
      d.style.width = size + 'px';
      d.style.height = size + 'px';
      d.style.left = (x - size / 2) + 'px';
      d.style.top = (y - size / 2) + 'px';
      d.style.background = color;
      window.effectLayer.appendChild(d);

      var ang = Math.random() * Math.PI * 2;
      var dist = (Math.random() * 0.6 + 0.4) * spread;
      var tx = Math.cos(ang) * dist;
      var ty = Math.sin(ang) * dist;

      try {
        var a = d.animate([
          { transform: 'translate(0px, 0px) scale(1)', opacity: 0.95 },
          { transform: 'translate(' + tx + 'px, ' + ty + 'px) scale(0.3)', opacity: 0 }
        ], {
          duration: duration,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          fill: 'forwards'
        });
        a.onfinish = (function(node) {
          return function() {
            if (node && node.parentNode) node.parentNode.removeChild(node);
          };
        })(d);
      } catch (e) {
        setTimeout((function(node) {
          return function() {
            if (node && node.parentNode) node.parentNode.removeChild(node);
          };
        })(d), duration);
      }
    }
  };

  GG.effects = GG.effects || {};

  GG.effects.register = function registerEffect(name, handler) {
    if (!name || typeof handler !== 'function') return;
    GG.effects[name] = handler;
  };

  GG.effects.init = window.initEffects;

  var style = document.createElement('style');
  style.textContent = `
    @keyframes text-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }
    .fx-spark, .fx-hit-ring, .fx-magic-ring, .fx-beam, .fx-smoke {
      position: absolute;
      pointer-events: none;
      will-change: transform, opacity;
    }
    .fx-spark {
      border-radius: 999px;
      filter: blur(0.2px);
      mix-blend-mode: screen;
    }
    .fx-hit-ring, .fx-magic-ring {
      border: 2px solid;
      border-radius: 999px;
      background: transparent;
      mix-blend-mode: screen;
    }
    .fx-beam {
      border-radius: 999px;
      mix-blend-mode: screen;
    }
    .fx-smoke {
      border-radius: 999px;
      filter: blur(1.2px);
      mix-blend-mode: screen;
    }
    .fx-img {
      position:absolute;
      pointer-events:none;
      will-change: transform, opacity;
      user-select:none;
      -webkit-user-drag:none;
    }
    .fx-magic-circle-img, .fx-beam-img, .fx-hit-ring-img, .fx-hit-spark-img,
    .fx-paper-img, .fx-paper-bit-img, .fx-zzz-img, .fx-eye-glow-img, .fx-ripple-img {
      mix-blend-mode: screen;
      filter: drop-shadow(0 0 14px rgba(255,255,255,0.16));
    }
    .fx-sleep-overlay, .fx-wake-overlay {
      position:absolute;
      inset:0;
      pointer-events:none;
      will-change: opacity;
      mix-blend-mode: screen;
    }
    .fx-zzz {
      position:absolute;
      font-weight: 700;
      letter-spacing: 1px;
      text-shadow: 0 0 18px rgba(255,255,255,0.15);
      pointer-events:none;
      will-change: transform, opacity;
    }
    .fx-eye-wrap {
      position:absolute;
      inset:0;
      pointer-events:none;
      z-index: 30;
    }
    .fx-eyelid {
      position:absolute;
      left:0;
      width:100%;
      height:50%;
      background: #000;
      will-change: transform;
    }
    .fx-eyelid.top { top:0; }
    .fx-eyelid.bottom { bottom:0; }
    .fx-ripple {
      position:absolute;
      border: 2px solid rgba(255,255,255,0.38);
      border-radius: 999px;
      pointer-events:none;
      box-shadow: 0 0 18px rgba(255,255,255,0.10);
      mix-blend-mode: screen;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(style);
})();
