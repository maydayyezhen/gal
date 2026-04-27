// ==================== 场景编辑模态框 ====================
function openSceneEditModal(scene) {
  const modal = document.getElementById('sceneModal');
  const form = document.getElementById('sceneForm');
  
  currentStep = 1;

  // QA-02：行级 Playtest 需要知道“当前正在编辑的场景是谁”
  EditorState._editingSceneObj = scene;
  
  // 收集所有可用的资源ID
  const availableResources = collectAvailableResources();

  form.innerHTML = `
    <div class="modal-header">
      <div class="scene-modal-topbar">
        <div>
          <h3 style="margin: 0;">场景编辑</h3>
          <div class="scene-modal-sub">当前场景：<span id="sceneModalSceneIdLabel">${scene.id}</span></div>
        </div>
        <div class="scene-modal-actions">
          <button class="btn-small" id="sceneFsBtn" onclick="toggleSceneEditorFullscreen()">⛶ 浏览器全屏</button>
          <button class="btn-small" onclick="closeModal()">✕ 关闭</button>
        </div>
      </div>
      
      <!-- 步骤进度条 -->
      <div class="step-progress">
        <div class="step-item active" onclick="goToStep(1)">
          <div class="step-number">1</div>
          <div class="step-label">基础信息</div>
        </div>
        <div class="step-item" onclick="goToStep(2)">
          <div class="step-number">2</div>
          <div class="step-label">选择背景</div>
        </div>
        <div class="step-item" onclick="goToStep(3)">
          <div class="step-number">3</div>
          <div class="step-label">选择音乐</div>
        </div>
        <div class="step-item" onclick="goToStep(4)">
          <div class="step-number">4</div>
          <div class="step-label">编辑对话</div>
        </div>
        <div class="step-item" onclick="goToStep(5)">
          <div class="step-number">5</div>
          <div class="step-label">预览保存</div>
        </div>
      </div>
    </div>
    
    <div class="modal-body">
      <!-- 步骤1: 基础信息 -->
      <div class="step-content active" id="step-1">
        <div class="edit-section">
          <div class="section-title">📋 基础信息</div>
          <div class="form-field">
            <label>场景ID</label>
            <input type="text" class="form-input" id="edit_sceneId" value="${scene.id}" 
                   style="font-size: 16px; padding: 15px;">
            <small style="color: #999; margin-top: 5px; display: block;">
              例如：scene_ch1_classroom
            </small>
          </div>
        </div>

        <div class="edit-section">
          <div class="section-title">🎭 初始舞台（scene.characters）</div>
          <div class="init-stage-box">
            <div class="init-stage-hint">
              这里设置的是“进入场景时就已经站在舞台上的角色”。
              如果你更喜欢在对话里通过 <code>stage.showChars / stage.swapChars / stage.hideChars</code> 控制出场，也可以留空。
            </div>
            <div id="initStageRows" class="init-stage-rows"></div>
            <div class="init-stage-actions">
              <button class="btn btn-secondary btn-inline" onclick="addInitStageRow()">+ 添加角色</button>
              <button class="btn btn-secondary btn-inline" onclick="clearInitStage()">🧹 清空</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 步骤2: 选择背景 -->
      <div class="step-content" id="step-2">
        <div class="edit-section">
          <div class="section-title">
            🖼️ 选择背景图
            <button class="btn-small" onclick="showImportDialog('background')" style="margin-left: auto;">
              + 导入新背景
            </button>
          </div>
          <div class="resource-grid" id="backgroundGrid">
            ${generateBackgroundGrid(availableResources.backgrounds, scene.background)}
          </div>
        </div>
      </div>
      
      <!-- 步骤3: 选择BGM -->
      <div class="step-content" id="step-3">
        <div class="edit-section">
          <div class="section-title">
            🎵 选择背景音乐
            <button class="btn-small" onclick="showImportDialog('bgm')" style="margin-left: auto;">
              + 导入新BGM
            </button>
          </div>
          <div class="resource-grid" id="bgmGrid">
            ${generateBGMGrid(availableResources.bgms, scene.bgm)}
          </div>
        </div>
      </div>
      
      <!-- 步骤4: 编辑对话 -->
      <div class="step-content" id="step-4">
        <div class="edit-section">
          <div class="section-title">💬 编辑对话列表</div>
          <div class="dialog-editor-grid" id="dialogEditorGrid">
            <div class="dialog-editor-left" id="dialogEditorLeft">
              <div id="dialogsList" class="dialogs-editor-list">
                <!-- 动态生成 -->
              </div>
              <div class="dialog-add-sticky">
                <button class="add-dialog-btn" onclick="addDialogItem()">+ 添加新对话</button>
              </div>
            </div>

            <div class="dialog-splitter" id="dialogSplitter" title="拖动调整比例"></div>

            <div class="dialog-editor-right" id="dialogEditorRight">
              <div class="editor-preview-panel">
                <div class="editor-preview-header">
                  <div class="editor-preview-title">🎬 预览框</div>
                  <div class="editor-preview-buttons">
                    <button class="btn-small" onclick="previewPrevLine()" title="上一句">←</button>
                    <button class="btn-small" onclick="previewCurrentLine()" title="预览当前句">▶</button>
                    <button class="btn-small" onclick="previewNextLine()" title="下一句">→</button>
                    <button class="btn-small" onclick="previewReset()" title="重置到场景初始">⟲</button>
                  </div>
                </div>
                <div class="editor-preview-toggles">
                  <label class="preview-toggle"><input type="checkbox" id="previewLiveToggle" checked onchange="togglePreviewLive(this.checked)">实时</label>
                  <label class="preview-toggle"><input type="checkbox" id="previewMuteToggle" checked onchange="togglePreviewMute(this.checked)">静音</label>
                </div>
                <div class="editor-preview-scrub">
                  <div class="editor-preview-scrub-line">
                    <span>对话位置</span>
                    <span id="previewScrubLabel">0/0</span>
                  </div>
                  <input type="range" id="previewScrub" min="0" max="0" value="0" step="1" oninput="onPreviewScrub(this.value)">
                </div>
                <div class="editor-preview-iframe-wrap" id="editorPreviewWrap">
                  <div class="editor-preview-viewport" id="editorPreviewViewport">
                    <iframe id="editorPreviewFrame" src="preview.html?embed=1" title="预览"></iframe>
                  </div>
                </div>
                <div class="editor-preview-status" id="previewStatus">等待连接…</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 步骤5: 预览和分支 -->
      <div class="step-content" id="step-5">
        <div class="edit-section">
          <div class="section-title">📋 场景预览</div>
          <div id="scenePreview" style="background: #2d2d2d; padding: 20px; border-radius: 8px; margin-bottom: 20px; max-height: 55vh; overflow-y: auto;">
            <!-- 预览内容 -->
          </div>
        </div>
        
        <div class="edit-section">
          <div class="section-title">🔀 选择分支（可选）</div>
          <textarea class="form-textarea" id="edit_choices" rows="3" 
                    placeholder="每行一个选项，格式：选项文本>> 场景ID&#10;例如：同意>> scene_ch1_agree"
                    >${serializeChoices(scene.choices)}</textarea>
          <div class="form-field" style="margin-top: 15px;">
            <label>自动跳转场景ID（无选择时）</label>
            <input type="text" class="form-input" id="edit_autoNext" value="${scene.autoNext || ''}" 
                   placeholder="scene_ch1_next">
          </div>
        </div>
      </div>
    </div>
    
    <div class="modal-actions">
      <div style="flex: 1;">
        <button class="btn btn-secondary" onclick="prevStep()" id="prevBtn" style="display: none;">
          ← 上一步
        </button>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn" onclick="nextStep()" id="nextBtn">下一步 →</button>
        <button class="btn" onclick="saveScene()" id="saveBtn" style="display: none; background: #5aaa5a;">
          💾 保存场景
        </button>
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      </div>
    </div>
  `;
  
  modal.classList.add('show');

  // P-01：预览框每次打开场景编辑器都重新连接一次（iframe 会重新加载）
  __resetPreviewState();
  
  // 初始化对话编辑数据：深拷贝避免直接污染原剧本。
  // 注意：不要在这里“自动补默认立绘”，否则会覆盖剧本里通过 scene.characters / stage.swapChars 等实现的演出。
  // 立绘展示请在渲染层做“继承/舞台状态”推导。
  (function () {
    var raw = scene.dialogs || [];
    editingDialogs = raw.map(function (d) {
      return Object.assign({
        speaker: '',
        text: '',
        character: '',
        position: '',
        animation: '',
        voice: null,
        se: null
      }, d || {});
    });
  })();

  // 初始化“初始舞台”编辑数据（深拷贝避免直接污染剧本，保存时再写回）
  editingSceneCharacters = __cloneSceneCharacters(scene.characters);
  renderInitStageEditor();

  // 渲染对话列表
  renderDialogsList(editingDialogs);
  updateStepUI();

  // P-01：预览框尺寸初始化（等比适配 + 可拖拽分隔条）
  requestAnimationFrame(function () {
    try {
      __initDialogSplitter();
      __applyPreviewPaneSize();
      __fitPreviewViewport();
    } catch (e) {}
  });
}

