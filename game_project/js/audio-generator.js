/**
 * audio-generator.js - Web Audio API 动态生成 BGM & SE
 *
 * 目标：
 * 1) 彻底不依赖 mp3 也能有“存在感”的 BGM/音效（更厚、更稳、更像游戏）。
 * 2) 解决自动播放限制：在用户第一次交互后 resume() 即可正常出声。
 * 3) 仍保持兼容：如果外部代码传入 (id, baseVol) 也能生效。
 */
(function () {
  var GG = window.GG = window.GG || {};

  // ====== helpers ======
  function clamp01(x) {
    x = (x == null ? 0 : x);
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
  }

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  // ====== audio nodes ======
  var ctx = null;
  var master = null;
  var comp = null;

  var musicBus = null;
  var seBus = null;

  var musicEQ = null;
  var seHP = null;

  var convolver = null;
  var musicVerbSend = null;
  var seVerbSend = null;
  var verbReturn = null;

  // ====== volumes ======
  var volumes = {
    bgm: 0.45,
    se: 0.7,
    voice: 0.8
  };

  // ====== BGM state ======
  var track = {
    id: null,
    baseVol: 1,
    tempo: 92,
    nextTime: 0,
    step: 0,
    scheduler: null,
    profile: null,
    longNodes: []
  };

  // ====== init / resume ======
  function ensureContext() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;

    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 1;

    comp = ctx.createDynamicsCompressor();
    // 稍微“收束”一下动态，听起来更像有混音
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.01;
    comp.release.value = 0.18;

    musicBus = ctx.createGain();
    seBus = ctx.createGain();

    // BGM 做一点轻微 EQ：低频略鼓一点，高频别刺
    musicEQ = ctx.createBiquadFilter();
    musicEQ.type = 'lowshelf';
    musicEQ.frequency.value = 140;
    musicEQ.gain.value = 3.5;

    // SE 做个高通，避免低频轰隆混成一锅
    seHP = ctx.createBiquadFilter();
    seHP.type = 'highpass';
    seHP.frequency.value = 90;
    seHP.Q.value = 0.7;

    // 混响
    convolver = ctx.createConvolver();
    convolver.buffer = buildImpulse(1.3, 2.6);

    musicVerbSend = ctx.createGain();
    seVerbSend = ctx.createGain();
    verbReturn = ctx.createGain();

    // 默认混响返回不要太吓人
    verbReturn.gain.value = 0.22;

    // Graph:
    // musicBus -> musicEQ -> comp -> master -> destination
    // seBus -> seHP -> comp -> master -> destination
    // (musicBus -> musicVerbSend -> convolver -> verbReturn -> comp)
    // (seBus    -> seVerbSend    -> convolver -> verbReturn -> comp)
    musicBus.connect(musicEQ);
    musicEQ.connect(comp);

    seBus.connect(seHP);
    seHP.connect(comp);

    musicBus.connect(musicVerbSend);
    seBus.connect(seVerbSend);
    musicVerbSend.connect(convolver);
    seVerbSend.connect(convolver);
    convolver.connect(verbReturn);
    verbReturn.connect(comp);

    comp.connect(master);
    master.connect(ctx.destination);

    updateVolumes();

    return ctx;
  }

  function resume() {
    ensureContext();
    if (!ctx) return Promise.resolve(false);
    try {
      if (ctx.state === 'suspended') {
        var p = ctx.resume();
        if (p && p.then) {
          return p.then(function () { return true; }).catch(function () { return false; });
        }
        return Promise.resolve(ctx.state !== 'suspended');
      }
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function state() {
    return ctx ? ctx.state : 'none';
  }

  function buildImpulse(seconds, decay) {
    seconds = seconds || 1.0;
    decay = decay || 2.0;
    var rate = (ctx ? ctx.sampleRate : 48000);
    var len = Math.floor(rate * seconds);
    var buf = (ctx ? ctx.createBuffer(2, len, rate) : null);
    if (!buf) return null;
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        var env = Math.pow(1 - t, decay);
        data[i] = (Math.random() * 2 - 1) * env;
      }
    }
    return buf;
  }

  function updateVolumes() {
    if (GG.settings) {
      if (GG.settings.bgmVol != null) volumes.bgm = GG.settings.bgmVol;
      if (GG.settings.seVol != null) volumes.se = GG.settings.seVol;
      if (GG.settings.voiceVol != null) volumes.voice = GG.settings.voiceVol;
    }
    // 真正的“存在感”来自于：
    // - BGM bus gain = 用户滑块 * 曲目基础音量（资源volume） * 一个合理的内部校准
    // - 让音乐别太轻（以前很多人把 bgmVol 设 0.3 结果等于空气）
    var base = clamp01(track.baseVol);
    // 资源里原本的 volume 多为 0.3~0.45（给 mp3 用的），直接乘会太小。
    // 这里做一次“存在感校准”：把 baseVol 映射到 0.6..1.4 的区间，避免BGM像空气。
    var calibrated = 0.6 + 0.8 * base;
    var bgmGain = clamp01(volumes.bgm * calibrated);
    var seGain = clamp01(volumes.se);

    if (musicBus) musicBus.gain.value = bgmGain;
    if (seBus) seBus.gain.value = seGain;
  }

  // ====== synth building blocks ======
  function makeNoiseBuffer(sec) {
    var n = Math.max(1, Math.floor(ctx.sampleRate * sec));
    var b = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < n; i++) {
      d[i] = Math.random() * 2 - 1;
    }
    return b;
  }

  function envPerc(gainNode, t, peak, dur) {
    var g = gainNode.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.004);
    g.exponentialRampToValueAtTime(0.0001, t + Math.max(0.02, dur));
  }

  function envPluck(gainNode, t, peak, decay) {
    var g = gainNode.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.006);
    g.exponentialRampToValueAtTime(0.0001, t + Math.max(0.06, decay));
  }

  function playKick(t, amp) {
    amp = (amp == null ? 1 : amp);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';

    var f0 = 160;
    var f1 = 52;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + 0.09);

    envPerc(g, t, 0.9 * amp, 0.14);

    o.connect(g);
    g.connect(musicBus);

    o.start(t);
    o.stop(t + 0.16);
  }

  function playSnare(t, amp) {
    amp = (amp == null ? 1 : amp);

    // noise
    var src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(0.2);

    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.9;

    var g = ctx.createGain();
    envPerc(g, t, 0.55 * amp, 0.12);

    src.connect(bp);
    bp.connect(g);
    g.connect(musicBus);

    // tone
    var o = ctx.createOscillator();
    var tg = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(210, t);
    envPerc(tg, t, 0.18 * amp, 0.11);
    o.connect(tg);
    tg.connect(musicBus);

    src.start(t);
    o.start(t);
    src.stop(t + 0.18);
    o.stop(t + 0.18);
  }

  function playHat(t, amp) {
    amp = (amp == null ? 1 : amp);
    var src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(0.06);

    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;
    hp.Q.value = 0.7;

    var g = ctx.createGain();
    envPerc(g, t, 0.16 * amp, 0.04);

    src.connect(hp);
    hp.connect(g);
    g.connect(musicBus);

    src.start(t);
    src.stop(t + 0.07);
  }

  function playBass(freq, t, amp, dur) {
    amp = (amp == null ? 1 : amp);
    dur = dur || 0.18;

    var o = ctx.createOscillator();
    var g = ctx.createGain();

    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);

    envPluck(g, t, 0.32 * amp, dur);

    o.connect(g);
    g.connect(musicBus);

    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function playPluck(freq, t, amp, decay, bright) {
    amp = (amp == null ? 1 : amp);
    decay = decay || 0.18;

    var o = ctx.createOscillator();
    var g = ctx.createGain();

    o.type = bright ? 'square' : 'triangle';
    o.frequency.setValueAtTime(freq, t);

    // 轻微 vibrato
    var lfo = ctx.createOscillator();
    var lfoG = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    lfoG.gain.value = 7;
    lfo.connect(lfoG);
    lfoG.connect(o.frequency);

    envPluck(g, t, 0.22 * amp, decay);

    // 柔一点的滤波
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = bright ? 4800 : 3200;
    lp.Q.value = 0.4;

    o.connect(lp);
    lp.connect(g);
    g.connect(musicBus);

    o.start(t);
    lfo.start(t);
    o.stop(t + decay + 0.08);
    lfo.stop(t + decay + 0.08);
  }

  function playPadChord(midiNotes, t, amp, dur) {
    amp = (amp == null ? 1 : amp);
    dur = dur || 2.2;

    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.18 * amp), t + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, t);
    lp.Q.value = 0.35;

    out.connect(lp);
    lp.connect(musicBus);

    for (var i = 0; i < midiNotes.length; i++) {
      var o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(midiToFreq(midiNotes[i]), t);

      // 超轻微 detune，避免薄
      o.detune.setValueAtTime((i - (midiNotes.length - 1) / 2) * 6, t);

      o.connect(out);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  // ====== SE (sound effects) ======
  function seClick(t, amp) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(520, t + 0.06);
    envPerc(g, t, 0.22 * amp, 0.07);
    o.connect(g);
    g.connect(seBus);
    o.start(t);
    o.stop(t + 0.09);
  }

  function seBell(t, amp) {
    // 简单的“叮” + 混响
    var carrier = ctx.createOscillator();
    var mod = ctx.createOscillator();
    var modG = ctx.createGain();
    var g = ctx.createGain();

    carrier.type = 'sine';
    mod.type = 'sine';

    carrier.frequency.setValueAtTime(880, t);
    mod.frequency.setValueAtTime(12, t);
    modG.gain.setValueAtTime(30, t);

    mod.connect(modG);
    modG.connect(carrier.frequency);

    envPluck(g, t, 0.35 * amp, 0.55);

    carrier.connect(g);
    g.connect(seBus);

    carrier.start(t);
    mod.start(t);
    carrier.stop(t + 0.7);
    mod.stop(t + 0.7);
  }

  function sePageFlip(t, amp) {
    var src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(0.12);

    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2200;

    var g = ctx.createGain();
    envPerc(g, t, 0.28 * amp, 0.10);

    src.connect(hp);
    hp.connect(g);
    g.connect(seBus);

    src.start(t);
    src.stop(t + 0.14);
  }

  function seSparkle(t, amp) {
    // 亮闪闪：快速上滑 + 很短的泛音
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(640, t);
    o.frequency.exponentialRampToValueAtTime(2100, t + 0.22);
    envPluck(g, t, 0.32 * amp, 0.35);
    o.connect(g);
    g.connect(seBus);
    o.start(t);
    o.stop(t + 0.4);
  }

  function seSword(t, amp) {
    var src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(0.22);

    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 0.8;

    var g = ctx.createGain();
    envPerc(g, t, 0.32 * amp, 0.18);

    src.connect(bp);
    bp.connect(g);
    g.connect(seBus);

    src.start(t);
    src.stop(t + 0.26);
  }

  function seHit(t, amp) {
    // 低一点的冲击
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(65, t + 0.09);
    envPerc(g, t, 0.55 * amp, 0.14);
    o.connect(g);
    g.connect(seBus);
    o.start(t);
    o.stop(t + 0.16);

    // 叠一点噪声质感
    var n = ctx.createBufferSource();
    n.buffer = makeNoiseBuffer(0.08);
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;
    var ng = ctx.createGain();
    envPerc(ng, t, 0.20 * amp, 0.07);
    n.connect(hp);
    hp.connect(ng);
    ng.connect(seBus);
    n.start(t);
    n.stop(t + 0.1);
  }

  function seFumble(t, amp) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.35);
    envPluck(g, t, 0.25 * amp, 0.45);
    o.connect(g);
    g.connect(seBus);
    o.start(t);
    o.stop(t + 0.55);
  }

  function seNotify(t, amp) {
    // 两下提示
    seClick(t, amp * 0.9);
    seClick(t + 0.09, amp * 0.75);
  }


  function seWhoosh(t, amp) {
    // transition / whoosh
    var n = ctx.createBufferSource();
    n.buffer = noiseBuffer;

    var f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(450, t);
    f.frequency.exponentialRampToValueAtTime(1800, t + 0.22);
    f.Q.setValueAtTime(0.9, t);

    var g = ctx.createGain();
    envPluck(g, t, 0.38 * amp, 0.30);

    n.connect(f);
    f.connect(g);
    g.connect(seBus);

    n.start(t);
    n.stop(t + 0.32);
  }

  function seChoiceOpen(t, amp) {
    // choice open: a tiny up-chirp
    var o1 = osc('sine', 650, t, t + 0.12);
    var g1 = ctx.createGain();
    envPluck(g1, t, 0.18 * amp, 0.16);
    o1.connect(g1);
    g1.connect(seBus);

    var o2 = osc('sine', 950, t + 0.06, t + 0.18);
    var g2 = ctx.createGain();
    envPluck(g2, t + 0.06, 0.16 * amp, 0.14);
    o2.connect(g2);
    g2.connect(seBus);
  }

  function seChoiceConfirm(t, amp) {
    // confirm: short two-note chime
    var o1 = osc('triangle', 880, t, t + 0.16);
    var g1 = ctx.createGain();
    envPluck(g1, t, 0.22 * amp, 0.18);
    o1.connect(g1);
    g1.connect(seBus);

    var o2 = osc('triangle', 1320, t + 0.02, t + 0.18);
    var g2 = ctx.createGain();
    envPluck(g2, t + 0.02, 0.18 * amp, 0.18);
    o2.connect(g2);
    g2.connect(seBus);
  }

  function seItemShow(t, amp) {
    // item show: sparkle + tiny click
    seClick(t, 0.55 * amp);
    seSparkle(t + 0.01, 0.75 * amp);
  }

  function seSleep(t, amp) {
    // sleep: soft downward hum + breath
    var o = osc('sine', 220, t, t + 0.70);
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.70);
    var g = ctx.createGain();
    envPerc(g, t, 0.20 * amp, 0.75);
    o.connect(g);
    g.connect(seBus);

    var n = ctx.createBufferSource();
    n.buffer = noiseBuffer;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(800, t);
    var ng = ctx.createGain();
    envPerc(ng, t, 0.10 * amp, 0.70);
    n.connect(lp);
    lp.connect(ng);
    ng.connect(seBus);
    n.start(t);
    n.stop(t + 0.72);
  }

  function seWake(t, amp) {
    // wake: gentle rising chime
    var o1 = osc('sine', 440, t, t + 0.20);
    var g1 = ctx.createGain();
    envPluck(g1, t, 0.18 * amp, 0.20);
    o1.connect(g1);
    g1.connect(seBus);

    var o2 = osc('sine', 660, t + 0.06, t + 0.26);
    var g2 = ctx.createGain();
    envPluck(g2, t + 0.06, 0.16 * amp, 0.20);
    o2.connect(g2);
    g2.connect(seBus);

    var o3 = osc('sine', 990, t + 0.12, t + 0.34);
    var g3 = ctx.createGain();
    envPluck(g3, t + 0.12, 0.14 * amp, 0.22);
    o3.connect(g3);
    g3.connect(seBus);
  }

  function seEyeOpen(t, amp) {
    // eye open: tiny whoosh
    seWhoosh(t, 0.55 * amp);
  }

  function sePuff(t, amp) {
    // puff: short soft pop
    var n = ctx.createBufferSource();
    n.buffer = noiseBuffer;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1200, t);
    var g = ctx.createGain();
    envPluck(g, t, 0.28 * amp, 0.10);
    n.connect(lp);
    lp.connect(g);
    g.connect(seBus);
    n.start(t);
    n.stop(t + 0.18);
  }

  function seBeam(t, amp) {
    // beam: bright zap
    var o = osc('sawtooth', 620, t, t + 0.22);
    var g = ctx.createGain();
    envPluck(g, t, 0.26 * amp, 0.16);
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1600, t);
    bp.Q.setValueAtTime(6, t);
    o.connect(bp);
    bp.connect(g);
    g.connect(seBus);

    var n = ctx.createBufferSource();
    n.buffer = noiseBuffer;
    var ng = ctx.createGain();
    envPluck(ng, t, 0.18 * amp, 0.12);
    n.connect(ng);
    ng.connect(seBus);
    n.start(t);
    n.stop(t + 0.20);
  }
  // ====== BGM scheduling ======
  var LOOKAHEAD_MS = 25;
  var SCHEDULE_AHEAD = 0.14;

  var PROFILES = {
    bgm_daily: {
      tempo: 92,
      verb: 0.12,
      // 4 bars chord progression
      chords: [
        [60, 64, 67], // C
        [57, 60, 64], // Am
        [53, 57, 60], // F
        [55, 59, 62]  // G
      ],
      scale: [60, 62, 64, 67, 69, 72] // C major-ish
    },
    bgm_dream_forest: {
      tempo: 72,
      verb: 0.42,
      chords: [
        [62, 65, 69], // Dm
        [60, 64, 67], // C
        [58, 62, 65], // Bb-ish (as color)
        [60, 64, 67]
      ],
      scale: [62, 65, 67, 69, 72, 74] // D minor-ish
    },
    bgm_battle_comedy: {
      tempo: 128,
      verb: 0.08,
      chords: [
        [57, 61, 64], // A (A-C#-E)
        [55, 59, 62], // G
        [53, 57, 60], // F
        [55, 59, 62]  // G
      ],
      scale: [57, 59, 61, 64, 66, 69, 71, 72] // A minor w/ #? comedic
    },
    bgm_mystery: {
      tempo: 80,
      verb: 0.26,
      chords: [
        [57, 60, 64], // Am
        [56, 60, 63], // Ab-ish
        [57, 60, 64],
        [55, 59, 62]  // G
      ],
      scale: [57, 58, 60, 62, 63, 65, 67, 69] // A phryg-ish
    },

    // 标题页：更克制、更“冬夜”的呼吸感（无鼓点，只留空间）
    bgm_title: {
      tempo: 64,
      verb: 0.48,
      chords: [
        [62, 65, 69], // Dm
        [58, 62, 65], // Bb-ish
        [60, 64, 67], // C
        [55, 59, 62]  // G
      ],
      scale: [62, 65, 67, 69, 72, 74] // D minor-ish
    }
  };

  function setProfile(id) {
    track.profile = PROFILES[id] || PROFILES.bgm_daily;
    track.tempo = track.profile.tempo;

    // 各曲目混响比例
    if (musicVerbSend) musicVerbSend.gain.value = track.profile.verb;
    if (seVerbSend) seVerbSend.gain.value = 0.08;
  }

  function scheduleStep(id, step, t) {
    var p = track.profile;
    if (!p) return;

    var stepsPerBar = 16;
    var bar = Math.floor(step / stepsPerBar) % 4;
    var s = step % stepsPerBar;

    // === per-track ===
    if (id === 'bgm_daily') {
      // drums
      if (s === 0 || s === 8) playKick(t, 1);
      if (s === 4 || s === 12) playSnare(t, 1);
      if (s % 2 === 0) playHat(t, 1);
      if (bar === 3 && s === 14) playKick(t, 0.55);

      // pad chord each bar
      if (s === 0) {
        var chord = p.chords[bar];
        // pad register: +12
        playPadChord([chord[0] + 12, chord[1] + 12, chord[2] + 12], t, 1, (60 / p.tempo) * 4 * 0.92);
      }

      // bass on beats
      if (s === 0 || s === 4 || s === 8 || s === 12) {
        var root = p.chords[bar][0];
        var bassMidi = (s === 8) ? (root + 7 - 12) : (root - 24);
        playBass(midiToFreq(bassMidi), t, 1, 0.20);
      }

      // lead plucks
      if (s === 2 || s === 6 || s === 10 || s === 14) {
        var motif = [0, 2, 1, 4, 2, 3, 1, 5];
        var idx = motif[(bar * 2 + Math.floor(s / 4)) % motif.length];
        var note = p.scale[idx] + 12;
        playPluck(midiToFreq(note), t + 0.01, 1, 0.16, false);
      }
      return;
    }

    if (id === 'bgm_dream_forest') {
      // very light drums: rare hat shimmer
      if ((bar === 1 || bar === 3) && (s === 8 || s === 12)) playHat(t, 0.55);

      // airy pad every 2 bars
      if ((bar === 0 || bar === 2) && s === 0) {
        var c = p.chords[bar];
        playPadChord([c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24], t, 0.95, (60 / p.tempo) * 8 * 0.95);
      }

      // drone low
      if (bar === 0 && s === 0) {
        startDreamDrone(t, (60 / p.tempo) * 16 * 0.95);
      }

      // bell melody (sparse)
      if (s === 4 || s === 10 || (bar === 2 && s === 14)) {
        var bellNotes = [p.scale[0] + 24, p.scale[3] + 24, p.scale[5] + 24, p.scale[2] + 24];
        var bn = bellNotes[(bar + Math.floor(s / 4)) % bellNotes.length];
        playBellTone(midiToFreq(bn), t + 0.02, 0.85, 1.2);
      }
      return;
    }

    if (id === 'bgm_title') {
      // 标题页：无鼓点，主要是铺底 + 铃音点缀

      // airy pad each bar
      if (s === 0) {
        var c0 = p.chords[bar];
        playPadChord([c0[0] + 12, c0[1] + 12, c0[2] + 12, c0[0] + 24], t, 0.9, (60 / p.tempo) * 4 * 0.98);
      }

      // long drone once per cycle
      if (bar === 0 && s === 0) {
        startDreamDrone(t, (60 / p.tempo) * 16 * 0.98);
      }

      // sparse bell tones
      if ((bar % 2 === 0 && (s === 6 || s === 14)) || (bar % 2 === 1 && s === 10)) {
        var bell = [p.scale[0] + 24, p.scale[2] + 24, p.scale[3] + 24, p.scale[5] + 24];
        var bn = bell[(bar + Math.floor(s / 4)) % bell.length];
        playBellTone(midiToFreq(bn), t + 0.02, 0.75, 1.6);
      }

      // super rare shimmer
      if (bar === 3 && s === 12) playHat(t, 0.28);
      return;
    }

    if (id === 'bgm_battle_comedy') {
      // drums stronger
      if (s === 0 || s === 8 || (bar === 2 && s === 14)) playKick(t, 1.05);
      if (s === 4 || s === 12) playSnare(t, 1.05);
      if (s % 2 === 0) playHat(t, 1.1);

      // short stab chords on bar starts
      if (s === 0) {
        var cc = p.chords[bar];
        playStabChord([cc[0] + 12, cc[1] + 12, cc[2] + 12], t, 1.0, 0.22);
      }

      // bass on 8th notes
      if (s % 2 === 0) {
        var rr = p.chords[bar][0] - 24;
        var bass = (s === 6 || s === 14) ? rr + 7 : rr;
        playBass(midiToFreq(bass), t, 1.05, 0.12);
      }

      // lead: chiptune-ish
      if (s === 3 || s === 7 || s === 11 || s === 15) {
        var lick = [0, 2, 3, 5, 3, 2, 1, 6];
        var li = lick[(bar * 2 + Math.floor(s / 4)) % lick.length];
        var nn = p.scale[li] + 24;
        playPluck(midiToFreq(nn), t, 1.0, 0.11, true);
      }
      return;
    }

    if (id === 'bgm_mystery') {
      // heartbeat kick
      if (s === 0) playKick(t, 0.85);
      if (s === 6) playKick(t, 0.55);
      if (s === 12 && (bar % 2 === 1)) playSnare(t, 0.55);

      // dark drone + dissonant stab
      if (s === 0) {
        startMysteryDrone(t, (60 / p.tempo) * 4 * 0.95);
      }
      if (s === 8 && (bar === 1 || bar === 3)) {
        var a = midiToFreq(45);
        var b = midiToFreq(46); // minor second
        playDissonance(a, b, t, 0.7);
      }

      // subtle ticks
      if (s === 2 || s === 10) playHat(t, 0.35);
      return;
    }
  }

  function tickScheduler() {
    if (!ctx || !track.id) return;
    var now = ctx.currentTime;
    while (track.nextTime < now + SCHEDULE_AHEAD) {
      scheduleStep(track.id, track.step, track.nextTime);
      advanceStep();
    }
  }

  function advanceStep() {
    var spb = 60 / track.tempo;
    var stepDur = spb / 4; // 16th
    track.nextTime += stepDur;
    track.step = (track.step + 1) % 64; // 4 bars
  }

  function startScheduler() {
    if (track.scheduler) return;
    track.nextTime = ctx.currentTime + 0.05;
    track.step = 0;
    track.scheduler = setInterval(tickScheduler, LOOKAHEAD_MS);
  }

  function stopScheduler() {
    if (track.scheduler) {
      clearInterval(track.scheduler);
      track.scheduler = null;
    }
  }

  // ====== extra textures ======
  function playBellTone(freq, t, amp, dur) {
    amp = amp == null ? 1 : amp;
    dur = dur || 1.0;

    // 简单 FM，听起来像铃铛一点
    var car = ctx.createOscillator();
    var mod = ctx.createOscillator();
    var modG = ctx.createGain();
    var g = ctx.createGain();

    car.type = 'sine';
    mod.type = 'sine';

    car.frequency.setValueAtTime(freq, t);
    mod.frequency.setValueAtTime(freq * 2.01, t);
    modG.gain.setValueAtTime(freq * 0.25, t);

    mod.connect(modG);
    modG.connect(car.frequency);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 * amp, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    car.connect(g);
    g.connect(musicBus);

    car.start(t);
    mod.start(t);
    car.stop(t + dur + 0.05);
    mod.stop(t + dur + 0.05);
  }

  function playStabChord(midiNotes, t, amp, dur) {
    amp = amp == null ? 1 : amp;
    dur = dur || 0.18;

    var g = ctx.createGain();
    envPerc(g, t, 0.35 * amp, dur);

    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 5200;
    lp.Q.value = 0.25;

    lp.connect(g);
    g.connect(musicBus);

    for (var i = 0; i < midiNotes.length; i++) {
      var o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime(midiToFreq(midiNotes[i]), t);
      o.detune.setValueAtTime((i - 1) * 8, t);
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.06);
    }
  }

  function startDreamDrone(t, dur) {
    dur = dur || 12;

    // 清掉旧的长音（避免叠到糊）
    stopLongNodes();

    var base = midiToFreq(50); // D-ish

    var o1 = ctx.createOscillator();
    var o2 = ctx.createOscillator();
    var g = ctx.createGain();

    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(base, t);
    o2.frequency.setValueAtTime(base * 1.5, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o1.connect(g);
    o2.connect(g);
    g.connect(musicBus);

    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.08);
    o2.stop(t + dur + 0.08);

    track.longNodes.push(o1);
    track.longNodes.push(o2);
  }

  function startMysteryDrone(t, dur) {
    dur = dur || 3;

    // 低频颤音+轻微不和谐
    var o1 = ctx.createOscillator();
    var o2 = ctx.createOscillator();
    var g = ctx.createGain();
    var lp = ctx.createBiquadFilter();

    o1.type = 'sine';
    o2.type = 'sine';

    o1.frequency.setValueAtTime(110, t);
    o2.frequency.setValueAtTime(116, t);

    lp.type = 'lowpass';
    lp.frequency.value = 900;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.10, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o1.connect(lp);
    o2.connect(lp);
    lp.connect(g);
    g.connect(musicBus);

    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  function playDissonance(a, b, t, amp) {
    amp = amp == null ? 1 : amp;
    var o1 = ctx.createOscillator();
    var o2 = ctx.createOscillator();
    var g = ctx.createGain();

    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(a, t);
    o2.frequency.setValueAtTime(b, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16 * amp, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    o1.connect(g);
    o2.connect(g);
    g.connect(musicBus);

    o1.start(t);
    o2.start(t);
    o1.stop(t + 0.7);
    o2.stop(t + 0.7);
  }

  function stopLongNodes() {
    if (!track.longNodes || track.longNodes.length === 0) return;
    for (var i = 0; i < track.longNodes.length; i++) {
      try { track.longNodes[i].stop(); } catch (e) {}
    }
    track.longNodes = [];
  }

  // ====== public API ======
  function playBGM(bgmId, baseVol) {
    ensureContext();
    if (!ctx) return false;

    // 同一首就别反复重启
    if (track.id === bgmId) {
      if (typeof baseVol === 'number') track.baseVol = baseVol;
      updateVolumes();
      
      // 但要确保context处于运行状态
      if (ctx.state === 'suspended') {
        ctx.resume().catch(function(err) {
          console.log('Resume failed for same BGM:', err);
        });
      }
      
      return true;
    }

    stopBGM();

    track.id = bgmId;
    track.baseVol = (typeof baseVol === 'number') ? baseVol : 1;

    setProfile(bgmId);
    updateVolumes();

    // 如果 context 是 suspended，先恢复再播放
    if (ctx.state === 'suspended') {
      ctx.resume().then(function() {
        startScheduler();
      }).catch(function(err) {
        console.log('Resume failed, trying to start anyway:', err);
        // 即使失败也尝试播放，可能下次用户交互会解锁
        setTimeout(startScheduler, 50);
      });
    } else {
      startScheduler();
    }
    
    return true;
  }

  function stopBGM() {
    // 先淡出一点，避免切场景时“啪”
    if (musicBus && ctx) {
      try {
        var t = ctx.currentTime;
        var v = musicBus.gain.value;
        musicBus.gain.setValueAtTime(v, t);
        musicBus.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      } catch (e) {}
    }

    stopScheduler();
    stopLongNodes();

    track.id = null;
    track.step = 0;
  }

  function playSE(seId, baseVol) {
    ensureContext();
    if (!ctx) return false;
    
    // 尝试恢复context（音效通常很短，不等待Promise）
    if (ctx.state === 'suspended') {
      try {
        ctx.resume();
      } catch (e) {}
    }

    var amp = (typeof baseVol === 'number') ? baseVol : 1;
    amp = clamp01(amp);

    var t = ctx.currentTime;

    if (seId === 'se_click') { seClick(t, amp); return true; }
    if (seId === 'se_bell') { seBell(t, amp); return true; }
    if (seId === 'se_page_flip') { sePageFlip(t, amp); return true; }
    if (seId === 'se_magic_sparkle') { seSparkle(t, amp); return true; }
    if (seId === 'se_sword_swing') { seSword(t, amp); return true; }
    if (seId === 'se_hit_light') { seHit(t, amp); return true; }
    if (seId === 'se_fumble') { seFumble(t, amp); return true; }
    if (seId === 'se_notification') { seNotify(t, amp); return true; }
if (seId === 'se_transition') { seWhoosh(t, amp); return true; }    if (seId === 'se_choice_open') { seChoiceOpen(t, amp); return true; }    if (seId === 'se_choice_confirm') { seChoiceConfirm(t, amp); return true; }    if (seId === 'se_item_show') { seItemShow(t, amp); return true; }    if (seId === 'se_sleep') { seSleep(t, amp); return true; }    if (seId === 'se_wake') { seWake(t, amp); return true; }    if (seId === 'se_eye_open') { seEyeOpen(t, amp); return true; }    if (seId === 'se_beam') { seBeam(t, amp); return true; }    if (seId === 'se_puff') { sePuff(t, amp); return true; }

    // unknown id: 给个轻提示，别完全没声
    seClick(t, amp * 0.8);
    return true;
  }

  // ====== expose ======
  GG.audioGen = {
    init: ensureContext,
    resume: resume,
    state: state,
    updateVolumes: updateVolumes,
    playBGM: playBGM,
    stopBGM: stopBGM,
    playSE: playSE
  };

  // 不强行自动播放，只初始化 graph；真正出声由 utils 的 unlockAudio 控制。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ensureContext(); });
  } else {
    ensureContext();
  }
})();
