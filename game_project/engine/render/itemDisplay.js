/**
 * itemDisplay.js - 道具展示系统（剧情演出版）
 *
 * 用户要求：
 * - 不要背包/物品栏/HUD。
 * - 道具只在剧情提到时出现，带一点小动效/小特效即可。
 */
(function () {
  var GG = window.GG = window.GG || {};

  var itemLayer = null;
  var toastLayer = null;

  var DEFAULT_SIZE = 240;

  var NAME_MAP = {
    'item_broom': '扫把',
    'item_book': '笔记本',
    'item_phone': '手机',
    'item_sword': '塑料剑',
    'item_umbrella': '雨伞'
  };

  function ensureUI() {
    var game = document.getElementById('game-container') || document.body;
    var scene = document.getElementById('scene-layer') || game;

    itemLayer = document.getElementById('item-layer');
    if (!itemLayer) {
      itemLayer = document.createElement('div');
      itemLayer.id = 'item-layer';
      scene.appendChild(itemLayer);
    }

    toastLayer = document.getElementById('item-toast-layer');
    if (!toastLayer) {
      toastLayer = document.createElement('div');
      toastLayer.id = 'item-toast-layer';
      game.appendChild(toastLayer);
    }
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function getItemName(itemId, fallbackName) {
    return fallbackName || NAME_MAP[itemId] || itemId;
  }

  function getImgSrc(itemId) {
    return GG.getImage ? GG.getImage(itemId) : null;
  }

  function makeFallbackCanvas(itemId, size) {
    size = size || 256;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    if (GG.items && GG.items.draw) {
      var itemType = (itemId || '').replace('item_', '');
      GG.items.draw(itemType, ctx, { x: size / 2, y: size / 2, scale: size / 400 });
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#eee';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(itemId || 'item', size / 2, size / 2);
    }
    return canvas.toDataURL('image/png');
  }

  function getCharRect(side) {
    var sprites = GG.$$('.character-sprite') || [];
    if (!sprites.length) return null;

    if (side === 'speaker') {
      for (var i = 0; i < sprites.length; i++) {
        if (sprites[i].classList.contains('speaking')) return sprites[i].getBoundingClientRect();
      }
      return sprites[0].getBoundingClientRect();
    }

    for (var j = 0; j < sprites.length; j++) {
      var el = sprites[j];
      var left = (el.style.left || '').trim();
      var right = (el.style.right || '').trim();
      if (side === 'left' && left && left !== 'auto') return el.getBoundingClientRect();
      if (side === 'right' && right && right !== 'auto') return el.getBoundingClientRect();
    }

    return sprites[0].getBoundingClientRect();
  }

  function resolveAnchor(position) {
    var rect = null;
    var pos = position || 'center';

    if (pos === 'speaker') rect = getCharRect('speaker');
    else if (pos === 'left') rect = getCharRect('left');
    else if (pos === 'right') rect = getCharRect('right');
    else rect = getCharRect('speaker') || getCharRect('center');

    if (!rect) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.52 };

    var isRight = (pos === 'right');
    var x = rect.left + rect.width * (isRight ? 0.35 : 0.65);
    var y = rect.top + rect.height * 0.62;
    return { x: x, y: y };
  }

  function animateIn(el, baseTransform) {
    el.animate([
      { opacity: 0, transform: baseTransform + ' scale(0.82) rotate(-2deg)' },
      { opacity: 1, transform: baseTransform + ' scale(1) rotate(0deg)' }
    ], {
      duration: 260,
      easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
      fill: 'forwards'
    });
  }

  function animateOut(el, baseTransform) {
    return el.animate([
      { opacity: 1, transform: baseTransform + ' scale(1) translateY(0px)' },
      { opacity: 0, transform: baseTransform + ' scale(0.86) translateY(8px)' }
    ], {
      duration: 220,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      fill: 'forwards'
    });
  }

  function startLoopAnim(el, baseTransform, type) {
    if (type === 'float') {
      return el.animate([
        { transform: baseTransform + ' translateY(0px)' },
        { transform: baseTransform + ' translateY(-10px)' },
        { transform: baseTransform + ' translateY(0px)' }
      ], { duration: 1600, iterations: Infinity, easing: 'ease-in-out' });
    }
    if (type === 'spin') {
      return el.animate([
        { transform: baseTransform + ' rotate(0deg)' },
        { transform: baseTransform + ' rotate(360deg)' }
      ], { duration: 2200, iterations: Infinity, easing: 'linear' });
    }
    return null;
  }

  /**
   * 场景内展示道具
   * @param {string} itemId
   * @param {Object} options { position: center/left/right/speaker, duration, animation, size, label, persist }
   */
  function showItem(itemId, options) {
    ensureUI();
    options = options || {};

    var position = options.position || 'center';
    var duration = options.duration != null ? options.duration : 1800;
    var animation = options.animation || 'appear';
    var size = options.size || DEFAULT_SIZE;
    var label = options.label || '';
    var persist = !!options.persist || duration <= 0;

    var anchor = resolveAnchor(position);
    var x = clamp(anchor.x - size / 2, 20, window.innerWidth - size - 20);
    var y = clamp(anchor.y - size / 2, 40, window.innerHeight - size - 220);

    var wrap = document.createElement('div');
    wrap.className = 'gg-item';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.style.width = size + 'px';
    wrap.style.height = size + 'px';

    var glow = document.createElement('div');
    glow.className = 'gg-item-glow';
    wrap.appendChild(glow);

    var img = document.createElement('img');
    var src = getImgSrc(itemId);
    img.src = src || makeFallbackCanvas(itemId, 320);
    img.alt = itemId;
    wrap.appendChild(img);

    if (label) {
      var lab = document.createElement('div');
      lab.className = 'gg-item-label';
      lab.textContent = label;
      wrap.appendChild(lab);
    }

    itemLayer.appendChild(wrap);

    var baseTransform = 'translateZ(0)';
    animateIn(wrap, baseTransform);

    var loop = null;
    if (animation === 'float' || animation === 'spin') {
      setTimeout(function () {
        loop = startLoopAnim(wrap, baseTransform, animation);
      }, 260);
    }

    if (!persist) {
      setTimeout(function () {
        if (loop) try { loop.cancel(); } catch (e) {}
        var out = animateOut(wrap, baseTransform);
        out.onfinish = function () {
          if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
        };
      }, duration);
    }
  }

  /**
   * 轻量“获得”提示（无背包）
   */
  function showItemGet(itemId, itemName, options) {
    ensureUI();
    options = options || {};
    var duration = options.duration != null ? options.duration : 2200;
    var name = getItemName(itemId, itemName);

    var toast = document.createElement('div');
    toast.className = 'gg-item-toast';

    var icon = document.createElement('img');
    icon.className = 'toast-icon';
    var src = getImgSrc(itemId);
    icon.src = src || makeFallbackCanvas(itemId, 256);
    icon.alt = itemId;

    var text = document.createElement('div');
    text.className = 'toast-text';
    var t1 = document.createElement('div');
    t1.className = 'toast-title';
    t1.textContent = '道具出现';
    var t2 = document.createElement('div');
    t2.className = 'toast-name';
    t2.textContent = name;
    text.appendChild(t1);
    text.appendChild(t2);

    toast.appendChild(icon);
    toast.appendChild(text);
    toastLayer.appendChild(toast);

    toast.animate([
      { opacity: 0, transform: 'translate(-50%, -28px) scale(0.98)' },
      { opacity: 1, transform: 'translate(-50%, 0px) scale(1)' }
    ], { duration: 220, easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)', fill: 'forwards' });

    setTimeout(function () {
      var out = toast.animate([
        { opacity: 1, transform: 'translate(-50%, 0px) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, -18px) scale(0.98)' }
      ], { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
      out.onfinish = function () {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      };
    }, duration);
  }

  function clearAll() {
    ensureUI();
    if (itemLayer) itemLayer.innerHTML = '';
    if (toastLayer) toastLayer.innerHTML = '';
  }

  // 为了兼容旧调用，保留空实现
  function getInventory() { return []; }
  function setInventory(_) { /* no-op */ }
  function clearInventory() { /* no-op */ }

  GG.itemDisplay = {
    show: showItem,
    showGet: showItemGet,
    clear: clearAll,
    getInventory: getInventory,
    setInventory: setInventory,
    clearInventory: clearInventory
  };
})();
