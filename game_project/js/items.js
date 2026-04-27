/**
 * items.js - 物品绘制系统
 * 用于绘制扫把、书本、塑料剑等道具
 */
(function() {
  var GG = window.GG = window.GG || {};
  
  /**
   * 绘制物品到Canvas
   * @param {string} itemType - 物品类型：broom, book, sword, monster等
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} options - 绘制选项 {x, y, scale}
   */
  function drawItem(itemType, ctx, options) {
    options = options || {};
    var x = options.x || 200;
    var y = options.y || 200;
    var scale = options.scale || 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    switch(itemType) {
      case 'broom':
        drawBroom(ctx);
        break;
      case 'book':
        drawBook(ctx);
        break;
      case 'sword':
        drawSword(ctx);
        break;
      case 'monster':
        drawMonsterSlime(ctx);
        break;
      default:
        // 默认绘制一个问号
        drawQuestionMark(ctx);
    }
    
    ctx.restore();
  }
  
  /**
   * 扫把
   */
  function drawBroom(ctx) {
    // 扫帚柄
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.lineTo(0, 80);
    ctx.stroke();
    
    // 扫帚头（一束束的）
    ctx.strokeStyle = '#c0a060';
    ctx.lineWidth = 3;
    for (var i = -40; i <= 40; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 60);
      ctx.lineTo(i + Math.random() * 10 - 5, 120);
      ctx.stroke();
    }
    
    // 绑带
    ctx.strokeStyle = '#6a4a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-30, 70);
    ctx.lineTo(30, 70);
    ctx.stroke();
    
    // 发光效果（魔法扫帚）
    ctx.strokeStyle = 'rgba(160,200,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -100, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -100, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * 书本
   */
  function drawBook(ctx) {
    // 书本主体
    ctx.fillStyle = '#d06060';
    ctx.strokeStyle = '#8a4040';
    ctx.lineWidth = 3;
    ctx.fillRect(-50, -60, 100, 120);
    ctx.strokeRect(-50, -60, 100, 120);
    
    // 书脊
    ctx.fillStyle = '#a04040';
    ctx.fillRect(-50, -60, 15, 120);
    
    // 书页
    ctx.fillStyle = '#f0e8d0';
    ctx.fillRect(-40, -50, 3, 100);
    ctx.fillRect(-35, -50, 3, 100);
    
    // 标题框
    ctx.strokeStyle = '#f0d060';
    ctx.lineWidth = 2;
    ctx.strokeRect(-35, -40, 70, 25);
    
    // 魔法符号
    ctx.strokeStyle = '#f0d060';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 15, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-15, 15);
    ctx.lineTo(15, 15);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 30);
    ctx.stroke();
    
    // 发光
    ctx.strokeStyle = 'rgba(240,208,96,0.3)';
    ctx.lineWidth = 6;
    ctx.strokeRect(-50, -60, 100, 120);
  }
  
  /**
   * 塑料剑
   */
  function drawSword(ctx) {
    // 剑刃
    ctx.fillStyle = '#a0c0d0';
    ctx.strokeStyle = '#607080';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(-10, -20);
    ctx.lineTo(-5, 40);
    ctx.lineTo(5, 40);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 剑刃反光
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(-3, -100);
    ctx.lineTo(-2, -40);
    ctx.lineTo(2, -40);
    ctx.lineTo(3, -100);
    ctx.closePath();
    ctx.fill();
    
    // 护手
    ctx.fillStyle = '#d0a060';
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 2;
    ctx.fillRect(-30, 40, 60, 10);
    ctx.strokeRect(-30, 40, 60, 10);
    
    // 剑柄
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(-8, 50, 16, 50);
    ctx.strokeRect(-8, 50, 16, 50);
    
    // 剑柄纹理
    for (var i = 55; i < 95; i += 10) {
      ctx.strokeStyle = '#6a4a3a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, i);
      ctx.lineTo(8, i);
      ctx.stroke();
    }
    
    // 剑柄尾部
    ctx.fillStyle = '#c09070';
    ctx.beginPath();
    ctx.arc(0, 100, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 魔法光效
    ctx.strokeStyle = 'rgba(160,200,255,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(0, 40);
    ctx.stroke();
  }
  
  /**
   * 史莱姆怪物（作业怪）
   */
  function drawMonsterSlime(ctx) {
    // 身体
    ctx.fillStyle = 'rgba(255,128,160,0.3)';
    ctx.strokeStyle = '#ff80a0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.quadraticCurveTo(-120, 30, -100, -60);
    ctx.quadraticCurveTo(-80, -120, 0, -140);
    ctx.quadraticCurveTo(80, -120, 100, -60);
    ctx.quadraticCurveTo(120, 30, 0, 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 左眼
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(-40, -30, 18, 0, Math.PI * 2);
    ctx.fill();
    // 高光
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-35, -35, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // 右眼
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(40, -30, 18, 0, Math.PI * 2);
    ctx.fill();
    // 高光
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(45, -35, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 10, 30, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // 头顶牌子
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 2;
    ctx.fillRect(-60, -170, 120, 35);
    ctx.strokeRect(-60, -170, 120, 35);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('作业怪 Lv.1', 0, -145);
    
    // 抖动效果线条
    ctx.strokeStyle = 'rgba(255,128,160,0.2)';
    ctx.lineWidth = 1;
    for (var i = 0; i < 5; i++) {
      var angle = (Math.PI * 2 / 5) * i;
      var r = 150;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.stroke();
    }
  }
  
  /**
   * 问号（未知物品）
   */
  function drawQuestionMark(ctx) {
    ctx.fillStyle = '#8a8a8a';
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 3;
    
    // 方框
    ctx.fillRect(-50, -50, 100, 100);
    ctx.strokeRect(-50, -50, 100, 100);
    
    // 问号
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 0);
  }
  
  /**
   * 创建物品的Canvas图像
   */
  function generateItemImage(itemType, size) {
    size = size || 400;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    
    drawItem(itemType, ctx, { x: size / 2, y: size / 2, scale: 1 });
    
    return canvas.toDataURL('image/png');
  }
  
  // 暴露API
  GG.items = {
    draw: drawItem,
    generate: generateItemImage
  };
})();
