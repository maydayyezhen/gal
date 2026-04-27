/**
 * choiceManager.js — 选项生成与分支跳转
 * - 增加 WebAudio 反馈：打开选项 / 确认选项
 * - 修复：重复调用 handleSceneEnd 时的按钮堆叠/重复计时
 */
(function () {
  var GG = window.GG = window.GG || {};

  var endTimer = null;

  function playSE(id, fallbackId) {
    try {
      var info = GG.getAudio && GG.getAudio(id);
      if ((!info || info.fallback) && fallbackId) info = GG.getAudio(fallbackId);
      if (info && !info.fallback) GG.playSE(info.path, info.volume);
    } catch (e) {}
  }

  GG.handleSceneEnd = function (scene, onChoose) {
    var choices = scene.choices || [];
    var container = GG.$('#choice-container');
    var hint = GG.$('#click-hint');

    // 防止重复触发：清理上一次的结局计时器
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }

    container.innerHTML = '';

    function unlockAnd(next) {
      if (GG._setWaitingChoice) GG._setWaitingChoice(false);
      if (next) next();
    }

    // 支持 autoNext 自动跳转
    if (scene.autoNext) {
      hint.style.display = 'block';
      endTimer = setTimeout(function () {
        unlockAnd(function () {
          if (onChoose) onChoose(scene.autoNext);
        });
      }, 300);
      return;
    }

    if (choices.length === 0) {
      hint.style.display = 'none';
      // 结局 → 显示重玩和回标题
      endTimer = setTimeout(function () {
        playSE('se_choice_open', 'se_click');

        var btn1 = document.createElement('button');
        btn1.className = 'choice-btn';
        btn1.textContent = '↺ 重新开始';
        btn1.addEventListener('click', function () {
          playSE('se_choice_confirm', 'se_click');
          container.innerHTML = '';
          unlockAnd(function () {
            if (GG._restartGame) GG._restartGame();
          });
        });

        var btn2 = document.createElement('button');
        btn2.className = 'choice-btn';
        btn2.textContent = '回到标题';
        btn2.addEventListener('click', function () {
          playSE('se_choice_confirm', 'se_click');
          container.innerHTML = '';
          unlockAnd(function () {
            if (GG._showTitle) GG._showTitle();
          });
        });

        container.appendChild(btn1);
        container.appendChild(btn2);
      }, 600);
      return;
    }

    hint.style.display = 'none';
    playSE('se_choice_open', 'se_click');

    choices.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = ch.text;
      btn.addEventListener('click', function () {
        playSE('se_choice_confirm', 'se_click');
        container.innerHTML = '';
        unlockAnd(function () {
          if (onChoose) onChoose(ch.nextSceneId);
        });
      });
      container.appendChild(btn);
    });
  };
})();
