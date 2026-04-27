// ==================== P-01：编辑器内预览框 ====================
function __updatePreviewStatus(text) {
  const el = document.getElementById('previewStatus');
  if (el) el.textContent = text;
}

function __resetPreviewState() {
  EditorPreview.ready = false;
  EditorPreview.pendingPayload = null;
  EditorPreview.currentIndex = 0;
  // toggle UI（如果存在）
  const liveEl = document.getElementById('previewLiveToggle');
  if (liveEl) EditorPreview.live = !!liveEl.checked;
  const muteEl = document.getElementById('previewMuteToggle');
  if (muteEl) EditorPreview.muted = !!muteEl.checked;
  __updatePreviewStatus('等待预览连接…');
  __refreshPreviewScrub();
}

function __refreshPreviewScrub() {
  const slider = document.getElementById('previewScrub');
  const label = document.getElementById('previewScrubLabel');
  if (!slider || !label) return;

  const total = Array.isArray(editingDialogs) ? editingDialogs.length : 0;
  const max = Math.max(0, total - 1);
  slider.min = '0';
  slider.max = String(max);
  if (total === 0) {
    EditorPreview.currentIndex = 0;
    slider.value = '0';
    label.textContent = '0/0';
    return;
  }

  EditorPreview.currentIndex = Math.min(max, Math.max(0, EditorPreview.currentIndex | 0));
  slider.value = String(EditorPreview.currentIndex);
  label.textContent = `${EditorPreview.currentIndex + 1}/${total}`;
}

function togglePreviewLive(enabled) {
  EditorPreview.live = !!enabled;
  // 关了就不自动刷；开了就立刻刷一次
  if (EditorPreview.live) {
    __scheduleLivePreview(true);
  }
}

function togglePreviewMute(enabled) {
  EditorPreview.muted = !!enabled;
  // 让预览端也同步一下静音状态（不强求 ready）
  __postPreviewMessage({
    type: 'editorPreview:options',
    options: { muted: EditorPreview.muted }
  });
}

function onPreviewScrub(value) {
  const idx = parseInt(value, 10) || 0;
  EditorPreview.currentIndex = idx;
  __refreshPreviewScrub();
  __scheduleLivePreview(true);
}

function previewDialogLine(index) {
  EditorPreview.currentIndex = Math.max(0, Math.min((editingDialogs?.length || 1) - 1, index));
  __refreshPreviewScrub();
  // 让高亮跟上
  renderDialogsList(editingDialogs);
  // 立刻刷一发
  previewCurrentLine();
}

function previewPrevLine() {
  if (!editingDialogs || editingDialogs.length === 0) return;
  EditorPreview.currentIndex = Math.max(0, (EditorPreview.currentIndex | 0) - 1);
  __refreshPreviewScrub();
  renderDialogsList(editingDialogs);
  previewCurrentLine();
}

function previewNextLine() {
  if (!editingDialogs || editingDialogs.length === 0) return;
  const max = Math.max(0, editingDialogs.length - 1);
  EditorPreview.currentIndex = Math.min(max, (EditorPreview.currentIndex | 0) + 1);
  __refreshPreviewScrub();
  renderDialogsList(editingDialogs);
  previewCurrentLine();
}

function previewReset() {
  EditorPreview.currentIndex = 0;
  __refreshPreviewScrub();
  renderDialogsList(editingDialogs);
  previewCurrentLine();
}

function __scheduleLivePreview(force) {
  // 不在“编辑对话”步就别刷了，免得浪费。
  const step4 = document.getElementById('step-4');
  const inStep4 = !!(step4 && step4.classList.contains('active'));
  if (!inStep4) return;

  if (!EditorPreview.live && !force) return;
  clearTimeout(EditorPreview._debounceTimer);
  EditorPreview._debounceTimer = setTimeout(() => {
    previewCurrentLine();
  }, 120);
}

