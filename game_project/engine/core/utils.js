/**
 * utils.js — 工具函数 + 全局设置
 */
(function () {
  var GG = window.GG = window.GG || {};

  // ====== DOM ======
  GG.$ = function (s) { return document.querySelector(s); };
  GG.$$ = function (s) { return document.querySelectorAll(s); };

  // ====== 设置 ======
  GG.settings = {
    bgmVol: 0.4,
    seVol: 0.6,
    voiceVol: 0.8,
    titleBgmOn: 1, // 1开/0关
    textSpeed: 35,   // ms per char
    autoWait: 2.0    // seconds
  };

  // ====== 设置持久化（跨页面：标题页 <-> 游戏页） ======
  var SETTINGS_KEY = 'GG_SETTINGS_V1';

  function isNum(x) { return typeof x === 'number' && !isNaN(x); }

  GG.loadSettings = function () {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return;

      // 只接受数字，防止被奇怪的值污染
      if (isNum(obj.bgmVol)) GG.settings.bgmVol = obj.bgmVol;
      if (isNum(obj.seVol)) GG.settings.seVol = obj.seVol;
      if (isNum(obj.voiceVol)) GG.settings.voiceVol = obj.voiceVol;
      // 标题页音乐开关（1开/0关）
      if (isNum(obj.titleBgmOn)) GG.settings.titleBgmOn = (obj.titleBgmOn ? 1 : 0);
      if (isNum(obj.textSpeed)) GG.settings.textSpeed = obj.textSpeed;
      if (isNum(obj.autoWait)) GG.settings.autoWait = obj.autoWait;
    } catch (e) { /* ignore */ }
  };

  GG.saveSettings = function () {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(GG.settings));
    } catch (e) { /* ignore */ }
  };

  // 页面加载就先读一次
  GG.loadSettings();



  // ====== 存档（localStorage） ======
  // 这里只提供“读/写原始存档对象”的能力；具体存什么由 main.js 组装。
  var SAVE_QUICK_KEY = 'GG_SAVE_QUICK_V1';
  var SAVE_AUTO_KEY = 'GG_SAVE_AUTO_V1';

  function getSaveKey(slot) {
    return (slot === 'auto') ? SAVE_AUTO_KEY : SAVE_QUICK_KEY;
  }

  function safeJsonParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  GG.hasSave = function (slot) {
    try {
      return !!localStorage.getItem(getSaveKey(slot));
    } catch (e) {
      return false;
    }
  };

  GG.readSave = function (slot) {
    try {
      var raw = localStorage.getItem(getSaveKey(slot));
      if (!raw) return null;
      var obj = safeJsonParse(raw);
      if (!obj || typeof obj !== 'object') return null;
      return obj;
    } catch (e) {
      return null;
    }
  };

  GG.writeSave = function (slot, obj) {
    try {
      localStorage.setItem(getSaveKey(slot), JSON.stringify(obj));
      return true;
    } catch (e) {
      return false;
    }
  };

  GG.deleteSave = function (slot) {
    try {
      localStorage.removeItem(getSaveKey(slot));
      return true;
    } catch (e) {
      return false;
    }
  };



  // ====== 延迟 ======
  GG.delay = function (ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  };

  // ====== 打字机效果 ======
  GG.typewriter = function (el, text, speed) {
    speed = speed || GG.settings.textSpeed;
    var resolve;
    var cancelled = false;
    var i = 0;
    var timer = null;
    var done = false;

    el.textContent = '';

    var promise = new Promise(function (r) { resolve = r; });

    function finish() {
      if (done) return;
      done = true;
      if (timer) { clearTimeout(timer); timer = null; }
      resolve();
    }

    function tick() {
      if (cancelled) return;
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        timer = setTimeout(tick, speed);
      } else {
        finish();
      }
    }
    tick();

    promise.skip = function () {
      if (cancelled) return;
      cancelled = true;
      if (timer) { clearTimeout(timer); timer = null; }
      el.textContent = text;
      finish();
    };
    return promise;
  };

    // ====== 音频控制 ======
  function clamp01(x) {
    x = (x == null ? 0 : x);
    return Math.max(0, Math.min(1, x));
  }

  // 当前播放对象：Audio元素 或 生成器ID字符串
  var _bgm = null;
  var _bgmSrc = null;
  var _bgmBaseVol = 1; // 每首BGM自己的基础音量（资源配置），不被滑块“洗掉”
  var _voice = null;

  // 自动播放限制处理：把“开场BGM”先记账，等用户第一次交互再补播
  var _audioUnlocked = false;
  var _pendingBGM = null;

  // SE 音效池：避免连点时互相抢夺
  var _sePools = {}; // src -> { list: Audio[], idx: number }

  function isAutoplayBlocked(err) {
    if (!err) return false;
    var name = err.name || '';
    var msg = (err.message || '').toLowerCase();
    return name === 'NotAllowedError' || name === 'SecurityError' || msg.indexOf('notallowed') >= 0 || msg.indexOf('user gesture') >= 0;
  }


  function safeResumeWebAudio() {
    try {
      if (GG.audioGen) {
        if (GG.audioGen.resume) return GG.audioGen.resume();
        if (GG.audioGen.init) { GG.audioGen.init(); return Promise.resolve(true); }
      }
    } catch (e) {}
    return Promise.resolve(false);
  }

  function isGenRunning() {
    try {
      if (GG.audioGen && GG.audioGen.state) return GG.audioGen.state() === 'running';
    } catch (e) {}
    // 老环境没 state()：别卡死，默认当作可用
    return true;
  }

  function tryConsumePendingBGM() {
    if (!_pendingBGM) return;
    var p = _pendingBGM;
    _pendingBGM = null;
    // 立即补播，别 setTimeout 吃掉“用户激活窗口”
    try { GG.playBGM(p.src, p.baseVol); } catch (e) {}
  }

  GG.unlockAudio = function () {
    // 不要因为 _audioUnlocked 就直接 return。
    // 移动端/Safari 有时会把 AudioContext 再次挂起，需要允许“再次解锁”。
    var ret = safeResumeWebAudio();

    function finalize(ok) {
      if (ok === true || isGenRunning()) _audioUnlocked = true;
      if (_audioUnlocked) tryConsumePendingBGM();
      return _audioUnlocked;
    }

    // resume() 可能返回 Promise，也可能啥都不返回
    if (ret && typeof ret.then === 'function') {
      return ret.then(function (ok) { return finalize(ok); }).catch(function () { return finalize(false); });
    }
    return finalize(true);
  };

  // 监听交互解锁（捕获阶段更稳）。直到真正出声为止才移除监听。
  (function hookUnlockUntilReady() {
    var inFlight = false;

    function handler() {
      if (inFlight) return;
      inFlight = true;
      var r;
      try { r = GG.unlockAudio(); } catch (e) { r = null; }

      function done(unlocked) {
        inFlight = false;
        if (unlocked) {
          document.removeEventListener('pointerdown', handler, true);
          document.removeEventListener('keydown', handler, true);
        }
      }

      if (r && typeof r.then === 'function') {
        r.then(done).catch(function () { done(false); });
      } else {
        done(!!_audioUnlocked);
      }
    }

    document.addEventListener('pointerdown', handler, { capture: true });
    document.addEventListener('keydown', handler, { capture: true });

    // 从标题页跳转过来（用户点击了开始/继续）：尽量在“用户激活窗口”内立刻 resume
    try {
      if (localStorage.getItem('GG_USER_INTERACTED') === '1') {
        localStorage.removeItem('GG_USER_INTERACTED');
        handler();
      }
    } catch (e) {}
  })();

  // 从路径提取生成器ID（仅用于兜底）
  function extractAudioId(path) {
    if (!path) return null;
    // 允许直接传入生成器 id（编辑器注入/脚本导出可能会这么写）
    // 例如："bgm_daily" / "se_click" / "voice_hina_01"
    if (/^(bgm|se|voice)_[a-z0-9_-]+$/i.test(path)) return path;
    // "audios/bgm/bgm_daily.mp3" -> "bgm_daily"
    // "audios/se/se_page_flip.mp3" -> "se_page_flip"
    // "audios/se/click.mp3" -> "se_click"
    // "audios/voices/hina_01.mp3" -> "voice_hina_01"
    var m = path.match(/\/(bgm|se|voices?|voice)\/([^\/?#]+?)\.(mp3|wav|ogg)$/i);
    if (!m) return null;

    var kind = (m[1] || '').toLowerCase();
    var name = m[2] || '';

    if (kind === 'voices') kind = 'voice';
    if (kind === 'bgm' && name.indexOf('bgm_') === 0) name = name.slice(4);
    if (kind === 'se' && name.indexOf('se_') === 0) name = name.slice(3);

    return kind + '_' + name;
  }

  function tryPlayWithGenerator(kind, src, baseVol) {
    if (!GG.audioGen) return false;

    var id = extractAudioId(src);
    if (!id) return false;

    try {
      GG.audioGen.updateVolumes && GG.audioGen.updateVolumes();

      // 生成器支持 baseVol：用于和资源表里配置的 volume 对齐。
      // 传入 baseVol：让每个资源配置的 volume 生效（更好做“存在感”混音）
      if (kind === 'bgm' && GG.audioGen.playBGM) { GG.audioGen.playBGM(id, baseVol); return true; }
      if (kind === 'se' && GG.audioGen.playSE) { GG.audioGen.playSE(id, baseVol); return true; }
    } catch (e) {
      return false;
    }
    return false;
  }

  
GG.playBGM = function (src, baseVol) {
  if (!src) { GG.stopBGM(); return; }

  var bv = (typeof baseVol === 'number') ? baseVol : 1;

  // 同一首BGM，不要反复重启（减少“咔哒”感）
  if (_bgmSrc === src && _bgm) {
    _bgmBaseVol = bv;
    GG.updateBGMVolume();
    return;
  }

  // 自动播放限制：如果没解锁（或 AudioContext 仍是 suspended），先记账，等解锁后补播
  var genSuspended = false;
  try {
    if (GG.audioGen && GG.audioGen.state) genSuspended = (GG.audioGen.state() === 'suspended');
  } catch (e) { genSuspended = false; }

  if ((!_audioUnlocked || genSuspended) && GG.audioGen) {
    _pendingBGM = { src: src, baseVol: bv };
    _bgm = null;
    _bgmSrc = src;
    _bgmBaseVol = bv;

    // 如果这次调用刚好发生在用户手势里（比如刚点了“开始”/点了下一句），这里能直接解锁并补播
    try { GG.unlockAudio && GG.unlockAudio(); } catch (e2) {}
    return;
  }

  GG.stopBGM();
  _bgmSrc = src;
  _bgmBaseVol = bv;

  // 先用 WebAudio 生成器（默认替换 mp3，mp3 作为极少数环境的 fallback）
  if (tryPlayWithGenerator('bgm', src, _bgmBaseVol)) {
    _bgm = extractAudioId(src) || null; // 记住当前是“生成器BGM”
    return;
  }

  // fallback：真实音频文件（mp3）
  var a = new Audio(src);
  a.preload = 'auto';
  a.loop = true;
  a.volume = clamp01(_bgmBaseVol * GG.settings.bgmVol);

  var p = a.play();
  if (p && p.catch) {
    p.catch(function (err) {
      // 自动播放限制：记账，等用户第一次交互后补播
      if (!_audioUnlocked && isAutoplayBlocked(err)) {
        _pendingBGM = { src: src, baseVol: _bgmBaseVol };
        a.pause();
        a.currentTime = 0;
        _bgm = null;
        return;
      }
      // 其他原因：再试一次生成器兜底
      if (tryPlayWithGenerator('bgm', src, _bgmBaseVol)) {
        _bgm = extractAudioId(src) || null;
        return;
      }
    });
  }

  _bgm = a;
};

  GG.updateBGMVolume = function () {
    safeResumeWebAudio();
    if (GG.audioGen && GG.audioGen.updateVolumes) {
      GG.audioGen.updateVolumes();
    }
    // 生成器BGM：同步 baseVol（每首曲子配置的 volume）
    if (_bgm && typeof _bgm === 'string' && GG.audioGen && GG.audioGen.playBGM) {
      try { GG.audioGen.playBGM(_bgm, _bgmBaseVol); } catch (e) {}
    }
    if (_bgm && typeof _bgm === 'object' && _bgm.volume != null) {
      _bgm.volume = clamp01(_bgmBaseVol * GG.settings.bgmVol);
    }
  };

  GG.stopBGM = function () {
    _pendingBGM = null;

    if (GG.audioGen && GG.audioGen.stopBGM) {
      try { GG.audioGen.stopBGM(); } catch (e) {}
    }

    if (_bgm && typeof _bgm === 'object') {
      try {
        _bgm.pause();
        _bgm.currentTime = 0;
      } catch (e) {}
    }

    _bgm = null;
    _bgmSrc = null;
  };

  
GG.playSE = function (src, baseVol) {
  if (!src) return;

  var bv = (typeof baseVol === 'number') ? baseVol : 1;

  // 没解锁时，SE 不强求（用户第一次点击后自然会响）
  if (!_audioUnlocked && GG.audioGen) return;

  // 默认优先走 WebAudio 生成器（更轻、更快、不会因为音频文件缺失而静默）
  if (tryPlayWithGenerator('se', src, bv)) return;

  // fallback：mp3（老环境）
  // 音效池（每个src最多6个实例足够了）
  var pool = _sePools[src];
  if (!pool) {
    pool = _sePools[src] = { list: [], idx: 0 };
    for (var i = 0; i < 6; i++) {
      var aa = new Audio(src);
      aa.preload = 'auto';
      pool.list.push(aa);
    }
  }

  var a = pool.list[pool.idx % pool.list.length];
  pool.idx++;

  try {
    a.pause();
    a.currentTime = 0;
  } catch (e) {}

  a.volume = clamp01(bv * GG.settings.seVol);

  var p = a.play();
  if (p && p.catch) {
    p.catch(function () {});
  }
};

  GG.playVoice = function (src, baseVol) {
    GG.stopVoice();
    if (!src) return;

    var bv = (typeof baseVol === 'number') ? baseVol : 1;
    var a = new Audio(src);
    a.preload = 'auto';
    a.volume = clamp01(bv * GG.settings.voiceVol);

    var p = a.play();
    if (p && p.catch) {
      p.catch(function (err) {
        if (!_audioUnlocked && isAutoplayBlocked(err)) {
          // 语音被拦就算了，等用户交互后自然能播（后续台词会触发）
          return;
        }
      });
    }

    _voice = a;
  };

  GG.stopVoice = function () {
    if (_voice) {
      try { _voice.pause(); _voice.currentTime = 0; } catch (e) {}
      _voice = null;
    }
  };

// ====== 对话记录 ======
  GG.dialogLog = [];

  GG.addLog = function (speaker, text) {
    GG.dialogLog.push({ speaker: speaker || '', text: text });
  };

  GG.clearLog = function () {
    GG.dialogLog = [];
  };
})();
