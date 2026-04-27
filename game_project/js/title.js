/**
 * title.js — 标题页逻辑（index.html/title.html）
 * 目标：让你能在一个单独文件里放心“美术化”标题界面，不用翻整个游戏页。
 */
(function () {
  var GG = window.GG = window.GG || {};
  var script = null;

  function el(sel) { return GG.$ ? GG.$(sel) : document.querySelector(sel); }
  function isHidden(node) { return !node || node.classList.contains('hidden'); }

  boot();

  function boot() {
    try {
      script = GG.loadScript ? GG.loadScript() : (window.SCRIPT_DATA || null);
      var title = (script && script.meta && script.meta.gameTitle) ? script.meta.gameTitle : 'Galgame';
      var nameEl = el('#title-name');
      if (nameEl) nameEl.textContent = title;

      syncSettingsUI();
      bindEvents();
      initTitleFX();
      // 音乐系统在独立模块中初始化
    } catch (e) {
      console.error('[title] boot failed:', e);
    }
  }

  // ====== Title Screen FX ======
  // 目标：不靠“大力出奇迹”的滤镜，用少量粒子做出独特氛围。
  function initTitleFXLegacy() {
    var screen = el('#title-screen');
    if (!screen) return;

    // 粒子 canvas
    var canvas = document.createElement('canvas');
    canvas.id = 'title-particles-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';

    // 插到 bg 之上、内容之下
    var content = el('#title-content');
    if (content) screen.insertBefore(canvas, content);
    else screen.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var parts = [];
    var raf = null;
    var lastT = performance.now();

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 颜色更冬一点：冷蓝 + 金色微光
    var palette = {
      snow: 'rgba(255,255,255,',
      dust: ['rgba(240,198,116,', 'rgba(112,208,255,', 'rgba(200,190,175,']
    };

    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function spawnSnow() {
      return {
        type: 'snow',
        x: rand(0, W),
        y: rand(-H * 0.2, H),
        r: rand(0.8, 2.6),
        vx: rand(-0.18, 0.22),
        vy: rand(0.25, 0.75),
        wob: rand(0, Math.PI * 2),
        wobV: rand(0.004, 0.012),
        a: rand(0.12, 0.38)
      };
    }

    function spawnBokeh() {
      var base = pick(palette.dust);
      return {
        type: 'bokeh',
        x: rand(-W * 0.1, W * 1.1),
        y: rand(0, H),
        r: rand(18, 64),
        vx: rand(-0.06, 0.08),
        vy: rand(-0.10, -0.02),
        a: rand(0.04, 0.12),
        p: rand(0, Math.PI * 2),
        pv: rand(0.004, 0.010),
        c: base
      };
    }

    function spawnSpark() {
      return {
        type: 'spark',
        x: rand(0, W),
        y: rand(0, H),
        r: rand(2, 5),
        a: 0,
        dir: 1,
        life: rand(0.6, 1.4)
      };
    }

    // 初始量（克制一点，不然你电脑风扇会觉得我在针对它）
    var SNOW_N = 42;
    var BOKEH_N = 18;
    var SPARK_N = 10;
    for (var i = 0; i < SNOW_N; i++) parts.push(spawnSnow());
    for (var j = 0; j < BOKEH_N; j++) parts.push(spawnBokeh());
    for (var k = 0; k < SPARK_N; k++) parts.push(spawnSpark());

    function drawSpark(p) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.a)) * 0.65;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      var s = p.r;
      // 十字星
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s * 2.2);
      ctx.lineTo(p.x + s * 0.45, p.y - s * 0.45);
      ctx.lineTo(p.x + s * 2.2, p.y);
      ctx.lineTo(p.x + s * 0.45, p.y + s * 0.45);
      ctx.lineTo(p.x, p.y + s * 2.2);
      ctx.lineTo(p.x - s * 0.45, p.y + s * 0.45);
      ctx.lineTo(p.x - s * 2.2, p.y);
      ctx.lineTo(p.x - s * 0.45, p.y - s * 0.45);
      ctx.closePath();
      ctx.fill();

      // 光晕
      ctx.globalAlpha = p.a * 0.10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function loop(t) {
      var dt = Math.min(33, t - lastT);
      lastT = t;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.type === 'snow') {
          p.wob += p.wobV;
          p.x += p.vx + Math.sin(p.wob) * 0.10;
          p.y += p.vy;
          if (p.y > H + 10) { p.y = -10; p.x = rand(0, W); }
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;

          ctx.save();
          ctx.globalAlpha = p.a;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = p.a * 0.12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'bokeh') {
          p.p += p.pv;
          var pulse = 0.6 + Math.sin(p.p) * 0.4;
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -p.r - 20) { p.y = H + p.r + 20; p.x = rand(-W * 0.1, W * 1.1); }
          if (p.x < -W * 0.2) p.x = W * 1.2;
          if (p.x > W * 1.2) p.x = -W * 0.2;

          var a = p.a * pulse;
          ctx.save();
          ctx.globalAlpha = a;
          var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          var c = p.c;
          grd.addColorStop(0, c + (a * 0.85).toFixed(3) + ')');
          grd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'spark') {
          // 闪一下就够了
          var step = (dt / 1000) / p.life;
          p.a += (p.dir > 0 ? step * 1.6 : -step * 1.3);
          if (p.a >= 1) { p.a = 1; p.dir = -1; }
          if (p.a <= 0) {
            p.x = rand(0, W);
            p.y = rand(0, H);
            p.r = rand(2, 5);
            p.life = rand(0.6, 1.4);
            p.dir = 1;
            p.a = 0;
          }
          drawSpark(p);
        }
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    // 轻微视差：鼠标移动时，让背景和标题内容有一点点“呼吸感”
    var bg = el('#title-bg');
    var inner = el('#title-content');
    var tx = 0, ty = 0;
    function onMove(e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1;
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      tx = nx; ty = ny;
      if (bg) bg.style.transform = 'scale(1.04) translate(' + (-tx * 10).toFixed(1) + 'px,' + (-ty * 8).toFixed(1) + 'px)';
      if (inner) inner.style.transform = 'translate(' + (tx * 6).toFixed(1) + 'px,' + (ty * 4).toFixed(1) + 'px)';
    }
    window.addEventListener('mousemove', onMove);

    // 防止离开页面时残留 RAF（虽然跳转会刷新，但强迫症还是要治）
    window.addEventListener('beforeunload', function () {
      try { if (raf) cancelAnimationFrame(raf); } catch (e) {}
    });
  }

  function bindEvents() {
    // 点击波纹：标题界面也给点反馈，不然太像PPT
    var ts = el('#title-screen');
    if (ts) {
      ts.addEventListener('pointerdown', function (e) {
        if (typeof e.button === 'number' && e.button !== 0) return;
        var t = e.target;
        if (t && t.closest && t.closest('input[type="range"]')) return;
        var size = Math.max(90, Math.min(220, Math.min(window.innerWidth, window.innerHeight) * 0.22));
        var r = document.createElement('div');
        r.style.position = 'fixed';
        r.style.left = (e.clientX - size / 2) + 'px';
        r.style.top = (e.clientY - size / 2) + 'px';
        r.style.width = size + 'px';
        r.style.height = size + 'px';
        r.style.border = '2px solid rgba(255,255,255,0.35)';
        r.style.borderRadius = '999px';
        r.style.pointerEvents = 'none';
        r.style.zIndex = '10';
        r.style.boxShadow = '0 0 18px rgba(255,255,255,0.10)';
        r.style.mixBlendMode = 'screen';
        ts.appendChild(r);
        try {
          r.animate([{ transform: 'scale(0.18)', opacity: 0.75 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(0.18,0.9,0.2,1)', fill: 'forwards' }).onfinish = function () { if (r.parentNode) r.parentNode.removeChild(r); };
        } catch (e2) {
          r.style.transform = 'scale(1.25)';
          r.style.opacity = '0';
          setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 560);
        }
      }, { passive: true });
    }

    var btnStart = el('#btn-start');
    if (btnStart) btnStart.addEventListener('click', startGame);

    // 继续游戏（有存档才显示）
    var btnContinue = el('#btn-continue');
    if (btnContinue) {
      var has = (GG.hasSave && (GG.hasSave('quick') || GG.hasSave('auto')));
      if (has) {
        btnContinue.classList.remove('is-hidden');
        btnContinue.addEventListener('click', continueGame);
      }
    }

    var btnSettings = el('#btn-settings-title');
    if (btnSettings) btnSettings.addEventListener('click', function () { toggleSettings(); });

    var btnClose = el('#btn-settings-close');
    if (btnClose) btnClose.addEventListener('click', function () { closeSettings(); });

    // 点 footer 也能开始（更像 VN）
    var footer = el('#title-footer');
    if (footer) footer.addEventListener('click', startGame);

    // 键盘
    document.addEventListener('keydown', function (e) {
      // settings 打开时，ESC 关掉
      if (!isHidden(el('#settings-panel'))) {
        if (e.code === 'Escape') { closeSettings(); }
        return;
      }
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); startGame(); }
      if (e.code === 'Escape') { toggleSettings(); }
    });

    // 滑块
    bindSlider('vol-bgm', function (v) {
      GG.settings.bgmVol = v / 100;
      try { GG.audioGen && GG.audioGen.updateVolumes && GG.audioGen.updateVolumes(); } catch (e) {}
      try { window.TitleMusic && window.TitleMusic.updateVolume && window.TitleMusic.updateVolume(); } catch (e) {}
      GG.saveSettings && GG.saveSettings();
    });
    bindSlider('vol-se', function (v) {
      GG.settings.seVol = v / 100;
      try { GG.audioGen && GG.audioGen.updateVolumes && GG.audioGen.updateVolumes(); } catch (e) {}
      GG.saveSettings && GG.saveSettings();
    });
    bindSlider('vol-voice', function (v) {
      GG.settings.voiceVol = v / 100;
      try { GG.audioGen && GG.audioGen.updateVolumes && GG.audioGen.updateVolumes(); } catch (e) {}
      GG.saveSettings && GG.saveSettings();
    });
    bindSlider('text-speed', function (v) { GG.settings.textSpeed = 90 - v; GG.saveSettings && GG.saveSettings(); });
    bindSlider('auto-wait', function (v) { GG.settings.autoWait = v; GG.saveSettings && GG.saveSettings(); }, true);
  }

  function startGame() {
    try {
      var se = GG.getAudio && GG.getAudio('se_click');
      if (se && !se.fallback) GG.playSE(se.path, se.volume);
    } catch (e) {}
    
    // 停止标题BGM
    try {
      if (window.TitleMusic && window.TitleMusic.stop) {
        window.TitleMusic.stop();
      }
    } catch (e) {}
    
    // 标记用户已交互，游戏页可以自动播放BGM
    try {
      localStorage.setItem('GG_USER_INTERACTED', '1');
    } catch (e) {}
    
    try {
      window.location.href = 'game.html';
    } catch (e) {}
  }

  function continueGame() {
    try {
      var se = GG.getAudio && GG.getAudio('se_click');
      if (se && !se.fallback) GG.playSE(se.path, se.volume);
    } catch (e) {}
    
    // 停止标题BGM
    try {
      if (window.TitleMusic && window.TitleMusic.stop) {
        window.TitleMusic.stop();
      }
    } catch (e) {}
    
    // 标记用户已交互
    try {
      localStorage.setItem('GG_USER_INTERACTED', '1');
    } catch (e) {}
    
    try {
      window.location.href = 'game.html?continue=1';
    } catch (e) {}
  }

  // ====== Title Music (WebAudio) ======
  function initTitleMusic() {
    var btn = el('#btn-title-music');
    if (!btn) {
      var menu = el('#title-menu');
      if (menu) {
        btn = document.createElement('button');
        btn.className = 'title-btn';
        btn.id = 'btn-title-music';
        btn.textContent = '标题音乐：开';
        menu.appendChild(btn);
      }
    }
    if (!btn) return;

    var started = false;

    function label() {
      btn.textContent = (GG.settings && GG.settings.titleBgmOn) ? '标题音乐：开' : '标题音乐：关';
    }

    function startIfAllowed() {
      if (!GG.settings || !GG.settings.titleBgmOn) return;
      // 先解锁音频（会 resume WebAudio）
      try { GG.unlockAudio && GG.unlockAudio(); } catch (e) {}

      try {
        if (GG.audioGen && GG.audioGen.playBGM) {
          GG.audioGen.playBGM('bgm_title', 0.95);
          started = true;
        }
      } catch (e2) {}
    }

    function stopNow() {
      try { if (GG.audioGen && GG.audioGen.stopBGM) GG.audioGen.stopBGM(); } catch (e) {}
      started = false;
    }

    function shouldIgnoreAutoStart(target) {
      if (!target) return false;
      // 点开关按钮/滑块时别“自动开声”，否则你会感觉我在抢戏
      if (target.closest && target.closest('#btn-title-music')) return true;
      if (target.closest && target.closest('#settings-panel')) return true;
      return false;
    }

    label();

    // 第一次交互后尝试启动（受浏览器自动播放限制影响，必须要用户手势）
    document.addEventListener('pointerdown', function (e) {
      if (shouldIgnoreAutoStart(e.target)) return;
      if (!started) startIfAllowed();
    }, { capture: true, once: true });
    document.addEventListener('keydown', function (e) {
      if (!started) startIfAllowed();
    }, { capture: true, once: true });

    // 按钮开关（也兼容“点一下就出声”的直觉）
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!GG.settings) GG.settings = {};

      // 如果还没响过，而开关是“开”，那这一下就当作“启动/解锁声音”，不要反手给人关掉🙂
      if (GG.settings.titleBgmOn && !started) {
        startIfAllowed();
        return;
      }

      GG.settings.titleBgmOn = GG.settings.titleBgmOn ? 0 : 1;
      try { GG.saveSettings && GG.saveSettings(); } catch (e2) {}
      label();

      if (GG.settings.titleBgmOn) {
        startIfAllowed();
      } else {
        stopNow();
      }
    });

    // 如果用户之前关掉了，就别自作聪明开声
    // 如果开着，等第一次交互会自动响起来
  }

  function toggleSettings() {
    var panel = el('#settings-panel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }

  function closeSettings() {
    var panel = el('#settings-panel');
    if (panel) panel.classList.add('hidden');
  }

  function syncSettingsUI() {
    setSliderVal('vol-bgm', Math.round((GG.settings.bgmVol || 0) * 100));
    setSliderVal('vol-se', Math.round((GG.settings.seVol || 0) * 100));
    setSliderVal('vol-voice', Math.round((GG.settings.voiceVol || 0) * 100));

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

  // ====== 标题页“美术化”小特效：独特粒子 + 轻微视差 ======
  function initTitleFX() {
    var screen = el('#title-screen');
    var bg = el('#title-bg');
    var content = el('#title-content');
    if (!screen) return;

    // canvas 粒子层（插在 bg 后面、content 前面）
    var canvas = document.createElement('canvas');
    canvas.id = 'title-particles-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';
    if (content) screen.insertBefore(canvas, content);
    else screen.appendChild(canvas);

    // 让内容层永远在最上
    if (content) content.style.zIndex = '2';
    var footer = el('#title-footer');
    if (footer) footer.style.zIndex = '2';

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);


// 你新加的雪花贴图：有就用，没有就退回画圆
var snowImg = new Image();
var snowReady = false;
snowImg.onload = function () { snowReady = true; };
snowImg.onerror = function () { snowReady = false; };
snowImg.src = 'images/others/snowflake_single.png';

    // 粒子：雪 + 光尘（bokeh） + 星光闪
    var particles = [];
    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

    var bokehColors = [
      'rgba(240,198,116,0.18)',
      'rgba(112,208,255,0.12)',
      'rgba(190,160,255,0.11)',
      'rgba(255,255,255,0.08)'
    ];

    function spawnSnow() {
      return {
        t: 'snow',
        x: rand(0, W),
        y: rand(-H * 0.2, H),
        r: rand(1.2, 3.6),
        vx: rand(-0.18, 0.18),
        vy: rand(0.25, 0.85),
        w: rand(0, Math.PI * 2),
        wa: rand(0.004, 0.014),
        a: rand(0.25, 0.65),
        rot: rand(0, Math.PI * 2),
        rotV: rand(-0.012, 0.012)
      };
    }

    function spawnBokeh() {
      return {
        t: 'bokeh',
        x: rand(-W * 0.1, W * 1.1),
        y: rand(0, H),
        r: rand(22, 80),
        vx: rand(-0.05, 0.08),
        vy: rand(-0.06, -0.02),
        a: rand(0.18, 0.55),
        c: pick(bokehColors),
        p: rand(0, Math.PI * 2),
        pa: rand(0.002, 0.008)
      };
    }

    function spawnSpark() {
      return {
        t: 'spark',
        x: rand(0, W),
        y: rand(0, H),
        s: rand(2.5, 6.5),
        a: 0,
        ad: rand(0.02, 0.05),
        life: rand(40, 90)
      };
    }

    var SNOW_N = 40;
    var BOKEH_N = 18;
    var SPARK_N = 10;
    for (var i = 0; i < SNOW_N; i++) particles.push(spawnSnow());
    for (var j = 0; j < BOKEH_N; j++) particles.push(spawnBokeh());
    for (var k = 0; k < SPARK_N; k++) particles.push(spawnSpark());

    // 轻微视差（鼠标/触摸）
    var mx = 0, my = 0;
    function setParallax(px, py) {
      mx = px; my = py;
    }
    window.addEventListener('mousemove', function (e) {
      setParallax((e.clientX / window.innerWidth - 0.5), (e.clientY / window.innerHeight - 0.5));
    });
    window.addEventListener('touchmove', function (e) {
      if (!e.touches || !e.touches[0]) return;
      setParallax((e.touches[0].clientX / window.innerWidth - 0.5), (e.touches[0].clientY / window.innerHeight - 0.5));
    }, { passive: true });

    function drawSpark(p) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.a)) * 0.85;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      var s = p.s;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s * 2);
      ctx.lineTo(p.x + s * 0.5, p.y - s * 0.5);
      ctx.lineTo(p.x + s * 2, p.y);
      ctx.lineTo(p.x + s * 0.5, p.y + s * 0.5);
      ctx.lineTo(p.x, p.y + s * 2);
      ctx.lineTo(p.x - s * 0.5, p.y + s * 0.5);
      ctx.lineTo(p.x - s * 2, p.y);
      ctx.lineTo(p.x - s * 0.5, p.y - s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = ctx.globalAlpha * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s * 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawBokeh(p) {
      ctx.save();
      var alpha = p.a * (0.65 + 0.35 * Math.sin(p.p));
      ctx.globalAlpha = alpha;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, p.c.replace(/0\.[0-9]+\)/, (alpha * 0.95).toFixed(2) + ')'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    
function drawSnow(p) {
  ctx.save();
  if (snowReady) {
    var s = Math.max(10, p.r * 6.0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot || 0);
    ctx.globalAlpha = p.a * 0.95;
    ctx.drawImage(snowImg, -s / 2, -s / 2, s, s);
    // 轻微柔光
    ctx.globalAlpha = p.a * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
  } else {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = p.a * 0.18;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 2.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

    var t = 0;
    function loop() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // 背景视差（很轻，避免晕）
      if (bg) {
        var bx = mx * 10;
        var by = my * 10;
        bg.style.transform = 'translate(' + (-bx) + 'px,' + (-by) + 'px) scale(1.05)';
      }
      if (content) {
        var cx = mx * 6;
        var cy = my * 6;
        content.style.transform = 'translate(' + (cx) + 'px,' + (cy) + 'px)';
      }

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.t === 'snow') {
          p.w += p.wa;
          p.rot += p.rotV || 0;
          p.x += p.vx + Math.sin(p.w) * 0.25;
          p.y += p.vy;
          if (p.y > H + 10) { p.y = -rand(10, 80); p.x = rand(0, W); }
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
          drawSnow(p);
        } else if (p.t === 'bokeh') {
          p.p += p.pa;
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -p.r - 20) { p.y = H + p.r + rand(10, 80); p.x = rand(-W * 0.1, W * 1.1); }
          if (p.x < -W * 0.2) p.x = W * 1.2;
          if (p.x > W * 1.2) p.x = -W * 0.2;
          drawBokeh(p);
        } else if (p.t === 'spark') {
          // 闪一下就重生
          p.life -= 1;
          p.a += p.ad;
          if (p.a > 1) p.ad = -Math.abs(p.ad);
          if (p.life <= 0 || p.a <= 0) {
            particles[i] = spawnSpark();
            continue;
          }
          drawSpark(p);
        }
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // 微弱“呼吸”光（给标题一点灵魂，不至于像 PPT）
    try {
      var nameEl = el('#title-name');
      if (nameEl) {
        nameEl.animate([
          { textShadow: '0 0 40px rgba(240,198,116,0.18)', opacity: 0.92 },
          { textShadow: '0 0 70px rgba(240,198,116,0.28)', opacity: 1 }
        ], { duration: 3200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
      }
    } catch (e) {}
  }
})();