function __postPreviewMessage(payload) {
  try {
    const frame = document.getElementById('editorPreviewFrame');
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(payload, '*');
  } catch (e) {}
}


// ===== P-01：预览框布局：等比适配 + 可拖拽比例 =====
const __PREVIEW_PANE_W_KEY = 'ww_editor_previewPaneW';
const __PREVIEW_PANE_H_KEY = 'ww_editor_previewPaneH';

function __getDialogFlexDir() {
  const grid = document.getElementById('dialogEditorGrid');
  if (!grid) return 'row';
  return (getComputedStyle(grid).flexDirection || 'row');
}

function __applyPreviewPaneSize() {
  const grid = document.getElementById('dialogEditorGrid');
  const right = document.getElementById('dialogEditorRight');
  if (!grid || !right) return;

  const dir = __getDialogFlexDir();

  if (dir === 'column') {
    // 窄屏：上下布局，调整预览高度
    right.style.width = '100%';
    const saved = parseInt(localStorage.getItem(__PREVIEW_PANE_H_KEY) || '520', 10);
    const maxH = Math.max(260, Math.floor(window.innerHeight * 0.85));
    const h = Math.max(280, Math.min(saved, maxH));
    right.style.height = h + 'px';
  } else {
    // 宽屏：左右布局，调整预览宽度
    right.style.height = ''; // 交给 CSS（全屏下由 calc 控制）
    const saved = parseInt(localStorage.getItem(__PREVIEW_PANE_W_KEY) || '520', 10);
    const maxW = Math.max(380, grid.clientWidth - 340);
    const w = Math.max(360, Math.min(saved, maxW));
    right.style.width = w + 'px';
  }
}

function __fitPreviewViewport() {
  const wrap = document.getElementById('editorPreviewWrap');
  const viewport = document.getElementById('editorPreviewViewport');
  if (!wrap || !viewport) return;

  const cs = getComputedStyle(wrap);
  const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);

  const availW = Math.max(220, wrap.clientWidth - padX);
  const availH = Math.max(160, wrap.clientHeight - padY);

  // 预览默认用 16:9（背景图 1920x1080），不然你看到的就是“宽得要死，高得可怜”
  const ratio = 16 / 9;

  let w = availW;
  let h = w / ratio;

  if (h > availH) {
    h = availH;
    w = h * ratio;
  }

  viewport.style.width = Math.floor(w) + 'px';
  viewport.style.height = Math.floor(h) + 'px';
}

