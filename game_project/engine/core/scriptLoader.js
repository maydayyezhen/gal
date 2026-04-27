/**
 * scriptLoader.js — 剧本读取与解析
 *
 * 现实提醒：编辑器里能显示/选择的立绘，不一定被写进 resources.images。
 * 游戏端如果只信 resources 预加载，就会出现“编辑器有图，游戏没图”。
 *
 * 这里做兜底：扫描剧本里实际引用到的 bg/char/item/fx，把缺失的资源自动补进 resources。
 */
(function () {
  var GG = window.GG = window.GG || {};

  function ensureArray(v) { return Array.isArray(v) ? v : []; }

  function inferImageTypeById(id) {
    if (!id) return 'item';
    if (id.indexOf('bg_') === 0) return 'background';
    if (id.indexOf('char_') === 0) return 'character';
    // item_ / fx_ 都走 item
    return 'item';
  }

  function inferAudioTypeById(id) {
    if (!id) return 'se';
    if (id.indexOf('bgm_') === 0) return 'bgm';
    if (id.indexOf('voice_') === 0 || id.indexOf('voices_') === 0) return 'voice';
    if (id.indexOf('se_') === 0) return 'se';
    // 兜底：当作音效
    return 'se';
  }

  // 某些道具的 id 和文件名不一致（人类命名习惯，懂的都懂）
  var SPECIAL_ITEM_FILE = {
    'item_sword': 'plastic_sword.png'
  };

  function guessImagePath(id) {
    if (!id) return null;

    // 如果用户已经直接写了路径（或者带扩展名），尊重它。
    if (id.indexOf('/') >= 0 || id.indexOf('\\') >= 0 || id.indexOf('.') >= 0) return id;

    if (id.indexOf('bg_') === 0) {
      return 'images/backgrounds/' + id.substring(3) + '.png';
    }
    if (id.indexOf('char_') === 0) {
      return 'images/characters/' + id.substring(5) + '.png';
    }

    if (SPECIAL_ITEM_FILE[id]) {
      return 'images/others/' + SPECIAL_ITEM_FILE[id];
    }

    if (id.indexOf('item_') === 0) {
      return 'images/others/' + id.substring(5) + '.png';
    }
    if (id.indexOf('fx_') === 0) {
      return 'images/others/' + id.substring(3) + '.png';
    }

    // 兜底：当作 others 下的 png
    return 'images/others/' + id + '.png';
  }

  function guessAudioPath(id) {
    if (!id) return null;

    // 如果用户已经直接写了路径/文件名（带扩展名），尊重它。
    if (id.indexOf('/') >= 0 || id.indexOf('\\') >= 0 || id.indexOf('.') >= 0) return id;

    // 约定：BGM/SE/VOICE 的默认路径
    if (id.indexOf('bgm_') === 0) return 'audios/bgm/' + id + '.mp3';
    if (id.indexOf('se_') === 0) return 'audios/se/' + id + '.mp3';
    if (id.indexOf('voice_') === 0) return 'audios/voices/' + id + '.mp3';

    // 兜底：直接用 id（让 WebAudio 生成器还能播）
    return id;
  }

  function collectReferencedImageIds(script) {
    var ids = [];
    function push(id) {
      if (!id) return;
      if (ids.indexOf(id) < 0) ids.push(id);
    }

    var scenes = ensureArray(script.scenes);
    scenes.forEach(function (scene) {
      if (!scene) return;
      push(scene.background);

      var chars = ensureArray(scene.characters);
      chars.forEach(function (c) { push(c && c.id); });

      var dialogs = ensureArray(scene.dialogs);
      dialogs.forEach(function (d) {
        if (!d) return;
        push(d.character);

        // 单次道具展示
        if (d.itemShow && d.itemShow.itemId) push(d.itemShow.itemId);
        if (d.itemHide && d.itemHide.itemId) push(d.itemHide.itemId);

        // 舞台操作里可能直接带资源 id
        var st = d.stage || {};
        ensureArray(st.showChars).forEach(function (c2) { push(c2 && c2.id); });
        ensureArray(st.swapChars).forEach(function (c3) { push(c3 && c3.id); });

        ensureArray(st.showItems).forEach(function (it) { push(it && it.id); });
        ensureArray(st.hideItems).forEach(function (it2) { push(it2 && it2.id); });
      });
    });

    return ids;
  }

  function collectReferencedAudioIds(script) {
    var ids = [];
    function push(id) {
      if (!id) return;
      if (ids.indexOf(id) < 0) ids.push(id);
    }

    var scenes = ensureArray(script.scenes);
    scenes.forEach(function (scene) {
      if (!scene) return;
      push(scene.bgm);

      var dialogs = ensureArray(scene.dialogs);
      dialogs.forEach(function (d) {
        if (!d) return;
        push(d.se);
        push(d.voice);

        // 有些剧本会把“场景切换音效/额外音效”写在 effects 里
        // （这里不强行定义格式，只做弱扫描）
        var fx = d.effects || d.fx || null;
        if (fx && typeof fx === 'object') {
          if (fx.se) push(fx.se);
          if (fx.bgm) push(fx.bgm);
        }
      });
    });

    // 关键交互音效：就算剧本没写，也尽量让它存在（否则全程静音很尴尬）
    push('se_click');
    push('se_transition');

    return ids;
  }

  function ensureResourceCoverage(script) {
    script.resources = script.resources || {};
    script.resources.images = ensureArray(script.resources.images);
    script.resources.audios = ensureArray(script.resources.audios);

    var imgSet = {};
    for (var i = 0; i < script.resources.images.length; i++) {
      var r = script.resources.images[i];
      if (r && r.id) imgSet[r.id] = true;
    }

    var refs = collectReferencedImageIds(script);
    for (var j = 0; j < refs.length; j++) {
      var id = refs[j];
      if (!id || imgSet[id]) continue;
      script.resources.images.push({
        id: id,
        type: inferImageTypeById(id),
        path: guessImagePath(id)
      });
      imgSet[id] = true;
      // console.log('[ScriptLoader] Auto-added missing image resource:', id);
    }

    // ===== 音频资源兜底：避免“编辑器选了BGM，游戏里却还是旧BGM/没声音” =====
    var audSet = {};
    for (var a = 0; a < script.resources.audios.length; a++) {
      var ar = script.resources.audios[a];
      if (ar && ar.id) audSet[ar.id] = true;
    }

    var aRefs = collectReferencedAudioIds(script);
    for (var b = 0; b < aRefs.length; b++) {
      var aid = aRefs[b];
      if (!aid || audSet[aid]) continue;

      var at = inferAudioTypeById(aid);
      var dv = (at === 'bgm') ? 0.40 : (at === 'voice' ? 0.80 : 0.70);
      script.resources.audios.push({
        id: aid,
        type: at,
        path: guessAudioPath(aid),
        volume: dv
      });
      audSet[aid] = true;
    }
  }

  GG.loadScript = function () {
    if (typeof SCRIPT_DATA === 'undefined') {
      throw new Error('SCRIPT_DATA 未定义，请确保 script.js 已加载');
    }
    var s = SCRIPT_DATA;
    if (!s.meta || !s.resources || !s.scenes) throw new Error('剧本缺少必要字段');
    if (!Array.isArray(s.scenes) || s.scenes.length === 0) throw new Error('剧本 scenes 为空');
    for (var i = 0; i < s.scenes.length; i++) {
      if (!s.scenes[i].id) throw new Error('存在无 id 的场景');
    }

    // 关键：补齐缺失资源，避免“编辑器有图，游戏没图”
    ensureResourceCoverage(s);

    return s;
  };

  GG.findResource = function (script, id) {
    if (!id) return null;
    var all = (script.resources.images || []).concat(script.resources.audios || []);
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  };

  GG.findScene = function (script, sceneId) {
    for (var i = 0; i < script.scenes.length; i++) {
      if (script.scenes[i].id === sceneId) return script.scenes[i];
    }
    return null;
  };
})();