// 跳转到指定步骤
function goToStep(step) {
  if (step < 1 || step > totalSteps) return;
  
  currentStep = step;
  updateStepUI();
  
  // 如果到了最后一步，生成预览
  if (currentStep === totalSteps) {
    generateScenePreview();
  }
}

// 下一步
function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    updateStepUI();
    
    // 如果到了最后一步，生成预览
    if (currentStep === totalSteps) {
      generateScenePreview();
    }
  }
}

// 上一步
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepUI();
  }
}

// 更新步骤UI
function updateStepUI() {
  // 更新进度条
  document.querySelectorAll('.step-item').forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');
    
    if (stepNum === currentStep) {
      item.classList.add('active');
    } else if (stepNum < currentStep) {
      item.classList.add('completed');
    }
  });
  
  // 更新内容显示
  document.querySelectorAll('.step-content').forEach((content, index) => {
    content.classList.remove('active');
    if (index + 1 === currentStep) {
      content.classList.add('active');
    }
  });
  
  // 更新按钮
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const saveBtn = document.getElementById('saveBtn');
  
  if (prevBtn && nextBtn && saveBtn) {
    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    
    if (currentStep === totalSteps) {
      nextBtn.style.display = 'none';
      saveBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'block';
      saveBtn.style.display = 'none';
    }
  }

  // P-01：切到“编辑对话列表”时，自动刷新预览框
  if (currentStep === 4) {
    __refreshPreviewScrub();
    __scheduleLivePreview();
    requestAnimationFrame(function () {
      try {
        __initDialogSplitter();
        __applyPreviewPaneSize();
        __fitPreviewViewport();
      } catch (e) {}
    });
  }
}

