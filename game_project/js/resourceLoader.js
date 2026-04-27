/**
 * resourceLoader.js — 资源预加载（含 Canvas 占位图 fallback）
 */
(function () {
  var GG = window.GG = window.GG || {};
  var imageCache = {};
  var audioCache = {};

  GG.getImage = function (id) { return imageCache[id] || null; };
  GG.getAudio = function (id) { return audioCache[id] || null; };

  GG.preloadAll = function (script, onProgress) {
    var images = script.resources.images || [];
    var audios = script.resources.audios || [];
    var total = images.length + audios.length;
    var loaded = 0;
    function report() { loaded++; if (onProgress) onProgress(loaded, total); }

    var imgPromises = images.map(function (res) {
      return new Promise(function (resolve) {
        // 检测生成式资源
        if (res.path === 'generated' || res.path === 'placeholder') {
          imageCache[res.id] = genPlaceholder(res);
          report();
          resolve();
          return;
        }
        
        // 尝试加载外部图片
        var img = new Image();
        img.onload = function () { imageCache[res.id] = img.src; report(); resolve(); };
        img.onerror = function () { imageCache[res.id] = genPlaceholder(res); report(); resolve(); };
        img.src = res.path;
      });
    });

    var audioPromises = audios.map(function (res) {
      // 兼容两类资源写法：
      // 1) 外部文件: audios/bgm/xxx.mp3
      // 2) 生成式音频: path = 'generated'（编辑器默认注入）
      //
      // 游戏端走 GG.playBGM/GG.playSE 时会尝试从“src”推断生成器ID。
      // 如果 path 只是 'generated'，就什么都推不出来，结果就是“编辑器有BGM，游戏没声音”。
      // 这里把 generated/空路径 映射成资源 id，本地生成器就能直接播。
      var p = res.path;
      if (!p || p === 'generated' || p === 'placeholder') p = res.id;

      audioCache[res.id] = {
        path: p,
        volume: res.volume != null ? res.volume : 0.5,
        type: res.type,
        fallback: false
      };
      // 使用Web Audio API生成器，无需加载外部文件
      report();
      return Promise.resolve();
    });

    return Promise.all(imgPromises.concat(audioPromises));
  };

  // ====== 占位图 ======
  function genPlaceholder(res) {
    var c = document.createElement('canvas'), x = c.getContext('2d');
    if (res.type === 'background') { c.width = 1920; c.height = 1080; drawBg(x, c, res); }
    else if (res.type === 'character') { c.width = 400; c.height = 800; drawChar(x, c, res); }
    else if (res.type === 'item') { c.width = 400; c.height = 400; drawItem(x, c, res); }
    else { c.width = 400; c.height = 400; x.fillStyle = '#333'; x.fillRect(0, 0, 400, 400); }
    return c.toDataURL('image/png');
  }


function drawBg(x, c, res) {
  // 卧室 - 更温馨精致
  if (res.id.indexOf('placeholder_bedroom') >= 0 || res.id.indexOf('bedroom') >= 0) {
    // 深蓝夜空背景
    var g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#0a1a2a');
    g.addColorStop(1, '#1a2a3a');
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    
    // 星星
    x.fillStyle = '#d0d8ff';
    for (var i = 0; i < 40; i++) {
      x.beginPath();
      x.arc(Math.random() * 1920, Math.random() * 500, Math.random() * 2 + 1, 0, Math.PI * 2);
      x.fill();
    }
    
    // 窗户框架（更精致）
    x.strokeStyle = '#4a6a8a';
    x.lineWidth = 10;
    x.fillStyle = 'rgba(20,40,60,0.5)';
    x.fillRect(1380, 180, 400, 350);
    x.strokeRect(1380, 180, 400, 350);
    
    // 窗格
    x.strokeStyle = '#4a6a8a';
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(1580, 180);
    x.lineTo(1580, 530);
    x.moveTo(1380, 355);
    x.lineTo(1780, 355);
    x.stroke();
    
    // 月亮（更圆润）
    x.fillStyle = '#f0e8b0';
    x.beginPath();
    x.arc(1520, 300, 50, 0, Math.PI * 2);
    x.fill();
    
    // 月光
    x.fillStyle = 'rgba(240,232,176,0.1)';
    x.beginPath();
    x.arc(1520, 300, 80, 0, Math.PI * 2);
    x.fill();
    
    // 床（更立体）
    x.fillStyle = '#2a3a4a';
    x.fillRect(150, 680, 550, 100); // 床垫
    x.fillStyle = '#3a4a5a';
    x.fillRect(150, 700, 550, 80);
    
    // 床框
    x.fillStyle = '#4a5a6a';
    x.fillRect(130, 780, 590, 35);
    
    // 枕头
    x.fillStyle = '#5a7a9a';
    x.strokeStyle = '#4a6a8a';
    x.lineWidth = 2;
    x.beginPath();
    x.ellipse(220, 680, 60, 30, 0, 0, Math.PI * 2);
    x.fill();
    x.stroke();
    
    // 被子纹理
    x.strokeStyle = '#3a4a5a';
    x.lineWidth = 2;
    for (var i = 0; i < 5; i++) {
      x.beginPath();
      x.moveTo(200 + i * 100, 720);
      x.quadraticCurveTo(250 + i * 100, 750, 200 + i * 100, 780);
      x.stroke();
    }
    
    // 地板线
    x.strokeStyle = 'rgba(60,80,100,0.3)';
    x.lineWidth = 2;
    for (var i = 0; i < 8; i++) {
      x.beginPath();
      x.moveTo(0, 820 + i * 30);
      x.lineTo(1920, 820 + i * 30);
      x.stroke();
    }
    
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, 890, 1920, 190);
    return;
  }
  
  // 奇幻森林 - 更梦幻
  if (res.id.indexOf('placeholder_forest') >= 0 || res.id.indexOf('forest') >= 0) {
    // 深紫梦幻背景
    var g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#1a0a2a');
    g.addColorStop(0.5, '#2a1a3a');
    g.addColorStop(1, '#0a051a');
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    
    // 远山剪影
    x.fillStyle = '#0a0515';
    x.beginPath();
    x.moveTo(0, 500);
    x.quadraticCurveTo(400, 350, 800, 400);
    x.quadraticCurveTo(1200, 450, 1600, 380);
    x.quadraticCurveTo(1800, 420, 1920, 450);
    x.lineTo(1920, 1080);
    x.lineTo(0, 1080);
    x.closePath();
    x.fill();
    
    // 树木（更多层次）
    for (var i = 0; i < 8; i++) {
      var tx = 100 + i * 230;
      var th = 350 + Math.random() * 100;
      
      // 树干
      x.fillStyle = i % 2 === 0 ? '#0a0515' : '#15081a';
      x.fillRect(tx, 900 - th, 45, th);
      
      // 树冠（多层）
      x.fillStyle = i % 2 === 0 ? '#0a0515' : '#15081a';
      for (var layer = 0; layer < 3; layer++) {
        x.beginPath();
        x.moveTo(tx + 22, 900 - th + layer * 60);
        x.lineTo(tx - 80 - layer * 10, 900 - th + layer * 60 + 100);
        x.lineTo(tx + 124 + layer * 10, 900 - th + layer * 60 + 100);
        x.closePath();
        x.fill();
      }
    }
    
    // 萤火虫（动态感）
    x.fillStyle = '#70d0ff';
    for (var i = 0; i < 30; i++) {
      x.globalAlpha = 0.4 + Math.random() * 0.4;
      var fx = Math.random() * 1920;
      var fy = Math.random() * 800;
      var fs = Math.random() * 3 + 2;
      x.beginPath();
      x.arc(fx, fy, fs, 0, Math.PI * 2);
      x.fill();
      
      // 光晕
      x.globalAlpha = 0.1;
      x.beginPath();
      x.arc(fx, fy, fs * 3, 0, Math.PI * 2);
      x.fill();
    }
    
    // 星星
    x.fillStyle = '#d0d0ff';
    x.globalAlpha = 1;
    for (var i = 0; i < 50; i++) {
      var sx = Math.random() * 1920;
      var sy = Math.random() * 600;
      var ss = Math.random() * 1.5 + 0.5;
      x.globalAlpha = 0.5 + Math.random() * 0.5;
      x.beginPath();
      x.arc(sx, sy, ss, 0, Math.PI * 2);
      x.fill();
    }
    
    // 魔法光点（大颗）
    x.fillStyle = '#a070ff';
    for (var i = 0; i < 10; i++) {
      var mx = Math.random() * 1920;
      var my = Math.random() * 800;
      x.globalAlpha = 0.6;
      x.beginPath();
      x.arc(mx, my, 5, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.2;
      x.beginPath();
      x.arc(mx, my, 12, 0, Math.PI * 2);
      x.fill();
    }
    
    // 地面雾气
    x.globalAlpha = 0.15;
    x.fillStyle = '#5a4a7a';
    x.fillRect(0, 850, 1920, 80);
    
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, 890, 1920, 190);
    return;
  }
  
  // 战斗场地 - 更紧张
  if (res.id.indexOf('placeholder_battle') >= 0 || res.id.indexOf('battle') >= 0) {
    // 暗红紧张背景
    var g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#2a1a1a');
    g.addColorStop(0.5, '#3a1a1a');
    g.addColorStop(1, '#1a0a0a');
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    
    // 远处树林（更密集）
    x.fillStyle = '#0a0505';
    for (var i = 0; i < 12; i++) {
      var tx = i * 170;
      var th = 450 + Math.random() * 50;
      x.fillRect(tx, 900 - th, 35, th);
      // 树冠
      x.beginPath();
      x.arc(tx + 17, 900 - th, 60, 0, Math.PI);
      x.fill();
    }
    
    // 战斗光圈
    x.strokeStyle = 'rgba(255,100,100,0.2)';
    x.lineWidth = 4;
    for (var i = 0; i < 3; i++) {
      x.beginPath();
      x.arc(960, 650, 300 + i * 100, 0, Math.PI * 2);
      x.stroke();
    }
    
    // 地面裂纹
    x.strokeStyle = '#4a2a2a';
    x.lineWidth = 5;
    x.beginPath();
    x.moveTo(400, 700);
    x.lineTo(800, 650);
    x.lineTo(1200, 680);
    x.lineTo(1500, 720);
    x.stroke();
    
    x.beginPath();
    x.moveTo(300, 750);
    x.lineTo(700, 730);
    x.lineTo(1100, 760);
    x.lineTo(1600, 740);
    x.stroke();
    
    // 地面层次
    x.strokeStyle = '#3a2a2a';
    x.lineWidth = 3;
    for (var i = 0; i < 6; i++) {
      x.beginPath();
      x.moveTo(0, 700 + i * 35);
      x.lineTo(1920, 700 + i * 35);
      x.stroke();
    }
    
    // 能量波动
    x.strokeStyle = 'rgba(255,80,80,0.3)';
    x.lineWidth = 2;
    for (var i = 0; i < 5; i++) {
      x.beginPath();
      x.moveTo(0, 300 + i * 80);
      x.quadraticCurveTo(480, 320 + i * 80, 960, 300 + i * 80);
      x.quadraticCurveTo(1440, 280 + i * 80, 1920, 300 + i * 80);
      x.stroke();
    }
    
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, 890, 1920, 190);
    return;
  }
  
  // 教室 - 更有细节
  if (res.id.indexOf('school') >= 0) {
    var g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#6a9fd8');
    g.addColorStop(0.6, '#3a6a9a');
    g.addColorStop(1, '#2a4a6a');
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    
    // 窗户（3扇，更精致）
    x.fillStyle = 'rgba(255,255,255,0.15)';
    x.strokeStyle = '#5a8ab0';
    x.lineWidth = 6;
    for (var i = 0; i < 3; i++) {
      var wx = 1350;
      var wy = 140 + i * 240;
      x.fillRect(wx, wy, 450, 200);
      x.strokeRect(wx, wy, 450, 200);
      
      // 窗格
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(wx + 225, wy);
      x.lineTo(wx + 225, wy + 200);
      x.moveTo(wx, wy + 100);
      x.lineTo(wx + 450, wy + 100);
      x.stroke();
    }
    
    // 阳光
    x.fillStyle = 'rgba(255,255,200,0.1)';
    x.beginPath();
    x.moveTo(1575, 240);
    x.lineTo(900, 400);
    x.lineTo(900, 600);
    x.lineTo(1575, 440);
    x.closePath();
    x.fill();
    
    // 黑板（更大）
    x.fillStyle = '#1a2a1a';
    x.strokeStyle = '#8a9a8a';
    x.lineWidth = 5;
    x.fillRect(120, 160, 600, 400);
    x.strokeRect(120, 160, 600, 400);
    
    // 黑板边框
    x.strokeStyle = '#a0b0a0';
    x.lineWidth = 8;
    x.strokeRect(115, 155, 610, 410);
    
    // 粉笔字（更清晰）
    x.strokeStyle = 'rgba(255,255,255,0.4)';
    x.lineWidth = 4;
    x.lineCap = 'round';
    var lines = [
      {x1: 160, y1: 200, x2: 660, y2: 200},
      {x1: 160, y1: 240, x2: 640, y2: 240},
      {x1: 160, y1: 280, x2: 670, y2: 280},
      {x1: 160, y1: 320, x2: 620, y2: 320},
      {x1: 160, y1: 360, x2: 650, y2: 360},
      {x1: 160, y1: 400, x2: 630, y2: 400},
      {x1: 160, y1: 440, x2: 660, y2: 440},
      {x1: 160, y1: 480, x2: 645, y2: 480}
    ];
    lines.forEach(function(line) {
      x.beginPath();
      x.moveTo(line.x1, line.y1);
      x.lineTo(line.x2, line.y2);
      x.stroke();
    });
    
    // 粉笔槽
    x.fillStyle = '#c0d0c0';
    x.fillRect(120, 565, 600, 15);
    
    // 讲台
    x.fillStyle = '#8a6a4a';
    x.strokeStyle = '#6a4a3a';
    x.lineWidth = 3;
    x.fillRect(300, 630, 250, 100);
    x.strokeRect(300, 630, 250, 100);
    x.fillRect(280, 730, 290, 15);
    
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, 890, 1920, 190);
    return;
  }
  
  // 天台
  if (res.id.indexOf('rooftop') >= 0) {
    var g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#e87a4a');
    g.addColorStop(0.6, '#8a3a6a');
    g.addColorStop(1, '#1a1030');
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    
    // 太阳/月亮
    x.fillStyle = '#f0c080';
    x.globalAlpha = 0.8;
    x.beginPath();
    x.arc(1500, 250, 80, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 1;
    
    // 云朵（更立体）
    x.fillStyle = 'rgba(255,255,255,0.25)';
    for (var i = 0; i < 6; i++) {
      var cx = 150 + i * 320;
      var cy = 150 + Math.random() * 100;
      x.beginPath();
      x.arc(cx, cy, 50, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.arc(cx + 40, cy + 10, 45, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.arc(cx + 80, cy, 50, 0, Math.PI * 2);
      x.fill();
    }
    
    // 围栏（更精致）
    x.strokeStyle = '#4a3a5a';
    x.lineWidth = 8;
    // 横杆
    x.beginPath();
    x.moveTo(0, 580);
    x.lineTo(1920, 580);
    x.moveTo(0, 730);
    x.lineTo(1920, 730);
    x.stroke();
    
    // 竖杆
    x.lineWidth = 6;
    for (var i = 0; i < 24; i++) {
      x.beginPath();
      x.moveTo(i * 80, 580);
      x.lineTo(i * 80, 730);
      x.stroke();
    }
    
    // 地面砖块
    x.strokeStyle = 'rgba(60,40,70,0.3)';
    x.lineWidth = 2;
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 6; j++) {
        x.strokeRect(j * 320, 750 + i * 35, 320, 35);
      }
    }
    
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, 890, 1920, 190);
    return;
  }
  
  // 公园
  if (res.id.indexOf('park') >= 0) {
    var g = x.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#7ac87a');
    g.addColorStop(0.6, '#4a8a4a');
    g.addColorStop(1, '#2a5a2a');
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    
    // 天空云朵
    x.fillStyle = 'rgba(255,255,255,0.2)';
    for (var i = 0; i < 5; i++) {
      var cx = 200 + i * 400;
      x.beginPath();
      x.arc(cx, 150, 40, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.arc(cx + 35, 160, 35, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.arc(cx + 70, 150, 40, 0, Math.PI * 2);
      x.fill();
    }
    
    // 树木（更丰富）
    for (var i = 0; i < 10; i++) {
      var tx = 80 + i * 190;
      var th = 280 + Math.random() * 80;
      
      // 树干
      x.fillStyle = '#2a4a2a';
      x.strokeStyle = '#1a3a1a';
      x.lineWidth = 2;
      x.fillRect(tx, 900 - th, 35, th);
      x.strokeRect(tx, 900 - th, 35, th);
      
      // 树冠（多层）
      x.fillStyle = i % 2 === 0 ? '#3a6a3a' : '#4a7a4a';
      x.beginPath();
      x.arc(tx + 17, 900 - th - 30, 70, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = '#2a5a2a';
      x.lineWidth = 2;
      x.stroke();
      
      x.fillStyle = i % 2 === 0 ? '#4a7a4a' : '#5a8a5a';
      x.beginPath();
      x.arc(tx + 17, 900 - th - 10, 50, 0, Math.PI * 2);
      x.fill();
    }
    
    // 长椅（更精致）
    x.fillStyle = '#6a4a3a';
    x.strokeStyle = '#4a3a2a';
    x.lineWidth = 3;
    // 座位
    x.fillRect(780, 640, 280, 20);
    x.strokeRect(780, 640, 280, 20);
    // 靠背
    x.fillRect(780, 490, 280, 20);
    x.strokeRect(780, 490, 280, 20);
    // 腿
    x.fillRect(800, 490, 20, 170);
    x.fillRect(1040, 490, 20, 170);
    
    // 草地纹理
    x.strokeStyle = 'rgba(50,80,50,0.2)';
    x.lineWidth = 1;
    for (var i = 0; i < 100; i++) {
      var gx = Math.random() * 1920;
      var gy = 700 + Math.random() * 200;
      x.beginPath();
      x.moveTo(gx, gy);
      x.lineTo(gx, gy - 8);
      x.stroke();
    }
    
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, 890, 1920, 190);
    return;
  }
  
  // 默认背景
  x.fillStyle = '#333';
  x.fillRect(0, 0, 1920, 1080);
  x.globalAlpha = 1;
  x.fillStyle = 'rgba(0,0,0,0.15)';
  x.fillRect(0, 890, 1920, 190);
}
// ===== 美化后的角色绘制函数 =====

function drawChar(x, c, res) {
  x.clearRect(0, 0, 400, 800);
  
  // 公主希尔薇（梦境）- 更精致
  if (res.id.indexOf('placeholder_princess') >= 0) {
    x.lineWidth = 4;
    x.strokeStyle = '#b090d0';
    
    // 头发（后层，超长波浪发）
    x.fillStyle = 'rgba(180,144,208,0.2)';
    x.beginPath();
    x.ellipse(200, 115, 95, 80, 0, Math.PI, Math.PI*2);
    x.fill();
    x.stroke();
    
    // 左侧超长波浪发
    x.beginPath();
    x.moveTo(110, 130);
    x.quadraticCurveTo(90, 250, 100, 400);
    x.quadraticCurveTo(95, 500, 105, 600);
    x.lineTo(130, 595);
    x.quadraticCurveTo(120, 480, 125, 380);
    x.quadraticCurveTo(130, 240, 145, 145);
    x.closePath();
    x.fill();
    x.stroke();
    
    // 右侧超长波浪发
    x.beginPath();
    x.moveTo(290, 130);
    x.quadraticCurveTo(310, 250, 300, 400);
    x.quadraticCurveTo(305, 500, 295, 600);
    x.lineTo(270, 595);
    x.quadraticCurveTo(280, 480, 275, 380);
    x.quadraticCurveTo(270, 240, 255, 145);
    x.closePath();
    x.fill();
    x.stroke();
    
    // 发饰（小花）
    x.fillStyle = '#ffa0c0';
    x.strokeStyle = '#d07090';
    x.lineWidth = 2;
    for (var i = 0; i < 5; i++) {
      var angle = (Math.PI * 2 / 5) * i;
      x.beginPath();
      x.arc(150 + Math.cos(angle) * 12, 160 + Math.sin(angle) * 12, 6, 0, Math.PI * 2);
      x.fill();
      x.stroke();
    }
    
    // 脸
    x.strokeStyle = '#b090d0';
    x.lineWidth = 4;
    x.fillStyle = 'rgba(255,240,250,0.3)';
    x.beginPath();
    x.ellipse(200, 145, 58, 65, 0, 0, Math.PI*2);
    x.fill();
    x.stroke();
    
    // 腮红
    x.fillStyle = 'rgba(255,160,180,0.25)';
    x.beginPath();
    x.ellipse(160, 165, 18, 12, 0, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.ellipse(240, 165, 18, 12, 0, 0, Math.PI*2);
    x.fill();
    
    // 身体（华丽公主裙）
    x.strokeStyle = '#b090d0';
    x.lineWidth = 4;
    x.fillStyle = 'rgba(220,200,240,0.25)';
    x.beginPath();
    x.moveTo(140, 210);
    x.quadraticCurveTo(200, 195, 260, 210);
    x.lineTo(275, 480);
    x.quadraticCurveTo(275, 520, 290, 650);
    x.lineTo(110, 650);
    x.quadraticCurveTo(125, 520, 125, 480);
    x.closePath();
    x.fill();
    x.stroke();
    
    // 裙摆装饰（波浪花边）
    x.strokeStyle = '#d0b0f0';
    x.lineWidth = 3;
    x.lineCap = 'round';
    for (var i = 0; i < 9; i++) {
      x.beginPath();
      x.arc(115 + i * 20, 635, 12, 0, Math.PI);
      x.stroke();
    }
    
    // 腰带
    x.fillStyle = '#f0a0d0';
    x.strokeStyle = '#c080a0';
    x.lineWidth = 2;
    x.fillRect(150, 380, 100, 15);
    x.strokeRect(150, 380, 100, 15);
    
    // 腰带蝴蝶结
    x.fillStyle = '#ffa0c0';
    x.beginPath();
    x.moveTo(200, 387);
    x.lineTo(175, 380);
    x.lineTo(175, 395);
    x.closePath();
    x.fill();
    x.stroke();
    x.beginPath();
    x.moveTo(200, 387);
    x.lineTo(225, 380);
    x.lineTo(225, 395);
    x.closePath();
    x.fill();
    x.stroke();
    
    // 袖子/手臂
    x.strokeStyle = '#b090d0';
    x.lineWidth = 4;
    x.fillStyle = 'rgba(220,200,240,0.2)';
    // 左臂
    x.beginPath();
    x.moveTo(140, 220);
    x.quadraticCurveTo(100, 280, 110, 340);
    x.lineTo(125, 335);
    x.quadraticCurveTo(120, 275, 150, 225);
    x.closePath();
    x.fill();
    x.stroke();
    // 右臂
    x.beginPath();
    x.moveTo(260, 220);
    x.quadraticCurveTo(300, 280, 290, 340);
    x.lineTo(275, 335);
    x.quadraticCurveTo(280, 275, 250, 225);
    x.closePath();
    x.fill();
    x.stroke();
    
    // 手
    x.fillStyle = 'rgba(255,240,250,0.3)';
    x.beginPath();
    x.ellipse(117, 340, 10, 12, 0, 0, Math.PI*2);
    x.fill();
    x.stroke();
    x.beginPath();
    x.ellipse(283, 340, 10, 12, 0, 0, Math.PI*2);
    x.fill();
    x.stroke();
    
    // 眼睛（更有神）
    x.lineWidth = 3;
    x.strokeStyle = '#6a4a7a';
    var ey = 145;
    
    // 左眼
    x.beginPath();
    x.ellipse(178, ey, 16, 14, 0, 0, Math.PI*2);
    x.stroke();
    x.fillStyle = '#6a4a7a';
    x.beginPath();
    x.arc(180, ey+2, 7, 0, Math.PI*2);
    x.fill();
    // 眼睛高光（双层）
    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(183, ey-2, 4, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.arc(177, ey+2, 2, 0, Math.PI*2);
    x.fill();
    
    // 右眼
    x.strokeStyle = '#6a4a7a';
    x.beginPath();
    x.ellipse(222, ey, 16, 14, 0, 0, Math.PI*2);
    x.stroke();
    x.fillStyle = '#6a4a7a';
    x.beginPath();
    x.arc(220, ey+2, 7, 0, Math.PI*2);
    x.fill();
    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(223, ey-2, 4, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.arc(217, ey+2, 2, 0, Math.PI*2);
    x.fill();
    
    // 睫毛
    x.strokeStyle = '#5a3a6a';
    x.lineWidth = 2;
    x.lineCap = 'round';
    for (var i = 0; i < 3; i++) {
      // 左眼睫毛
      x.beginPath();
      x.moveTo(170 + i * 8, ey - 12);
      x.lineTo(168 + i * 8, ey - 18);
      x.stroke();
      // 右眼睫毛
      x.beginPath();
      x.moveTo(214 + i * 8, ey - 12);
      x.lineTo(212 + i * 8, ey - 18);
      x.stroke();
    }
    
    // 嘴巴（温柔微笑）
    x.strokeStyle = '#8a6a9a';
    x.lineWidth = 2.5;
    x.lineCap = 'round';
    x.beginPath();
    x.arc(200, 172, 13, 0.2*Math.PI, 0.8*Math.PI);
    x.stroke();
    
    // 皇冠（更华丽）
    x.fillStyle = '#f0d060';
    x.strokeStyle = '#c0a030';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(200, 50);
    x.lineTo(185, 65);
    x.lineTo(170, 92);
    x.lineTo(185, 92);
    x.lineTo(185, 105);
    x.lineTo(200, 105);
    x.lineTo(215, 105);
    x.lineTo(215, 92);
    x.lineTo(230, 92);
    x.lineTo(215, 65);
    x.closePath();
    x.fill();
    x.stroke();
    
    // 皇冠装饰
    x.fillStyle = '#e06090';
    x.beginPath();
    x.arc(200, 70, 6, 0, Math.PI*2);
    x.fill();
    x.fillStyle = '#80d0ff';
    x.beginPath();
    x.arc(185, 92, 4, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.arc(215, 92, 4, 0, Math.PI*2);
    x.fill();
    
    return;
  }
  
  // 史莱姆怪物（已经很可爱了，保持原样）
  if (res.id.indexOf('placeholder_monster') >= 0) {
    x.fillStyle = 'rgba(255,128,160,0.3)';
    x.strokeStyle = '#ff80a0';
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(200, 550);
    x.quadraticCurveTo(100, 450, 120, 300);
    x.quadraticCurveTo(140, 200, 200, 180);
    x.quadraticCurveTo(260, 200, 280, 300);
    x.quadraticCurveTo(300, 450, 200, 550);
    x.closePath();
    x.fill();
    x.stroke();
    
    x.fillStyle = '#2a2a2a';
    x.beginPath();
    x.arc(170, 320, 15, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.arc(230, 320, 15, 0, Math.PI*2);
    x.fill();
    
    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(175, 315, 6, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.arc(235, 315, 6, 0, Math.PI*2);
    x.fill();
    
    x.strokeStyle = '#2a2a2a';
    x.lineWidth = 3;
    x.beginPath();
    x.arc(200, 360, 25, 0.2*Math.PI, 0.8*Math.PI);
    x.stroke();
    
    x.fillStyle = 'rgba(255,255,255,0.8)';
    x.fillRect(150, 140, 100, 30);
    x.fillStyle = '#000';
    x.font = '14px sans-serif';
    x.fillText('作业怪 Lv.1', 155, 160);
    
    return;
  }
  
  // === 阳菜/夜学姐（现实世界）- 美化版 ===
  var isHina = res.id.indexOf('hina') >= 0;
  var isSora = res.id.indexOf('sora') >= 0;
  var isHappy = res.id.indexOf('happy') >= 0;
  
  // 颜色配置
  var cl = isHina ? {
    outline: '#8070a0',
    fill: 'rgba(240,230,250,0.25)',
    hair: '#6a5a7a',
    hairFill: 'rgba(130,110,150,0.2)'
  } : isSora ? {
    outline: '#3a4a65',
    fill: 'rgba(200,210,230,0.25)',
    hair: '#1a2a40',
    hairFill: 'rgba(40,60,90,0.2)'
  } : {
    outline: '#666',
    fill: 'rgba(200,200,200,0.25)',
    hair: '#333',
    hairFill: 'rgba(100,100,100,0.2)'
  };
  
  x.lineWidth = 4;
  x.strokeStyle = cl.outline;
  
  // 头发（后层）
  x.fillStyle = cl.hairFill;
  x.beginPath();
  x.ellipse(200, 115, 90, 75, 0, Math.PI, Math.PI*2);
  x.fill();
  x.stroke();
  
  // 左侧长发
  x.beginPath();
  x.moveTo(115, 130);
  x.quadraticCurveTo(95, 280, 105, 420);
  x.quadraticCurveTo(100, 460, 115, 500);
  x.lineTo(140, 495);
  x.quadraticCurveTo(130, 450, 135, 410);
  x.quadraticCurveTo(140, 270, 150, 145);
  x.closePath();
  x.fill();
  x.stroke();
  
  // 右侧长发
  x.beginPath();
  x.moveTo(285, 130);
  x.quadraticCurveTo(305, 280, 295, 420);
  x.quadraticCurveTo(300, 460, 285, 500);
  x.lineTo(260, 495);
  x.quadraticCurveTo(270, 450, 265, 410);
  x.quadraticCurveTo(260, 270, 250, 145);
  x.closePath();
  x.fill();
  x.stroke();
  
  // 发夹（阳菜专属）
  if (isHina) {
    x.fillStyle = '#ff80a0';
    x.strokeStyle = '#d06080';
    x.lineWidth = 2;
    x.beginPath();
    x.arc(155, 150, 8, 0, Math.PI*2);
    x.fill();
    x.stroke();
    x.beginPath();
    x.arc(245, 150, 8, 0, Math.PI*2);
    x.fill();
    x.stroke();
  }
  
  // 脸
  x.strokeStyle = cl.outline;
  x.lineWidth = 4;
  x.fillStyle = cl.fill;
  x.beginPath();
  x.ellipse(200, 145, 58, 65, 0, 0, Math.PI*2);
  x.fill();
  x.stroke();
  
  // 腮红（开心时更明显）
  if (isHappy) {
    x.fillStyle = 'rgba(255,160,180,0.3)';
    x.beginPath();
    x.ellipse(160, 165, 18, 12, 0, 0, Math.PI*2);
    x.fill();
    x.beginPath();
    x.ellipse(240, 165, 18, 12, 0, 0, Math.PI*2);
    x.fill();
  }
  
  // 身体（校服）
  x.fillStyle = cl.fill;
  x.strokeStyle = cl.outline;
  x.lineWidth = 4;
  x.beginPath();
  x.moveTo(140, 210);
  x.quadraticCurveTo(200, 195, 260, 210);
  x.lineTo(280, 560);
  x.quadraticCurveTo(200, 575, 120, 560);
  x.closePath();
  x.fill();
  x.stroke();
  
  // 领子
  x.fillStyle = 'rgba(255,255,255,0.3)';
  x.strokeStyle = cl.outline;
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(170, 210);
  x.lineTo(200, 230);
  x.lineTo(230, 210);
  x.stroke();
  
  // 领结/蝴蝶结
  x.fillStyle = isHina ? '#ff80a0' : '#6080a0';
  x.strokeStyle = cl.outline;
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(200, 235);
  x.lineTo(185, 230);
  x.lineTo(185, 240);
  x.closePath();
  x.fill();
  x.stroke();
  x.beginPath();
  x.moveTo(200, 235);
  x.lineTo(215, 230);
  x.lineTo(215, 240);
  x.closePath();
  x.fill();
  x.stroke();
  
  // 裙子
  x.fillStyle = cl.fill;
  x.strokeStyle = cl.outline;
  x.lineWidth = 4;
  x.beginPath();
  x.moveTo(120, 540);
  x.quadraticCurveTo(200, 530, 280, 540);
  x.lineTo(300, 730);
  x.quadraticCurveTo(200, 745, 100, 730);
  x.closePath();
  x.fill();
  x.stroke();
  
  // 裙子褶皱
  x.strokeStyle = cl.outline;
  x.lineWidth = 2;
  for (var i = 0; i < 5; i++) {
    x.beginPath();
    x.moveTo(140 + i * 32, 560);
    x.lineTo(145 + i * 32, 720);
    x.stroke();
  }
  
  // 腿
  x.lineWidth = 3;
  x.strokeStyle = cl.outline;
  x.beginPath();
  x.moveTo(165, 720);
  x.lineTo(165, 790);
  x.stroke();
  x.beginPath();
  x.moveTo(193, 720);
  x.lineTo(193, 790);
  x.stroke();
  x.beginPath();
  x.moveTo(207, 720);
  x.lineTo(207, 790);
  x.stroke();
  x.beginPath();
  x.moveTo(235, 720);
  x.lineTo(235, 790);
  x.stroke();
  
  // 眼睛（更有神）
  x.lineWidth = 3;
  x.strokeStyle = '#2a2a2a';
  var ey = 148;
  
  // 左眼
  x.beginPath();
  x.ellipse(178, ey, 16, 13, 0, 0, Math.PI*2);
  x.stroke();
  x.fillStyle = isHina ? '#6088cc' : '#4a7a90';
  x.beginPath();
  x.arc(180, ey+1, 7, 0, Math.PI*2);
  x.fill();
  
  // 右眼
  x.beginPath();
  x.ellipse(222, ey, 16, 13, 0, 0, Math.PI*2);
  x.stroke();
  x.fillStyle = isHina ? '#6088cc' : '#4a7a90';
  x.beginPath();
  x.arc(220, ey+1, 7, 0, Math.PI*2);
  x.fill();
  
  // 高光（双层）
  x.fillStyle = '#fff';
  x.beginPath();
  x.arc(183, ey-2, 4, 0, Math.PI*2);
  x.fill();
  x.beginPath();
  x.arc(177, ey+2, 2, 0, Math.PI*2);
  x.fill();
  x.beginPath();
  x.arc(223, ey-2, 4, 0, Math.PI*2);
  x.fill();
  x.beginPath();
  x.arc(217, ey+2, 2, 0, Math.PI*2);
  x.fill();
  
  // 睫毛
  x.strokeStyle = '#2a2a2a';
  x.lineWidth = 2;
  x.lineCap = 'round';
  for (var i = 0; i < 3; i++) {
    x.beginPath();
    x.moveTo(170 + i * 8, ey - 11);
    x.lineTo(168 + i * 8, ey - 16);
    x.stroke();
    x.beginPath();
    x.moveTo(214 + i * 8, ey - 11);
    x.lineTo(212 + i * 8, ey - 16);
    x.stroke();
  }
  
  // 嘴巴
  x.strokeStyle = '#6a5a6a';
  x.lineWidth = 2.5;
  x.lineCap = 'round';
  if (isHappy) {
    x.beginPath();
    x.arc(200, 172, 14, 0.15*Math.PI, 0.85*Math.PI);
    x.stroke();
  } else {
    x.beginPath();
    x.moveTo(190, 176);
    x.lineTo(210, 176);
    x.stroke();
  }
}
  function drawItem(x, c, res) {
    x.clearRect(0, 0, 400, 400);
    
    // 确定物品类型
    var itemType = 'unknown';
    if (res.id.indexOf('broom') >= 0) itemType = 'broom';
    else if (res.id.indexOf('book') >= 0) itemType = 'book';
    else if (res.id.indexOf('sword') >= 0) itemType = 'sword';
    else if (res.id.indexOf('monster') >= 0) itemType = 'monster';
    
    // 调用items.js中的绘制函数
    if (GG.items && GG.items.draw) {
      GG.items.draw(itemType, x, { x: 200, y: 200, scale: 1 });
    } else {
      // fallback：绘制一个问号
      x.fillStyle = '#8a8a8a';
      x.strokeStyle = '#4a4a4a';
      x.lineWidth = 3;
      x.fillRect(100, 100, 200, 200);
      x.strokeRect(100, 100, 200, 200);
      x.fillStyle = '#fff';
      x.font = 'bold 80px sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('?', 200, 200);
    }
  }
})();
