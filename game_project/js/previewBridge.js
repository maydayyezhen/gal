/*
 * Editor Preview Bridge (P-01)
 * - 运行在 preview.html 的 iframe 内
 * - 接收 editor.html 发来的剧本/场景/对话索引
 * - 调用 GG.previewSceneAt 做“即时渲染”
 */

(function () {
  const OVERLAY_ID = 'preview-overlay';

  function $(sel) { return document.querySelector(sel); }

  function showOverlay(text) {
    const el = document.getElementById(OVERLAY_ID);
    if (!el) return;
    el.textContent = text || '...';
    el.classList.remove('hidden');
  }

  function hideOverlay() {
    const el = document.getElementById(OVERLAY_ID);
    if (!el) return;
    el.classList.add('hidden');
  }

  function postToParent(type, data) {
    if (!window.parent) return;
    window.parent.postMessage(Object.assign({ type: `editorPreview:${type}` }, data || {}), '*');
  }

  // 预览模式默认静音（避免你一边调参数一边被 BGM 支配 🙃）
  let muted = true;
  const __audio = {
    playBGM: null,
    playSE: null,
    playVoice: null,
    stopBGM: null,
    stopVoice: null
  };

  function hookAudio() {
    if (!window.GG) return;
    if (!__audio.playBGM) __audio.playBGM = GG.playBGM;
    if (!__audio.playSE) __audio.playSE = GG.playSE;
    if (!__audio.playVoice) __audio.playVoice = GG.playVoice;
    if (!__audio.stopBGM) __audio.stopBGM = GG.stopBGM;
    if (!__audio.stopVoice) __audio.stopVoice = GG.stopVoice;
  }

  function applyMute(nextMuted) {
    muted = !!nextMuted;
    hookAudio();

    if (!window.GG) return;

    if (muted) {
      // 直接掐掉播放接口（更彻底），同时停掉当前音频
      GG.playBGM = function () {};
      GG.playSE = function () {};
      GG.playVoice = function () {};
      try { __audio.stopBGM && __audio.stopBGM(); } catch (e) {}
      try { __audio.stopVoice && __audio.stopVoice(); } catch (e) {}
    } else {
      // 还原
      if (__audio.playBGM) GG.playBGM = __audio.playBGM;
      if (__audio.playSE) GG.playSE = __audio.playSE;
      if (__audio.playVoice) GG.playVoice = __audio.playVoice;
    }
  }

  // 资源/剧本加载签名，用于避免每次都全量 preload
  let lastSig = '';
  let loadedScript = null;

  function signatureOf(script) {
    try {
      const m = script && script.meta ? JSON.stringify(script.meta).length : 0;
      const r = script && script.resources ? JSON.stringify(script.resources).length : 0;
      const s = script && script.scenes ? script.scenes.length : 0;
      return `${m}|${r}|${s}`;
    } catch (e) {
      return String(Date.now());
    }
  }

  async function ensureScriptLoaded(script) {
    if (!window.GG) throw new Error('GG 未初始化');
    if (!script) throw new Error('script 为空');

    window.SCRIPT_DATA = script;
    loadedScript = GG.loadScript();

    const sig = signatureOf(script);
    if (sig !== lastSig) {
      showOverlay('加载资源中…');
      await GG.preloadAll(loadedScript);
      lastSig = sig;
    }
  }

  async function handlePreviewMessage(msg) {
    const { script, sceneId, dialogIndex, options } = msg || {};

    applyMute(options && typeof options.muted !== 'undefined' ? options.muted : muted);

    await ensureScriptLoaded(script);

    if (!GG.previewSceneAt) {
      throw new Error('GG.previewSceneAt 未找到（sceneManager.js 需要支持 P-01）');
    }

    const idx = typeof dialogIndex === 'number' ? dialogIndex : 0;
    GG.previewSceneAt(loadedScript, sceneId, idx, {
      muted,
      includeHistoryItems: true,
      applyEffects: true
    });

    hideOverlay();
    postToParent('ack', { ok: true, dialogIndex: idx });
  }

  window.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'editorPreview:ping') {
      postToParent('ready');
      return;
    }
    if (msg.type !== 'editorPreview:preview') return;

    handlePreviewMessage(msg).catch((err) => {
      console.error(err);
      showOverlay('预览出错：' + (err && err.message ? err.message : String(err)));
      postToParent('error', { message: (err && err.message) ? err.message : String(err) });
    });
  });

  // 页面加载完成就通知编辑器
  window.addEventListener('load', () => {
    applyMute(true);
    postToParent('ready');
  });
})();