// 生成场景预览
function generateScenePreview() {
  const preview = document.getElementById('scenePreview');
  if (!preview) return;
  
  const sceneId = document.getElementById('edit_sceneId').value;
  
  // 获取选中的背景和BGM
  const bgInput = document.getElementById('edit_background');
  const bgmInput = document.getElementById('edit_bgm');
  const background = bgInput ? bgInput.value : '';
  const bgm = bgmInput ? bgmInput.value : '';

  const initChars = Array.isArray(editingSceneCharacters) ? editingSceneCharacters : [];
  const initSummary = (initChars.length === 0)
    ? '无'
    : initChars.map(c => {
        const id = (c && c.id) ? String(c.id) : '';
        if (!id) return '';
        const pos = (c && c.position) ? String(c.position) : __defaultPosForCharId(id);
        const op = (c && c.opacity != null) ? c.opacity : 1;
        return `${id} @${pos} (α=${op})`;
      }).filter(Boolean).join('；');
  
  let html = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 18px; font-weight: 600; color: #4a8acc; margin-bottom: 15px;">
        场景：${sceneId || '未命名'}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <div style="color: #999; font-size: 13px; margin-bottom: 5px;">背景图</div>
          <div style="color: #fff; font-size: 15px;">${background || '无'}</div>
        </div>
        <div>
          <div style="color: #999; font-size: 13px; margin-bottom: 5px;">背景音乐</div>
          <div style="color: #fff; font-size: 15px;">${bgm || '无'}</div>
        </div>
      </div>

      <div>
        <div style="color: #999; font-size: 13px; margin-bottom: 5px;">初始舞台</div>
        <div style="color: #fff; font-size: 14px; line-height: 1.5;">${initSummary}</div>
      </div>
    </div>
    
    <div>
      <div style="color: #999; font-size: 13px; margin-bottom: 10px;">
        对话内容（共 ${editingDialogs.length} 条）
      </div>
  `;
  
  if (editingDialogs.length === 0) {
    html += '<div style="color: #666; padding: 20px; text-align: center;">暂无对话</div>';
  } else {
    editingDialogs.forEach((dialog, index) => {
      html += `
        <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #4a8acc;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="color: #4a8acc; font-weight: 600; font-size: 13px;">对话 ${index + 1}</span>
            ${dialog.character ? `<span style="color: #999; font-size: 12px;">立绘: ${dialog.character}</span>` : ''}
            ${dialog.position ? `<span style="color: #999; font-size: 12px;">位置: ${dialog.position}</span>` : ''}
          </div>
          <div style="color: #4a8acc; font-weight: 600; margin-bottom: 5px;">
            ${dialog.speaker || '旁白'}
          </div>
          <div style="color: #e0e0e0; line-height: 1.6;">${dialog.text || ''}</div>
          ${dialog.animation || dialog.se ? `
            <div style="margin-top: 8px; font-size: 12px; color: #999;">
              ${dialog.animation ? `动画: ${dialog.animation}` : ''}
              ${dialog.se ? ` | 音效: ${dialog.se}` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }
  
  html += '</div>';
  preview.innerHTML = html;
}

// 生成背景网格
function generateBackgroundGrid(backgrounds, selected) {
  let html = `
    <div class="resource-option ${!selected ? 'selected' : ''}" onclick="selectBackground('')">
      <div class="resource-preview">
        <div style="color: #666; font-size: 14px;">无背景</div>
      </div>
      <div class="resource-name">无背景</div>
    </div>
  `;
  
  backgrounds.forEach(bg => {
    const imagePath = getImagePathById(bg) || `images/backgrounds/${bg.replace('bg_', '')}.png`;
    html += `
      <div class="resource-option ${selected === bg ? 'selected' : ''}" onclick="selectBackground('${bg}')">
        <div class="resource-preview">
          <img src="${imagePath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="display: none; color: #4a8acc; font-size: 32px;">🖼️</div>
        </div>
        <div class="resource-name">${bg}</div>
      </div>
    `;
  });
  
  return html;
}

// 生成BGM网格
function generateBGMGrid(bgms, selected) {
  let html = `
    <div class="resource-option ${!selected ? 'selected' : ''}" onclick="selectBGM('')">
      <div class="resource-preview">
        <div style="color: #666; font-size: 14px;">无音乐</div>
      </div>
      <div class="resource-name">无音乐</div>
    </div>
  `;
  
  bgms.forEach(bgm => {
    html += `
      <div class="resource-option ${selected === bgm ? 'selected' : ''}" onclick="selectBGM('${bgm}')">
        <div class="resource-preview">
          <div style="color: #4a8acc; font-size: 48px;">🎵</div>
        </div>
        <div class="resource-name">${bgm}</div>
      </div>
    `;
  });
  
  return html;
}

// 选择背景
function selectBackground(bgId) {
  document.querySelectorAll('#backgroundGrid .resource-option').forEach(el => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // 保存到隐藏字段
  let input = document.getElementById('edit_background');
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.id = 'edit_background';
    document.getElementById('sceneForm').appendChild(input);
  }
  input.value = bgId;
}

// 选择BGM
function selectBGM(bgmId) {
  document.querySelectorAll('#bgmGrid .resource-option').forEach(el => {
    el.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // 保存到隐藏字段
  let input = document.getElementById('edit_bgm');
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.id = 'edit_bgm';
    document.getElementById('sceneForm').appendChild(input);
  }
  input.value = bgmId;
}

// 全局变量保存编辑中的对话
let editingDialogs = [];