function __initDialogSplitter() {
  const splitter = document.getElementById('dialogSplitter');
  const grid = document.getElementById('dialogEditorGrid');
  const right = document.getElementById('dialogEditorRight');
  if (!splitter || !grid || !right) return;
  if (splitter.__bound) return;
  splitter.__bound = true;

  splitter.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    splitter.classList.add('dragging');
    try { splitter.setPointerCapture(e.pointerId); } catch (_) {}

    const dir = __getDialogFlexDir();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = right.getBoundingClientRect().width;
    const startH = right.getBoundingClientRect().height;

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (dir === 'column') {
        // 上下：拖动分隔条，调整预览高度
        let newH = startH - dy; // 往上拖（dy负）=> 预览变高
        const maxH = Math.max(260, Math.floor(window.innerHeight * 0.85));
        newH = Math.max(280, Math.min(newH, maxH));
        right.style.height = Math.floor(newH) + 'px';
        localStorage.setItem(__PREVIEW_PANE_H_KEY, String(Math.floor(newH)));
      } else {
        // 左右：拖动分隔条，调整预览宽度
        let newW = startW - dx; // 往左拖（dx负）=> 预览变宽
        const maxW = Math.max(380, grid.clientWidth - 340);
        newW = Math.max(360, Math.min(newW, maxW));
        right.style.width = Math.floor(newW) + 'px';
        localStorage.setItem(__PREVIEW_PANE_W_KEY, String(Math.floor(newW)));
      }

      __fitPreviewViewport();
    }

    function onUp() {
      splitter.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      try { splitter.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  if (!window.__PREVIEW_RESIZE_BOUND__) {
    window.__PREVIEW_RESIZE_BOUND__ = true;
    window.addEventListener('resize', function () {
      __applyPreviewPaneSize();
      __fitPreviewViewport();
    }, { passive: true });
  }
}


function __buildPreviewScript() {
  if (!EditorState.currentChapter) return null;
  // 用 JSON 深拷贝，省得你在预览里改到编辑器对象（你知道这会多离谱）
  const script = JSON.parse(JSON.stringify(EditorState.currentChapter));
  script.scenes = Array.isArray(script.scenes) ? script.scenes : [];
  const idx = EditorState.editingScene;
  if (idx == null || idx < 0 || idx >= script.scenes.length) return script;

  const scene = script.scenes[idx] || {};
  // 把正在编辑的内容塞进去
  if (Array.isArray(editingDialogs)) scene.dialogs = JSON.parse(JSON.stringify(editingDialogs));
  if (Array.isArray(editingSceneCharacters)) scene.characters = JSON.parse(JSON.stringify(editingSceneCharacters));

  // 背景/BGM 可能还没保存，优先读当前 UI 值
  const bgEl = document.getElementById('edit_background');
  if (bgEl && bgEl.value) scene.background = bgEl.value;
  const bgmEl = document.getElementById('edit_bgm');
  if (bgmEl) scene.bgm = bgmEl.value || null;
  const idEl = document.getElementById('edit_sceneId');
  if (idEl && idEl.value) scene.id = idEl.value;

  script.scenes[idx] = scene;
  return script;
}

function previewCurrentLine() {
  const frame = document.getElementById('editorPreviewFrame');
  if (!frame) return;
  if (!editingDialogs || editingDialogs.length === 0) {
    __updatePreviewStatus('暂无对话可预览');
    return;
  }

  const script = __buildPreviewScript();
  if (!script) {
    __updatePreviewStatus('没有可用章节数据');
    return;
  }

  const idx = Math.max(0, Math.min(editingDialogs.length - 1, (EditorPreview.currentIndex | 0)));
  EditorPreview.currentIndex = idx;
  __refreshPreviewScrub();

  const scene = script.scenes[EditorState.editingScene];
  const sceneId = scene?.id || (scene?.sceneId) || '';

  const payload = {
    type: 'editorPreview:preview',
    script,
    sceneId,
    dialogIndex: idx,
    options: {
      muted: !!EditorPreview.muted,
      applyEffects: true,
      applyItems: true
    }
  };

  if (!EditorPreview.ready) {
    EditorPreview.pendingPayload = payload;
    __updatePreviewStatus('预览加载中…');
    // 顺手发个 ping，提醒 iframe 赶紧醒
    __postPreviewMessage({ type: 'editorPreview:ping' });
    return;
  }

  __postPreviewMessage(payload);
  __updatePreviewStatus(`已预览：对话 ${idx + 1}`);
}

// 添加对话
function addDialogItem() {
  editingDialogs.push({
    speaker: '',
    text: '',
    character: '',
    position: '',
    animation: '',
    voice: null,
    se: null
  });
  renderDialogsList(editingDialogs);
}

// 更新对话
function updateDialog(index, field, value) {
  if (editingDialogs[index]) {
    editingDialogs[index][field] = value;
    
    // 这些字段会影响“继承立绘/舞台状态”的推导，改完就重渲染
    if (field === 'character' || field === 'speaker' || field === 'position') {
      renderDialogsList(editingDialogs);
    }
  }
}

// 删除对话
function deleteDialog(index) {
  if (confirm('确定删除这条对话吗？')) {
    editingDialogs.splice(index, 1);
    renderDialogsList(editingDialogs);
  }
}

// 移动对话
function moveDialog(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= editingDialogs.length) return;
  
  [editingDialogs[index], editingDialogs[newIndex]] = [editingDialogs[newIndex], editingDialogs[index]];
  renderDialogsList(editingDialogs);
}

