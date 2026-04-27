/**
 * main.js — 游戏页入口：设置、日志、流程调度（标题页已拆到 index.html/title.html）
 */
(function () {
  var GG = window.GG;
  var script = null;

  // 面板打开时临时暂停 AUTO / SKIP，避免后台继续推进
  var overlayPaused = null;

  function el(sel) { return GG.$(sel); }
  function isHidden(node) { return !node || node.classList.contains('hidden'); }

  function anyPanelOpen() {
    return !isHidden(el('#settings-panel')) || !isHidden(el('#log-panel'));
  }

  function hidePanelsOnly() {
    var s = el('#settings-panel'); if (s) s.classList.add('hidden');
    var l = el('#log-panel'); if (l) l.classList.add('hidden');
  }

  function pauseForOverlay() {
    if (overlayPaused) return;
    overlayPaused = { auto: GG.autoMode, skip: GG.skipMode };
    if (GG.autoMode || GG.skipMode) {
      GG.autoMode = false;
      GG.skipMode = false;
      if (GG.clearAutoTimer) GG.clearAutoTimer();
      if (GG.updateControlState) GG.updateControlState();
    }
  }

  function resumeAfterOverlay() {
    if (!overlayPaused) return;
    var waitingChoice = GG._isWaitingChoice ? GG._isWaitingChoice() : false;
    if (!waitingChoice) {
      GG.autoMode = overlayPaused.auto;
      GG.skipMode = overlayPaused.skip;
      if (GG.skipMode) GG.autoMode = false;
      if (GG.updateControlState) GG.updateControlState();
    }
    overlayPaused = null;
  }

  boot();

  function boot() {
    try {
      updateLoading('正在读取剧本…', 10);
      script = GG.loadScript();

      var bar = el('#title-bar');
      if (bar) bar.textContent = script.meta.gameTitle || 'Galgame';

      updateLoading('正在加载资源…', 20);
      GG.preloadAll(script, function (loaded, total) {
        var pct = 20 + Math.floor((loaded / total) * 70);
        updateLoading('加载资源 ' + loaded + '/' + total, pct);
      }).then(function () {
        updateLoading('准备就绪', 100);
        return GG.delay(300);
      }).then(function () {
        hideLoading();
        bindEvents();
        syncSettingsUI();
        // 支持从标题页“继续游戏”进入：game.html?continue=1
        if (!tryContinueFromQuery() && !tryPlaytestFromQuery()) {
          startGame();
        }
      });
    } catch (err) {
      updateLoading('加载失败: ' + err.message, 0);
      console.error('[boot]', err);
    }
  }

  function tryContinueFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var cont = params.get('continue');
      var load = params.get('load');
      if (cont === '1') {
        // 优先 quick，没有就 auto
        return loadQuick(true) || loadAuto(true);
      }
      if (load === 'quick') return loadQuick(true);
      if (load === 'auto') return loadAuto(true);
      return false;
    } catch (e) {
      return false;
    }
  }

  // 支持从编辑器/外部直接跳到某个场景某一句：game.html?scene=scene_xxx&line=12
  function tryPlaytestFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var sceneId = params.get('scene') || params.get('sceneId');
      if (!sceneId) return false;
      var lineRaw = params.get('line') || params.get('dialog') || params.get('dialogIndex');
      var idx = (lineRaw == null || lineRaw === '') ? 0 : parseInt(String(lineRaw), 10);
      if (isNaN(idx) || idx < 0) idx = 0;
      var db = el('#dialog-box');
      if (db) db.classList.add('visible');
      GG.clearLog();
      enterScene(sceneId, idx);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ====== 开始游戏（游戏页默认直接开） ======
  function startGame() {
    var db = el('#dialog-box');
    if (db) db.classList.add('visible');
    GG.clearLog();
    enterScene(script.scenes[0].id);
  }

  // 暴露给 choiceManager
  GG._restartGame = function () {
    try { if (GG.itemDisplay && GG.itemDisplay.clearInventory) GG.itemDisplay.clearInventory(); } catch (e) {}

    GG.stopBGM();
    GG.autoMode = false;
    GG.skipMode = false;
    if (GG.updateControlState) GG.updateControlState();
    GG.clearLog();
    enterScene(script.scenes[0].id);
  };

  GG._showTitle = function () {
    // 拆页后，“回到标题”就是跳回 index.html
    try { window.location.href = 'index.html'; } catch (e) {}
  };

  // ====== 场景 ======
  function enterScene(sceneId, startIndex) {
    var scene = GG.findScene(script, sceneId);
    if (!scene) { console.error('[main] 场景不存在:', sceneId); return; }
    var cb = function (finishedScene) {
      GG.handleSceneEnd(finishedScene, function (nextId) { enterScene(nextId); });
    };
    if (typeof startIndex === 'number' && !isNaN(startIndex) && GG.renderSceneAt) {
      GG.renderSceneAt(script, scene, startIndex, cb);
    } else {
      GG.renderScene(script, scene, cb);
    }
  }

  // ====== 存档 / 读档 / 回标题 ======
  function cloneJsonSafe(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return null; }
  }

  function buildSavePayload(extra) {
    if (!GG.getProgress) return null;
    var p = GG.getProgress();
    if (!p || !p.sceneId) return null;
    var payload = {
      v: 1,
      at: new Date().toISOString(),
      sceneId: p.sceneId,
      dialogIndex: p.dialogIndex || 0,
      log: Array.isArray(GG.dialogLog) ? GG.dialogLog.slice() : [],
      settings: cloneJsonSafe(GG.settings) || GG.settings
    };
    if (extra && typeof extra === 'object') {
      for (var k in extra) payload[k] = extra[k];
    }
    return payload;
  }

  function flashBtn(btn, okText, ms) {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = okText;
    setTimeout(function () { btn.textContent = old; }, ms || 900);
  }

  function saveQuick(btn) {
    var payload = buildSavePayload({ slot: 'quick' });
    if (!payload) {
      flashBtn(btn, '无法存档', 900);
      return false;
    }
    var ok = GG.writeSave && GG.writeSave('quick', payload);
    if (ok) flashBtn(btn, '已存档', 900);
    else flashBtn(btn, '存档失败', 900);
    return !!ok;
  }

  function saveAuto() {
    var payload = buildSavePayload({ slot: 'auto' });
    if (!payload) return false;
    return !!(GG.writeSave && GG.writeSave('auto', payload));
  }

  function applySaveData(data) {
    try {
      if (!data || !data.sceneId) return false;

      // 设置
      if (data.settings && typeof data.settings === 'object') {
        for (var k in data.settings) GG.settings[k] = data.settings[k];
        if (GG.saveSettings) GG.saveSettings();
        syncSettingsUI();
      }

      // 模式清理
      GG.autoMode = false;
      GG.skipMode = false;
      if (GG.clearAutoTimer) GG.clearAutoTimer();
      if (GG.updateControlState) GG.updateControlState();

      closeAllPanels();

      // 日志
      GG.dialogLog = Array.isArray(data.log) ? data.log.slice() : [];

      // 进度
      var idx = parseInt(data.dialogIndex || 0, 10);
      if (isNaN(idx) || idx < 0) idx = 0;

      var scene = GG.findScene(script, data.sceneId);
      if (!scene) return false;

      // 如果“当前行”已经在 log 里，进入场景时跳过一次写 log
      try {
        var d = (scene.dialogs && scene.dialogs[idx]) ? scene.dialogs[idx] : null;
        var last = (GG.dialogLog && GG.dialogLog.length) ? GG.dialogLog[GG.dialogLog.length - 1] : null;
        if (d && last && (last.speaker || '') === (d.speaker || '') && last.text === d.text) {
          if (GG._setSuppressNextLog) GG._setSuppressNextLog(true);
        }
      } catch (e) {}

      GG.stopVoice && GG.stopVoice();
      GG.stopBGM && GG.stopBGM();

      // 读档进入
      enterScene(data.sceneId, idx);
      return true;
    } catch (e) {
      console.error('[save] apply failed', e);
      return false;
    }
  }

  function loadQuick(arg) {
    var silent = (arg === true);
    var btn = (!silent && arg && arg.nodeType === 1) ? arg : null;
    var data = GG.readSave && GG.readSave('quick');
    if (!data) {
      if (!silent) flashBtn(btn, '没有存档', 900);
      return false;
    }
    var ok = applySaveData(data);
    if (!silent) flashBtn(btn, ok ? '已读档' : '读档失败', 900);
    return !!ok;
  }

  function loadAuto(arg) {
    var silent = (arg === true);
    var data = GG.readSave && GG.readSave('auto');
    if (!data) return false;
    var ok = applySaveData(data);
    return silent ? !!ok : !!ok;
  }

  function backToTitle() {
    // 回标题前自动存一份 auto（不打扰你，算是对人类健忘症的温柔补丁）
    var ok = saveAuto();
    var msg = ok
      ? '已自动存到【自动存档】。确定返回标题？'
      : '确定返回标题？（建议先手动存档）';
    if (!confirm(msg)) return;
    
    // 停止游戏BGM
    try {
      if (GG.audioGen && GG.audioGen.stopBGM) {
        GG.audioGen.stopBGM();
      }
    } catch (e) {}
    
    // 标记用户已交互，标题页可以自动播放BGM
    try {
      localStorage.setItem('GG_USER_INTERACTED', '1');
    } catch (e) {}
    
    try { window.location.href = 'index.html'; } catch (e) {}
  }

  // ====== 事件绑定 ======
  function bindEvents() {
    // 对话框点击推进
    var dialogBox = el('#dialog-box');
    if (dialogBox) {
      dialogBox.addEventListener('click', function (e) {
        if (e.target.classList.contains('choice-btn') || e.target.classList.contains('ctrl-btn')) return;
        GG.handleClick();
      });
    }

    // 点击波纹：给鼠标一点存在感（否则你点了跟没点一样）
    var gameContainer = el('#game-container');
    if (gameContainer && GG.effects && GG.effects.ripple) {
      gameContainer.addEventListener('pointerdown', function (e) {
        if (anyPanelOpen()) return;
        // 只响应主按钮/触摸
        if (typeof e.button === 'number' && e.button !== 0) return;

        // 避免拖动音量/速度滑块时刷屏
        var t = e.target;
        if (t && t.closest) {
          if (t.closest('input[type="range"]')) return;
        }
        GG.effects.ripple({ x: e.clientX, y: e.clientY });
      }, { passive: true });
    }

    // 键盘
    document.addEventListener('keydown', function (e) {
      // 面板打开时
      if (anyPanelOpen()) {
        if (e.code === 'Escape') { closeAllPanels(); }
        return;
      }
      // 游戏中
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); GG.handleClick(); }
      if (e.code === 'KeyA') { toggleAuto(); }
      if (e.code === 'KeyS') { toggleSkip(); }
      if (e.code === 'KeyL') { togglePanel('log'); }
      if (e.code === 'Escape') { togglePanel('settings'); }

      // 快捷键（尽量避开浏览器常用键）：F6 存档 / F7 读档 / F8 返回标题
      if (e.code === 'F6') { e.preventDefault(); saveQuick(); }
      if (e.code === 'F7') { e.preventDefault(); loadQuick(); }
      if (e.code === 'F8') { e.preventDefault(); backToTitle(); }
    });

    // 控制按钮
    var btnAuto = el('#btn-auto'); if (btnAuto) btnAuto.addEventListener('click', function (e) { e.stopPropagation(); toggleAuto(); });
    var btnSkip = el('#btn-skip'); if (btnSkip) btnSkip.addEventListener('click', function (e) { e.stopPropagation(); toggleSkip(); });
    var btnSave = el('#btn-save'); if (btnSave) btnSave.addEventListener('click', function (e) { e.stopPropagation(); saveQuick(btnSave); });
    var btnTitle = el('#btn-title'); if (btnTitle) btnTitle.addEventListener('click', function (e) { e.stopPropagation(); backToTitle(); });
    var btnLog = el('#btn-log'); if (btnLog) btnLog.addEventListener('click', function (e) { e.stopPropagation(); togglePanel('log'); });
    var btnSet = el('#btn-settings'); if (btnSet) btnSet.addEventListener('click', function (e) { e.stopPropagation(); togglePanel('settings'); });

    // 面板关闭
    var setClose = el('#btn-settings-close'); if (setClose) setClose.addEventListener('click', function () { closeAllPanels(); });
    var logClose = el('#btn-log-close'); if (logClose) logClose.addEventListener('click', function () { closeAllPanels(); });

    // 设定面板里的快捷按钮
    var btnSaveQuick = el('#btn-save-quick');
    if (btnSaveQuick) btnSaveQuick.addEventListener('click', function () { saveQuick(btnSaveQuick); });
    var btnLoadQuick = el('#btn-load-quick');
    if (btnLoadQuick) btnLoadQuick.addEventListener('click', function () { loadQuick(btnLoadQuick); });
    var btnBackTitle = el('#btn-back-title');
    if (btnBackTitle) btnBackTitle.addEventListener('click', function () { backToTitle(); });

    // 音量滑块
    bindSlider('vol-bgm', function (v) { GG.settings.bgmVol = v / 100; GG.updateBGMVolume(); GG.saveSettings && GG.saveSettings(); });
    bindSlider('vol-se', function (v) { GG.settings.seVol = v / 100; GG.saveSettings && GG.saveSettings(); });
    bindSlider('vol-voice', function (v) { GG.settings.voiceVol = v / 100; GG.saveSettings && GG.saveSettings(); });
    bindSlider('text-speed', function (v) { GG.settings.textSpeed = 90 - v; GG.saveSettings && GG.saveSettings(); }); // 反转：滑块右=更快=更小ms
    bindSlider('auto-wait', function (v) { GG.settings.autoWait = v; GG.saveSettings && GG.saveSettings(); }, true);
  }

  // 从 GG.settings 同步到滑块 UI（支持标题页也共用同一套设置）
  function syncSettingsUI() {
    setSliderVal('vol-bgm', Math.round((GG.settings.bgmVol || 0) * 100));
    setSliderVal('vol-se', Math.round((GG.settings.seVol || 0) * 100));
    setSliderVal('vol-voice', Math.round((GG.settings.voiceVol || 0) * 100));

    // textSpeed: ms/char -> slider v (10..80) via 90 - v
    var v = 90 - (GG.settings.textSpeed || 35);
    v = Math.max(10, Math.min(80, v));
    setSliderVal('text-speed', Math.round(v));

    setSliderVal('auto-wait', (GG.settings.autoWait != null ? GG.settings.autoWait : 2.0), true);
  }

  function setSliderVal(id, v, isFloat) {
    var slider = el('#' + id);
    var valEl = el('#' + id + '-val');
    if (!slider) return;
    slider.value = v;
    if (valEl) valEl.textContent = isFloat ? parseFloat(v).toFixed(1) : String(parseInt(v, 10));
  }

  function bindSlider(id, onChange, isFloat) {
    var slider = el('#' + id);
    var valEl = el('#' + id + '-val');
    if (!slider) return;
    slider.addEventListener('input', function () {
      var v = isFloat ? parseFloat(this.value) : parseInt(this.value, 10);
      if (valEl) valEl.textContent = isFloat ? v.toFixed(1) : v;
      onChange(v);
    });
  }

  // ====== AUTO / SKIP ======
  function toggleAuto() {
    GG.autoMode = !GG.autoMode;
    if (GG.autoMode) GG.skipMode = false;
    GG.updateControlState();
    // 如果刚开启auto且当前不在打字中，推进一下
    if (GG.autoMode) GG.handleClick();
  }

  function toggleSkip() {
    GG.skipMode = !GG.skipMode;
    if (GG.skipMode) { GG.autoMode = false; GG.clearAutoTimer(); }
    GG.updateControlState();
    if (GG.skipMode) GG.handleClick();
  }

  // ====== 面板 ======
  function togglePanel(name) {
    var panelId = name === 'settings' ? '#settings-panel' : '#log-panel';
    var panel = el(panelId);
    if (!panel) return;

    if (panel.classList.contains('hidden')) {
      // 打开面板：暂停 auto/skip，且不要让对话在后台继续跑
      pauseForOverlay();
      hidePanelsOnly();
      if (name === 'log') refreshLog();
      panel.classList.remove('hidden');
      if (GG.clearAutoTimer) GG.clearAutoTimer();
    } else {
      // 关闭当前面板
      panel.classList.add('hidden');
      if (!anyPanelOpen()) resumeAfterOverlay();
    }
  }

  function closeAllPanels() {
    hidePanelsOnly();
    resumeAfterOverlay();
  }

  function refreshLog() {
    var container = el('#log-content');
    if (!container) return;
    container.innerHTML = '';
    var log = GG.dialogLog;
    if (log.length === 0) {
      container.innerHTML = '<p style="color:#666;font-size:13px;text-align:center;">暂无记录</p>';
      return;
    }
    for (var i = 0; i < log.length; i++) {
      var entry = document.createElement('div');
      entry.className = 'log-entry';
      if (log[i].speaker) {
        var name = document.createElement('div');
        name.className = 'log-speaker';
        name.textContent = log[i].speaker;
        entry.appendChild(name);
      }
      var text = document.createElement('div');
      text.className = 'log-text';
      text.textContent = log[i].text;
      entry.appendChild(text);
      container.appendChild(entry);
    }
    container.scrollTop = container.scrollHeight;
  }

  // ====== Loading ======
  function updateLoading(text, pct) {
    var t = el('#loading-text'), p = el('#loading-progress');
    if (t) t.textContent = text;
    if (p) p.style.width = pct + '%';
  }
  function hideLoading() {
    var s = el('#loading-screen');
    if (s) s.classList.add('hidden');
  }
})();
