/**
 * title_music.js - 冬日梦幻标题音乐系统
 * 完全基于 Web Audio API，无需外部音频文件
 */
(function() {
  'use strict';
  
  // ==================== 音乐状态管理 ====================
  var musicState = {
    ctx: null,
    masterGain: null,
    reverbNode: null,
    isPlaying: false,
    loopTimer: null,
    activeNodes: []
  };

  // ==================== 音乐参数 ====================
  var musicParams = {
    bpm: 66,
    key: 'C',
    scale: [0, 2, 4, 5, 7, 9, 11], // C大调音阶
    chordProgression: [
      [0, 4, 7],     // C major (C-E-G)
      [9, 0, 4],     // Am (A-C-E) 
      [5, 9, 0],     // F major (F-A-C)
      [7, 11, 2]     // G major (G-B-D)
    ],
    rootNote: 48,  // C3 (MIDI note number)
    baseVolume: 0.45  // 和游戏BGM一样的基础音量
  };

  // ==================== 工具函数 ====================
  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function initAudioContext() {
    if (musicState.ctx) return musicState.ctx;
    
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    
    musicState.ctx = new AC();
    
    // 创建混响
    musicState.reverbNode = createReverb(musicState.ctx);
    
    // 创建主增益
    musicState.masterGain = musicState.ctx.createGain();
    updateVolume(); // 使用GG.settings.bgmVol
    musicState.masterGain.connect(musicState.ctx.destination);
    
    return musicState.ctx;
  }
  
  function updateVolume() {
    if (!musicState.masterGain) return;
    var GG = window.GG || {};
    var userVol = (GG.settings && typeof GG.settings.bgmVol === 'number') 
      ? GG.settings.bgmVol 
      : 0.4;
    // 基础音量0.45 × 用户设置（0-1）
    musicState.masterGain.gain.value = musicParams.baseVolume * userVol;
  }

  function createReverb(ctx) {
    var convolver = ctx.createConvolver();
    var reverbTime = 2.5;
    var decay = 3.0;
    var sampleRate = ctx.sampleRate;
    var length = sampleRate * reverbTime;
    var impulse = ctx.createBuffer(2, length, sampleRate);
    
    for (var channel = 0; channel < 2; channel++) {
      var channelData = impulse.getChannelData(channel);
      for (var i = 0; i < length; i++) {
        var n = i / sampleRate;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / reverbTime, decay);
      }
    }
    
    convolver.buffer = impulse;
    return convolver;
  }

  // ==================== 音色合成器 ====================
  
  /**
   * 钢琴音色 - 使用多个正弦波叠加模拟钢琴谐波
   */
  function createPiano(ctx, freq, time, duration, velocity) {
    var harmonics = [
      { ratio: 1.0, amp: 1.0 },
      { ratio: 2.0, amp: 0.4 },
      { ratio: 3.0, amp: 0.25 },
      { ratio: 4.0, amp: 0.15 },
      { ratio: 5.0, amp: 0.08 }
    ];
    
    var gainNode = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq * 4;
    filter.Q.value = 0.5;
    
    // 钢琴包络：快速打击，指数衰减
    var peakGain = velocity * 0.4;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(peakGain * 0.3, time + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    filter.connect(gainNode);
    gainNode.connect(musicState.masterGain);
    
    // 混响发送（20%）
    var reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.15;
    gainNode.connect(reverbSend);
    reverbSend.connect(musicState.reverbNode);
    musicState.reverbNode.connect(musicState.masterGain);
    
    harmonics.forEach(function(h) {
      var osc = ctx.createOscillator();
      var oscGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq * h.ratio;
      osc.detune.value = randomRange(-2, 2); // 轻微失谐增加温暖感
      
      oscGain.gain.value = h.amp;
      
      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start(time);
      osc.stop(time + duration + 0.1);
      
      musicState.activeNodes.push(osc);
      musicState.activeNodes.push(oscGain);
    });
    
    musicState.activeNodes.push(gainNode);
    musicState.activeNodes.push(filter);
    musicState.activeNodes.push(reverbSend);
  }

  /**
   * Pad音色 - 空灵氛围铺底
   */
  function createPad(ctx, freq, time, duration) {
    var osc1 = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var gainNode = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.005; // 轻微失谐产生合唱效果
    
    filter.type = 'lowpass';
    filter.frequency.value = freq * 2.5;
    filter.Q.value = 0.3;
    
    // 慢attack，营造柔和感
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.12, time + 1.2);
    gainNode.gain.linearRampToValueAtTime(0.10, time + duration - 1.0);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(musicState.masterGain);
    
    // 混响发送（30%）
    var reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.25;
    gainNode.connect(reverbSend);
    reverbSend.connect(musicState.reverbNode);
    
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.1);
    osc2.stop(time + duration + 0.1);
    
    musicState.activeNodes.push(osc1, osc2, gainNode, filter, reverbSend);
  }

  /**
   * 风铃音色 - 高频清脆
   */
  function createChime(ctx, freq, time) {
    var osc = ctx.createOscillator();
    var gainNode = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.value = freq * 4; // 高两个八度
    
    filter.type = 'highpass';
    filter.frequency.value = 800;
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.06, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(musicState.masterGain);
    
    // 大量混响
    var reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.4;
    gainNode.connect(reverbSend);
    reverbSend.connect(musicState.reverbNode);
    
    osc.start(time);
    osc.stop(time + 2.0);
    
    musicState.activeNodes.push(osc, gainNode, filter, reverbSend);
  }

  /**
   * 雪花闪烁音效 - 短促高频
   */
  function createSparkle(ctx, time) {
    var osc = ctx.createOscillator();
    var gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = randomRange(2000, 4500);
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.045, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(musicState.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.45);
    
    musicState.activeNodes.push(osc, gainNode);
  }

  /**
   * 低音根音
   */
  function createBass(ctx, freq, time, duration) {
    var osc = ctx.createOscillator();
    var gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = freq / 2; // 低一个八度
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.18, time + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.12, time + duration - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);
    
    osc.connect(gainNode);
    gainNode.connect(musicState.masterGain);
    
    osc.start(time);
    osc.stop(time + duration + 0.1);
    
    musicState.activeNodes.push(osc, gainNode);
  }

  // ==================== 音乐编排 ====================
  
  /**
   * 主旋律（简单优美）
   */
  function playMelody(ctx, startTime, chordIndex) {
    var melodies = [
      // 第一小节 (C和弦): E - G - E - C
      [4, 7, 4, 0],
      // 第二小节 (Am和弦): A - C - E - C  
      [9, 0, 4, 0],
      // 第三小节 (F和弦): F - A - C - A
      [5, 9, 0, 9],
      // 第四小节 (G和弦): G - B - D - B
      [7, 11, 2, 11]
    ];
    
    var melody = melodies[chordIndex];
    var beatDuration = 60 / musicParams.bpm;
    
    melody.forEach(function(note, i) {
      var time = startTime + i * beatDuration;
      var freq = midiToFreq(musicParams.rootNote + 12 + note); // 高一个八度
      var velocity = i === 0 ? 1.0 : 0.7; // 第一拍强调
      createPiano(ctx, freq, time, beatDuration * 0.9, velocity);
    });
  }

  /**
   * 和弦层（Pad铺底）
   */
  function playChord(ctx, startTime, duration, chordIndex) {
    var chord = musicParams.chordProgression[chordIndex];
    
    chord.forEach(function(note) {
      var freq = midiToFreq(musicParams.rootNote + note);
      createPad(ctx, freq, startTime, duration);
    });
    
    // 低音根音
    var rootFreq = midiToFreq(musicParams.rootNote + chord[0] - 12);
    createBass(ctx, rootFreq, startTime, duration);
  }

  /**
   * 装饰音层
   */
  function playOrnaments(ctx, startTime, barDuration) {
    // 风铃（随机出现）
    if (Math.random() > 0.4) {
      var chimeTime = startTime + randomRange(0, barDuration * 0.8);
      var chimeNote = musicParams.rootNote + 12 + [0, 4, 7][Math.floor(Math.random() * 3)];
      createChime(ctx, midiToFreq(chimeNote), chimeTime);
    }
    
    // 雪花闪烁（稀疏分布）
    for (var i = 0; i < 3; i++) {
      if (Math.random() > 0.6) {
        var sparkleTime = startTime + randomRange(0, barDuration);
        createSparkle(ctx, sparkleTime);
      }
    }
  }

  /**
   * 编排完整循环
   */
  function scheduleLoop(startTime) {
    var ctx = musicState.ctx;
    var barDuration = (60 / musicParams.bpm) * 4; // 4拍一小节
    
    for (var i = 0; i < 4; i++) {
      var barTime = startTime + i * barDuration;
      
      // 和弦层
      playChord(ctx, barTime, barDuration, i);
      
      // 旋律层
      playMelody(ctx, barTime, i);
      
      // 装饰音层
      playOrnaments(ctx, barTime, barDuration);
    }
    
    return barDuration * 4; // 返回总时长
  }

  // ==================== 播放控制 ====================
  
  function startMusic() {
    if (musicState.isPlaying) return;
    
    var GG = window.GG || {};
    if (!GG.settings || !GG.settings.titleBgmOn) return;
    
    var ctx = initAudioContext();
    if (!ctx) {
      console.error('Web Audio API not supported');
      return;
    }
    
    // 恢复音频上下文（处理自动播放限制）
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function(err) {
        console.log('Audio resume failed:', err);
      });
    }
    
    musicState.isPlaying = true;
    
    // 首次播放
    var now = ctx.currentTime;
    var loopDuration = scheduleLoop(now + 0.1);
    
    // 循环播放
    function loop() {
      var GG = window.GG || {};
      if (!GG.settings || !GG.settings.titleBgmOn) return;
      
      var nextTime = ctx.currentTime + 0.5;
      scheduleLoop(nextTime);
      
      musicState.loopTimer = setTimeout(loop, loopDuration * 1000);
    }
    
    musicState.loopTimer = setTimeout(loop, loopDuration * 1000);
  }

  function stopMusic() {
    if (musicState.loopTimer) {
      clearTimeout(musicState.loopTimer);
      musicState.loopTimer = null;
    }
    
    // 淡出所有活动节点
    if (musicState.ctx && musicState.masterGain) {
      var now = musicState.ctx.currentTime;
      musicState.masterGain.gain.setValueAtTime(musicState.masterGain.gain.value, now);
      musicState.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
      
      setTimeout(function() {
        musicState.activeNodes.forEach(function(node) {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {}
        });
        musicState.activeNodes = [];
        
        // 恢复音量
        updateVolume();
      }, 600);
    }
    
    musicState.isPlaying = false;
  }

  function toggleMusic() {
    var GG = window.GG || {};
    if (!GG.settings) GG.settings = {};
    
    GG.settings.titleBgmOn = GG.settings.titleBgmOn ? 0 : 1;
    
    // 保存设置
    try {
      if (GG.saveSettings) GG.saveSettings();
    } catch (e) {}
    
    updateButton();
    
    if (GG.settings.titleBgmOn) {
      startMusic();
    } else {
      stopMusic();
    }
  }

  function updateButton() {
    var GG = window.GG || {};
    var isOn = GG.settings && GG.settings.titleBgmOn;
    
    var btn = document.querySelector('#btn-title-music');
    if (btn) {
      btn.textContent = '标题音乐：' + (isOn ? '开' : '关');
    }
  }

  // ==================== 初始化 ====================
  
  function init() {
    var GG = window.GG || {};
    
    // 确保settings已加载
    if (GG.loadSettings) {
      try { GG.loadSettings(); } catch (e) {}
    }
    
    // 确保设置对象存在
    if (!GG.settings) {
      GG.settings = {
        bgmVol: 0.4,
        titleBgmOn: 1
      };
    }
    
    updateButton();
    
    // 绑定按钮
    var btn = document.querySelector('#btn-title-music');
    if (btn) {
      btn.addEventListener('click', toggleMusic);
    }
    
    // 等待用户交互后自动播放
    if (GG.settings.titleBgmOn) {
      // 检查是否从游戏页面返回（已有用户交互）
      var hasInteracted = false;
      try {
        hasInteracted = localStorage.getItem('GG_USER_INTERACTED') === '1';
        if (hasInteracted) {
          localStorage.removeItem('GG_USER_INTERACTED');
        }
      } catch (e) {}
      
      if (hasInteracted) {
        // 从游戏返回，直接播放
        setTimeout(function() {
          startMusic();
        }, 100);
      } else {
        // 首次访问，等待用户交互
        var startOnce = function() {
          startMusic();
          document.removeEventListener('click', startOnce);
          document.removeEventListener('keydown', startOnce);
        };
        document.addEventListener('click', startOnce);
        document.addEventListener('keydown', startOnce);
      }
    }
    
    // 页面卸载时停止
    window.addEventListener('beforeunload', stopMusic);
  }

  // ==================== 导出 ====================
  
  window.TitleMusic = {
    init: init,
    start: startMusic,
    stop: stopMusic,
    toggle: toggleMusic,
    updateVolume: updateVolume
  };
  
  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