// 显示资源导入对话框
function showImportDialog(type, dialogIndex) {
  const dialogHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center;" id="importDialog" onclick="if(event.target.id==='importDialog') closeImportDialog()">
      <div style="background: #252525; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;" onclick="event.stopPropagation()">
        <h3 style="margin-bottom: 20px;">${getImportTitle(type)}</h3>
        
        <div class="form-group">
          <label class="form-label">选择文件</label>
          <input type="file" id="importFile" class="form-input" accept="${getFileAccept(type)}">
        </div>
        
        <div class="form-group">
          <label class="form-label">资源名称</label>
          <input type="text" id="importName" class="form-input" placeholder="${getNamePlaceholder(type)}">
          <small style="color: #999; font-size: 12px;">${getNameHint(type)}</small>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn" onclick="confirmImport('${type}', ${dialogIndex})">确认导入</button>
          <button class="btn btn-secondary" onclick="closeImportDialog()">取消</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', dialogHTML);
}

function getImportTitle(type) {
  const titles = {
    'background': '导入背景图',
    'bgm': '导入背景音乐',
    'character': '导入角色立绘'
  };
  return titles[type] || '导入资源';
}

function getFileAccept(type) {
  if (type === 'bgm') return '.mp3';
  return '.png,.jpg,.jpeg';
}

function getNamePlaceholder(type) {
  const placeholders = {
    'background': '例如：school, rooftop',
    'bgm': '例如：daily, mystery',
    'character': '例如：hina_happy, sora_normal'
  };
  return placeholders[type] || '';
}

function getNameHint(type) {
  const hints = {
    'background': '资源ID会自动添加 bg_ 前缀；文件名不要加 bg_（例如 school.png 放到 images/backgrounds/）',
    'bgm': '会自动添加 bgm_ 前缀，保存到 audios/bgm/',
    'character': '资源ID会自动添加 char_ 前缀；文件名不要加 char_（例如 hina_happy.png 放到 images/characters/）'
  };
  return hints[type] || '';
}

function closeImportDialog() {
  const dialog = document.getElementById('importDialog');
  if (dialog) dialog.remove();
}

// 把导入的资源写进当前章节的 resources（否则游戏端可能预加载不到，出现“编辑器有图，游戏没图”）
function __editorAddImportedResource(type, resourceId, relativePath) {
  try {
    if (!EditorState.currentChapter) return;
    EditorState.currentChapter.resources = EditorState.currentChapter.resources || { images: [], audios: [] };
    const res = EditorState.currentChapter.resources;
    res.images = Array.isArray(res.images) ? res.images : [];
    res.audios = Array.isArray(res.audios) ? res.audios : [];

    if (type === 'bgm') {
      if (!res.audios.some(a => a && a.id === resourceId)) {
        res.audios.push({ id: resourceId, type: 'bgm', path: relativePath, volume: 0.5 });
      }

      // 同步到全局资源表（用于“删了章节文件/新建章节”也能继续选到已导入资源）
      try {
        EditorState.globalResources.audios = Array.isArray(EditorState.globalResources.audios) ? EditorState.globalResources.audios : [];
        if (!EditorState.globalResources.audios.some(a => a && a.id === resourceId)) {
          EditorState.globalResources.audios.push({ id: resourceId, type: 'bgm', path: relativePath, volume: 0.5 });
        }
        __saveGlobalResourcesToLocalStorage();
      } catch (e) {}

      return;
    }

    const imgType = (type === 'background') ? 'background' : ((type === 'character') ? 'character' : 'item');
    if (!res.images.some(img => img && img.id === resourceId)) {
      res.images.push({ id: resourceId, type: imgType, path: relativePath });
    }

    // 同步到全局资源表（让你“删了章节文件”也不会丢掉可选立绘/背景）
    try {
      __registerGlobalImageResource(resourceId, imgType, relativePath);
      __saveGlobalResourcesToLocalStorage();
    } catch (e) {}
  } catch (e) {
    console.warn('[Editor] add imported resource failed:', e);
  }
}


