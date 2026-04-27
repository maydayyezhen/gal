/**
 * sceneManager.js — 场景/立绘/对话渲染
 * 新增：角色说话亮暗、AUTO模式、SKIP模式
 * 修复：场景结束后重复触发 onComplete / 结局按钮堆叠
 */
(function () {
  var GG = window.GG = window.GG || {};

  var currentScene = null;
  var currentScript = null;
  var dialogIndex = 0;
  var currentTw = null;
  var typing = false;
  var dialogLock = false;
  var onComplete = null;

  // 场景结束后进入“等待选择”状态，禁止继续点击推进
  var waitingChoice = false;

  // 读档时，如果当前行已被写入 log，避免重复追加一次
  var suppressNextLogOnce = false;

  // 轻量“演出”：说话人变化时给一点小动作，避免全程站桩
  var lastSpeaker = null;

  // 模式
  GG.autoMode = false;
  GG.skipMode = false;
  var autoTimer = null;

  // 角色名与立绘ID的映射（从剧本中推断）
  var speakerCharMap = {
    '阳菜': 'hina',
    '空': 'sora',
    '夜': 'sora',
    '公主': 'princess'
  };

  // 背景双层交叉淡入（两层div交叉变透明，不然背景换图就是瞬移）
  var bgA = null;
  var bgB = null;
  var _bgInited = false;
  var _bgFrontIsA = true;

  function initBgLayers() {
    if (_bgInited) return;
    bgA = GG.$('#background-layer');
    bgB = GG.$('#background-layer2');
    // 没有第二层也没关系：降级为单层
    if (bgA) bgA.classList.add('active');
    if (bgB) bgB.classList.remove('active');
    _bgInited = true;
  }

  function setBackground(url, immediate) {
    initBgLayers();
    bgA = bgA || GG.$('#background-layer');
    if (!bgA) return;

    // 只有一层背景：直接换
    if (!bgB) {
      bgA.style.backgroundImage = url ? ('url(' + url + ')') : '';
      bgA.classList.add('active');
      return;
    }

    url = url || '';
    var front = _bgFrontIsA ? bgA : bgB;
    var back = _bgFrontIsA ? bgB : bgA;

    if ((front.dataset.bgUrl || '') === url) {
      front.classList.add('active');
      back.classList.remove('active');
      return;
    }

    // 第一次设置：不做动画，避免开场闪黑
    if (immediate || !front.dataset.bgUrl) {
      front.style.backgroundImage = url ? ('url(' + url + ')') : '';
      front.dataset.bgUrl = url;
      front.classList.add('active');
      back.classList.remove('active');
      return;
    }

    try {
      var seT = GG.getAudio && GG.getAudio("se_transition");
      if (seT) GG.playSE(seT.path, seT.volume || 0.5);
    } catch (e) {}

    // 交叉淡入
    back.style.backgroundImage = url ? ('url(' + url + ')') : '';
    back.dataset.bgUrl = url;
    back.classList.add('active');
    front.classList.remove('active');
    _bgFrontIsA = !_bgFrontIsA;
  }

  // 允许外部在读档时触发一次“跳过写 log”（进入场景时生效）
  GG._setSuppressNextLog = function (v) { GG._pendingSuppressNextLogOnce = !!v; };

  // 允许外部读取当前进度（用于存档）
  GG.getProgress = function () {
    return {
      sceneId: currentScene ? currentScene.id : null,
      dialogIndex: dialogIndex,
      typing: !!typing,
      waitingChoice: !!waitingChoice
    };
  };

  // 允许外部以指定对话下标进入场景（用于读档）
  GG.renderSceneAt = function (script, scene, startIndex, callback) {
    doRender(script, scene, callback, startIndex);
  };

  /**
   * 渲染场景
   */
  GG.renderScene = function (script, scene, callback) {
    doRender(script, scene, callback, 0);
  };

  // ===== P-01：编辑器“视频剪辑式预览”支持 =====
  // 即时渲染到某一句：会先快进应用历史 stage（默认不触发历史 effects），然后展示目标对话的画面+文字。
  function _stageFastClone(stage) {
    if (!stage || typeof stage === 'string') return stage;
    var fast;
    try { fast = JSON.parse(JSON.stringify(stage)); } catch (e) { return stage; }
    fast.speed = fast.speed || {};
    fast.speed.show = 1;
    fast.speed.hide = 1;
    fast.speed.swap = 1;
    fast.speed.move = 1;
    function zap(list) {
      if (!Array.isArray(list)) return;
      list.forEach(function (x) {
        if (!x || typeof x !== 'object') return;
        if ('delay' in x) x.delay = 0;
        if ('duration' in x) x.duration = 1;
      });
    }
    zap(fast.show);
    zap(fast.swap);
    zap(fast.move);
    zap(fast.hide);
    return fast;
  }

  function _applyDialogCharacterFast(dialog) {
    var ch = dialog && dialog.character;
    if (!ch || !ch.key || !ch.sprite) return;
    var key = ch.key;
    var sprite = ch.sprite;
    var pos = ch.position || 'center';
    var scale = (typeof ch.scale === 'number') ? ch.scale : 1;
    var opacity = (typeof ch.opacity === 'number') ? ch.opacity : 1;

    var existing = findSpriteByKey(key);
    if (!existing) {
      showSprite(key, sprite, pos, scale, opacity, 1);
    } else {
      swapSpriteReplace(key, existing, sprite, 1, pos, scale, opacity);
    }
  }

  function _clearPreviewOverlays() {
    // 清理 choice
    var cc = GG.$('#choice-container');
    if (cc) cc.innerHTML = '';
    // 清理 effect-layer
    var el = GG.$('#effect-layer');
    if (el) el.innerHTML = '';
    // 复位 shake
    var gc = GG.$('#game-container');
    if (gc) gc.style.transform = '';
  }

  GG.previewSceneAt = function (script, sceneOrId, targetIndex, options) {
    options = options || {};

    try {
      if (!script) throw new Error('preview: missing script');
      var scene = sceneOrId;
      if (typeof sceneOrId === 'string') {
        scene = (script.scenes || []).find(function (s) { return s && s.id === sceneOrId; });
      }
      if (!scene) throw new Error('preview: scene not found');

      // 基础状态
      currentScript = script;
      currentScene = scene;
      dialogIndex = 0;
      typing = false;
      dialogLock = false;
      waitingChoice = false;
      lastSpeaker = null;
      suppressNextLogOnce = true;
      clearAutoTimer();

      // speakerMap
      try {
        if (script.meta && script.meta.speakerMap && typeof script.meta.speakerMap === 'object') {
          speakerCharMap = script.meta.speakerMap;
        }
      } catch (e) {}

      // 清理 UI/效果/道具
      _clearPreviewOverlays();
      try { if (GG.startParticles) GG.startParticles(null); } catch (e) {}
      try { if (GG.itemDisplay && GG.itemDisplay.clear) GG.itemDisplay.clear(); } catch (e) {}

      // 背景
      var bgUrl = GG.getImage(scene.background);
      setBackground(bgUrl, !_bgInited);

      // BGM（预览默认静音，由 iframe 侧控制 playBGM）
      if (!options.muted) {
        try {
          var bgmInfo = GG.getAudio(scene.bgm);
          if (bgmInfo) GG.playBGM(bgmInfo);
        } catch (e) {}
      } else {
        try { if (GG.stopBGM) GG.stopBGM(); } catch (e) {}
      }

      // 粒子
      try { if (GG.startParticles) GG.startParticles(scene.particles); } catch (e) {}

      // 立绘基线
      renderCharacters(scene.characters || []);

      var dialogs = Array.isArray(scene.dialogs) ? scene.dialogs : [];
      if (dialogs.length === 0) {
        // 没台词就清空文本
        var nameEl = GG.$('#dialog-name');
        var textEl = GG.$('#dialog-text');
        if (nameEl) nameEl.textContent = '';
        if (textEl) textEl.textContent = '';
        return;
      }

      var idx = Math.max(0, Math.min(parseInt(targetIndex || 0, 10), dialogs.length - 1));

      // 快进应用历史 stage/自动角色（不触发历史 effects）
      for (var i = 0; i < idx; i++) {
        var d0 = dialogs[i];
        if (!d0) continue;
        if (d0.stage) applyStageCommands(_stageFastClone(d0.stage));
        _applyDialogCharacterFast(d0);
        // 道具出现（历史）
        if (d0.itemShow && GG.itemDisplay && GG.itemDisplay.show) {
          try { GG.itemDisplay.show(d0.itemShow); } catch (e) {}
        }
      }

      // 目标一句：按真实参数执行
      var d = dialogs[idx] || {};
      if (d.stage) applyStageCommands(d.stage);
      applyDialogCharacter(d);
      updateCharacterHighlight(d.speaker);

      // 文本（不走打字机，预览要“秒出”）
      var nameEl2 = GG.$('#dialog-name');
      var textEl2 = GG.$('#dialog-text');
      if (nameEl2) nameEl2.textContent = d.speaker || '';
      if (textEl2) textEl2.textContent = d.text || '';

      // effects（仅目标一句）
      if (options.applyEffects !== false && d.effects && GG.effects) {
        try {
          if (d.effects.flash) GG.effects.flash(d.effects.flash);
          if (d.effects.shake) GG.effects.shake(d.effects.shake);
          if (d.effects.focus) GG.effects.focus(d.effects.focus);
          if (d.effects.blur) GG.effects.blur(d.effects.blur);
          if (d.effects.sleep) GG.effects.sleep(d.effects.sleep);
          if (d.effects.wake) GG.effects.wake(d.effects.wake);
          if (d.effects.dream && GG.effects.dream) GG.effects.dream(d.effects.dream);
          if (d.effects.stopDream && GG.effects.stopDream) GG.effects.stopDream();
          if (d.effects.eyeGlow && GG.effects.eyeGlow) GG.effects.eyeGlow(d.effects.eyeGlow);
          if (d.effects.stopEyeGlow && GG.effects.stopEyeGlow) GG.effects.stopEyeGlow();
          if (d.effects.particles) {
            if (d.effects.particles === 'off') {
              GG.startParticles(null);
            } else {
              GG.startParticles(d.effects.particles);
            }
          }
        } catch (e) {}
      }

      // 道具（目标一句）
      if (GG.itemDisplay) {
        if (d.itemShow && GG.itemDisplay.show) {
          try { GG.itemDisplay.show(d.itemShow); } catch (e) {}
        }
        if (options.showGets !== false && d.itemGet && GG.itemDisplay.showGet) {
          try { GG.itemDisplay.showGet(d.itemGet); } catch (e) {}
        }
      }

    } catch (err) {
      console.error('[GG.previewSceneAt] failed:', err);
    }
  };

  function doRender(script, scene, callback, startIndex) {
    currentScript = script;
    currentScene = scene;
    dialogIndex = Math.max(0, parseInt(startIndex || 0, 10));
    onComplete = callback;
    typing = false;
    dialogLock = false;
    waitingChoice = false;
    lastSpeaker = null;
    // 如果外部在进入场景前请求了“跳过一次 log 写入”，在这里消费掉
    suppressNextLogOnce = !!GG._pendingSuppressNextLogOnce;
    GG._pendingSuppressNextLogOnce = false;
    clearAutoTimer();

    // 可选：从剧本 meta 里覆盖 speakerMap（不要求存在）
    try {
      if (script && script.meta && script.meta.speakerMap && typeof script.meta.speakerMap === 'object') {
        speakerCharMap = script.meta.speakerMap;
      }
    } catch (e) {}

    // 背景
    var bgUrl = GG.getImage(scene.background);
    setBackground(bgUrl, !_bgInited);

    // BGM
    var bgmInfo = GG.getAudio(scene.bgm);
    if (bgmInfo && !bgmInfo.fallback) GG.playBGM(bgmInfo.path, bgmInfo.volume);

    // 立绘
    renderCharacters(scene.characters || []);

    // 粒子效果
    if (GG.startParticles) {
      GG.startParticles(scene.particles || null);
    }

    // 清空 choices
    GG.$('#choice-container').innerHTML = '';
    GG.$('#click-hint').style.display = 'block';
    GG.$('#dialog-name').textContent = '';
    GG.$('#dialog-text').textContent = '';
    GG.$('#dialog-box').classList.add('visible');

    showNext();
  }

  /**
   * 点击推进
   */
  GG.handleClick = function () {
    if (dialogLock) return;
    if (waitingChoice) return;

    clearAutoTimer();

    // 每次点击都播放轻微音效
    var seInfo = GG.getAudio('se_click');
    if (seInfo && !seInfo.fallback) GG.playSE(seInfo.path, seInfo.volume * 0.5);

    if (typing && currentTw && currentTw.skip) {
      currentTw.skip();
      return;
    }
    showNext();
  };

  // ====== 内部 ======

  // 立绘入场：轻微淡入+下移（别像PPT硬切）
  function animateSpriteEnter(el, targetOpacity, duration) {
    try {
      targetOpacity = (targetOpacity == null) ? 1 : targetOpacity;
      duration = duration || 260;
      var baseT = el.style.transform || '';
      var fromT = (baseT ? (baseT + ' translateY(14px)') : 'translateY(14px)');
      var toT = (baseT || 'translateY(0px)');
      el.animate([
        { opacity: 0, transform: fromT },
        { opacity: targetOpacity, transform: toT }
      ], { duration: duration, easing: 'ease-out', fill: 'forwards' });
    } catch (e) {}
  }

  // 生成“立绘节点”：外层负责定位/镜头/亮暗，内层负责默认微动，最里层才是图片
  function buildSpriteNode(id, url, pos, targetOpacity) {
    var sprite = document.createElement('div');
    sprite.className = 'character-sprite';
    sprite.dataset.charId = id;

    var baseT = 'translateX(-50%)';
    if (pos === 'left') { sprite.style.left = '8%'; sprite.style.right = 'auto'; baseT = 'translateX(0)'; }
    else if (pos === 'right') { sprite.style.right = '8%'; sprite.style.left = 'auto'; baseT = 'translateX(0)'; }
    else { sprite.style.left = '50%'; sprite.style.right = 'auto'; baseT = 'translateX(-50%)'; }

    // 记录基础 transform，后续动画使用“叠加”方式，避免覆盖定位
    sprite.dataset.baseTransform = baseT;
    sprite.dataset.offsetX = '0px';
    sprite.dataset.offsetY = '0px';
    sprite.style.transform = baseT + ' translate(0px, 0px)';

    // 默认“微动”错觉：随机一点点参数，避免全员同频像广场舞
    try {
      var dur = Math.floor(2800 + Math.random() * 1400) + 'ms';
      var delay = '-' + Math.floor(Math.random() * 3800) + 'ms';
      var amp = (1.1 + Math.random() * 1.1).toFixed(1) + 'px';
      var rot = (0.16 + Math.random() * 0.18).toFixed(2) + 'deg';
      // 小角度用于 25%/75% 的过渡帧，让运动更像正弦、不“卡点”
      var rotNum = parseFloat(rot) || 0.22;
      var rotSmall = (rotNum * 0.55).toFixed(2) + 'deg';
      var rotSmallNeg = '-' + (rotNum * 0.55).toFixed(2) + 'deg';
      sprite.style.setProperty('--idleDur', dur);
      sprite.style.setProperty('--idleDelay', delay);
      sprite.style.setProperty('--idleAmp', amp);
      sprite.style.setProperty('--idleAmpNeg', '-' + amp);
      sprite.style.setProperty('--idleRot', rot);
      sprite.style.setProperty('--idleRotSmall', rotSmall);
      sprite.style.setProperty('--idleRotSmallNeg', rotSmallNeg);
      sprite.style.setProperty('--idleRotNeg', '-' + rot);
    } catch (e) {}

    // 怪物本身有更夸张的待机，不叠加小晃动
    if ((id || '').indexOf('homework_slime') >= 0) {
      sprite.classList.add('monster');
    }

    var idle = document.createElement('div');
    idle.className = 'character-idle';
    var img = document.createElement('img');
    img.className = 'character-img';
    img.src = url;
    img.alt = id;
    idle.appendChild(img);
    sprite.appendChild(idle);

    sprite.style.opacity = 0;
    if (targetOpacity != null) sprite.dataset.targetOpacity = String(targetOpacity);
    return sprite;
  }

  // ===== 立绘即时出入场/替换（用于“史莱姆消失”等镜头对齐） =====
  function findSpriteByKey(key) {
    if (!key) return null;
    var sprites = GG.$$('.character-sprite');
    for (var i = 0; i < sprites.length; i++) {
      var cid = sprites[i].dataset.charId || '';
      if (cid.indexOf(key) >= 0) return sprites[i];
    }
    return null;
  }

  // ===== 编辑器友好：对白级 character / position / animation =====
  function _keyFromCharId(id) {
    if (!id) return '';
    if (id.indexOf('hina') >= 0) return 'hina';
    if (id.indexOf('sora') >= 0) return 'sora';
    if (id.indexOf('princess') >= 0) return 'princess';
    if (id.indexOf('homework_slime') >= 0) return 'homework_slime';
    if (id.indexOf('slime') >= 0) return 'homework_slime';
    return '';
  }

  function _speakerKey(speaker) {
    return speakerCharMap[speaker] || (speaker || '').toLowerCase();
  }

  function _defaultPos(key) {
    if (key === 'hina') return 'left';
    if (key === 'sora') return 'right';
    if (key === 'princess') return 'center';
    if (key === 'homework_slime') return 'center';
    return 'center';
  }

  function _stageTouchesKey(stage, key, id) {
    if (!stage || !key) return false;

    function has(arr, pred) {
      if (!arr || !arr.length) return false;
      for (var i = 0; i < arr.length; i++) {
        if (pred(arr[i])) return true;
      }
      return false;
    }

    if (has(stage.hideChars, function (h) {
      if (typeof h === 'string') return h.indexOf(key) >= 0;
      if (h && h.charId) return String(h.charId).indexOf(key) >= 0;
      return false;
    })) return true;

    if (has(stage.showChars, function (s) {
      return s && s.id && (s.id === id || String(s.id).indexOf(key) >= 0);
    })) return true;

    if (has(stage.swapChars, function (s) {
      return s && ((s.match && String(s.match).indexOf(key) >= 0) || (s.id && String(s.id).indexOf(key) >= 0));
    })) return true;

    if (has(stage.moveChars, function (m) {
      return m && m.match && String(m.match).indexOf(key) >= 0;
    })) return true;

    return false;
  }

  function applyDialogCharacter(d) {
    if (!d || !d.character) return;
    var id = d.character;
    var key = _keyFromCharId(id) || _speakerKey(d.speaker);
    if (!key) return;

    // 剧本若明确写了 stage 指令，就别用自动逻辑抢戏
    if (_stageTouchesKey(d.stage, key, id)) return;

    var existing = findSpriteByKey(key);
    if (!existing) {
      showSprite({ id: id, position: d.position || _defaultPos(key), opacity: 1 }, 220);
    } else {
      var curId = existing.dataset.charId || '';
      if (curId !== id) {
        // 用 replace 避免叠两张线稿，看着像“分身术”
        swapSpriteReplace(key, id, 160);
      }
    }

    // 轻量动画（编辑器的 animation 字段）
    try {
      if (d.animation && GG.charAnim) {
        var t = null;
        if (d.animation === 'fadeIn') t = 'appear';
        else if (d.animation === 'bounce') t = 'bounce';
        else if (d.animation === 'shake') t = 'shake';
        if (t) GG.charAnim.play(key, t, { duration: (t === 'appear') ? 360 : 520 });
      }
    } catch (e) {}
  }

  function fadeOutAndRemove(el, duration, remove) {
    if (!el) return;
    duration = duration || 220;
    remove = (remove !== false);
    try {
      var baseT = el.style.transform || '';
      var toT = (baseT ? (baseT + ' translateY(8px)') : 'translateY(8px)');
      var a = el.animate([
        { opacity: parseFloat(getComputedStyle(el).opacity || '1'), transform: baseT || 'translateY(0px)' },
        { opacity: 0, transform: toT }
      ], { duration: duration, easing: 'ease-in', fill: 'forwards' });
      a.onfinish = function () {
        if (remove && el && el.parentNode) el.parentNode.removeChild(el);
      };
    } catch (e) {
      el.style.opacity = 0;
      if (remove && el.parentNode) el.parentNode.removeChild(el);
    }
  }

  function showSprite(def, duration) {
    if (!def || !def.id) return;
    var layer = GG.$('#character-layer');
    if (!layer) return;
    var url = GG.getImage(def.id);
    if (!url) return;
    var targetOpacity = (def.opacity != null) ? def.opacity : 1;
    var pos = def.position || 'center';
    var sprite = buildSpriteNode(def.id, url, pos, targetOpacity);
    layer.appendChild(sprite);
    animateSpriteEnter(sprite, targetOpacity, duration || 240);
    // 怪物待机
    try {
      if (GG.charAnim && def.id && def.id.indexOf('homework_slime') >= 0) {
        GG.charAnim.play('homework_slime', 'idle', { duration: 1200 });
      }
    } catch (e) {}
  }

  function swapSpriteReplace(matchKey, newId, duration) {
    duration = duration || 160;
    var el = findSpriteByKey(matchKey);
    if (!el) return;
    var url = GG.getImage(newId);
    if (!url) return;

    var innerImg = el.querySelector('img');
    if (!innerImg) return;

    // 无重叠替换：先淡出，再换 src，再淡入（避免“两个公主叠在一起”的双线稿）
    var half = Math.max(60, Math.floor(duration / 2));
    try {
      var outA = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: half, easing: 'ease-in', fill: 'forwards' });
      outA.onfinish = function () {
        innerImg.src = url;
        el.dataset.charId = newId;
        if ((newId || '').indexOf('homework_slime') >= 0) el.classList.add('monster');
        else el.classList.remove('monster');
        el.classList.remove('dimmed', 'speaking');
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration - half, easing: 'ease-out', fill: 'forwards' });
      };
    } catch (e) {
      el.style.opacity = 0;
      innerImg.src = url;
      el.dataset.charId = newId;
      if ((newId || '').indexOf('homework_slime') >= 0) el.classList.add('monster');
      else el.classList.remove('monster');
      el.style.opacity = 1;
    }
  }

  function swapSprite(matchKey, newId, duration, mode) {
    duration = duration || 180;
    if (mode === 'replace' || mode === 'noOverlay') {
      swapSpriteReplace(matchKey, newId, duration);
      return;
    }
    var oldEl = findSpriteByKey(matchKey);
    if (!oldEl) return;
    var url = GG.getImage(newId);
    if (!url) return;
    // 克隆一张新图叠上去做交叉淡入（避免直接换 src 闪一下）
    var neo = oldEl.cloneNode(true);
    var neoImg = neo.querySelector('img');
    if (neoImg) neoImg.src = url;
    neo.dataset.charId = newId;
    if ((newId || '').indexOf('homework_slime') >= 0) neo.classList.add('monster');
    else neo.classList.remove('monster');
    // 继承基础 transform 与偏移
    neo.dataset.baseTransform = oldEl.dataset.baseTransform || neo.dataset.baseTransform || '';
    neo.dataset.offsetX = oldEl.dataset.offsetX || neo.dataset.offsetX || '0px';
    neo.dataset.offsetY = oldEl.dataset.offsetY || neo.dataset.offsetY || '0px';
    neo.classList.remove('dimmed', 'speaking');
    neo.style.opacity = 0;
    oldEl.parentNode.appendChild(neo);
    try {
      neo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration, easing: 'ease-out', fill: 'forwards' });
      var a = oldEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration, easing: 'ease-in', fill: 'forwards' });
      a.onfinish = function () {
        if (oldEl && oldEl.parentNode) oldEl.parentNode.removeChild(oldEl);
      };
    } catch (e) {
      oldEl.parentNode.removeChild(oldEl);
      neo.style.opacity = 1;
    }
  }

  function applyStageCommands(stage) {
    if (!stage) return;
    var speed = stage.speed || {};
    function later(fn, delay) {
      if (delay && delay > 0) setTimeout(fn, delay);
      else fn();
    }
    // hide
    if (stage.hideChars && stage.hideChars.length) {
      for (var i = 0; i < stage.hideChars.length; i++) {
        var h = stage.hideChars[i];
        if (typeof h === 'string') {
          fadeOutAndRemove(findSpriteByKey(h), speed.hide || 200, true);
        } else if (h && h.charId) {
          (function(hh){ later(function () { fadeOutAndRemove(findSpriteByKey(hh.charId), hh.duration || speed.hide || 200, hh.remove !== false); }, hh.delay); })(h);
        }
      }
    }
    // show
    if (stage.showChars && stage.showChars.length) {
      for (var j = 0; j < stage.showChars.length; j++) {
        (function(cc){ later(function () { showSprite(cc, (cc && cc.duration) || speed.show || 240); }, cc && cc.delay); })(stage.showChars[j]);
      }
    }
    // swap
    if (stage.swapChars && stage.swapChars.length) {
      for (var k = 0; k < stage.swapChars.length; k++) {
        var s = stage.swapChars[k];
        if (s && s.match && s.id) (function (ss) { later(function () { swapSprite(ss.match, ss.id, ss.duration || speed.swap || 180, ss.mode || (ss.noOverlay ? 'replace' : null)); }, ss.delay); })(s);
      }
    }

    // move (公主靠近/退开这类镜头)
    if (stage.moveChars && stage.moveChars.length) {
      for (var m = 0; m < stage.moveChars.length; m++) {
        var mv = stage.moveChars[m];
        if (mv && mv.match) {
          (function (mm) { later(function () { moveSpriteTo(mm.match, mm.x, mm.y, mm.duration || speed.move || 420, mm.easing || 'ease-in-out'); }, mm.delay); })(mv);
        }
      }
    }
  }

  function moveSpriteTo(matchKey, x, y, duration, easing) {
    var el = findSpriteByKey(matchKey);
    if (!el) return;

    var base = el.dataset.baseTransform || '';
    var curX = el.dataset.offsetX || '0px';
    var curY = el.dataset.offsetY || '0px';
    var toX = (x != null) ? x : curX;
    var toY = (y != null) ? y : curY;

    var fromT = (base ? (base + ' ') : '') + 'translate(' + curX + ', ' + curY + ')';
    var toT = (base ? (base + ' ') : '') + 'translate(' + toX + ', ' + toY + ')';

    // 先写入目标偏移，保证后续 swap/anim 能继承
    el.dataset.offsetX = toX;
    el.dataset.offsetY = toY;

    try {
      var a = el.animate([{ transform: fromT }, { transform: toT }], { duration: duration || 420, easing: easing || 'ease-in-out', fill: 'forwards' });
      a.onfinish = function () { el.style.transform = toT;
        try {
          if (GG.charAnim && GG.charAnim.restartIdle) {
            var cid = (el.dataset && el.dataset.charId) ? el.dataset.charId : '';
            if (cid.indexOf('homework_slime') >= 0) GG.charAnim.restartIdle('homework_slime');
          }
        } catch (e) {}
      };
    } catch (e) {
      el.style.transform = toT;
      try {
        if (GG.charAnim && GG.charAnim.restartIdle && (el.dataset.charId || '').indexOf('homework_slime') >= 0) {
          GG.charAnim.restartIdle('homework_slime');
        }
      } catch (e2) {}
    }
  }

  function renderCharacters(chars) {
    var layer = GG.$('#character-layer');
    layer.innerHTML = '';
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      var url = GG.getImage(ch.id);
      if (!url) continue;
      var targetOpacity = (ch.opacity != null) ? ch.opacity : 1;
      var pos = ch.position || 'center';
      var sprite = buildSpriteNode(ch.id, url, pos, targetOpacity);
      layer.appendChild(sprite);
      animateSpriteEnter(sprite, targetOpacity);
      // 怪物待机（让它别像贴纸）
      try {
        if (GG.charAnim && ch.id && ch.id.indexOf('homework_slime') >= 0) {
          GG.charAnim.play('homework_slime', 'idle', { duration: 1200 });
        }
      } catch (e) {}
    }
  }

  /**
   * 角色亮暗处理
   */
  function updateCharacterHighlight(speaker) {
    var sprites = GG.$$('.character-sprite');
    if (!speaker || sprites.length <= 1) {
      // 旁白或单人场景：全部正常亮度
      for (var i = 0; i < sprites.length; i++) {
        sprites[i].classList.remove('dimmed', 'speaking');
      }
      return;
    }

    var speakerKey = speakerCharMap[speaker] || (speaker || '').toLowerCase();

    for (var i = 0; i < sprites.length; i++) {
      var charId = sprites[i].dataset.charId || '';
      if (charId.indexOf(speakerKey) >= 0) {
        sprites[i].classList.add('speaking');
        sprites[i].classList.remove('dimmed');
      } else {
        sprites[i].classList.add('dimmed');
        sprites[i].classList.remove('speaking');
      }
    }
  }

  function clearCharacterHighlight() {
    var sprites = GG.$$('.character-sprite');
    for (var i = 0; i < sprites.length; i++) sprites[i].classList.remove('dimmed', 'speaking');
  }

  function showNext() {
    if (!currentScene) return;
    if (waitingChoice) return;

    var dialogs = currentScene.dialogs || [];

    if (dialogIndex >= dialogs.length) {
      typing = false;
      clearAutoTimer();

      GG.$('#click-hint').style.display = 'none';
      clearCharacterHighlight();

      // 场景结束：锁住推进，等待 choiceManager 接管
      waitingChoice = true;

      // 关闭 skip/auto（避免面板打开/结局停留时后台继续推进）
      GG.autoMode = false;
      GG.skipMode = false;
      updateBtnState();

      if (onComplete) onComplete(currentScene);
      return;
    }

    dialogLock = true;
    var d = dialogs[dialogIndex];

    // 名字
    GG.$('#dialog-name').textContent = d.speaker || '';

    // 立绘/镜头即时调整（比如“史莱姆消失”要立刻淡出）
    if (d.stage) {
      applyStageCommands(d.stage);
    }

    // 编辑器导出的对白级立绘（没写 stage 的情况下自动生效）
    applyDialogCharacter(d);

    // 角色亮暗
    updateCharacterHighlight(d.speaker);

    // 轻量“演出”：说话人变化时，给当前说话人一点小动作
    //（如果剧本里已经手写了 charAnim，就别叠加了，免得抽搐）
    try {
      if (d.speaker && d.speaker !== lastSpeaker && GG.charAnim) {
        var k = speakerCharMap[d.speaker] || (d.speaker || '').toLowerCase();

        // 默认：只要设置了 charAnim，就认为该句由作者“手动控制演出”，因此抑制说话人自动轻动；
        // 但如果显式标记 keepAutoSpeaker，则允许保留自动轻动（且避免对同一角色重复触发）
        var allowAuto = true;
        try {
          if (d.charAnim) {
            if (d.charAnim.keepAutoSpeaker) {
              var mid = (d.charAnim.charId != null) ? String(d.charAnim.charId) : '';
              if (mid && (mid.indexOf(k) >= 0 || k.indexOf(mid) >= 0)) allowAuto = false;
            } else {
              allowAuto = false;
            }
          }
        } catch (e2) {
          allowAuto = !d.charAnim;
        }

        if (allowAuto) {
          var anim = 'nod';
          var dur = 460;
          if (k.indexOf('princess') >= 0) { anim = 'sway'; dur = 560; }
          else if (k.indexOf('hina') >= 0) { anim = 'sway'; dur = 520; }
          else if (k.indexOf('homework') >= 0 || k.indexOf('slime') >= 0) { anim = 'bounce'; dur = 520; }
          GG.charAnim.play(k, anim, { duration: dur });
        }
      }
    } catch (e) {}
    lastSpeaker = d.speaker || '';

    // SFX
    if (d.se) {
      var seInfo = GG.getAudio(d.se);
      if (seInfo && !seInfo.fallback) GG.playSE(seInfo.path, seInfo.volume);
    }

    // Auto-SFX (when line has no explicit se)
    if (!d.se) {
      var autoIds = [];
      if (d.effects) {
        if (d.effects.sleep) autoIds.push("se_sleep");
        if (d.effects.wake) autoIds.push("se_wake");
        if (d.effects.eyeOpen) autoIds.push("se_eye_open");
        if (d.effects.beam) autoIds.push("se_beam");
        if (d.effects.spell) autoIds.push("se_magic_sparkle");
        if (d.effects.hit) autoIds.push("se_hit_light");
        if (d.effects.puff) autoIds.push("se_puff");
      }
      if (d.itemShow || d.itemGet) autoIds.push("se_item_show");

      var played = {};
      var playedCount = 0;
      for (var ai = 0; ai < autoIds.length; ai++) {
        var id = autoIds[ai];
        if (played[id]) continue;
        played[id] = true;
        var info = GG.getAudio && GG.getAudio(id);
        if (info && !info.fallback) {
          GG.playSE(info.path, info.volume || 0.6);
          playedCount++;
        }
        if (playedCount >= 2) break;
      }
    }

    // 语音
    GG.stopVoice();
    if (d.voice) {
      var vInfo = GG.getAudio(d.voice);
      if (vInfo && !vInfo.fallback) GG.playVoice(vInfo.path, vInfo.volume);
    }

    
    // 特效处理
    if (d.effects && GG.effects) {
      if (d.effects.shake) GG.effects.shake(d.effects.shake);
      if (d.effects.flash) GG.effects.flash(d.effects.flash);
      if (d.effects.particles) GG.effects.particles(d.effects.particles);
      if (d.effects.dialogShake) GG.effects.dialogShake();
      if (d.effects.textShake) GG.effects.textShake();
      if (d.effects.spell) GG.effects.spell(d.effects.spell);
      if (d.effects.beam) GG.effects.beam(d.effects.beam);
      if (d.effects.hit) GG.effects.hit(d.effects.hit);
      if (d.effects.paperVanish) GG.effects.paperVanish(d.effects.paperVanish);
      if (d.effects.puff) GG.effects.puff(d.effects.puff);
      if (d.effects.eyeClose) GG.effects.eyeClose(d.effects.eyeClose);
      if (d.effects.sleep) GG.effects.sleep(d.effects.sleep);
      if (d.effects.wake) GG.effects.wake(d.effects.wake);
      if (d.effects.eyeOpen) GG.effects.eyeOpen(d.effects.eyeOpen);

    }
    
    // 角色动画
    if (d.charAnim && GG.charAnim) {
      GG.charAnim.play(d.charAnim.charId, d.charAnim.type, d.charAnim.options);
    }
    
    // 道具显示
    if (d.itemShow && GG.itemDisplay) {
      GG.itemDisplay.show(d.itemShow.itemId, d.itemShow.options);
    }
    
    // 道具获得提示
    if (d.itemGet && GG.itemDisplay) {
      GG.itemDisplay.showGet(d.itemGet.itemId, d.itemGet.itemName, d.itemGet.options);
    }
    // 记录日志（读档可能会回到“同一行”，避免重复写入）
    if (suppressNextLogOnce) {
      suppressNextLogOnce = false;
      var last = (GG.dialogLog && GG.dialogLog.length) ? GG.dialogLog[GG.dialogLog.length - 1] : null;
      var same = last && (last.speaker || '') === (d.speaker || '') && last.text === d.text;
      if (!same) GG.addLog(d.speaker, d.text);
    } else {
      GG.addLog(d.speaker, d.text);
    }

    // SKIP模式：直接显示
    if (GG.skipMode) {
      GG.$('#dialog-text').textContent = d.text;
      typing = false;
      dialogIndex++;
      dialogLock = false;
      setTimeout(function () {
        if (!waitingChoice) showNext();
      }, 80);
      return;
    }

    // 打字
    typing = true;
    var textEl = GG.$('#dialog-text');
    currentTw = GG.typewriter(textEl, d.text, GG.settings.textSpeed);
    currentTw.then(function () {
      typing = false;
      currentTw = null;
      dialogIndex++;
      dialogLock = false;

      // AUTO模式：等待后自动推进
      if (GG.autoMode && !waitingChoice) {
        autoTimer = setTimeout(function () {
          showNext();
        }, GG.settings.autoWait * 1000);
      }
    });
  }

  function clearAutoTimer() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  function updateBtnState() {
    var autoBtn = GG.$('#btn-auto');
    var skipBtn = GG.$('#btn-skip');
    if (autoBtn) autoBtn.classList.toggle('active', GG.autoMode);
    if (skipBtn) skipBtn.classList.toggle('active', GG.skipMode);
  }

  // 供 main.js 调用
  GG.updateControlState = updateBtnState;
  GG.clearAutoTimer = clearAutoTimer;

  // 供 choiceManager / main.js 使用：判断/解除“等待选择”锁
  GG._isWaitingChoice = function () { return waitingChoice; };
  GG._setWaitingChoice = function (v) { waitingChoice = !!v; };
})();
