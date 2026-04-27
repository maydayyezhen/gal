/**
 * characterAnimations.js - 角色动画系统
 */
(function() {
  var GG = window.GG = window.GG || {};

  // 长驻动画（例如怪物待机），避免每句对白都重启动画
  var idleMap = new WeakMap();

  function pauseIdle(elem) {
    if (!elem) return false;
    try {
      var idle = idleMap.get(elem);
      if (idle) {
        idle.cancel();
        idleMap.delete(elem);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function resumeIdleLater(elem, delayMs) {
    if (!elem) return;
    var d = Math.max(0, delayMs || 0);
    setTimeout(function () { animIdle(elem); }, d);
  }

  // 组合 transform：基础定位 transform + 偏移 translate + 额外动画 transform
  function getBaseTransform(elem) {
    var base = (elem && elem.dataset && elem.dataset.baseTransform) ? elem.dataset.baseTransform : '';
    var ox = (elem && elem.dataset && elem.dataset.offsetX) ? elem.dataset.offsetX : '0px';
    var oy = (elem && elem.dataset && elem.dataset.offsetY) ? elem.dataset.offsetY : '0px';
    var t = '';
    if (base) t += base + ' ';
    t += 'translate(' + ox + ', ' + oy + ')';
    return t;
  }

  function T(elem, extra) {
    extra = extra || '';
    var base = getBaseTransform(elem);
    return extra ? (base + ' ' + extra) : base;
  }
  
  /**
   * 播放角色动画
   */
  function playCharAnimation(charId, animType, options) {
    options = options || {};
    var duration = options.duration || 500;
    
    // 查找角色元素
    var charElement = null;
    var sprites = GG.$$('.character-sprite');
    for (var i = 0; i < sprites.length; i++) {
      if (sprites[i].dataset.charId && sprites[i].dataset.charId.indexOf(charId) >= 0) {
        charElement = sprites[i];
        break;
      }
    }
    
    if (!charElement) return;
    
    // 执行动画
    switch(animType) {
      case 'nod': animNod(charElement, duration); break;
      case 'shake': animShake(charElement, duration); break;
      case 'jump': animJump(charElement, duration); break;
      case 'bounce': animBounce(charElement, duration); break;
      case 'sway': animSway(charElement, duration); break;
      case 'heartbeat': animHeartbeat(charElement, duration); break;
      case 'appear': animAppear(charElement, duration); break;
      case 'idle': animIdle(charElement, duration); break;
      case 'hurt': animHurt(charElement, duration); break;
    }
  }
  
  function animNod(elem, dur) {
    elem.animate([
      { transform: T(elem, 'translateY(0) rotate(0deg)') },
      { transform: T(elem, 'translateY(10px) rotate(3deg)') },
      { transform: T(elem, 'translateY(0) rotate(0deg)') }
    ], { duration: dur, easing: 'ease-in-out' });
  }
  
  function animShake(elem, dur) {
    elem.animate([
      { transform: T(elem, 'translateX(0)') },
      { transform: T(elem, 'translateX(-8px)') },
      { transform: T(elem, 'translateX(8px)') },
      { transform: T(elem, 'translateX(-8px)') },
      { transform: T(elem, 'translateX(0)') }
    ], { duration: dur });
  }
  
  function animJump(elem, dur) {
    if (!elem) return;
    dur = dur || 520;
    var hadIdle = pauseIdle(elem);
    try {
      elem.animate([
        { transform: T(elem, 'translateY(0) scaleY(1)') },
        { transform: T(elem, 'translateY(-40px) scaleY(1.05)') },
        { transform: T(elem, 'translateY(0) scaleY(0.95)') },
        { transform: T(elem, 'translateY(0) scaleY(1)') }
      ], { duration: dur, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
    } catch (e) {}
    if (hadIdle) resumeIdleLater(elem, dur + 50);
  }
  
  function animBounce(elem, dur) {
    if (!elem) return;
    dur = dur || 520;
    var hadIdle = pauseIdle(elem);
    try {
      elem.animate([
        { transform: T(elem, 'translateY(0)') },
        { transform: T(elem, 'translateY(-15px)') },
        { transform: T(elem, 'translateY(0)') },
        { transform: T(elem, 'translateY(-8px)') },
        { transform: T(elem, 'translateY(0)') }
      ], { duration: dur, easing: 'ease-out' });
    } catch (e) {}
    if (hadIdle) resumeIdleLater(elem, dur + 50);
  }
  
  function animSway(elem, dur) {
    elem.animate([
      { transform: T(elem, 'rotate(0deg)') },
      { transform: T(elem, 'rotate(-3deg)') },
      { transform: T(elem, 'rotate(3deg)') },
      { transform: T(elem, 'rotate(-3deg)') },
      { transform: T(elem, 'rotate(0deg)') }
    ], { duration: dur });
  }
  
  function animHeartbeat(elem, dur) {
    elem.animate([
      { transform: T(elem, 'scale(1)') },
      { transform: T(elem, 'scale(1.08)') },
      { transform: T(elem, 'scale(1)') },
      { transform: T(elem, 'scale(1.05)') },
      { transform: T(elem, 'scale(1)') }
    ], { duration: dur });
  }
  
  function animAppear(elem, dur) {
    elem.animate([
      { opacity: 0, transform: T(elem, 'scale(0.8)') },
      { opacity: 1, transform: T(elem, 'scale(1.05)') },
      { opacity: 1, transform: T(elem, 'scale(1)') }
    ], { duration: dur });
  }
  
  
  // 怪物/角色待机：轻微上下浮动+弹性缩放（无限循环）
  function animIdle(elem, dur) {
    if (!elem) return;
    // 已在跑就别重复开
    if (idleMap.has(elem)) return;
    // 稍慢一点更像“呼吸”，也更不容易出现卡顿感
    dur = dur || 1500;
    try {
      // 用 alternate + easing 做平滑往返，避免循环点“顿一下”
      var a = elem.animate([
        { transform: T(elem, 'translateY(0px) scale(1,1)') },
        { transform: T(elem, 'translateY(-10px) scale(1.035,0.965)') }
      ], {
        duration: dur,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
      });
      idleMap.set(elem, a);
    } catch (e) {}
  }

  // 受击：短促抖动+缩放（会短暂停止 idle，然后自动恢复）
  function animHurt(elem, dur) {
    if (!elem) return;
    dur = dur || 380;
    // 暂停 idle
    try {
      var idle = idleMap.get(elem)
      if (idle) {
        idle.cancel();
        idleMap.delete(elem);
      }
    } catch (e) {}

    var anim = null;
    try {
      anim = elem.animate([
        { transform: T(elem, 'translateX(0) scale(1,1)') },
        { transform: T(elem, 'translateX(-10px) scale(0.98,1.02)') },
        { transform: T(elem, 'translateX(10px) scale(1.06,0.94)') },
        { transform: T(elem, 'translateX(-6px) scale(0.98,1.02)') },
        { transform: T(elem, 'translateX(0) scale(1,1)') }
      ], { duration: dur, easing: 'ease-out' });
    } catch (e) {}

    // 自动恢复 idle（仅对史莱姆这类）
    try {
      var id = (elem.dataset && elem.dataset.charId) ? elem.dataset.charId : '';
      if (id.indexOf('homework_slime') >= 0) {
        setTimeout(function(){ animIdle(elem, 1200); }, dur + 30);
      }
    } catch (e) {}

    return anim;
  }

// 暴露API
  GG.charAnim = {
    play: playCharAnimation,
    restartIdle: function(charId) {
      var sprites = GG.$$('.character-sprite');
      for (var i=0;i<sprites.length;i++) {
        var cid = sprites[i].dataset.charId || '';
        if (cid.indexOf(charId) >= 0) {
          try {
            var idle = idleMap.get(sprites[i]);
            if (idle) { idle.cancel(); idleMap.delete(sprites[i]); }
          } catch (e) {}
          animIdle(sprites[i], 1200);
          return;
        }
      }
    }
  };
})();