function confirmImport(type, dialogIndex) {
  const fileInput = document.getElementById('importFile');
  const nameInput = document.getElementById('importName');
  
  if (!fileInput.files || !fileInput.files[0]) {
    alert('请选择文件');
    return;
  }
  
  if (!nameInput.value.trim()) {
    alert('请输入资源名称');
    return;
  }
  
  const file = fileInput.files[0];
  const name = nameInput.value.trim();
  
  // 读取文件
  const reader = new FileReader();
  reader.onload = function(e) {
    const ext = file.name.split('.').pop();
    let prefix = '';
    let folder = '';
    let resourceId = '';
    let fileName = '';
    
    if (type === 'background') {
      prefix = 'bg_';
      folder = 'images/backgrounds/';
      resourceId = prefix + name;
      // 约定：背景文件名不带 bg_ 前缀
      fileName = name + '.' + ext;
    } else if (type === 'bgm') {
      prefix = 'bgm_';
      folder = 'audios/bgm/';
      resourceId = prefix + name;
      // 约定：BGM 文件名带 bgm_ 前缀
      fileName = resourceId + '.' + ext;
    } else if (type === 'character') {
      prefix = 'char_';
      folder = 'images/characters/';
      resourceId = prefix + name;
      // 约定：角色立绘文件名不带 char_ 前缀
      fileName = name + '.' + ext;
    }
    
    // 下载文件
    fetch(e.target.result)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        
        alert(`✅ 文件已下载: ${fileName}\n\n请将文件放入项目目录:\n${folder}${fileName}\n\n资源ID: ${resourceId}`);

        // 写入 resources，保证游戏端能预加载并显示
        __editorAddImportedResource(type, resourceId, folder + fileName);

        
        // 更新下拉列表
        if (type === 'background') {
          const select = document.getElementById('edit_background');
          if (select && !Array.from(select.options).some(opt => opt.value === resourceId)) {
            const option = document.createElement('option');
            option.value = resourceId;
            option.textContent = resourceId;
            option.selected = true;
            select.appendChild(option);
            previewBackground(resourceId);
          }
        } else if (type === 'bgm') {
          const select = document.getElementById('edit_bgm');
          if (select && !Array.from(select.options).some(opt => opt.value === resourceId)) {
            const option = document.createElement('option');
            option.value = resourceId;
            option.textContent = resourceId;
            option.selected = true;
            select.appendChild(option);
            previewBGM(resourceId);
          }
        } else if (type === 'character') {
          // 如果是从对话中导入，更新该对话的角色立绘
          if (dialogIndex !== undefined && dialogIndex !== null) {
            updateDialog(dialogIndex, 'character', resourceId);
            renderDialogsList(editingDialogs);
          }
        }
        
        closeImportDialog();
      });
  };
  reader.readAsDataURL(file);
}

// 收集所有可用的资源ID
function collectAvailableResources() {
  const resources = {
    backgrounds: [],
    bgms: [],
    characters: []
  };
  
  // 从所有章节中收集资源
  EditorState.chapters.forEach(chapter => {
    if (chapter.resources && chapter.resources.images) {
      chapter.resources.images.forEach(img => {
        if (img.type === 'background' && !resources.backgrounds.includes(img.id)) {
          resources.backgrounds.push(img.id);
        } else if (img.type === 'character' && !resources.characters.includes(img.id)) {
          resources.characters.push(img.id);
        }
      });
    }
    
    if (chapter.resources && chapter.resources.audios) {
      chapter.resources.audios.forEach(audio => {
        if ((audio.type === 'bgm' || audio.id.startsWith('bgm_')) && !resources.bgms.includes(audio.id)) {
          resources.bgms.push(audio.id);
        }
      });
    }
    
    // 从场景中提取使用过的资源
    if (chapter.scenes) {
      chapter.scenes.forEach(scene => {
        if (scene.background && !resources.backgrounds.includes(scene.background)) {
          resources.backgrounds.push(scene.background);
        }
        if (scene.bgm && !resources.bgms.includes(scene.bgm)) {
          resources.bgms.push(scene.bgm);
        }
        // 从对话中提取角色立绘
        if (scene.dialogs) {
          scene.dialogs.forEach(dialog => {
            if (dialog.character && !resources.characters.includes(dialog.character)) {
              resources.characters.push(dialog.character);
            }
          });
        }
      });
    }
  });
  

  // 从全局资源表收集（即使章节文件被删/新建空剧本，也能看到已有图片资源）
  try {
    const gImgs = (EditorState.globalResources && Array.isArray(EditorState.globalResources.images)) ? EditorState.globalResources.images : [];
    gImgs.forEach(img => {
      if (!img || !img.id) return;
      if (img.type === 'background' && !resources.backgrounds.includes(img.id)) {
        resources.backgrounds.push(img.id);
      } else if (img.type === 'character' && !resources.characters.includes(img.id)) {
        resources.characters.push(img.id);
      }
    });

    const gAudios = (EditorState.globalResources && Array.isArray(EditorState.globalResources.audios)) ? EditorState.globalResources.audios : [];
    gAudios.forEach(audio => {
      if (!audio || !audio.id) return;
      if ((audio.type === 'bgm' || (typeof audio.id === 'string' && audio.id.startsWith('bgm_'))) && !resources.bgms.includes(audio.id)) {
        resources.bgms.push(audio.id);
      }
    });
  } catch (e) {}

  // 排序
  resources.backgrounds.sort();
  resources.bgms.sort();
  resources.characters.sort();
  
  return resources;
}

// 预览背景
function previewBackground(bgId) {
  const preview = document.getElementById('bg_preview');
  if (!preview) return;
  
  if (!bgId) {
    preview.innerHTML = '未选择背景';
    preview.style.color = '#666';
    return;
  }
  
  // 尝试加载预览图
  const imagePath = getImagePathById(bgId) || `images/backgrounds/${bgId.replace('bg_', '')}.png`;
  const img = new Image();
  img.onload = function() {
    preview.innerHTML = `<img src="${imagePath}" style="max-width: 100%; max-height: 80px; border-radius: 4px;">`;
  };
  img.onerror = function() {
    preview.innerHTML = `<div style="padding: 20px; color: #4a8acc;">📷 ${bgId}</div>`;
  };
  img.src = imagePath;
}

// 预览BGM
function previewBGM(bgmId) {
  const preview = document.getElementById('bgm_preview');
  if (!preview) return;
  
  if (!bgmId) {
    preview.innerHTML = '未选择音乐';
    preview.style.color = '#666';
    return;
  }
  
  preview.innerHTML = `🎵 ${bgmId}`;
  preview.style.color = '#4a8acc';
}

function serializeDialogs(dialogs) {
  if (!dialogs || dialogs.length === 0) return '';
  
  return dialogs.map(d => {
    return `${d.speaker || ''}|${d.text}`;
  }).join('\n');
}

function serializeChoices(choices) {
  if (!choices || choices.length === 0) return '';
  
  return choices.map(c => {
    return `${c.text}>> ${c.nextSceneId}`;
  }).join('\n');
}

function parseDialogs(text) {
  if (!text.trim()) return [];
  
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const parts = line.split('|');
    return {
      speaker: parts[0]?.trim() || '',
      text: parts[1]?.trim() || parts[0]?.trim() || '',
      voice: null,
      se: null
    };
  });
}

function parseChoices(text) {
  if (!text.trim()) return null;
  
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return null;
  
  return lines.map(line => {
    const parts = line.split('>>').map(p => p.trim());
    return {
      text: parts[0] || '',
      nextSceneId: parts[1] || ''
    };
  });
}

function saveScene() {
  const index = EditorState.editingScene;
  const scene = EditorState.currentChapter.scenes[index];
  
  // 更新场景数据
  scene.id = document.getElementById('edit_sceneId').value;
  
  // 从隐藏字段获取背景和BGM
  const bgInput = document.getElementById('edit_background');
  const bgmInput = document.getElementById('edit_bgm');
  scene.background = bgInput ? bgInput.value : '';
  scene.bgm = bgmInput ? bgmInput.value : '';

  // 保存初始舞台（scene.characters）
  const rawChars = Array.isArray(editingSceneCharacters)
    ? editingSceneCharacters
    : __cloneSceneCharacters(scene.characters);
  scene.characters = rawChars
    .map(c => Object.assign({}, c || {}))
    .map(c => {
      c.id = (c.id == null) ? '' : String(c.id).trim();
      if (!c.id) return null;
      // position 允许空（走游戏默认），但编辑器里没写就给一个合理默认
      if (!c.position) c.position = __defaultPosForCharId(c.id);
      // opacity 归一
      if (c.opacity == null) c.opacity = 1;
      const n = parseFloat(c.opacity);
      c.opacity = isNaN(n) ? 1 : Math.max(0, Math.min(1, n));
      return c;
    })
    .filter(Boolean);
  if (!Array.isArray(scene.characters)) scene.characters = [];
  
  // 使用逐条编辑的对话数据：保留未知字段（stage/effects/itemShow/charAnim 等），避免一键把演出写没了。
  scene.dialogs = editingDialogs.map(dialog => {
    const out = Object.assign({}, dialog || {});
    out.speaker = (dialog && dialog.speaker) ? dialog.speaker : '';
    out.text = (dialog && dialog.text) ? dialog.text : '';

    // 这几项是编辑器 UI 允许直改的：空值就删除，表示“继承/不覆盖”
    if (!dialog || !dialog.character) delete out.character;
    else out.character = dialog.character;

    if (!dialog || !dialog.position) delete out.position;
    else out.position = dialog.position;

    if (!dialog || !dialog.animation) delete out.animation;
    else out.animation = dialog.animation;

    if (!dialog || !dialog.voice) delete out.voice;
    else out.voice = dialog.voice;

    if (!dialog || !dialog.se) delete out.se;
    else out.se = dialog.se;

    return out;
  });
  
  scene.choices = parseChoices(document.getElementById('edit_choices').value);
  scene.autoNext = document.getElementById('edit_autoNext').value || null;
  
  closeModal();
  renderSceneList();
  saveToLocalStorage();
  
  console.log('[Editor] Scene saved:', scene.id);
}

// 浏览器全屏（可选）：只是让工作区更大一点，免得你在小盒子里挤成沙丁鱼。
function toggleSceneEditorFullscreen() {
  try {
    const btn = document.getElementById('sceneFsBtn');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        if (btn) btn.textContent = '⤢ 退出全屏';
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        if (btn) btn.textContent = '⛶ 浏览器全屏';
      }).catch(() => {});
    }
  } catch (e) {
    // ignore
  }
}

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('sceneFsBtn');
  if (!btn) return;
  btn.textContent = document.fullscreenElement ? '⤢ 退出全屏' : '⛶ 浏览器全屏';
});

function closeModal() {
  document.getElementById('sceneModal').classList.remove('show');

  // 清理编辑态，避免下次打开时串数据
  editingSceneCharacters = null;
}

// 点击模态框外部关闭
document.addEventListener('click', (e) => {
  const modal = document.getElementById('sceneModal');
  if (e.target === modal) {
    closeModal();
  }
});

