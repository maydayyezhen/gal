/**
 * 剧本编辑器 - 核心逻辑
 */

// 全局状态
const EditorState = {
  currentChapter: null,
  currentChapterIndex: null,
  chapters: new Map(),
  // 基准章节：用于“查看改动”对比（加载项目章节/初次载入时保存一份不可变拷贝）
  baselineChapters: new Map(),
  editingScene: null,
  resources: {
    images: [],
    audios: []
  },
  // 全局资源：用于“没有章节文件/新建章节”时也能看到项目 assets（不依赖 chapters/resources）
  globalResources: {
    images: [], // {id, type, path}
    audios: []
  },
  // 资源ID -> path 的快速映射（优先用于预览）
  globalImagePathMap: new Map(),
  // 是否已做过一次“默认资源注入”
  globalResourcesReady: false
};

// 最近一次生成的改动报告（用于复制/下载）
let _lastDiffReport = null;

// 最近一次 QA-01 资源校验报告
let _lastAuditReport = null;

// 从已加载章节的 resources.images 里反查资源路径（用于预览，避免写死 .png 规则）
function getImagePathById(resourceId) {
  if (!resourceId) return null;

  // 先从各章节 resources 里找（最高优先级）
  for (const chapter of EditorState.chapters.values()) {
    const imgs = chapter && chapter.resources && chapter.resources.images ? chapter.resources.images : [];
    const hit = imgs.find(r => r.id === resourceId);
    if (hit && hit.path && hit.path !== 'placeholder' && hit.path !== 'generated') {
      return hit.path;
    }
  }

  // 再从全局资源表里找（删了章节文件/新建章节也能用）
  try {
    if (EditorState.globalImagePathMap && EditorState.globalImagePathMap.has(resourceId)) {
      return EditorState.globalImagePathMap.get(resourceId);
    }
  } catch (e) {}

  return null;
}


// ==================== 全局资源（自动注入/持久化） ====================

// 注册一个全局图片资源（用于下拉选择/预览，不依赖章节文件）
function __registerGlobalImageResource(id, type, path) {
  if (!id || !path) return;
  EditorState.globalResources.images = Array.isArray(EditorState.globalResources.images) ? EditorState.globalResources.images : [];
  if (!EditorState.globalResources.images.some(x => x && x.id === id)) {
    EditorState.globalResources.images.push({ id, type, path });
  }
  try {
    if (EditorState.globalImagePathMap) EditorState.globalImagePathMap.set(id, path);
  } catch (e) {}
}

// 注册一个全局音频资源（用于下拉选择/预览，不依赖章节文件）
function __registerGlobalAudioResource(id, type, path, volume) {
  if (!id) return;
  EditorState.globalResources.audios = Array.isArray(EditorState.globalResources.audios) ? EditorState.globalResources.audios : [];
  if (!EditorState.globalResources.audios.some(x => x && x.id === id)) {
    EditorState.globalResources.audios.push({
      id,
      type: type || 'bgm',
      // WebAudio 生成式 BGM 不依赖文件：path 可留 'generated' 作为语义占位
      path: path || 'generated',
      volume: (typeof volume === 'number') ? volume : 0.5
    });
  }
}


// 从 localStorage 读取全局资源（不会自动恢复章节，只恢复“资源表”）
function __loadGlobalResourcesFromLocalStorage() {
  try {
    const raw = localStorage.getItem('editor_global_resources');
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data && Array.isArray(data.images)) {
      data.images.forEach(img => {
        if (img && img.id && img.path) __registerGlobalImageResource(img.id, img.type || 'item', img.path);
      });
    }

    if (data && Array.isArray(data.audios)) {
      EditorState.globalResources.audios = Array.isArray(EditorState.globalResources.audios) ? EditorState.globalResources.audios : [];
      data.audios.forEach(a => {
        if (!a || !a.id || !a.path) return;
        if (!EditorState.globalResources.audios.some(x => x && x.id === a.id)) {
          EditorState.globalResources.audios.push({ id: a.id, type: a.type || 'bgm', path: a.path, volume: (a.volume ?? 0.5) });
        }
      });
    }
  } catch (e) {
    console.warn('[Editor] load global resources failed:', e);
  }
}

// 写回 localStorage（让“删了章节文件”后仍能看到已知资源）
function __saveGlobalResourcesToLocalStorage() {
  try {
    const payload = {
      images: (EditorState.globalResources.images || []).map(x => ({ id: x.id, type: x.type, path: x.path })),
      audios: (EditorState.globalResources.audios || []).map(a => ({ id: a.id, type: a.type, path: a.path, volume: (a.volume ?? 0.5) }))
    };
    localStorage.setItem('editor_global_resources', JSON.stringify(payload));
  } catch (e) {}
}

// 把章节中声明过的 resources 合并进全局资源表（不改变章节内容）
function __syncGlobalResourcesFromChapters() {
  try {
    EditorState.chapters.forEach(ch => {
      const imgs = ch?.resources?.images || [];
      imgs.forEach(img => {
        if (img?.id && img?.path) __registerGlobalImageResource(img.id, img.type || 'item', img.path);
      });

      const auds = ch?.resources?.audios || [];
      auds.forEach(a => {
        if (!a || !a.id) return;
        __registerGlobalAudioResource(a.id, a.type || 'bgm', a.path || 'generated', (a.volume ?? 0.5));
      });
    });
  } catch (e) {}
}

// 默认资源注入：即使章节文件被删，新建章节也能直接看到已有 assets（按约定路径映射）
function __injectDefaultImageResourcesOnce() {
  // 每次都先同步：章节资源 + localStorage 资源（不动章节内容）
  __loadGlobalResourcesFromLocalStorage();
  __syncGlobalResourcesFromChapters();

  // 保证结构存在
  EditorState.globalResources.images = Array.isArray(EditorState.globalResources.images) ? EditorState.globalResources.images : [];
  EditorState.globalResources.audios = Array.isArray(EditorState.globalResources.audios) ? EditorState.globalResources.audios : [];

  // ===== 默认图片资源（按约定路径） =====
  // 注意：浏览器不能遍历目录，所以这里只能注入“常见候选ID”。
  // 文件若不存在会显示占位，但你一旦导入/在章节里声明过，就会被持久化并优先使用。

  const defaultBackgrounds = [
    'title','school','school_morning','rooftop','park','bedroom','forest','battle','vending_machine',
    // 有些版本会用到（存在就能用，不存在就占位）
    'bedroom_morning'
  ];
  defaultBackgrounds.forEach(name => {
    __registerGlobalImageResource(`bg_${name}`, 'background', `images/backgrounds/${name}.png`);
  });

  const defaultCharacters = [
    // hina
    'hina_normal','hina_happy','hina_serious','hina_surprised','hina_angry','hina_embarrassed','hina_thinking',
    // sora
    'sora_normal','sora_smile','sora_serious','sora_surprised','sora_annoyed','sora_embarrassed','sora_sleepy',
    // princess
    'princess','princess_cast','princess_cry','princess_smile','princess_surprised',
    // monster
    'homework_slime'
  ];
  defaultCharacters.forEach(name => {
    __registerGlobalImageResource(`char_${name}`, 'character', `images/characters/${name}.png`);
  });

  // 道具/特效：统一当 item 资源（编辑器选择 & 预览用）
  const defaultItems = [
    // items
    ['item_broom','broom.png'],
    ['item_book','book.png'],
    ['item_phone','phone.png'],
    // 兼容两种 id（人类命名就这样）
    ['item_plastic_sword','plastic_sword.png'],
    ['item_sword','plastic_sword.png'],
    ['item_umbrella','umbrella.png'],

    // fx overlays
    ['fx_magic_circle','magic_circle.png'],
    ['fx_beam','beam.png'],
    ['fx_hit_spark','hit_spark.png'],
    ['fx_impact_ring','impact_ring.png'],
    ['fx_dream_bokeh','dream_bokeh.png'],
    ['fx_eye_glow','eye_glow.png'],
    ['fx_zzz','zzz.png'],
    ['fx_snowflake','snowflake_single.png'],
    ['fx_paper_sheet','paper_sheet.png'],
    ['fx_paper_stack','paper_stack.png']
  ];
  defaultItems.forEach(([id,file]) => {
    __registerGlobalImageResource(id, 'item', `images/others/${file}`);
  });

  // ===== 默认 BGM（WebAudio 生成式也能用） =====
  // audio-generator.js 内置的曲库（存在即能播，不依赖 mp3）。
  const defaultBGMs = [
    ['bgm_title', 0.45],
    ['bgm_daily', 0.40],
    ['bgm_dream_forest', 0.35],
    ['bgm_battle_comedy', 0.45],
    ['bgm_mystery', 0.30]
  ];
  defaultBGMs.forEach(([id,vol]) => {
    __registerGlobalAudioResource(id, 'bgm', 'generated', vol);
  });

  // 只要执行过一次就标记（但仍允许下次继续补齐缺口）
  EditorState.globalResourcesReady = true;
  __saveGlobalResourcesToLocalStorage();
}

// ==================== 初始化 ====================
window.addEventListener('DOMContentLoaded', () => {
  initEditor();
  setupEventListeners();
  loadExistingChapters();

  // 关键：即使删了章节文件/新建空剧本，也能自动看到项目里的背景/立绘资源（按约定路径映射）
  __injectDefaultImageResourcesOnce();
});

function initEditor() {
  console.log('[Editor] Initializing...');

  // 仅做状态探测：不再自动从 localStorage 恢复章节（避免“删了章文件却又冒出来旧章节”）
  let projectCount = 0;
  if (typeof chapterLoader !== 'undefined') {
    try {
      projectCount = chapterLoader.getAvailableChapters().length;
    } catch (e) {}
  }

  let hasLocalDrafts = false;
  try {
    hasLocalDrafts = !!localStorage.getItem('editor_chapters');
  } catch (e) {}

  if (projectCount > 0) {
    console.log(`[Editor] Project chapters detected: ${projectCount}`);
  } else if (hasLocalDrafts) {
    console.log('[Editor] No project chapters. Local drafts exist (manual restore available).');
  } else {
    console.log('[Editor] No project chapters. No local drafts.');
  }
}

function setupEventListeners() {
  // 模态框外部点击关闭
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('sceneModal');
    if (e.target === modal) {
      closeModal();
    }

    const diffModal = document.getElementById('diffModal');
    if (e.target === diffModal) {
      closeDiffModal();
    }
  });
}

function loadExistingChapters() {
  const statusEl = document.getElementById('loadStatus');
  const restoreBtn = document.getElementById('restoreDraftBtn');
  const clearBtn = document.getElementById('clearDraftBtn');

  const hideDraftBtns = () => {
    if (restoreBtn) restoreBtn.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
  };
  const showDraftBtns = () => {
    if (restoreBtn) restoreBtn.style.display = '';
    if (clearBtn) clearBtn.style.display = '';
  };

  // 每次加载都以“项目章节”为准：没有项目章节时，默认保持清爽（不自动恢复本地草稿）
  EditorState.chapters.clear();
  EditorState.baselineChapters.clear();
  EditorState.currentChapter = null;
  EditorState.currentChapterIndex = null;

  // 优先从项目中加载章节
  if (typeof chapterLoader !== 'undefined') {
    const availableChapters = chapterLoader.getAvailableChapters();
    console.log('[Editor] Found existing chapters:', availableChapters);

    if (availableChapters.length > 0) {
      hideDraftBtns();

      availableChapters.forEach(num => {
        const chapter = chapterLoader.getChapter(num);
        if (chapter) {
          EditorState.baselineChapters.set(num, JSON.parse(JSON.stringify(chapter)));
          const chapterCopy = JSON.parse(JSON.stringify(chapter));
          EditorState.chapters.set(num, chapterCopy);
          console.log(`[Editor] Loaded chapter ${num}:`, chapterCopy.meta?.title || 'Untitled');
        }
      });

      if (statusEl) statusEl.textContent = `已加载项目章节：${availableChapters.length}章`;

      // 自动选中第一个章节
      setTimeout(() => {
        selectChapter(availableChapters[0]);
      }, 100);

      renderChapterList();
      return;
    }
  }

  // 没有项目章节：默认不加载本地草稿（让界面“清爽”）
  let saved = null;
  try {
    saved = localStorage.getItem('editor_chapters');
  } catch (e) {}

  if (saved) {
    showDraftBtns();
    if (statusEl) statusEl.textContent = '未检测到章节文件（本地有草稿，可手动恢复）';
  } else {
    hideDraftBtns();
    if (statusEl) statusEl.textContent = '未检测到章节文件';
  }

  renderChapterList();
}


// ==================== 本地草稿（手动恢复） ====================
function restoreLocalDrafts() {
  const statusEl = document.getElementById('loadStatus');
  let saved = null;
  try { saved = localStorage.getItem('editor_chapters'); } catch (e) {}
  if (!saved) {
    alert('没有找到本地草稿。');
    return;
  }

  try {
    const data = JSON.parse(saved);
    EditorState.chapters.clear();
    EditorState.baselineChapters.clear();

    data.forEach((chapter, index) => {
      const num = index + 1;
      EditorState.chapters.set(num, chapter);
      if (!EditorState.baselineChapters.has(num)) {
        EditorState.baselineChapters.set(num, JSON.parse(JSON.stringify(chapter)));
      }
    });

    if (statusEl) statusEl.textContent = `已恢复本地草稿：${EditorState.chapters.size}章`;

    renderChapterList();
    const first = Array.from(EditorState.chapters.keys()).sort((a,b)=>a-b)[0];
    if (first) setTimeout(() => selectChapter(first), 100);
  } catch (e) {
    console.error('[Editor] Failed to restore local drafts:', e);
    alert('恢复本地草稿失败：数据格式不正确。');
  }
}

function clearLocalDrafts() {
  if (!confirm('确定要清空本地草稿吗？\n\n这会删除浏览器 localStorage 里的 editor_chapters，无法恢复。')) {
    return;
  }

  try {
    localStorage.removeItem('editor_chapters');
  } catch (e) {}

  EditorState.chapters.clear();
  EditorState.baselineChapters.clear();
  EditorState.currentChapter = null;
  EditorState.currentChapterIndex = null;

  const statusEl = document.getElementById('loadStatus');
  const restoreBtn = document.getElementById('restoreDraftBtn');
  const clearBtn = document.getElementById('clearDraftBtn');
  if (restoreBtn) restoreBtn.style.display = 'none';
  if (clearBtn) clearBtn.style.display = 'none';
  if (statusEl) statusEl.textContent = '本地草稿已清空';

  renderChapterList();
}

// ==================== 章节管理 ====================
function renderChapterList() {
  const list = document.getElementById('chapterList');
  const statusEl = document.getElementById('loadStatus');
  
  list.innerHTML = '';
  
  if (EditorState.chapters.size === 0) {
    list.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">暂无章节<br><small>点击"新建章节"开始</small></div>';
    if (statusEl) statusEl.textContent = '未加载章节';
    return;
  }
  
  // 更新状态提示
  if (statusEl) {
    const hasProjectChapters = typeof chapterLoader !== 'undefined' && 
                                chapterLoader.getAvailableChapters().length > 0;
    statusEl.textContent = hasProjectChapters 
      ? `已加载 ${EditorState.chapters.size} 个项目章节` 
      : `${EditorState.chapters.size} 个章节（本地创建）`;
    statusEl.style.color = hasProjectChapters ? '#4a8acc' : '#999';
  }
  
  EditorState.chapters.forEach((chapter, num) => {
    const item = document.createElement('div');
    item.className = 'chapter-item';
    if (EditorState.currentChapterIndex === num) {
      item.classList.add('active');
    }
    
    const title = chapter.meta?.title || `第${num}章`;
    const sceneCount = chapter.scenes?.length || 0;
    
    item.innerHTML = `
      <div class="chapter-title">第${num}章: ${title}</div>
      <div class="chapter-meta">${sceneCount} 个场景</div>
    `;
    
    item.onclick = () => selectChapter(num);
    list.appendChild(item);
  });
}

function selectChapter(chapterNum) {
  EditorState.currentChapterIndex = chapterNum;
  EditorState.currentChapter = EditorState.chapters.get(chapterNum);
  
  if (!EditorState.currentChapter) {
    console.error('[Editor] Chapter not found:', chapterNum);
    return;
  }
  
  document.getElementById('currentChapterTitle').textContent = 
    `第${chapterNum}章: ${EditorState.currentChapter.meta?.title || '未命名'}`;
  
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('sceneEditor').style.display = 'block';
  
  renderChapterList();
  renderSceneList();
  loadChapterSettings();
}

function createNewChapter() {
  // 确保资源下拉不为空（删了章节文件后新建也能直接选背景/立绘）
  __injectDefaultImageResourcesOnce();

  const nextNum = Math.max(0, ...EditorState.chapters.keys()) + 1;
  
  const newChapter = {
    meta: {
      chapterNumber: nextNum,
      title: `未命名章节`,
      gameTitle: `winter_whispers_game`,
      version: `1.0.0`,
      author: "夜真",
      speakerMap: {}
    },
    resources: {
      images: [],
      audios: []
    },
    scenes: []
  };
  
  EditorState.chapters.set(nextNum, newChapter);
  renderChapterList();
  selectChapter(nextNum);
  
  console.log('[Editor] Created chapter', nextNum);
}

function deleteChapter(chapterNum) {
  if (!confirm(`确定要删除第${chapterNum}章吗？此操作不可恢复！`)) {
    return;
  }
  
  EditorState.chapters.delete(chapterNum);
  
  if (EditorState.currentChapterIndex === chapterNum) {
    EditorState.currentChapterIndex = null;
    EditorState.currentChapter = null;
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('sceneEditor').style.display = 'none';
  }
  
  renderChapterList();
  saveToLocalStorage();
}

// ==================== 场景管理 ====================
function renderSceneList() {
  const list = document.getElementById('sceneList');
  list.innerHTML = '';
  
  if (!EditorState.currentChapter || !EditorState.currentChapter.scenes || 
      EditorState.currentChapter.scenes.length === 0) {
    list.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">暂无场景<br><small>点击上方"添加新场景"开始</small></div>';
    return;
  }
  
  EditorState.currentChapter.scenes.forEach((scene, index) => {
    const card = createSceneCard(scene, index);
    list.appendChild(card);
  });
}

function createSceneCard(scene, index) {
  const card = document.createElement('div');
  card.className = 'scene-card';
  
  const dialogCount = scene.dialogs?.length || 0;
  const hasChoice = scene.choices && scene.choices.length > 0;
  
  card.innerHTML = `
    <div class="scene-header">
      <div class="scene-id">场景 ${index + 1}: ${scene.id}</div>
      <div class="scene-actions">
        <button class="btn-small" onclick="playtestScene('${scene.id}')" title="打开 game.html 并从该场景第1句开始">▶ Playtest</button>
        <button class="btn-small" onclick="editScene(${index})">✏️ 编辑</button>
        <button class="btn-small" onclick="moveScene(${index}, -1)">↑</button>
        <button class="btn-small" onclick="moveScene(${index}, 1)">↓</button>
        <button class="btn-small" onclick="deleteScene(${index})">🗑️</button>
      </div>
    </div>
    <div style="margin-bottom: 10px; color: #999; font-size: 13px;">
      背景: ${scene.background || '无'} | BGM: ${scene.bgm || '无'} | 对话数: ${dialogCount}
      ${hasChoice ? ' | <span style="color: #4a8acc;">有选择分支</span>' : ''}
    </div>
    <div class="dialog-list">
      ${renderDialogPreview(scene.dialogs)}
    </div>
  `;
  
  return card;
}

function renderDialogPreview(dialogs) {
  if (!dialogs || dialogs.length === 0) {
    return '<div style="color: #666; font-size: 13px;">暂无对话</div>';
  }
  
  // 只显示前3条对话
  const preview = dialogs.slice(0, 3);
  const html = preview.map(dialog => `
    <div class="dialog-item">
      ${dialog.speaker ? `<div class="dialog-speaker">${dialog.speaker}</div>` : ''}
      <div class="dialog-text">${dialog.text}</div>
    </div>
  `).join('');
  
  if (dialogs.length > 3) {
    return html + `<div style="color: #666; font-size: 12px; margin-top: 5px;">... 还有 ${dialogs.length - 3} 条对话</div>`;
  }
  
  return html;
}

function addNewScene() {
  if (!EditorState.currentChapter) {
    alert('请先选择一个章节');
    return;
  }
  
  const sceneNum = EditorState.currentChapter.scenes.length + 1;
  const chapterNum = EditorState.currentChapterIndex;
  
  const newScene = {
    id: `scene_ch${chapterNum}_scene${sceneNum}`,
    background: "",
    bgm: "",
    particles: null,
    characters: [],
    dialogs: [],
    choices: null,
    autoNext: null
  };
  
  EditorState.currentChapter.scenes.push(newScene);
  renderSceneList();
  saveToLocalStorage();
  
  // 自动打开编辑
  editScene(EditorState.currentChapter.scenes.length - 1);
}

function editScene(index) {
  EditorState.editingScene = index;
  const scene = EditorState.currentChapter.scenes[index];
  
  openSceneEditModal(scene);
}

function deleteScene(index) {
  if (!confirm('确定要删除这个场景吗？')) {
    return;
  }
  
  EditorState.currentChapter.scenes.splice(index, 1);
  renderSceneList();
  saveToLocalStorage();
}

function moveScene(index, direction) {
  const scenes = EditorState.currentChapter.scenes;
  const newIndex = index + direction;
  
  if (newIndex < 0 || newIndex >= scenes.length) {
    return;
  }
  
  [scenes[index], scenes[newIndex]] = [scenes[newIndex], scenes[index]];
  renderSceneList();
  saveToLocalStorage();
}

// 当前步骤
let currentStep = 1;
const totalSteps = 5;

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

// ===== P-01：编辑器内预览框（iframe）状态 =====
const EditorPreview = {
  ready: false,
  live: true,
  muted: true,
  currentIndex: 0,
  pendingPayload: null,
  _debounceTimer: null
};

// 只绑定一次 message 监听（用于接收 preview.html 的 ready/error）
if (!window.__EDITOR_PREVIEW_MSG_BOUND__) {
  window.__EDITOR_PREVIEW_MSG_BOUND__ = true;
  window.addEventListener('message', function (ev) {
    const msg = ev && ev.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'editorPreview:ready') {
      EditorPreview.ready = true;
      __updatePreviewStatus('已连接 ✅');
      if (EditorPreview.pendingPayload) {
        __postPreviewMessage(EditorPreview.pendingPayload);
        EditorPreview.pendingPayload = null;
      }
      return;
    }
    if (msg.type === 'editorPreview:error') {
      __updatePreviewStatus('预览报错：' + (msg.message || '未知错误'));
      return;
    }
  });
}

// ===== D-01：对白特效（dialog.effects）可视化编辑 =====
// 这里的字段对齐 game_project/js/effects.js + sceneManager.js 里对白行的触发逻辑
const EFFECT_UI_ORDER = [
  'shake', 'flash', 'particles',
  'dialogShake', 'textShake',
  'spell', 'beam', 'hit', 'paperVanish', 'puff',
  'eyeClose', 'sleep', 'wake', 'eyeOpen'
];

const EFFECT_UI = {
  shake: {
    label: '屏幕震动',
    kind: 'object',
    defaults: { intensity: 10, duration: 500 },
    fields: [
      { key: 'intensity', label: '强度', type: 'number', step: 1, min: 0 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  flash: {
    label: '闪光',
    kind: 'object',
    defaults: { color: '#ffffff', duration: 300 },
    fields: [
      { key: 'color', label: '颜色', type: 'colorText' },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  particles: {
    label: '粒子爆发',
    kind: 'object',
    defaults: { type: 'sparkle', count: 30, duration: 3000 },
    fields: [
      { key: 'type', label: '类型', type: 'select', options: ['sparkle', 'snow', 'petals', 'magic'] },
      { key: 'count', label: '数量', type: 'number', step: 1, min: 0 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 50, min: 0 }
    ]
  },
  dialogShake: {
    label: '对话框抖动',
    kind: 'boolean'
  },
  textShake: {
    label: '文字抖动',
    kind: 'boolean'
  },
  spell: {
    label: '施法(魔法环/火花)',
    kind: 'object',
    defaults: { caster: 'princess', color: '#d080ff', duration: 650, size: 160, delay: 0 },
    fields: [
      { key: 'caster', label: '施法者Key', type: 'text', placeholder: 'princess' },
      { key: 'color', label: '颜色', type: 'colorText' },
      { key: 'size', label: '尺寸', type: 'number', step: 1, min: 0 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'delay', label: '延迟(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  beam: {
    label: '光束(连线)',
    kind: 'object',
    defaults: { from: 'princess', to: 'homework_slime', color: '#d080ff', duration: 360, width: 8, delay: 0 },
    fields: [
      { key: 'from', label: 'From Key', type: 'text', placeholder: 'princess' },
      { key: 'to', label: 'To Key', type: 'text', placeholder: 'homework_slime' },
      { key: 'color', label: '颜色', type: 'colorText' },
      { key: 'width', label: '宽度', type: 'number', step: 1, min: 1 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'delay', label: '延迟(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  hit: {
    label: '受击(冲击环)',
    kind: 'object',
    defaults: { target: 'homework_slime', color: '#70d0ff', duration: 420, size: 120, delay: 0 },
    fields: [
      { key: 'target', label: '目标Key', type: 'text', placeholder: 'homework_slime' },
      { key: 'color', label: '颜色', type: 'colorText' },
      { key: 'size', label: '尺寸', type: 'number', step: 1, min: 0 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'delay', label: '延迟(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  paperVanish: {
    label: '纸张消散(作业怪)',
    kind: 'object',
    defaults: { target: 'homework_slime', variant: 'stack', duration: 420, size: 180, delay: 0 },
    fields: [
      { key: 'target', label: '目标Key', type: 'text', placeholder: 'homework_slime' },
      { key: 'variant', label: '形态', type: 'select', options: ['stack', 'sheet'] },
      { key: 'size', label: '尺寸', type: 'number', step: 1, min: 0 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'delay', label: '延迟(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  puff: {
    label: '粉雾(烟雾)',
    kind: 'object',
    defaults: { target: 'homework_slime', color: '#ffb0d0', duration: 520, count: 8 },
    fields: [
      { key: 'target', label: '目标Key', type: 'text', placeholder: 'homework_slime' },
      { key: 'color', label: '颜色', type: 'colorText' },
      { key: 'count', label: '粒子数', type: 'number', step: 1, min: 0 },
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 }
    ]
  },
  eyeClose: {
    label: '闭眼/黑场',
    kind: 'object',
    defaults: { duration: 520, hold: 0, persist: false, blur: 0 },
    fields: [
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'hold', label: '停留(ms)', type: 'number', step: 10, min: 0 },
      { key: 'blur', label: '模糊', type: 'number', step: 0.1, min: 0 },
      { key: 'persist', label: '保持(不自动恢复)', type: 'checkbox' }
    ]
  },
  sleep: {
    label: '入睡(暗场+Z)',
    kind: 'object',
    defaults: { duration: 900, hold: 0, fadeIn: 260, fadeOut: 360, strength: 0.55, zCount: 7, zColor: 'rgba(255,255,255,0.22)', delay: 0 },
    fields: [
      { key: 'duration', label: '总时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'delay', label: '延迟(ms)', type: 'number', step: 10, min: 0 },
      { key: 'strength', label: '暗场强度', type: 'number', step: 0.05, min: 0, max: 1 },
      { key: 'zCount', label: 'Z数量', type: 'number', step: 1, min: 0 },
      { key: 'hold', label: '停留(ms)', type: 'number', step: 10, min: 0 },
      { key: 'fadeIn', label: '淡入(ms)', type: 'number', step: 10, min: 0 },
      { key: 'fadeOut', label: '淡出(ms)', type: 'number', step: 10, min: 0 },
      { key: 'zColor', label: 'Z颜色', type: 'text', placeholder: 'rgba(...)' }
    ]
  },
  wake: {
    label: '醒来(光点/恢复)',
    kind: 'object',
    defaults: { duration: 780, color: 'rgba(240,198,116,0.22)', delay: 0 },
    fields: [
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'delay', label: '延迟(ms)', type: 'number', step: 10, min: 0 },
      { key: 'color', label: '颜色', type: 'text', placeholder: 'rgba(...)' }
    ]
  },
  eyeOpen: {
    label: '睁眼(聚焦)',
    kind: 'object',
    defaults: { duration: 520, blur: 1.2, hold: 0 },
    fields: [
      { key: 'duration', label: '时长(ms)', type: 'number', step: 10, min: 0 },
      { key: 'blur', label: '模糊', type: 'number', step: 0.1, min: 0 },
      { key: 'hold', label: '停留(ms)', type: 'number', step: 10, min: 0 }
    ]
  }
};




// ===== D-04：对白角色动作（dialog.charAnim）可视化编辑 =====
// 对齐 game_project/js/characterAnimations.js 支持的动作类型
const CHAR_ANIM_TYPES = [
  { value: 'nod',       label: '点头 nod' },
  { value: 'sway',      label: '轻摆 sway' },
  { value: 'bounce',    label: '弹一下 bounce' },
  { value: 'jump',      label: '跳一下 jump' },
  { value: 'shake',     label: '抖动 shake' },
  { value: 'heartbeat', label: '心跳 heartbeat' },
  { value: 'hurt',      label: '受击 hurt' },
  { value: 'appear',    label: '出现 appear' },
  { value: 'idle',      label: '待机 idle（循环）' }
];

// 场景初始舞台（scene.characters）编辑中的数据（避免直接污染原剧本，保存时再写回）
let editingSceneCharacters = null;

function __cloneSceneCharacters(chars) {
  const arr = Array.isArray(chars) ? chars : [];
  return arr.map(c => Object.assign({}, c || {}));
}

function __defaultPosForCharId(id) {
  const s = (id == null) ? '' : String(id);
  if (s.indexOf('hina') >= 0) return 'left';
  if (s.indexOf('sora') >= 0) return 'right';
  if (s.indexOf('princess') >= 0) return 'center';
  if (s.indexOf('homework_slime') >= 0 || s.indexOf('slime') >= 0) return 'center';
  return 'center';
}

function renderInitStageEditor() {
  const wrap = document.getElementById('initStageRows');
  if (!wrap) return;

  const availableResources = collectAvailableResources();
  const chars = Array.isArray(editingSceneCharacters) ? editingSceneCharacters : [];

  if (chars.length === 0) {
    wrap.innerHTML = `<div style="color:#666; font-size:13px; padding:12px;">暂无初始角色。你也可以只在对话里用舞台指令/立绘字段来控制人物出场。</div>`;
    return;
  }

  wrap.innerHTML = chars.map((c, idx) => {
    const id = (c && c.id) ? String(c.id) : '';
    const pos = (c && c.position) ? String(c.position) : '';
    const opacity = (c && c.opacity != null) ? c.opacity : 1;
    const imgPath = id ? (getImagePathById(id) || `images/characters/${id.replace('char_', '')}.png`) : '';

    return `
      <div class="init-stage-row">
        <div class="init-stage-preview">
          ${id ? `
            <img src="${imgPath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display:none; color:#4a8acc; font-size:28px;">👤</div>
          ` : `
            <div style="color:#666; font-size:12px; text-align:center; padding:6px;">未选立绘</div>
          `}
        </div>

        <div class="init-stage-fields">
          <div style="flex: 1; min-width: 220px;">
            <div style="font-size:12px; color:#bbb; margin-bottom:6px;">角色立绘ID</div>
            <select class="form-select" style="padding:8px;" onchange="updateInitStageRow(${idx}, 'id', this.value)">
              <option value="">（请选择）</option>
              ${availableResources.characters.map(cid => `<option value="${cid}" ${cid === id ? 'selected' : ''}>${cid}</option>`).join('')}
            </select>
          </div>

          <div style="width: 140px; min-width: 140px;">
            <div style="font-size:12px; color:#bbb; margin-bottom:6px;">位置</div>
            <select class="form-select" style="padding:8px;" onchange="updateInitStageRow(${idx}, 'position', this.value)">
              <option value="">默认</option>
              <option value="left" ${pos === 'left' ? 'selected' : ''}>左侧</option>
              <option value="center" ${pos === 'center' ? 'selected' : ''}>中间</option>
              <option value="right" ${pos === 'right' ? 'selected' : ''}>右侧</option>
            </select>
          </div>

          <div style="width: 160px; min-width: 160px;">
            <div style="font-size:12px; color:#bbb; margin-bottom:6px;">透明度</div>
            <input class="form-input" style="padding:8px;" type="number" min="0" max="1" step="0.05" value="${opacity}" onchange="updateInitStageRow(${idx}, 'opacity', this.value)">
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="btn-small" onclick="removeInitStageRow(${idx})">移除</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

}

function addInitStageRow() {
  if (!Array.isArray(editingSceneCharacters)) editingSceneCharacters = [];
  editingSceneCharacters.push({ id: '', position: 'center', opacity: 1 });
  renderInitStageEditor();
  // 初始舞台变了，舞台推导也要刷新
  renderDialogsList(editingDialogs);
}

function clearInitStage() {
  editingSceneCharacters = [];
  renderInitStageEditor();
  renderDialogsList(editingDialogs);
}

function removeInitStageRow(idx) {
  if (!Array.isArray(editingSceneCharacters)) return;
  editingSceneCharacters.splice(idx, 1);
  renderInitStageEditor();
  renderDialogsList(editingDialogs);
}

function updateInitStageRow(idx, field, value) {
  if (!Array.isArray(editingSceneCharacters)) return;
  const row = editingSceneCharacters[idx];
  if (!row) return;

  if (field === 'opacity') {
    const n = parseFloat(value);
    row.opacity = isNaN(n) ? 1 : Math.max(0, Math.min(1, n));
  } else if (field === 'id') {
    row.id = (value == null) ? '' : String(value);
    // 没写 position 时给个合理默认，避免用户点一次就出现一堆奇怪站位
    if (!row.position) row.position = __defaultPosForCharId(row.id);
  } else {
    row[field] = (value == null) ? '' : String(value);
  }

  renderInitStageEditor();
  renderDialogsList(editingDialogs);
}

// 渲染对话列表
function renderDialogsList(dialogs) {
  editingDialogs = dialogs || [];
  const container = document.getElementById('dialogsList');
  if (!container) return;
  
  const availableResources = collectAvailableResources();

  // ===== D-03：道具 itemShow / itemGet 可视化编辑（对白行演出） =====
  // 只展示 item_ 前缀，避免把 fx_* 混进来（特效另外有面板）。
  const availableItemIds = (() => {
    const set = new Set();
    const push = (id) => {
      if (id == null) return;
      const s = String(id).trim();
      if (!s) return;
      if (s.startsWith('item_')) set.add(s);
    };

    // 兜底：即使用户没导入资源，至少给常用道具候选
    ['item_broom','item_book','item_phone','item_sword','item_plastic_sword','item_umbrella'].forEach(push);

    try {
      (EditorState.chapters || []).forEach(ch => {
        const imgs = (ch && ch.resources && Array.isArray(ch.resources.images)) ? ch.resources.images : [];
        imgs.forEach(img => {
          if (!img || !img.id) return;
          if (img.type === 'item' || String(img.id).startsWith('item_')) push(img.id);
        });

        const scenes = Array.isArray(ch && ch.scenes) ? ch.scenes : [];
        scenes.forEach(sc => {
          const ds = Array.isArray(sc && sc.dialogs) ? sc.dialogs : [];
          ds.forEach(d => {
            if (!d) return;
            const is = d.itemShow;
            if (typeof is === 'string') push(is);
            else if (is && typeof is === 'object' && is.itemId) push(is.itemId);

            const ig = d.itemGet;
            if (typeof ig === 'string') push(ig);
            else if (ig && typeof ig === 'object' && ig.itemId) push(ig.itemId);
          });
        });
      });

      const gImgs = (EditorState.globalResources && Array.isArray(EditorState.globalResources.images)) ? EditorState.globalResources.images : [];
      gImgs.forEach(img => {
        if (!img || !img.id) return;
        if (img.type === 'item' || String(img.id).startsWith('item_')) push(img.id);
      });
    } catch (e) {}

    return Array.from(set).sort();
  })();

  function __guessItemPath(itemId) {
    const id = String(itemId || '').trim();
    if (!id) return '';
    const map = {
      item_broom: 'broom.png',
      item_book: 'book.png',
      item_phone: 'phone.png',
      item_sword: 'plastic_sword.png',
      item_plastic_sword: 'plastic_sword.png',
      item_umbrella: 'umbrella.png'
    };
    const file = map[id] || (id.startsWith('item_') ? (id.replace('item_', '') + '.png') : '');
    return file ? `images/others/${file}` : '';
  }

  // ===== 关键：编辑器里“未选择立绘”并不等于游戏里“没角色” =====
  // 游戏里角色可能来自 scene.characters（场景初始舞台）以及 dialog.stage（swap/show/hide）。
  // 这里做一份轻量舞台模拟，让编辑器展示与游戏一致的“继承立绘”。
  const scene = (EditorState.currentChapter && EditorState.currentChapter.scenes)
    ? EditorState.currentChapter.scenes[EditorState.editingScene]
    : null;
  const speakerMap = (EditorState.currentChapter && EditorState.currentChapter.meta && EditorState.currentChapter.meta.speakerMap)
    ? EditorState.currentChapter.meta.speakerMap
    : {};

  function keyFromCharId(id) {
    if (!id) return '';
    const s = String(id);
    if (s.indexOf('hina') >= 0) return 'hina';
    if (s.indexOf('sora') >= 0) return 'sora';
    if (s.indexOf('princess') >= 0) return 'princess';
    if (s.indexOf('homework_slime') >= 0) return 'homework_slime';
    if (s.indexOf('slime') >= 0) return 'homework_slime';
    return '';
  }

  function speakerKey(speaker) {
    const sp = (speaker == null) ? '' : String(speaker).trim();
    if (!sp) return '';

    // 1) 显式映射优先（建议在章节 meta.speakerMap 里配置：{"夜":"sora","阳菜":"hina"...}
    if (speakerMap && speakerMap[sp]) return speakerMap[sp];

    // 2) 常见中文称呼兜底：不配置 speakerMap 也能尽量对上舞台 key
    //    你的项目里：夜=男主(sora)，阳菜/雏奈=hina，公主=princess，作业怪/史莱姆=homework_slime
    if (/夜|男主|Sora/i.test(sp)) return 'sora';
    if (/阳菜|雏奈|Hina/i.test(sp)) return 'hina';
    if (/公主|Princess/i.test(sp)) return 'princess';
    if (/史莱姆|作业|Slime/i.test(sp)) return 'homework_slime';

    // 3) fallback
    return sp.toLowerCase();
  }

  function defaultPos(key) {
    if (key === 'hina') return 'left';
    if (key === 'sora') return 'right';
    if (key === 'princess') return 'center';
    if (key === 'homework_slime') return 'center';
    return '';
  }

  function cloneStage(st) {
    const out = {};
    Object.keys(st || {}).forEach(k => {
      out[k] = Object.assign({}, st[k]);
    });
    return out;
  }

  function stageTouchesKey(stage, key, id) {
    if (!stage || !key) return false;
    const has = (arr, pred) => {
      if (!arr || !arr.length) return false;
      for (let i = 0; i < arr.length; i++) if (pred(arr[i])) return true;
      return false;
    };

    if (has(stage.hideChars, h => {
      if (typeof h === 'string') return String(h).indexOf(key) >= 0;
      if (h && h.charId) return String(h.charId).indexOf(key) >= 0;
      return false;
    })) return true;

    if (has(stage.showChars, s => s && s.id && (s.id === id || String(s.id).indexOf(key) >= 0))) return true;
    if (has(stage.swapChars, s => s && ((s.match && String(s.match).indexOf(key) >= 0) || (s.id && String(s.id).indexOf(key) >= 0)))) return true;
    if (has(stage.moveChars, m => m && m.match && String(m.match).indexOf(key) >= 0)) return true;
    return false;
  }

  function applyStageToState(state, stage) {
    if (!stage || !state) return;

    // hide
    if (Array.isArray(stage.hideChars)) {
      stage.hideChars.forEach(h => {
        const raw = (typeof h === 'string') ? h : (h && h.charId ? h.charId : '');
        const k = keyFromCharId(raw) || String(raw);
        if (k && state[k]) delete state[k];
      });
    }

    // show
    if (Array.isArray(stage.showChars)) {
      stage.showChars.forEach(s => {
        if (!s || !s.id) return;
        const k = keyFromCharId(s.id) || '';
        if (!k) return;
        state[k] = Object.assign({}, state[k] || {}, {
          id: s.id,
          position: s.position || (state[k] && state[k].position) || defaultPos(k) || 'center',
          opacity: (s.opacity != null) ? s.opacity : ((state[k] && state[k].opacity) != null ? state[k].opacity : 1)
        });
      });
    }

    // swap
    if (Array.isArray(stage.swapChars)) {
      stage.swapChars.forEach(sw => {
        if (!sw || !sw.id) return;
        const mk = sw.match ? String(sw.match) : '';
        const k = mk || keyFromCharId(sw.id);
        if (!k) return;
        state[k] = Object.assign({}, state[k] || {}, { id: sw.id });
      });
    }

    // move 只改位置/镜头，不改立绘 id，这里忽略（但保留 key 以便“舞台有谁”）
  }

  function buildStageSnapshots(sceneObj, dialogsArr) {
    const base = {};
    const chars = sceneObj && Array.isArray(sceneObj.characters) ? sceneObj.characters : [];
    chars.forEach(ch => {
      if (!ch || !ch.id) return;
      const k = keyFromCharId(ch.id);
      if (!k) return;
      base[k] = {
        id: ch.id,
        position: ch.position || defaultPos(k) || '',
        opacity: (ch.opacity != null) ? ch.opacity : 1
      };
    });

    let st = cloneStage(base);
    const snaps = [];
    (dialogsArr || []).forEach(d => {
      applyStageToState(st, d && d.stage);

      // 对白级 character：模拟 sceneManager.applyDialogCharacter 的“自动替换”，但不覆盖 stage 指令
      if (d && d.character) {
        const id = d.character;
        const k = keyFromCharId(id) || speakerKey(d.speaker);
        if (k && !stageTouchesKey(d.stage, k, id)) {
          st[k] = Object.assign({}, st[k] || {}, {
            id: id,
            position: d.position || (st[k] && st[k].position) || defaultPos(k) || ''
          });
        }
      }

      snaps.push(cloneStage(st));
    });
    return { base, snaps };
  }

  // 重要：编辑中不要直接改 scene.characters（避免误写回），但舞台推导要能实时反映“初始舞台”编辑。
  const sceneForStageSim = scene
    ? Object.assign({}, scene, { characters: Array.isArray(editingSceneCharacters) ? editingSceneCharacters : (scene.characters || []) })
    : ({ characters: Array.isArray(editingSceneCharacters) ? editingSceneCharacters : [] });

  const stageSim = buildStageSnapshots(sceneForStageSim, editingDialogs);
  const stageSnaps = stageSim.snaps || [];

  // 舞台 key 展示顺序
  const STAGE_ORDER = ['hina', 'sora', 'princess', 'homework_slime'];
  function stageLabel(key) {
    if (key === 'hina') return '阳菜';
    if (key === 'sora') return '夜';
    if (key === 'princess') return '公主';
    if (key === 'homework_slime') return '史莱姆';
    return key;
  }

  function sortStageKeys(keys) {
    const arr = Array.isArray(keys) ? keys.slice() : [];
    arr.sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a);
      const ib = STAGE_ORDER.indexOf(b);
      const da = ia < 0 ? 999 : ia;
      const db = ib < 0 ? 999 : ib;
      if (da !== db) return da - db;
      return String(a).localeCompare(String(b));
    });
    return arr;
  }

  function getSwapId(dialog, key) {
    const st = dialog && dialog.stage;
    const arr = st && Array.isArray(st.swapChars) ? st.swapChars : [];
    const hit = arr.find(x => x && String(x.match || '') === String(key));
    return hit && hit.id ? hit.id : '';
  }

  function getShowId(dialog, key) {
    const st = dialog && dialog.stage;
    const arr = st && Array.isArray(st.showChars) ? st.showChars : [];
    const k = String(key);
    const hit = arr.find(s => {
      const sid = s && s.id ? String(s.id) : '';
      return (keyFromCharId(sid) || '') === k;
    });
    return hit && hit.id ? hit.id : '';
  }


  function getMoveEntry(dialog, key) {
    const st = dialog && dialog.stage;
    const arr = st && Array.isArray(st.moveChars) ? st.moveChars : [];
    const k = String(key);
    const hit = arr.find(m => m && String(m.match || '') === k);
    return hit || null;
  }

  function hasHide(dialog, key) {
    const st = dialog && dialog.stage;
    const arr = st && Array.isArray(st.hideChars) ? st.hideChars : [];
    const k = String(key);
    return arr.some(h => {
      const raw = (typeof h === 'string') ? h : (h && h.charId ? h.charId : '');
      return String(raw) === k;
    });
  }

  function setSwapId(dialog, key, id) {
    if (!dialog) return;
    if (!dialog.stage) dialog.stage = {};
    if (!Array.isArray(dialog.stage.swapChars)) dialog.stage.swapChars = [];
    const arr = dialog.stage.swapChars;
    const idx = arr.findIndex(x => x && String(x.match || '') === String(key));
    const entry = { match: String(key), id: String(id), mode: 'replace' };
    if (idx >= 0) arr[idx] = Object.assign({}, arr[idx] || {}, entry);
    else arr.push(entry);
  }

  function removeSwap(dialog, key) {
    if (!dialog || !dialog.stage || !Array.isArray(dialog.stage.swapChars)) return;
    dialog.stage.swapChars = dialog.stage.swapChars.filter(x => !(x && String(x.match || '') === String(key)));
    if (dialog.stage.swapChars.length === 0) delete dialog.stage.swapChars;
    // stage 如果空了就删掉，保持剧本干净
    if (dialog.stage && Object.keys(dialog.stage).length === 0) delete dialog.stage;
  }

  function removeHide(dialog, key) {
    if (!dialog || !dialog.stage || !Array.isArray(dialog.stage.hideChars)) return;
    const k = String(key);
    dialog.stage.hideChars = dialog.stage.hideChars.filter(h => {
      const raw = (typeof h === 'string') ? h : (h && h.charId ? h.charId : '');
      return String(raw) !== k;
    });
    if (dialog.stage.hideChars.length === 0) delete dialog.stage.hideChars;
    if (dialog.stage && Object.keys(dialog.stage).length === 0) delete dialog.stage;
  }

  function setHide(dialog, key) {
    if (!dialog) return;
    if (!dialog.stage) dialog.stage = {};
    if (!Array.isArray(dialog.stage.hideChars)) dialog.stage.hideChars = [];
    const k = String(key);
    // 去重
    const exists = dialog.stage.hideChars.some(h => {
      const raw = (typeof h === 'string') ? h : (h && h.charId ? h.charId : '');
      return String(raw) === k;
    });
    if (!exists) dialog.stage.hideChars.push(k);

    // 同一行隐藏时，清掉 show/swap，避免冲突
    removeShow(dialog, key);
    removeSwap(dialog, key);
  }

  function removeShow(dialog, key) {
    if (!dialog || !dialog.stage || !Array.isArray(dialog.stage.showChars)) return;
    const k = String(key);
    dialog.stage.showChars = dialog.stage.showChars.filter(s => {
      const sid = s && s.id ? String(s.id) : '';
      const sk = keyFromCharId(sid) || '';
      return sk !== k;
    });
    if (dialog.stage.showChars.length === 0) delete dialog.stage.showChars;
    if (dialog.stage && Object.keys(dialog.stage).length === 0) delete dialog.stage;
  }

  function setShow(dialog, key, id, position) {
    if (!dialog || !id) return;
    if (!dialog.stage) dialog.stage = {};
    if (!Array.isArray(dialog.stage.showChars)) dialog.stage.showChars = [];
    const k = String(key);
    // 先移除可能存在的同 key show
    removeShow(dialog, key);
    dialog.stage.showChars.push({
      id: String(id),
      position: position || defaultPos(k) || 'center'
    });

    // 显示时不要同时处于 hide
    removeHide(dialog, key);
  }

  function filterCharacterIdsByKey(key, all) {
    const list = Array.isArray(all) ? all : [];
    const k = String(key || '');
    if (!k) return list;
    const hint = (k === 'homework_slime') ? 'slime' : k;
    const filtered = list.filter(id => String(id).indexOf(hint) >= 0);
    return filtered.length ? filtered : list;
  }

  // 供下拉框 onchange 调用：改“说话者立绘”或“舞台上其他人立绘”
  window.__editorSetStageSprite = function (dialogIndex, key, value, isSpeaker) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;

    if (isSpeaker) {
      // 说话者：用 dialog.character 直控，空值=继承
      if (!value) delete d.character;
      else d.character = value;
    } else {
      // 非说话者：在场=swap；不在场/本行隐藏=show（自动把人带回舞台）
      if (!value) {
        removeSwap(d, key);
        removeShow(d, key);
      } else {
        const snap = stageSnaps[dialogIndex] || {};
        const present = !!snap[key];
        const hidden = hasHide(d, key);
        if (!present || hidden) {
          setShow(d, key, value, (snap[key] && snap[key].position) || (stageSim.base && stageSim.base[key] && stageSim.base[key].position) || defaultPos(key) || 'center');
          removeSwap(d, key);
        } else {
          setSwapId(d, key, value);
        }
      }
    }

    renderDialogsList(editingDialogs);
  };

  // 舞台角色：隐藏（从本句起）
  window.__editorStageHide = function (dialogIndex, key) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    setHide(d, key);
    renderDialogsList(editingDialogs);
  };

  // 舞台角色：显示/恢复（从本句起）
  window.__editorStageShow = function (dialogIndex, key) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const snap = stageSnaps[dialogIndex] || {};
    const base = (snap[key] && snap[key].id) || (stageSim.base && stageSim.base[key] && stageSim.base[key].id) || '';
    const prefer = getSwapId(d, key) || getShowId(d, key) || base;
    const optionIds = filterCharacterIdsByKey(key, availableResources.characters);
    const id = prefer || (optionIds.length ? optionIds[0] : '');
    if (!id) return;
    setShow(d, key, id, (snap[key] && snap[key].position) || (stageSim.base && stageSim.base[key] && stageSim.base[key].position) || defaultPos(key) || 'center');
    renderDialogsList(editingDialogs);
  };

  
// ===== D-02：对白舞台（dialog.stage）高级参数 & moveChars 编辑 =====
// 说明：
// - hideChars: string 或 {charId, delay, duration, remove}
// - showChars: {id, position, opacity, delay, duration}
// - swapChars: {match, id, delay, duration, mode/noOverlay}
// - moveChars: {match, x, y, delay, duration, easing}
// - speed: {hide, show, swap, move}
try {
  window.__editorStageAdvOpen = window.__editorStageAdvOpen || {};
} catch (e) {}

window.__editorStageAdvToggle = function (dialogIndex, key, open) {
  try {
    if (!window.__editorStageAdvOpen) window.__editorStageAdvOpen = {};
    window.__editorStageAdvOpen[String(dialogIndex) + '::' + String(key)] = !!open;
  } catch (e) {}
};

function __ensureStageObj(d) {
  if (!d) return null;
  if (!d.stage || typeof d.stage !== 'object') d.stage = {};
  return d.stage;
}

function __cleanupStageObj(d) {
  if (!d || !d.stage || typeof d.stage !== 'object') return;
  const st = d.stage;

  // 空数组清理
  ['hideChars', 'showChars', 'swapChars', 'moveChars'].forEach(k => {
    if (Array.isArray(st[k]) && st[k].length === 0) delete st[k];
  });

  // speed 清理
  if (st.speed && typeof st.speed === 'object' && Object.keys(st.speed).length === 0) delete st.speed;

  // stage 空壳清理
  if (Object.keys(st).length === 0) delete d.stage;
}

function __setNumberField(obj, field, raw) {
  if (!obj) return;
  const s = (raw == null) ? '' : String(raw).trim();
  if (!s) {
    delete obj[field];
    return;
  }
  const n = parseFloat(s);
  if (isNaN(n)) delete obj[field];
  else obj[field] = n;
}

function __setTextField(obj, field, raw) {
  if (!obj) return;
  const s = (raw == null) ? '' : String(raw).trim();
  if (!s) delete obj[field];
  else obj[field] = s;
}

function __findShowEntryByKey(d, key) {
  const st = d && d.stage;
  const arr = st && Array.isArray(st.showChars) ? st.showChars : [];
  const k = String(key);
  return arr.find(s => s && s.id && (keyFromCharId(String(s.id)) || '') === k) || null;
}

function __findSwapEntry(d, key) {
  const st = d && d.stage;
  const arr = st && Array.isArray(st.swapChars) ? st.swapChars : [];
  const k = String(key);
  return arr.find(s => s && String(s.match || '') === k) || null;
}

function __findHideEntry(d, key) {
  const st = d && d.stage;
  const arr = st && Array.isArray(st.hideChars) ? st.hideChars : [];
  const k = String(key);
  const idx = arr.findIndex(h => {
    const raw = (typeof h === 'string') ? h : (h && h.charId ? h.charId : '');
    return String(raw) === k;
  });
  return { idx, entry: idx >= 0 ? arr[idx] : null, arr };
}

function __ensureMoveEntry(d, key) {
  const st = __ensureStageObj(d);
  if (!st) return null;
  if (!Array.isArray(st.moveChars)) st.moveChars = [];
  const k = String(key);
  let hit = st.moveChars.find(m => m && String(m.match || '') === k);
  if (!hit) {
    hit = { match: k };
    st.moveChars.push(hit);
  }
  return hit;
}

function __removeMoveEntry(d, key) {
  if (!d || !d.stage || !Array.isArray(d.stage.moveChars)) return;
  const k = String(key);
  d.stage.moveChars = d.stage.moveChars.filter(m => !(m && String(m.match || '') === k));
  if (d.stage.moveChars.length === 0) delete d.stage.moveChars;
  __cleanupStageObj(d);
}

window.__editorSetStageSpeed = function (dialogIndex, field, value) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;
  const st = __ensureStageObj(d);
  if (!st) return;
  if (!st.speed || typeof st.speed !== 'object') st.speed = {};
  __setNumberField(st.speed, field, value);
  if (st.speed && typeof st.speed === 'object' && Object.keys(st.speed).length === 0) delete st.speed;
  __cleanupStageObj(d);
  renderDialogsList(editingDialogs);
};

window.__editorClearStageSpeed = function (dialogIndex) {
  const d = editingDialogs[dialogIndex];
  if (!d || !d.stage) return;
  delete d.stage.speed;
  __cleanupStageObj(d);
  renderDialogsList(editingDialogs);
};

window.__editorToggleStageMove = function (dialogIndex, key, enabled) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;
  if (enabled) __ensureMoveEntry(d, key);
  else __removeMoveEntry(d, key);
  renderDialogsList(editingDialogs);
};

window.__editorResetStageMoveToZero = function (dialogIndex, key) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;
  const mv = __ensureMoveEntry(d, key);
  if (!mv) return;
  mv.x = '0px';
  mv.y = '0px';
  renderDialogsList(editingDialogs);
};

window.__editorSetStageMoveField = function (dialogIndex, key, field, value, valueType) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;
  const mv = __ensureMoveEntry(d, key);
  if (!mv) return;

  if (valueType === 'number') __setNumberField(mv, field, value);
  else __setTextField(mv, field, value);

  // 如果只剩 match 一个字段，就当没写 move（保持剧本干净）
  const tmp = Object.assign({}, mv);
  delete tmp.match;
  if (Object.keys(tmp).length === 0) {
    __removeMoveEntry(d, key);
  } else {
    __cleanupStageObj(d);
  }

  renderDialogsList(editingDialogs);
};

window.__editorSetStageShowField = function (dialogIndex, key, field, value, valueType) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;

  const entry = __findShowEntryByKey(d, key);
  if (!entry) return; // 本行没 show 指令就不乱造

  if (valueType === 'number') __setNumberField(entry, field, value);
  else __setTextField(entry, field, value);

  __cleanupStageObj(d);
  renderDialogsList(editingDialogs);
};

window.__editorSetStageSwapField = function (dialogIndex, key, field, value, valueType) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;

  const entry = __findSwapEntry(d, key);
  if (!entry) return; // 本行没 swap 指令就不乱造

  if (field === 'mode') {
    const s = (value == null) ? '' : String(value).trim();
    if (!s) {
      delete entry.mode;
      delete entry.noOverlay;
    } else {
      entry.mode = s;
      if (s === 'replace') entry.noOverlay = true; // 兼容老字段
      else delete entry.noOverlay;
    }
    __cleanupStageObj(d);
    renderDialogsList(editingDialogs);
    return;
  }

  if (valueType === 'number') __setNumberField(entry, field, value);
  else __setTextField(entry, field, value);

  __cleanupStageObj(d);
  renderDialogsList(editingDialogs);
};

window.__editorSetStageHideField = function (dialogIndex, key, field, value, valueType) {
  const d = editingDialogs[dialogIndex];
  if (!d) return;

  const info = __findHideEntry(d, key);
  if (info.idx < 0) return; // 本行没 hide 指令就不乱造

  const arr = info.arr;
  let entry = info.entry;

  // 如果要写高级字段，把 string 变成 object（保留语义）
  if (typeof entry === 'string') {
    entry = { charId: String(key) };
    arr[info.idx] = entry;
  }

  if (valueType === 'checkbox' && field === 'remove') {
    // 默认 remove=true，所以勾选时直接删字段更干净
    if (value) delete entry.remove;
    else entry.remove = false;
  } else if (valueType === 'number') {
    __setNumberField(entry, field, value);
  } else {
    __setTextField(entry, field, value);
  }

  // 如果回到最简形态（只有 charId，且 remove 默认 true），就转换回 string
  const tmp = Object.assign({}, entry);
  const cid = tmp.charId;
  delete tmp.charId;
  const removeIsDefaultTrue = (tmp.remove == null);
  if (removeIsDefaultTrue) delete tmp.remove;
  if (Object.keys(tmp).length === 0) {
    // 只有 charId
    arr[info.idx] = String(cid || key);
  }

  __cleanupStageObj(d);
  renderDialogsList(editingDialogs);
};

  // 清除本行对该舞台角色的变更（回到继承状态）
  // ===== D-01：对白特效 effects 编辑（尽量不污染未知字段） =====
  function __ensureEffects(d) {
    if (!d) return null;
    if (!d.effects || typeof d.effects !== 'object') d.effects = {};
    return d.effects;
  }

  window.__editorToggleEffect = function(dialogIndex, effectKey, enabled) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const meta = EFFECT_UI[effectKey] || null;
    if (!meta) return;

    const eff = __ensureEffects(d);

    if (enabled) {
      if (eff[effectKey]) {
        // 已开启就不动
      } else if (meta.kind === 'boolean') {
        eff[effectKey] = true;
      } else {
        // object：用默认值（也允许空对象让引擎走默认，这里直接填默认便于 UI 显示）
        eff[effectKey] = Object.assign({}, meta.defaults || {});
      }
    } else {
      if (eff && eff[effectKey] != null) delete eff[effectKey];
      if (d.effects && Object.keys(d.effects).length === 0) delete d.effects;
    }

    renderDialogsList(editingDialogs);
  };

  window.__editorSetEffectField = function(dialogIndex, effectKey, field, value, valueType) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const meta = EFFECT_UI[effectKey] || null;
    if (!meta || meta.kind !== 'object') return;

    const eff = __ensureEffects(d);
    if (!eff[effectKey] || typeof eff[effectKey] !== 'object') eff[effectKey] = Object.assign({}, meta.defaults || {});
    const obj = eff[effectKey];

    // checkbox
    if (valueType === 'checkbox') {
      obj[field] = !!value;
      renderDialogsList(editingDialogs);
      return;
    }

    // number
    if (valueType === 'number') {
      const s = (value == null) ? '' : String(value).trim();
      if (!s) {
        delete obj[field];
      } else {
        const n = parseFloat(s);
        if (isNaN(n)) delete obj[field];
        else obj[field] = n;
      }
      renderDialogsList(editingDialogs);
      return;
    }

    // text / colorText
    const s = (value == null) ? '' : String(value);
    if (!s.trim()) delete obj[field];
    else obj[field] = s.trim();

    renderDialogsList(editingDialogs);
  };

  // ===== D-03：对白道具（dialog.itemShow / dialog.itemGet）编辑 =====
  // 对齐 game_project/js/itemDisplay.js + sceneManager.js 的触发字段
  function __ensureItemShow(d) {
    if (!d) return null;
    if (typeof d.itemShow === 'string') {
      d.itemShow = { itemId: d.itemShow, options: {} };
      return d.itemShow;
    }
    if (!d.itemShow || typeof d.itemShow !== 'object') d.itemShow = {};
    if (!d.itemShow.options || typeof d.itemShow.options !== 'object') d.itemShow.options = {};
    return d.itemShow;
  }

  function __ensureItemGet(d) {
    if (!d) return null;
    if (typeof d.itemGet === 'string') {
      d.itemGet = { itemId: d.itemGet, itemName: '', options: {} };
      return d.itemGet;
    }
    if (!d.itemGet || typeof d.itemGet !== 'object') d.itemGet = {};
    if (!d.itemGet.options || typeof d.itemGet.options !== 'object') d.itemGet.options = {};
    return d.itemGet;
  }

  window.__editorToggleItemShow = function(dialogIndex, enabled) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;

    if (enabled) {
      const obj = __ensureItemShow(d);
      if (!obj.itemId) obj.itemId = (availableItemIds && availableItemIds.length ? availableItemIds[0] : 'item_broom');
    } else {
      if (d.itemShow != null) delete d.itemShow;
    }

    renderDialogsList(editingDialogs);
  };

  window.__editorSetItemShowItemId = function(dialogIndex, itemId) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureItemShow(d);
    obj.itemId = (itemId == null) ? '' : String(itemId).trim();
    renderDialogsList(editingDialogs);
  };

  window.__editorSetItemShowOpt = function(dialogIndex, key, value, valueType) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureItemShow(d);
    const opt = obj.options || (obj.options = {});

    if (valueType === 'checkbox') {
      if (value) opt[key] = true;
      else delete opt[key];
      renderDialogsList(editingDialogs);
      return;
    }

    if (valueType === 'number') {
      const s = (value == null) ? '' : String(value).trim();
      if (!s) {
        delete opt[key];
      } else {
        const n = parseFloat(s);
        if (isNaN(n)) delete opt[key];
        else opt[key] = n;
      }
      // options 空了就清理（但不碰未知字段以外的）
      if (obj.options && typeof obj.options === 'object' && Object.keys(obj.options).length === 0) delete obj.options;
      renderDialogsList(editingDialogs);
      return;
    }

    // text/select
    const s = (value == null) ? '' : String(value);
    if (!s.trim()) delete opt[key];
    else opt[key] = s.trim();

    if (obj.options && typeof obj.options === 'object' && Object.keys(obj.options).length === 0) delete obj.options;
    renderDialogsList(editingDialogs);
  };

  window.__editorClearItemShow = function(dialogIndex) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    if (d.itemShow != null) delete d.itemShow;
    renderDialogsList(editingDialogs);
  };

  window.__editorToggleItemGet = function(dialogIndex, enabled) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;

    if (enabled) {
      const obj = __ensureItemGet(d);
      if (!obj.itemId) obj.itemId = (availableItemIds && availableItemIds.length ? availableItemIds[0] : 'item_broom');
    } else {
      if (d.itemGet != null) delete d.itemGet;
    }

    renderDialogsList(editingDialogs);
  };

  window.__editorSetItemGetItemId = function(dialogIndex, itemId) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureItemGet(d);
    obj.itemId = (itemId == null) ? '' : String(itemId).trim();
    renderDialogsList(editingDialogs);
  };

  window.__editorSetItemGetName = function(dialogIndex, name) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureItemGet(d);
    const s = (name == null) ? '' : String(name);
    if (!s.trim()) delete obj.itemName;
    else obj.itemName = s.trim();
    renderDialogsList(editingDialogs);
  };

  window.__editorSetItemGetOpt = function(dialogIndex, key, value, valueType) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureItemGet(d);
    const opt = obj.options || (obj.options = {});

    if (valueType === 'number') {
      const s = (value == null) ? '' : String(value).trim();
      if (!s) {
        delete opt[key];
      } else {
        const n = parseFloat(s);
        if (isNaN(n)) delete opt[key];
        else opt[key] = n;
      }
      if (obj.options && typeof obj.options === 'object' && Object.keys(obj.options).length === 0) delete obj.options;
      renderDialogsList(editingDialogs);
      return;
    }

    const s = (value == null) ? '' : String(value);
    if (!s.trim()) delete opt[key];
    else opt[key] = s.trim();

    if (obj.options && typeof obj.options === 'object' && Object.keys(obj.options).length === 0) delete obj.options;
    renderDialogsList(editingDialogs);
  };

  window.__editorClearItemGet = function(dialogIndex) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    if (d.itemGet != null) delete d.itemGet;
    renderDialogsList(editingDialogs);
  };

  
  // ===== D-04：对白角色动作（dialog.charAnim）编辑 =====
  function __ensureCharAnim(d) {
    if (!d) return null;
    if (!d.charAnim || typeof d.charAnim !== 'object') {
      const k = (typeof speakerKey === 'function') ? (speakerKey(d.speaker) || '') : '';
      d.charAnim = { charId: k, type: 'nod', options: { duration: 520 } };
    }
    if (!d.charAnim.options || typeof d.charAnim.options !== 'object') d.charAnim.options = {};
    return d.charAnim;
  }

  window.__editorToggleCharAnim = function(dialogIndex, enabled) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    if (enabled) {
      __ensureCharAnim(d);
    } else {
      if (d.charAnim != null) delete d.charAnim;
    }
    renderDialogsList(editingDialogs);
  };

  window.__editorSetCharAnimField = function(dialogIndex, field, value, valueType) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureCharAnim(d);
    if (!obj) return;

    if (valueType === 'checkbox') {
      obj[field] = !!value;
      renderDialogsList(editingDialogs);
      return;
    }

    const s = (value == null) ? '' : String(value);
    if (!s.trim()) {
      if (obj[field] != null) delete obj[field];
    } else {
      obj[field] = s.trim();
    }
    renderDialogsList(editingDialogs);
  };

  window.__editorSetCharAnimOption = function(dialogIndex, key, value, valueType) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    const obj = __ensureCharAnim(d);
    if (!obj) return;
    const opt = obj.options || (obj.options = {});

    if (valueType === 'number') {
      const s = (value == null) ? '' : String(value).trim();
      if (!s) {
        delete opt[key];
      } else {
        const n = parseFloat(s);
        if (isNaN(n)) delete opt[key];
        else opt[key] = n;
      }
      if (obj.options && typeof obj.options === 'object' && Object.keys(obj.options).length === 0) delete obj.options;
      renderDialogsList(editingDialogs);
      return;
    }

    const s = (value == null) ? '' : String(value);
    if (!s.trim()) delete opt[key];
    else opt[key] = s.trim();

    if (obj.options && typeof obj.options === 'object' && Object.keys(obj.options).length === 0) delete obj.options;
    renderDialogsList(editingDialogs);
  };

  window.__editorClearCharAnim = function(dialogIndex) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    if (d.charAnim != null) delete d.charAnim;
    renderDialogsList(editingDialogs);
  };

window.__editorClearStageRole = function (dialogIndex, key) {
    const d = editingDialogs[dialogIndex];
    if (!d) return;
    removeHide(d, key);
    removeShow(d, key);
    removeSwap(d, key);
    renderDialogsList(editingDialogs);
  };
  
  if (editingDialogs.length === 0) {
    container.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">暂无对话，点击下方按钮添加</div>';
    return;
  }
  
  container.innerHTML = editingDialogs.map((dialog, index) => {
    const snap = stageSnaps[index] || {};
    const spkKey = speakerKey(dialog.speaker);
    const isPreviewActive = !!(EditorPreview && EditorPreview.currentIndex === index);

    const effectiveCharId = dialog.character || (spkKey && snap[spkKey] ? snap[spkKey].id : '');
    const effectivePos = dialog.position || (spkKey && snap[spkKey] ? (snap[spkKey].position || '') : '');
    const isInherited = !dialog.character && !!effectiveCharId;

    const characterPath = effectiveCharId
      ? (getImagePathById(effectiveCharId) || `images/characters/${String(effectiveCharId).replace('char_', '')}.png`)
      : '';

    // 旁白行：给个“当前舞台”提示，避免编辑器看着像啥都没
    const stageHint = (!dialog.speaker && !dialog.character)
      ? (() => {
          const keys = Object.keys(snap || {});
          if (!keys.length) return '';
          const items = keys.map(k => {
            const it = snap[k];
            const id = it && it.id ? it.id : '';
            const p = it && it.position ? it.position : '';
            return `${k}${id ? `:${id}` : ''}${p ? `(${p})` : ''}`;
          }).join(' · ');
          return items;
        })()
      : '';

    // 舞台角色面板：默认把主要角色都展示出来，方便“增/删/换立绘”在同一处完成
    const stageKeys = sortStageKeys(Array.from(new Set([...(STAGE_ORDER || []), ...Object.keys(snap || {})])));

    // 旁白/未指定立绘时：用“舞台缩略图”替代那句冷冰冰的“舞台已有人物”
    const stageMiniTiles = stageKeys.map(k => {
      const sid = (snap[k] && snap[k].id) ? snap[k].id : '';
      const isSp = !!dialog.speaker && k === spkKey;
      const displayId = (isSp && dialog.character) ? dialog.character : sid;
      if (!displayId) return '';
      const p = getImagePathById(displayId) || `images/characters/${String(displayId).replace('char_', '')}.png`;
      return `<div style="width:78px;">\
        <div style="width:78px; height:120px; background:#111; border:1px solid rgba(255,255,255,0.08); border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center;">\
          <img src="${p}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">\
          <div style="display:none; color:#4a8acc; font-size:28px;">👤</div>\
        </div>\
        <div style="margin-top:6px; font-size:11px; color:#aaa; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${stageLabel(k)}</div>\
      </div>`;
    }).filter(Boolean).join('');

    const stageMiniPreview = stageMiniTiles
      ? `<div style="display:flex; flex-wrap:wrap; gap:10px; padding:10px; align-items:flex-start; justify-content:flex-start; width:100%; height:100%; overflow:auto;">${stageMiniTiles}</div>`
      : '';

    // 舞台角色控制条：每一条对话都能改“所有在场角色”的立绘（包括旁白行）
    
const __speed = (dialog.stage && dialog.stage.speed && typeof dialog.stage.speed === 'object') ? dialog.stage.speed : {};
const __speedEnabled = (__speed && ( __speed.hide != null || __speed.show != null || __speed.swap != null || __speed.move != null ));

const stageSpeedPanel = `<details class="stage-speed-details">\
  <summary>⚡ stage.speed（可选）${__speedEnabled ? ' · 已设置' : ''}</summary>\
  <div class="stage-speed-panel">\
    <div class="stage-speed-grid">\
      <div>\
        <div class="stage-adv-label">hide (ms)</div>\
        <input type="number" class="form-input" value="${(__speed.hide==null?'':__speed.hide)}" step="10" min="0" onchange="__editorSetStageSpeed(${index}, 'hide', this.value)">\
      </div>\
      <div>\
        <div class="stage-adv-label">show (ms)</div>\
        <input type="number" class="form-input" value="${(__speed.show==null?'':__speed.show)}" step="10" min="0" onchange="__editorSetStageSpeed(${index}, 'show', this.value)">\
      </div>\
      <div>\
        <div class="stage-adv-label">swap (ms)</div>\
        <input type="number" class="form-input" value="${(__speed.swap==null?'':__speed.swap)}" step="10" min="0" onchange="__editorSetStageSpeed(${index}, 'swap', this.value)">\
      </div>\
      <div>\
        <div class="stage-adv-label">move (ms)</div>\
        <input type="number" class="form-input" value="${(__speed.move==null?'':__speed.move)}" step="10" min="0" onchange="__editorSetStageSpeed(${index}, 'move', this.value)">\
      </div>\
    </div>\
    <div style="display:flex; gap:10px; align-items:center; justify-content:space-between; margin-top:8px; flex-wrap:wrap;">\
      <div style="font-size:11px; color:#777;">提示：若该角色本行的 show/swap/hide/move 自己写了 duration，会优先使用本行 duration。</div>\
      <button class="btn-small" style="padding:6px 10px; font-size:12px; opacity:0.9;" onclick="__editorClearStageSpeed(${index})">清除 speed</button>\
    </div>\
  </div>\
</details>`;

// 舞台角色控制条：每一条对话都能改“所有在场角色”的立绘（包括旁白行）
const stageControlStrip = (stageKeys.length > 0)
  ? `<div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px;">\
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">\
        <div style="font-size:12px; color:#bbb; font-weight:700;">舞台角色（可直接改立绘）</div>\
        <div style="font-size:12px; color:#777;">同一行可同时调多个表情 / 走位</div>\
      </div>\
      ${stageSpeedPanel}\
      <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; margin-top:10px;">\
        ${stageKeys.map(k => {
          const hiddenOnThisLine = hasHide(dialog, k);
          const baseId = (snap[k] && snap[k].id) ? snap[k].id
            : ((stageSim.base && stageSim.base[k] && stageSim.base[k].id) ? stageSim.base[k].id : '');
          const isSpeaker = !!dialog.speaker && k === spkKey;
          const presentNow = !!snap[k] && !hiddenOnThisLine;
          const displayId = hiddenOnThisLine ? '' : ((isSpeaker && dialog.character) ? dialog.character : baseId);
          const imgPath = displayId ? (getImagePathById(displayId) || `images/characters/${String(displayId).replace('char_', '')}.png`) : '';
          const selectedId = isSpeaker ? (dialog.character || '') : (getSwapId(dialog, k) || getShowId(dialog, k) || '');
          const optionIds = filterCharacterIdsByKey(k, availableResources.characters);
          const kEsc = String(k).replace(/'/g, "\\'");

          // ===== D-02：高级参数读取（show/swap/hide/move） =====
          const showEntry = __findShowEntryByKey(dialog, k);
          const swapEntry = __findSwapEntry(dialog, k);
          const hideInfo = __findHideEntry(dialog, k);
          const hideEntry = hideInfo && hideInfo.entry != null ? hideInfo.entry : null;
          const hideObj = (hideEntry && typeof hideEntry === 'object') ? hideEntry : null;
          const moveEntry = getMoveEntry(dialog, k);
          const advKey = String(index) + '::' + String(k);
          const advOpen = (window.__editorStageAdvOpen && window.__editorStageAdvOpen[advKey]) ? true : false;

          const showBlock = showEntry ? `
            <div class="stage-adv-block">
              <div class="stage-adv-title">showChars（入场）</div>
              <div class="stage-adv-grid">
                <div>
                  <div class="stage-adv-label">delay (ms)</div>
                  <input type="number" class="form-input" value="${(showEntry.delay==null?'':showEntry.delay)}" step="10" min="0"
                    onchange="__editorSetStageShowField(${index}, '${kEsc}', 'delay', this.value, 'number')">
                </div>
                <div>
                  <div class="stage-adv-label">duration (ms)</div>
                  <input type="number" class="form-input" value="${(showEntry.duration==null?'':showEntry.duration)}" step="10" min="0"
                    onchange="__editorSetStageShowField(${index}, '${kEsc}', 'duration', this.value, 'number')">
                </div>
                <div>
                  <div class="stage-adv-label">opacity (0~1)</div>
                  <input type="number" class="form-input" value="${(showEntry.opacity==null?'':showEntry.opacity)}" step="0.05" min="0" max="1"
                    onchange="__editorSetStageShowField(${index}, '${kEsc}', 'opacity', this.value, 'number')">
                </div>
                <div>
                  <div class="stage-adv-label">position</div>
                  <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetStageShowField(${index}, '${kEsc}', 'position', this.value, 'text')">
                    <option value="" ${(String(showEntry.position||'')==='')?'selected':''}>默认(center)</option>
                    <option value="left" ${(String(showEntry.position||'')==='left')?'selected':''}>left</option>
                    <option value="center" ${(String(showEntry.position||'')==='center')?'selected':''}>center</option>
                    <option value="right" ${(String(showEntry.position||'')==='right')?'selected':''}>right</option>
                  </select>
                </div>
              </div>
            </div>` : `<div class="stage-adv-empty">本行未触发 showChars（添加/恢复角色后才会有）</div>`;

          const swapMode = swapEntry ? (swapEntry.mode || (swapEntry.noOverlay ? 'replace' : '')) : '';
          const swapBlock = swapEntry ? `
            <div class="stage-adv-block">
              <div class="stage-adv-title">swapChars（换立绘）</div>
              <div class="stage-adv-grid">
                <div>
                  <div class="stage-adv-label">delay (ms)</div>
                  <input type="number" class="form-input" value="${(swapEntry.delay==null?'':swapEntry.delay)}" step="10" min="0"
                    onchange="__editorSetStageSwapField(${index}, '${kEsc}', 'delay', this.value, 'number')">
                </div>
                <div>
                  <div class="stage-adv-label">duration (ms)</div>
                  <input type="number" class="form-input" value="${(swapEntry.duration==null?'':swapEntry.duration)}" step="10" min="0"
                    onchange="__editorSetStageSwapField(${index}, '${kEsc}', 'duration', this.value, 'number')">
                </div>
                <div style="grid-column: 1 / span 2;">
                  <div class="stage-adv-label">mode</div>
                  <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetStageSwapField(${index}, '${kEsc}', 'mode', this.value, 'text')">
                    <option value="" ${(String(swapMode||'')==='')?'selected':''}>overlay（默认）</option>
                    <option value="replace" ${(String(swapMode||'')==='replace')?'selected':''}>replace（无重叠）</option>
                  </select>
                  <div style="margin-top:6px; font-size:11px; color:#777;">replace 会避免两张线稿叠在一起（更像“换表情”，不像“分身术”）</div>
                </div>
              </div>
            </div>` : `<div class="stage-adv-empty">本行未触发 swapChars（在下拉框里选一个表情才会有）</div>`;

          const hideRemoveChecked = (typeof hideEntry === 'string') ? true : (hideObj ? (hideObj.remove !== false) : true);
          const hideBlock = hiddenOnThisLine ? `
            <div class="stage-adv-block">
              <div class="stage-adv-title">hideChars（退场）</div>
              <div class="stage-adv-grid">
                <div>
                  <div class="stage-adv-label">delay (ms)</div>
                  <input type="number" class="form-input" value="${(hideObj && hideObj.delay!=null)?hideObj.delay:''}" step="10" min="0"
                    onchange="__editorSetStageHideField(${index}, '${kEsc}', 'delay', this.value, 'number')">
                </div>
                <div>
                  <div class="stage-adv-label">duration (ms)</div>
                  <input type="number" class="form-input" value="${(hideObj && hideObj.duration!=null)?hideObj.duration:''}" step="10" min="0"
                    onchange="__editorSetStageHideField(${index}, '${kEsc}', 'duration', this.value, 'number')">
                </div>
                <div style="grid-column: 1 / span 2;">
                  <label class="stage-adv-check">
                    <input type="checkbox" ${hideRemoveChecked ? 'checked' : ''} onchange="__editorSetStageHideField(${index}, '${kEsc}', 'remove', this.checked, 'checkbox')">
                    <span>移除(remove)（不勾选则只淡出但保留DOM）</span>
                  </label>
                </div>
              </div>
            </div>` : `<div class="stage-adv-empty">本行未触发 hideChars（点“移除”后才会有）</div>`;

          const moveEnabled = !!moveEntry;
          const easingVal = moveEntry && moveEntry.easing ? moveEntry.easing : '';
          const moveBlock = `
            <div class="stage-adv-block">
              <div class="stage-adv-title">moveChars（走位）</div>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:8px;">
                <label class="stage-adv-check">
                  <input type="checkbox" ${moveEnabled ? 'checked' : ''} onchange="__editorToggleStageMove(${index}, '${kEsc}', this.checked)">
                  <span>启用 move</span>
                </label>
                <button class="btn-small" style="padding:6px 10px; font-size:12px; opacity:0.9;" onclick="__editorResetStageMoveToZero(${index}, '${kEsc}')" ${moveEnabled ? '' : 'disabled'}>重置(0px,0px)</button>
              </div>
              ${moveEnabled ? `
                <div class="stage-adv-grid">
                  <div>
                    <div class="stage-adv-label">x（例如 -40px / 20px）</div>
                    <input type="text" class="form-input" value="${(moveEntry.x==null?'':String(moveEntry.x))}" placeholder="-40px"
                      onchange="__editorSetStageMoveField(${index}, '${kEsc}', 'x', this.value, 'text')">
                  </div>
                  <div>
                    <div class="stage-adv-label">y（例如 -10px / 0px）</div>
                    <input type="text" class="form-input" value="${(moveEntry.y==null?'':String(moveEntry.y))}" placeholder="0px"
                      onchange="__editorSetStageMoveField(${index}, '${kEsc}', 'y', this.value, 'text')">
                  </div>
                  <div>
                    <div class="stage-adv-label">delay (ms)</div>
                    <input type="number" class="form-input" value="${(moveEntry.delay==null?'':moveEntry.delay)}" step="10" min="0"
                      onchange="__editorSetStageMoveField(${index}, '${kEsc}', 'delay', this.value, 'number')">
                  </div>
                  <div>
                    <div class="stage-adv-label">duration (ms)</div>
                    <input type="number" class="form-input" value="${(moveEntry.duration==null?'':moveEntry.duration)}" step="10" min="0"
                      onchange="__editorSetStageMoveField(${index}, '${kEsc}', 'duration', this.value, 'number')">
                  </div>
                  <div style="grid-column: 1 / span 2;">
                    <div class="stage-adv-label">easing</div>
                    <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetStageMoveField(${index}, '${kEsc}', 'easing', this.value, 'text')">
                      <option value="" ${(String(easingVal||'')==='')?'selected':''}>默认(ease-in-out)</option>
                      <option value="ease-in-out" ${(String(easingVal||'')==='ease-in-out')?'selected':''}>ease-in-out</option>
                      <option value="ease-out" ${(String(easingVal||'')==='ease-out')?'selected':''}>ease-out</option>
                      <option value="ease-in" ${(String(easingVal||'')==='ease-in')?'selected':''}>ease-in</option>
                      <option value="linear" ${(String(easingVal||'')==='linear')?'selected':''}>linear</option>
                    </select>
                  </div>
                </div>
              ` : `<div style="font-size:11px; color:#777;">启用后才会写入 stage.moveChars（用于“靠近/退开/震退”等镜头）</div>`}
            </div>`;

          const advPanel = `
            <details class="stage-adv-details" ${advOpen ? 'open' : ''} ontoggle="__editorStageAdvToggle(${index}, '${kEsc}', this.open)">
              <summary>⚙ 高级参数</summary>
              <div class="stage-adv-panel">
                ${showBlock}
                ${swapBlock}
                ${hideBlock}
                ${moveBlock}
              </div>
            </details>`;

          return `<div style=\"flex:0 0 auto; width:180px;\">\
            <div style=\"width:180px; height:160px; background:#111; border:1px solid rgba(255,255,255,0.08); border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center;\">\
              ${imgPath ? `<img src=\"${imgPath}\" style=\"max-width:100%; max-height:100%; object-fit:contain;\" onerror=\"this.style.display='none'; this.nextElementSibling.style.display='flex';\">\
                          <div style=\"display:none; color:#4a8acc; font-size:36px;\">👤</div>`
                       : `<div style=\"color:#666; font-size:12px; padding:8px; text-align:center;\">${hiddenOnThisLine ? '已隐藏' : (baseId ? '加载中/无预览' : '未在舞台')}\n</div>`} \
            </div>\
            <div style=\"margin-top:6px; display:flex; align-items:center; justify-content:space-between; gap:8px;\">\
              <div style=\"font-size:12px; color:#ccc; font-weight:700;\">${stageLabel(k)}${isSpeaker ? '（说话）' : ''}</div>\
            </div>\
            <select class=\"form-select\" style=\"margin-top:6px; font-size:12px;\" onchange=\"__editorSetStageSprite(${index}, '${kEsc}', this.value, ${isSpeaker ? 'true' : 'false'})\">\
              <option value=\"\">继承（当前：${hiddenOnThisLine ? '已隐藏' : (baseId || '无')}）</option>\
              ${optionIds.map(cid => `<option value=\"${cid}\" ${selectedId === cid ? 'selected' : ''}>${cid}</option>`).join('')}\
            </select>\
            <div style=\"display:flex; gap:6px; margin-top:6px;\">\
              ${hiddenOnThisLine ?
                `<button class=\"btn-small\" style=\"flex:1; padding:6px 8px; font-size:12px;\" onclick=\"__editorStageShow(${index}, '${kEsc}')\" title=\"从本句起把角色加回舞台\">恢复</button>`
                : (presentNow
                  ? `<button class=\"btn-small\" style=\"flex:1; padding:6px 8px; font-size:12px;\" onclick=\"__editorStageHide(${index}, '${kEsc}')\" title=\"从本句起把角色移出舞台\">移除</button>`
                  : `<button class=\"btn-small\" style=\"flex:1; padding:6px 8px; font-size:12px;\" onclick=\"__editorStageShow(${index}, '${kEsc}')\" title=\"从本句起把角色加到舞台\">添加</button>`)
              }\
              <button class=\"btn-small\" style=\"flex:1; padding:6px 8px; font-size:12px; opacity:0.9;\" onclick=\"__editorClearStageRole(${index}, '${kEsc}')\">清除</button>\
            </div>\
            ${advPanel}\
          </div>`;
        }).join('')}\
      </div>\
    </div>`
  : '';

// ===== D-01：对白特效（dialog.effects）面板 =====
    const __effectsObj = (dialog && dialog.effects && typeof dialog.effects === 'object') ? dialog.effects : {};
    const __enabledEffectKeys = Object.keys(__effectsObj).filter(k => !!__effectsObj[k]);
    const __effectsCount = __enabledEffectKeys.length;
    const __effectsSummary = __effectsCount ? `特效（${__effectsCount}）` : '特效（无）';

    function __safeText(v) { return (v == null) ? '' : String(v); }
    function __asHexOrDefault(v, defHex) {
      const s = __safeText(v).trim();
      if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
      return defHex || '#ffffff';
    }

    const effectsPanel = (() => {
      const rows = EFFECT_UI_ORDER.map(effectKey => {
        const meta = EFFECT_UI[effectKey];
        if (!meta) return '';
        const enabled = !!(__effectsObj && __effectsObj[effectKey]);
        const checked = enabled ? 'checked' : '';
        const title = meta.label || effectKey;

        // 头部：开关
        let html = `<div class="effect-row">          <label class="effect-toggle">            <input type="checkbox" ${checked} onchange="__editorToggleEffect(${index}, '${effectKey}', this.checked)">            <span class="effect-title">${title}</span>            <span class="effect-key">(${effectKey})</span>          </label>`;

        if (enabled && meta.kind === 'object' && Array.isArray(meta.fields) && meta.fields.length) {
          const obj = (typeof __effectsObj[effectKey] === 'object') ? __effectsObj[effectKey] : {};
          const fieldsHtml = meta.fields.map(f => {
            const defVal = (meta.defaults && meta.defaults[f.key] != null) ? meta.defaults[f.key] : '';
            const curVal = (obj && obj[f.key] != null) ? obj[f.key] : defVal;

            if (f.type === 'select') {
              const opts = (f.options || []).map(opt => {
                const sel = String(curVal) === String(opt) ? 'selected' : '';
                return `<option value="${opt}" ${sel}>${opt}</option>`;
              }).join('');
              return `<div class="effect-field">                <div class="effect-label">${f.label}</div>                <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetEffectField(${index}, '${effectKey}', '${f.key}', this.value, 'text')">                  ${opts}                </select>              </div>`;
            }

            if (f.type === 'checkbox') {
              const c = curVal ? 'checked' : '';
              return `<div class="effect-field">                <label class="effect-check">                  <input type="checkbox" ${c} onchange="__editorSetEffectField(${index}, '${effectKey}', '${f.key}', this.checked, 'checkbox')">                  <span>${f.label}</span>                </label>              </div>`;
            }

            if (f.type === 'colorText') {
              const hex = __asHexOrDefault(curVal, __asHexOrDefault(defVal, '#ffffff'));
              const txt = __safeText(curVal);
              return `<div class="effect-field">                <div class="effect-label">${f.label}</div>                <div class="effect-color-row">                  <input type="color" value="${hex}" onchange="__editorSetEffectField(${index}, '${effectKey}', '${f.key}', this.value, 'text')">                  <input type="text" class="form-input" value="${txt}" placeholder="#ffffff / rgba(...)"                     onchange="__editorSetEffectField(${index}, '${effectKey}', '${f.key}', this.value, 'text')">                </div>              </div>`;
            }

            if (f.type === 'number') {
              const v = (curVal == null) ? '' : curVal;
              const step = (f.step != null) ? f.step : 'any';
              const min = (f.min != null) ? `min="${f.min}"` : '';
              const max = (f.max != null) ? `max="${f.max}"` : '';
              return `<div class="effect-field">                <div class="effect-label">${f.label}</div>                <input type="number" class="form-input" value="${v}" step="${step}" ${min} ${max}                        onchange="__editorSetEffectField(${index}, '${effectKey}', '${f.key}', this.value, 'number')">              </div>`;
            }

            // text
            const placeholder = f.placeholder ? String(f.placeholder) : '';
            return `<div class="effect-field">              <div class="effect-label">${f.label}</div>              <input type="text" class="form-input" value="${__safeText(curVal)}" placeholder="${placeholder}"                      onchange="__editorSetEffectField(${index}, '${effectKey}', '${f.key}', this.value, 'text')">            </div>`;
          }).join('');

          html += `<div class="effect-fields">${fieldsHtml}</div>`;
        }

        html += `</div>`;
        return html;
      }).join('');

      return `<details class="effects-details">        <summary>🎬 ${__effectsSummary}</summary>        <div class="effects-panel">          ${rows || '<div style="color:#888; font-size:12px; padding:6px 0;">暂无可用特效</div>'}        </div>      </details>`;
    })();

    
    // ===== D-04：对白角色动作（dialog.charAnim）面板 =====
    const __rawAnim = (dialog && dialog.charAnim != null) ? dialog.charAnim : null;
    const __animEnabled = __rawAnim != null;
    const __animObj = (__rawAnim && typeof __rawAnim === 'object') ? __rawAnim : {};
    const __animCharId = (__animObj && __animObj.charId != null) ? String(__animObj.charId) : '';
    const __animType = (__animObj && __animObj.type != null) ? String(__animObj.type) : '';
    const __animOpt = (__animObj && __animObj.options && typeof __animObj.options === 'object') ? __animObj.options : {};
    const __animDur = (__animOpt && __animOpt.duration != null) ? __animOpt.duration : '';
    const __keepAutoSpeaker = !!(__animObj && __animObj.keepAutoSpeaker);

    const availableCharAnimIds = (() => {
      const set = new Set();
      try { (stageKeys || []).forEach(k => k && set.add(String(k))); } catch (e) {}
      if (spkKey) set.add(String(spkKey));
      if (__animCharId) set.add(String(__animCharId));
      return Array.from(set).filter(Boolean);
    })();

    const __animSummary = (() => {
      if (!__animEnabled) return '动作（无）';
      const cid = __animCharId ? __animCharId : '未选角色';
      const tp = __animType ? __animType : '未选动作';
      return `动作（${cid} · ${tp}）`;
    })();

    const charAnimPanel = (() => {
      const cidOptions = availableCharAnimIds.map(id => {
        const sel = String(__animCharId || '') === String(id) ? 'selected' : '';
        const tag = (stageLabel && typeof stageLabel === 'function') ? ('（' + stageLabel(id) + '）') : '';
        return `<option value="${id}" ${sel}>${id}${tag}</option>`;
      }).join('');

      const typeOptions = (CHAR_ANIM_TYPES || []).map(it => {
        const v = it.value;
        const sel = String(__animType || '') === String(v) ? 'selected' : '';
        return `<option value="${v}" ${sel}>${it.label || v}</option>`;
      }).join('');

      const durVal = (__animDur == null) ? '' : __animDur;
      const keepChecked = __keepAutoSpeaker ? 'checked' : '';

      return `<details class="charanim-details">
        <summary>🕺 ${__animSummary}</summary>
        <div class="charanim-panel">
          <div class="charanim-row">
            <label class="charanim-toggle">
              <input type="checkbox" ${__animEnabled ? 'checked' : ''} onchange="__editorToggleCharAnim(${index}, this.checked)">
              <span style="font-weight:600;">启用动作</span>
              <span style="opacity:0.7; font-size:12px;">（dialog.charAnim）</span>
            </label>

            ${__animEnabled ? `
              <div class="charanim-fields">
                <div class="charanim-label">角色 charId</div>
                <div style="display:flex; gap:10px; align-items:center;">
                  <select class="form-select" style="flex:1; padding:6px 10px; font-size:12px;" onchange="__editorSetCharAnimField(${index}, 'charId', this.value, 'text')">
                    <option value="">（未选择）</option>
                    ${cidOptions}
                  </select>
                  <input type="text" class="form-input" style="width:220px;" value="${__safeText(__animCharId)}"
                         placeholder="例如：hina / sora / princess"
                         onchange="__editorSetCharAnimField(${index}, 'charId', this.value, 'text')">
                </div>

                <div class="charanim-label">动作 type</div>
                <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetCharAnimField(${index}, 'type', this.value, 'text')">
                  <option value="">（未选择）</option>
                  ${typeOptions}
                </select>

                <div class="charanim-label">时长 duration(ms)</div>
                <input type="number" class="form-input" value="${durVal}" step="10" min="0"
                       onchange="__editorSetCharAnimOption(${index}, 'duration', this.value, 'number')"
                       placeholder="默认 500">

                <div class="charanim-label">说话人自动轻动</div>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#d8d8d8;">
                  <input type="checkbox" ${keepChecked} onchange="__editorSetCharAnimField(${index}, 'keepAutoSpeaker', this.checked, 'checkbox')">
                  <span>保留（仅当该动作不是针对说话人时才有意义）</span>
                </label>
              </div>

              <div class="charanim-actions">
                <button class="btn-small" onclick="__editorClearCharAnim(${index})" title="删除 dialog.charAnim">清除动作</button>
              </div>
            ` : ''}

            <div class="hint-muted">
              提示：动作会在这一句对白触发。默认情况下，只要你设置了 <code>charAnim</code>，编辑器会认为你想“手动控制演出”，所以会抑制说话人自动轻动。<br>
              如果你想“额外让某人动一下”而不影响说话人自动轻动，可以勾选“保留说话人自动轻动”。
            </div>
          </div>
        </div>
      </details>`;
    })();

// ===== D-03：对白道具（itemShow / itemGet）面板 =====
    const __rawShow = (dialog && dialog.itemShow != null) ? dialog.itemShow : null;
    const __rawGet  = (dialog && dialog.itemGet  != null) ? dialog.itemGet  : null;

    const __showEnabled = __rawShow != null;
    const __getEnabled  = __rawGet  != null;

    const __showItemId = (typeof __rawShow === 'string') ? __rawShow : ((__rawShow && typeof __rawShow === 'object' && __rawShow.itemId) ? __rawShow.itemId : '');
    const __showOpt = (__rawShow && typeof __rawShow === 'object' && __rawShow.options && typeof __rawShow.options === 'object') ? __rawShow.options : {};

    const __getItemId = (typeof __rawGet === 'string') ? __rawGet : ((__rawGet && typeof __rawGet === 'object' && __rawGet.itemId) ? __rawGet.itemId : '');
    const __getName   = (__rawGet && typeof __rawGet === 'object' && __rawGet.itemName != null) ? __rawGet.itemName : '';
    const __getOpt    = (__rawGet && typeof __rawGet === 'object' && __rawGet.options && typeof __rawGet.options === 'object') ? __rawGet.options : {};

    const __itemSummary = (!__showEnabled && !__getEnabled) ? '道具（无）' : (__showEnabled && __getEnabled ? '道具（显示+获得）' : (__showEnabled ? '道具（显示）' : '道具（获得）'));

    const itemPanel = (() => {
      const optionHtml = (selected) => {
        const opts = (availableItemIds || []).map(id => {
          const sel = String(selected || '') === String(id) ? 'selected' : '';
          return `<option value="${id}" ${sel}>${id}</option>`;
        }).join('');
        return `<option value="">（未选择）</option>` + opts;
      };

      const showPreviewPath = __showItemId ? (getImagePathById(__showItemId) || __guessItemPath(__showItemId)) : '';
      const getPreviewPath  = __getItemId  ? (getImagePathById(__getItemId)  || __guessItemPath(__getItemId))  : '';

      const showFields = __showEnabled ? `
        <div class="item-fields">
          <div>
            <div class="item-label">itemId</div>
            <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetItemShowItemId(${index}, this.value)">
              ${optionHtml(__showItemId)}
            </select>
          </div>
          <div>
            <div class="item-label">预览</div>
            <div class="item-preview-box">
              ${showPreviewPath ? `<img src="${showPreviewPath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none; color:#4a8acc; font-size:28px;">📦</div>`
              : `<div style="color:#666; font-size:12px;">未选择</div>`}
            </div>
          </div>

          <div>
            <div class="item-label">位置(position)</div>
            <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetItemShowOpt(${index}, 'position', this.value, 'text')">
              <option value="" ${(String(__showOpt.position||'')==='')?'selected':''}>默认(center)</option>
              <option value="center" ${(String(__showOpt.position||'')==='center')?'selected':''}>center</option>
              <option value="left" ${(String(__showOpt.position||'')==='left')?'selected':''}>left</option>
              <option value="right" ${(String(__showOpt.position||'')==='right')?'selected':''}>right</option>
              <option value="speaker" ${(String(__showOpt.position||'')==='speaker')?'selected':''}>speaker</option>
            </select>
          </div>

          <div>
            <div class="item-label">动画(animation)</div>
            <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetItemShowOpt(${index}, 'animation', this.value, 'text')">
              <option value="" ${(String(__showOpt.animation||'')==='')?'selected':''}>默认(appear)</option>
              <option value="appear" ${(String(__showOpt.animation||'')==='appear')?'selected':''}>appear</option>
              <option value="float" ${(String(__showOpt.animation||'')==='float')?'selected':''}>float</option>
              <option value="spin" ${(String(__showOpt.animation||'')==='spin')?'selected':''}>spin</option>
            </select>
          </div>

          <div>
            <div class="item-label">尺寸(size)</div>
            <input type="number" class="form-input" value="${(__showOpt.size==null?'':__showOpt.size)}" step="1" min="0" onchange="__editorSetItemShowOpt(${index}, 'size', this.value, 'number')" placeholder="240">
          </div>

          <div>
            <div class="item-label">时长(duration ms)</div>
            <input type="number" class="form-input" value="${(__showOpt.duration==null?'':__showOpt.duration)}" step="10" onchange="__editorSetItemShowOpt(${index}, 'duration', this.value, 'number')" placeholder="1800">
          </div>

          <div>
            <div class="item-label">标签(label)</div>
            <input type="text" class="form-input" value="${(__showOpt.label==null?'':String(__showOpt.label))}" placeholder="比如：扫把" onchange="__editorSetItemShowOpt(${index}, 'label', this.value, 'text')">
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <label class="item-check">
              <input type="checkbox" ${__showOpt.persist ? 'checked' : ''} onchange="__editorSetItemShowOpt(${index}, 'persist', this.checked, 'checkbox')">
              <span>常驻(persist)</span>
            </label>
            <button class="btn-small" style="padding:6px 10px; font-size:12px; opacity:0.9;" onclick="__editorClearItemShow(${index})">清除显示</button>
          </div>
        </div>` : '';

      const getFields = __getEnabled ? `
        <div class="item-fields">
          <div>
            <div class="item-label">itemId</div>
            <select class="form-select" style="padding:6px 10px; font-size:12px;" onchange="__editorSetItemGetItemId(${index}, this.value)">
              ${optionHtml(__getItemId)}
            </select>
          </div>
          <div>
            <div class="item-label">预览</div>
            <div class="item-preview-box">
              ${getPreviewPath ? `<img src="${getPreviewPath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none; color:#4a8acc; font-size:28px;">📦</div>`
              : `<div style="color:#666; font-size:12px;">未选择</div>`}
            </div>
          </div>

          <div>
            <div class="item-label">显示名(itemName，可选)</div>
            <input type="text" class="form-input" value="${(__getName==null?'':String(__getName))}" placeholder="留空则用默认名" onchange="__editorSetItemGetName(${index}, this.value)">
          </div>
          <div>
            <div class="item-label">时长(duration ms)</div>
            <input type="number" class="form-input" value="${(__getOpt.duration==null?'':__getOpt.duration)}" step="10" onchange="__editorSetItemGetOpt(${index}, 'duration', this.value, 'number')" placeholder="2200">
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button class="btn-small" style="padding:6px 10px; font-size:12px; opacity:0.9;" onclick="__editorClearItemGet(${index})">清除获得</button>
          </div>
          <div></div>
        </div>` : '';

      return `
        <details class="item-details">
          <summary>🧰 ${__itemSummary}</summary>
          <div class="item-panel">
            <div class="item-row">
              <label class="item-toggle">
                <input type="checkbox" ${__showEnabled ? 'checked' : ''} onchange="__editorToggleItemShow(${index}, this.checked)">
                <span class="item-title">显示道具</span>
                <span class="item-key">(itemShow)</span>
              </label>
              ${showFields || '<div style="color:#888; font-size:12px; padding:6px 0;">未启用</div>'}
            </div>

            <div class="item-row">
              <label class="item-toggle">
                <input type="checkbox" ${__getEnabled ? 'checked' : ''} onchange="__editorToggleItemGet(${index}, this.checked)">
                <span class="item-title">获得提示</span>
                <span class="item-key">(itemGet)</span>
              </label>
              ${getFields || '<div style="color:#888; font-size:12px; padding:6px 0;">未启用</div>'}
            </div>

            <div style="color:#777; font-size:12px; padding:2px 2px 0;">
              提示：itemShow 的 <code>duration&lt;=0</code> 或勾选 <code>persist</code> 会常驻到你手动清除。
            </div>
          </div>
        </details>`;
    })();

    return `
      <div class="dialog-card ${isPreviewActive ? 'preview-active' : ''}">
        <div class="dialog-card-header">
          <div class="dialog-number">对话 ${index + 1}</div>
          <div class="dialog-actions">
            <button class="btn-small" onclick="previewDialogLine(${index})" title="在右侧预览框中预览这一句">预览</button>
            <button class="btn-small" onclick="playtestDialogLine(${index})" title="打开 game.html 并定位到这一句">▶ Playtest</button>
            <button class="btn-small" onclick="moveDialog(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button class="btn-small" onclick="moveDialog(${index}, 1)" ${index === editingDialogs.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="btn-small" onclick="deleteDialog(${index})">删除</button>
          </div>
        </div>
        
        <div class="dialog-content">
          <div class="dialog-left">
            <div class="character-preview-large" style="position: relative;">
              ${effectiveCharId ? `
                <img src="${characterPath}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; color: #4a8acc; font-size: 64px;">👤</div>
                ${isInherited ? `<div style="position:absolute; left:10px; top:10px; background:rgba(0,0,0,0.55); padding:4px 8px; border-radius:999px; font-size:12px; color:#ddd;">继承</div>` : ''}
              ` : `
                ${stageMiniPreview || `
                  <div style="color: #666; font-size: 14px;">${stageHint ? '舞台已有人物' : '未指定立绘'}</div>
                  ${stageHint ? `<div style="margin-top:8px; font-size:12px; color:#888; line-height:1.4;">${stageHint}</div>` : ''}
                `}
              `}
            </div>

            ${stageControlStrip}
            
            <select class="form-select" onchange="updateDialog(${index}, 'character', this.value)">
              <option value="">${effectiveCharId ? `继承/自动（当前：${effectiveCharId}）` : '无立绘（当前无）'}</option>
              ${availableResources.characters.map(char => 
                `<option value="${char}" ${dialog.character === char ? 'selected' : ''}>${char}</option>`
              ).join('')}
            </select>
            
            <button class="import-button" onclick="showImportDialog('character', ${index})">
              + 导入角色立绘
            </button>
            
            <div class="form-field">
              <label>角色位置</label>
              <select class="form-select" onchange="updateDialog(${index}, 'position', this.value)">
                <option value="">${effectivePos ? `继承（当前：${effectivePos}）` : '默认/继承'}</option>
                <option value="left" ${dialog.position === 'left' ? 'selected' : ''}>左侧</option>
                <option value="center" ${dialog.position === 'center' ? 'selected' : ''}>中间</option>
                <option value="right" ${dialog.position === 'right' ? 'selected' : ''}>右侧</option>
              </select>
            </div>
          </div>
          
          <div class="dialog-right">
            <div class="form-field">
              <label>说话者</label>
              <input type="text" class="form-input" value="${dialog.speaker || ''}" 
                     onchange="updateDialog(${index}, 'speaker', this.value)"
                     placeholder="留空表示旁白">
            </div>
            
            <div class="form-field">
              <label>对话内容</label>
              <textarea class="form-textarea" rows="6" 
                        onchange="updateDialog(${index}, 'text', this.value)"
                        placeholder="输入对话内容">${dialog.text || ''}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="form-field">
                <label>表情动画</label>
                <select class="form-select" onchange="updateDialog(${index}, 'animation', this.value)">
                  <option value="">无</option>
                  <option value="fadeIn" ${dialog.animation === 'fadeIn' ? 'selected' : ''}>淡入</option>
                  <option value="bounce" ${dialog.animation === 'bounce' ? 'selected' : ''}>弹跳</option>
                  <option value="shake" ${dialog.animation === 'shake' ? 'selected' : ''}>晃动</option>
                </select>
              </div>
              
              <div class="form-field">
                <label>音效</label>
                <input type="text" class="form-input" value="${dialog.se || ''}" 
                       onchange="updateDialog(${index}, 'se', this.value)"
                       placeholder="se_bell">
              </div>
            </div>

            ${effectsPanel}

            ${charAnimPanel}

            ${itemPanel}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // P-01：同步预览框“时间轴”范围，并在开启实时预览时自动刷新
  __refreshPreviewScrub();
  __scheduleLivePreview();
}

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

// ==================== 章节设置 ====================
function loadChapterSettings() {
  if (!EditorState.currentChapter) return;

  const meta = EditorState.currentChapter.meta || {};

  const numEl = document.getElementById('chapterNumber');
  const titleEl = document.getElementById('chapterTitle');
  const authorEl = document.getElementById('chapterAuthor');
  const gameTitleEl = document.getElementById('chapterGameTitle');
  const versionEl = document.getElementById('chapterVersion');

  if (numEl) numEl.value = meta.chapterNumber || '';
  if (titleEl) titleEl.value = meta.title || '';
  if (authorEl) authorEl.value = meta.author || '';
  if (gameTitleEl) gameTitleEl.value = meta.gameTitle || meta.title || '';
  if (versionEl) versionEl.value = meta.version || '';

  renderSpeakerMapEditor(meta.speakerMap || {});
}

function saveChapterSettings() {
  if (!EditorState.currentChapter) return;

  if (!EditorState.currentChapter.meta) {
    EditorState.currentChapter.meta = {};
  }

  const num = parseInt(document.getElementById('chapterNumber').value) || 1;
  const title = document.getElementById('chapterTitle').value || '';
  const author = document.getElementById('chapterAuthor').value || '';

  const gameTitleEl = document.getElementById('chapterGameTitle');
  const versionEl = document.getElementById('chapterVersion');

  const gameTitle = (gameTitleEl && gameTitleEl.value) ? gameTitleEl.value : '';
  const version = (versionEl && versionEl.value) ? versionEl.value : '';

  EditorState.currentChapter.meta.chapterNumber = num;
  EditorState.currentChapter.meta.title = title;
  EditorState.currentChapter.meta.author = author;

  // 可选 meta：不填就用 title 兜底（避免空字符串让标题页显示奇怪）
  EditorState.currentChapter.meta.gameTitle = (gameTitle || title || 'winter_whispers_game');
  EditorState.currentChapter.meta.version = (version || EditorState.currentChapter.meta.version || '1.0.0');

  // speakerMap（从表格读回）
  EditorState.currentChapter.meta.speakerMap = readSpeakerMapFromEditor();

  renderChapterList();
  saveToLocalStorage();

  alert('章节设置已保存！');
}


// ==================== speakerMap 可视化编辑 ====================
function renderSpeakerMapEditor(mapObj) {
  const container = document.getElementById('speakerMapRows');
  if (!container) return;

  const entries = Object.entries(mapObj || {});
  container.innerHTML = '';

  if (entries.length === 0) {
    // 至少放一行空白，避免“看起来像坏了”
    container.appendChild(createSpeakerMapRow('', ''));
    return;
  }

  entries.forEach(([name, key]) => {
    container.appendChild(createSpeakerMapRow(name, key));
  });
}

function createSpeakerMapRow(name, key) {
  const row = document.createElement('div');
  row.className = 'speaker-map-row';

  const nameInput = document.createElement('input');
  nameInput.className = 'form-input name-input';
  nameInput.placeholder = '显示名（对白里出现的）';
  nameInput.value = name || '';

  const keyInput = document.createElement('input');
  keyInput.className = 'form-input key-input';
  keyInput.placeholder = '角色key（例如：hina / sora）';
  keyInput.setAttribute('list', 'speakerKeyList');
  keyInput.value = key || '';

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-small';
  delBtn.textContent = '删除';
  delBtn.onclick = () => row.remove();

  row.appendChild(nameInput);
  row.appendChild(keyInput);
  row.appendChild(delBtn);

  return row;
}

function addSpeakerMapRow() {
  const container = document.getElementById('speakerMapRows');
  if (!container) return;
  container.appendChild(createSpeakerMapRow('', ''));
}

function clearSpeakerMap() {
  const container = document.getElementById('speakerMapRows');
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(createSpeakerMapRow('', ''));
}

function fillCommonSpeakerMap() {
  const common = {
    "阳菜": "hina",
    "雏奈": "hina",
    "Hina": "hina",
    "夜": "sora",
    "男主": "sora",
    "Sora": "sora",
    "希尔薇": "princess",
    "公主": "princess",
    "Princess": "princess",
    "???": "princess",
    "作业怪": "homework_slime",
    "史莱姆": "homework_slime",
    "Slime": "homework_slime"
  };

  // 合并到现有（现有优先）
  const cur = readSpeakerMapFromEditor();
  const merged = Object.assign({}, common, cur);

  renderSpeakerMapEditor(merged);
}

function readSpeakerMapFromEditor() {
  const container = document.getElementById('speakerMapRows');
  if (!container) return {};

  const rows = Array.from(container.querySelectorAll('.speaker-map-row'));
  const out = {};

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (!inputs || inputs.length < 2) return;
    const name = (inputs[0].value || '').trim();
    const key = (inputs[1].value || '').trim();
    if (!name || !key) return;
    out[name] = key;
  });

  return out;
}


// ==================== Tab切换 ====================
function switchTab(tabName) {
  // 更新tab按钮状态
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // 切换内容
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(`tab-${tabName}`).style.display = 'block';
}

// ==================== 保存和导出 ====================
function saveToLocalStorage() {
  const chaptersArray = Array.from(EditorState.chapters.values());
  localStorage.setItem('editor_chapters', JSON.stringify(chaptersArray));
  console.log('[Editor] Saved to localStorage');
}

function saveAllChapters() {
  saveToLocalStorage();
  
  if (EditorState.chapters.size === 0) {
    alert('暂无章节可保存');
    return;
  }
  
  // 生成并下载所有章节文件
  let savedCount = 0;
  EditorState.chapters.forEach((chapter, num) => {
    const jsCode = generateChapterJS(num, chapter);
    const fileName = `chapter${num}.js`;
    downloadFile(fileName, jsCode);
    savedCount++;
  });
  
  alert(`✅ 已保存 ${savedCount} 个章节！\n\n文件已下载到浏览器下载目录。\n\n📁 下载的文件：\n${Array.from(EditorState.chapters.keys()).map(n => `  • chapter${n}.js`).join('\n')}\n\n💡 替换步骤：\n1. 找到下载的文件（通常在"下载"文件夹）\n2. 复制到项目的 chapters/ 目录\n3. 覆盖原文件\n4. 刷新游戏页面测试`);
}

// 保存单个章节（快捷保存当前章节）
function saveCurrentChapter() {
  if (!EditorState.currentChapter || !EditorState.currentChapterIndex) {
    alert('请先选择要保存的章节');
    return;
  }
  
  saveToLocalStorage();
  
  const num = EditorState.currentChapterIndex;
  const jsCode = generateChapterJS(num, EditorState.currentChapter);
  const fileName = `chapter${num}.js`;
  
  downloadFile(fileName, jsCode);
  
  alert(`✅ 第${num}章已保存！\n\n文件: chapter${num}.js\n已下载到浏览器下载目录。\n\n💡 替换步骤：\n1. 找到下载的 chapter${num}.js\n2. 复制到项目 chapters/ 目录\n3. 覆盖原文件\n4. 刷新游戏页面测试`);
}

function generateChapterJS(num, chapter) {
  const code = `/**
 * 第${num}章剧本: ${chapter.meta?.title || '未命名'}
 * 作者: ${chapter.meta?.author || '未知'}
 * 使用剧本编辑器生成
 */
chapterLoader.registerChapter(${num}, ${JSON.stringify(chapter, null, 2)});
`;
  return code;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 下载任意文本文件（比如 JSON diff 报告）
function downloadTextFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== QA-01 / QA-02：校验 & Playtest ====================

function openGamePlaytest() {
  try { window.open('game.html', '_blank'); } catch (e) { window.location.href = 'game.html'; }
}

function openCurrentChapterFirstScenePlaytest() {
  try {
    if (!EditorState.currentChapter || !Array.isArray(EditorState.currentChapter.scenes) || EditorState.currentChapter.scenes.length === 0) {
      return openGamePlaytest();
    }
    playtestScene(EditorState.currentChapter.scenes[0].id);
  } catch (e) {
    openGamePlaytest();
  }
}

function __buildPlaytestUrl(sceneId, lineIndex) {
  try {
    if (!sceneId) return 'game.html';
    var params = new URLSearchParams();
    params.set('scene', String(sceneId));
    if (typeof lineIndex === 'number' && !isNaN(lineIndex)) params.set('line', String(lineIndex));
    params.set('fromEditor', '1');
    return 'game.html?' + params.toString();
  } catch (e) {
    if (!sceneId) return 'game.html';
    var q = 'scene=' + encodeURIComponent(String(sceneId));
    if (typeof lineIndex === 'number' && !isNaN(lineIndex)) q += '&line=' + encodeURIComponent(String(lineIndex));
    q += '&fromEditor=1';
    return 'game.html?' + q;
  }
}

function playtestScene(sceneId) {
  var url = __buildPlaytestUrl(sceneId, 0);
  try { window.open(url, '_blank'); } catch (e) { window.location.href = url; }
}

function playtestDialogLine(dialogIndex) {
  var scene = EditorState._editingSceneObj;
  var sceneId = scene && scene.id;
  if (!sceneId) {
    // 兜底：如果你不是从场景编辑器里点的，那就退化为打开 game.html
    return openGamePlaytest();
  }
  var idx = parseInt(dialogIndex, 10);
  if (isNaN(idx) || idx < 0) idx = 0;
  var url = __buildPlaytestUrl(sceneId, idx);
  try { window.open(url, '_blank'); } catch (e) { window.location.href = url; }
}

function clearAuditReport() {
  _lastAuditReport = null;
  var rep = document.getElementById('qaAuditReport');
  var st = document.getElementById('qaAuditStatus');
  if (rep) rep.innerHTML = '已清空。恭喜你成功地让信息熵上升了一点。';
  if (st) st.textContent = '等待扫描…';
}

function downloadLastAuditReport() {
  if (!_lastAuditReport || !_lastAuditReport.text) {
    alert('还没有可下载的校验报告。先点“开始扫描”。');
    return;
  }
  var name = _lastAuditReport.filename || ('QA_resource_audit_' + (new Date().toISOString().replace(/[:.]/g, '-')) + '.md');
  downloadTextFile(name, _lastAuditReport.text, 'text/markdown');
}

function __qaGetScope() {
  var el = document.querySelector('input[name="qaScope"]:checked');
  return el ? el.value : 'current';
}

function __qaChecked(id, def) {
  var el = document.getElementById(id);
  if (!el) return !!def;
  return !!el.checked;
}

function __qaEscapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function __qaInferTypeById(id) {
  if (!id) return 'unknown';
  if (id.indexOf('bg_') === 0) return 'background';
  if (id.indexOf('char_') === 0) return 'character';
  if (id.indexOf('bgm_') === 0) return 'bgm';
  if (id.indexOf('se_') === 0) return 'se';
  if (id.indexOf('voice_') === 0) return 'voice';
  if (id.indexOf('fx_') === 0) return 'fx';
  if (id.indexOf('item_') === 0) return 'item';
  return 'unknown';
}

function __qaIsIdLike(v) {
  if (!v || typeof v !== 'string') return false;
  // 只认你这套约定前缀，免得把“hina/sora”这种 key 当资源 id
  return (/^(bg_|char_|item_|fx_|bgm_|se_|voice_)/).test(v);
}

function __qaGuessImagePath(id) {
  if (!id) return null;
  // 已经是路径/文件名就别瞎猜了
  if (id.indexOf('/') >= 0 || id.indexOf('\\') >= 0 || id.indexOf('.') >= 0) return id;
  if (id.indexOf('bg_') === 0) return 'images/backgrounds/' + id.substring(3) + '.png';
  if (id.indexOf('char_') === 0) return 'images/characters/' + id.substring(5) + '.png';
  if (id.indexOf('item_') === 0) return 'images/others/' + id.substring(5) + '.png';
  if (id.indexOf('fx_') === 0) return 'images/others/' + id.substring(3) + '.png';
  return 'images/others/' + id + '.png';
}

function __qaGuessAudioPath(id) {
  if (!id) return null;
  if (id.indexOf('/') >= 0 || id.indexOf('\\') >= 0 || id.indexOf('.') >= 0) return id;
  if (id.indexOf('bgm_') === 0) return 'audios/bgm/' + id + '.mp3';
  if (id.indexOf('se_') === 0) return 'audios/se/' + id + '.mp3';
  if (id.indexOf('voice_') === 0) return 'audios/voices/' + id + '.mp3';
  return id;
}

function __qaAddRef(refs, id, where) {
  if (!id) return;
  refs[id] = refs[id] || [];
  if (refs[id].indexOf(where) < 0) refs[id].push(where);
}

function __qaCollectStageResIds(stage, refs, used, wherePrefix) {
  if (!stage || typeof stage !== 'object') return;
  function scanCharList(list, label) {
    if (!Array.isArray(list)) return;
    list.forEach(function (x, i) {
      var id = null;
      if (typeof x === 'string') id = x;
      else if (x && typeof x === 'object') id = x.id;
      if (__qaIsIdLike(id) && id.indexOf('char_') === 0) {
        used.add(id);
        __qaAddRef(refs, id, wherePrefix + '.' + label + '[' + i + ']');
      }
    });
  }
  function scanItemList(list, label) {
    if (!Array.isArray(list)) return;
    list.forEach(function (x, i) {
      var id = null;
      if (typeof x === 'string') id = x;
      else if (x && typeof x === 'object') id = x.id;
      if (__qaIsIdLike(id) && (id.indexOf('item_') === 0 || id.indexOf('fx_') === 0)) {
        used.add(id);
        __qaAddRef(refs, id, wherePrefix + '.' + label + '[' + i + ']');
      }
    });
  }

  scanCharList(stage.showChars, 'stage.showChars');
  scanCharList(stage.swapChars, 'stage.swapChars');
  scanItemList(stage.showItems, 'stage.showItems');
  scanItemList(stage.hideItems, 'stage.hideItems');
}

function __qaCollectEffectDeps(dialog, refs, used, wherePrefix) {
  // 用“弱约定”做依赖补全：effects 里出现某些 key，就认为会用到对应 fx 资源。
  // 你要是自定义了新特效，这里不会神奇地知道。人类也不会。
  var fx = dialog && (dialog.effects || dialog.fx);
  if (!fx || typeof fx !== 'object') return;

  var keys = Object.keys(fx);
  // 常用效果依赖（对齐 js/effects.js 的写法）
  var dep = {
    spell: ['fx_magic_circle'],
    beam: ['fx_beam'],
    hit: ['fx_impact_ring', 'fx_hit_spark'],
    dreamBokeh: ['fx_dream_bokeh'],
    sleep: ['fx_zzz'],
    eyeOpen: ['fx_eye_glow'],
    paperVanish: ['fx_paper_sheet', 'fx_paper_stack']
  };

  keys.forEach(function (k) {
    if (dep[k]) {
      dep[k].forEach(function (id) {
        used.add(id);
        __qaAddRef(refs, id, wherePrefix + '.effects.' + k);
      });
    }
    // 如果用户把资源 id 直接塞在 effects 里（比如 {se:'se_x'} 这种），也顺手扫一下
    var v = fx[k];
    if (typeof v === 'string' && __qaIsIdLike(v)) {
      used.add(v);
      __qaAddRef(refs, v, wherePrefix + '.effects.' + k);
    }
    if (v && typeof v === 'object') {
      ['id', 'itemId', 'se', 'bgm', 'voice'].forEach(function (kk) {
        var vv = v[kk];
        if (typeof vv === 'string' && __qaIsIdLike(vv)) {
          used.add(vv);
          __qaAddRef(refs, vv, wherePrefix + '.effects.' + k + '.' + kk);
        }
      });
    }
  });
}

function __qaBuildResourceIndex(chapters, includeGlobal) {
  var idx = new Map();
  function put(r, where) {
    if (!r || !r.id) return;
    if (!idx.has(r.id)) idx.set(r.id, { id: r.id, type: r.type || __qaInferTypeById(r.id), path: r.path, where: where });
  }

  chapters.forEach(function (ch, num) {
    var imgs = (ch && ch.resources && ch.resources.images) ? ch.resources.images : [];
    var auds = (ch && ch.resources && ch.resources.audios) ? ch.resources.audios : [];
    imgs.forEach(function (r) { put(r, 'chapter' + num); });
    auds.forEach(function (r) { put(r, 'chapter' + num); });
  });

  if (includeGlobal) {
    (EditorState.globalResources.images || []).forEach(function (r) { put(r, 'global'); });
    (EditorState.globalResources.audios || []).forEach(function (r) { put(r, 'global'); });
  }

  return idx;
}

function __qaGetChaptersByScope(scope) {
  if (scope === 'all') {
    // EditorState.chapters 是 Map
    return new Map(EditorState.chapters);
  }
  // current
  var m = new Map();
  if (EditorState.currentChapterIndex && EditorState.currentChapter) {
    m.set(EditorState.currentChapterIndex, EditorState.currentChapter);
  }
  return m;
}

function __qaCollectUsedIds(chapters) {
  var used = new Set();
  var refs = {};

  chapters.forEach(function (ch, num) {
    var scenes = (ch && Array.isArray(ch.scenes)) ? ch.scenes : [];
    scenes.forEach(function (scene) {
      var sp = 'chapter' + num + '/' + (scene && scene.id ? scene.id : 'unknownScene');

      var bg = scene && scene.background;
      if (__qaIsIdLike(bg)) { used.add(bg); __qaAddRef(refs, bg, sp + '.background'); }

      var bgm = scene && scene.bgm;
      if (__qaIsIdLike(bgm)) { used.add(bgm); __qaAddRef(refs, bgm, sp + '.bgm'); }

      (scene && Array.isArray(scene.characters) ? scene.characters : []).forEach(function (c, i) {
        var id = c && c.id;
        if (__qaIsIdLike(id) && id.indexOf('char_') === 0) {
          used.add(id);
          __qaAddRef(refs, id, sp + '.characters[' + i + ']');
        }
      });

      (scene && Array.isArray(scene.dialogs) ? scene.dialogs : []).forEach(function (d, di) {
        var dp = sp + '.dialogs[' + di + ']';

        if (d && __qaIsIdLike(d.character) && d.character.indexOf('char_') === 0) {
          used.add(d.character);
          __qaAddRef(refs, d.character, dp + '.character');
        }

        if (d && __qaIsIdLike(d.se) && d.se.indexOf('se_') === 0) {
          used.add(d.se);
          __qaAddRef(refs, d.se, dp + '.se');
        }
        if (d && __qaIsIdLike(d.voice) && d.voice.indexOf('voice_') === 0) {
          used.add(d.voice);
          __qaAddRef(refs, d.voice, dp + '.voice');
        }

        if (d && d.itemShow && __qaIsIdLike(d.itemShow.itemId)) {
          used.add(d.itemShow.itemId);
          __qaAddRef(refs, d.itemShow.itemId, dp + '.itemShow.itemId');
        }
        if (d && d.itemHide && __qaIsIdLike(d.itemHide.itemId)) {
          used.add(d.itemHide.itemId);
          __qaAddRef(refs, d.itemHide.itemId, dp + '.itemHide.itemId');
        }
        if (d && d.itemGet && __qaIsIdLike(d.itemGet.itemId)) {
          used.add(d.itemGet.itemId);
          __qaAddRef(refs, d.itemGet.itemId, dp + '.itemGet.itemId');
        }

        if (d && d.stage) __qaCollectStageResIds(d.stage, refs, used, dp);
        __qaCollectEffectDeps(d, refs, used, dp);
      });
    });
  });

  return { used: used, refs: refs };
}

function __qaCheckImage(path, timeoutMs) {
  timeoutMs = timeoutMs || 4000;
  return new Promise(function (resolve) {
    if (!path) return resolve({ ok: false, reason: 'empty' });
    var img = new Image();
    var done = false;
    var t = setTimeout(function () { finish(false, 'timeout'); }, timeoutMs);
    function finish(ok, reason) {
      if (done) return;
      done = true;
      try { clearTimeout(t); } catch (e) {}
      resolve({ ok: ok, reason: reason || (ok ? 'ok' : 'error') });
    }
    img.onload = function () { finish(true, 'ok'); };
    img.onerror = function () { finish(false, 'error'); };
    // cache busting，避免你改了文件但浏览器死活用旧缓存
    var src = path;
    src += (src.indexOf('?') >= 0 ? '&' : '?') + '__qa=' + Date.now();
    img.src = src;
  });
}

function __qaCheckAudio(path, timeoutMs) {
  timeoutMs = timeoutMs || 6000;
  return new Promise(function (resolve) {
    if (!path) return resolve({ ok: false, reason: 'empty' });
    var a = new Audio();
    a.preload = 'auto';
    a.muted = true;
    var done = false;
    var t = setTimeout(function () { finish(false, 'timeout'); }, timeoutMs);
    function finish(ok, reason) {
      if (done) return;
      done = true;
      try { clearTimeout(t); } catch (e) {}
      try { a.src = ''; a.load(); } catch (e2) {}
      resolve({ ok: ok, reason: reason || (ok ? 'ok' : 'error') });
    }
    a.addEventListener('loadedmetadata', function () { finish(true, 'ok'); });
    a.addEventListener('canplaythrough', function () { finish(true, 'ok'); });
    a.addEventListener('error', function () { finish(false, 'error'); });
    try {
      var src = path;
      src += (src.indexOf('?') >= 0 ? '&' : '?') + '__qa=' + Date.now();
      a.src = src;
      a.load();
    } catch (e) {
      finish(false, 'exception');
    }
  });
}

async function runResourceAudit() {
  var rep = document.getElementById('qaAuditReport');
  var st = document.getElementById('qaAuditStatus');
  if (!rep || !st) {
    alert('QA 面板不存在... 你是不是把 HTML 改坏了？');
    return;
  }

  var scope = __qaGetScope();
  var includeGlobal = __qaChecked('qaIncludeGlobal', true);
  var checkFiles = __qaChecked('qaCheckFiles', true);

  var chapters = __qaGetChaptersByScope(scope);
  if (chapters.size === 0) {
    st.textContent = '没有可扫描的章节（先选个章节吧）。';
    rep.innerHTML = '你连章节都没选，我也很难装作在工作。';
    return;
  }

  st.textContent = '扫描引用中…';
  rep.innerHTML = '努力扫描中...（这句话也适用于你）';

  // 1) 收集引用
  var collected = __qaCollectUsedIds(chapters);
  var used = collected.used;
  var refs = collected.refs;

  // 2) 建索引（声明资源）
  var idx = __qaBuildResourceIndex(chapters, includeGlobal);

  // 3) 缺失 / 未使用
  var missing = [];
  used.forEach(function (id) {
    if (!idx.has(id)) missing.push(id);
  });
  missing.sort();

  // 未使用：只统计“当前 scope 的章节资源”，避免把 global 全部算进来（否则噪音过大）
  var declared = [];
  chapters.forEach(function (ch, num) {
    (ch?.resources?.images || []).forEach(function (r) { if (r && r.id) declared.push({ id: r.id, type: r.type, path: r.path, where: 'chapter' + num }); });
    (ch?.resources?.audios || []).forEach(function (r) { if (r && r.id) declared.push({ id: r.id, type: r.type, path: r.path, where: 'chapter' + num }); });
  });
  var unused = declared.filter(function (r) { return r && r.id && !used.has(r.id); });
  unused.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });

  // 4) 文件可加载性检查（可选）
  var loadFails = [];
  if (checkFiles) {
    st.textContent = '检测文件可加载性中…（图片/音频）';

    // 只检查“引用到的资源”，并且跳过 generated
    var checkList = [];
    used.forEach(function (id) {
      var hit = idx.get(id);
      var inferredType = hit ? (hit.type || __qaInferTypeById(id)) : __qaInferTypeById(id);
      var path = hit ? hit.path : null;
      var guessed = false;
      if (!path || path === 'placeholder') {
        // 没声明就按约定猜一个，至少能抓到“文件名拼错了”这种低级事故
        if (inferredType === 'background' || inferredType === 'character' || inferredType === 'item' || inferredType === 'fx') {
          path = __qaGuessImagePath(id);
          guessed = true;
        } else {
          path = __qaGuessAudioPath(id);
          guessed = true;
        }
      }
      if (!path || path === 'generated') return;
      checkList.push({ id: id, type: inferredType, path: path, guessed: guessed, declared: !!hit });
    });

    for (var i = 0; i < checkList.length; i++) {
      var t = checkList[i];
      st.textContent = '检测文件可加载性 ' + (i + 1) + '/' + checkList.length + '：' + t.id;
      var res;
      if (t.type === 'bgm' || t.type === 'se' || t.type === 'voice') {
        res = await __qaCheckAudio(t.path);
      } else {
        res = await __qaCheckImage(t.path);
      }
      if (!res.ok) {
        loadFails.push({ id: t.id, type: t.type, path: t.path, guessed: t.guessed, declared: t.declared, reason: res.reason });
      }
    }
  }

  // 5) 渲染报告
  st.textContent = '生成报告中…';

  function refHtml(id) {
    var list = refs[id] || [];
    if (list.length === 0) return '<span style="color:#777;">（无定位）</span>';
    var show = list.slice(0, 6);
    var more = list.length > show.length ? ('<div style="color:#777; margin-top:4px;">... 还有 ' + (list.length - show.length) + ' 处</div>') : '';
    return show.map(function (x) { return '<div><code>' + __qaEscapeHtml(x) + '</code></div>'; }).join('') + more;
  }

  var html = '';
  html += '<div style="font-size:14px; margin-bottom:8px;">';
  html += '<span class="qa-pill">scope: ' + __qaEscapeHtml(scope) + '</span> ';
  html += '<span class="qa-pill">used: ' + used.size + '</span> ';
  html += '<span class="qa-pill">missing: ' + missing.length + '</span> ';
  html += '<span class="qa-pill">unused: ' + unused.length + '</span> ';
  html += (checkFiles ? ('<span class="qa-pill">fileFail: ' + loadFails.length + '</span>') : '<span class="qa-pill">fileCheck: off</span>');
  html += '</div>';

  html += '<div style="color:#aaa; font-size:12px;">提示：missing 是“引用了但资源表里找不到”；fileFail 是“路径存在但浏览器加载失败（或被环境限制）”。</div>';

  // 缺失
  html += '<h3 style="margin:14px 0 6px;">❌ Missing（引用了但资源表没有）</h3>';
  if (missing.length === 0) {
    html += '<div style="color:#8bd48b;">没有 missing。你居然把资源管理做对了，罕见。</div>';
  } else {
    html += '<table class="qa-table"><thead><tr><th>id</th><th>推断类型</th><th>猜测路径</th><th>引用位置</th></tr></thead><tbody>';
    missing.forEach(function (id) {
      var tp = __qaInferTypeById(id);
      var guess = (tp === 'bgm' || tp === 'se' || tp === 'voice') ? __qaGuessAudioPath(id) : __qaGuessImagePath(id);
      html += '<tr>';
      html += '<td><code>' + __qaEscapeHtml(id) + '</code></td>';
      html += '<td>' + __qaEscapeHtml(tp) + '</td>';
      html += '<td><code>' + __qaEscapeHtml(guess || '') + '</code></td>';
      html += '<td>' + refHtml(id) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
  }

  // 未使用
  html += '<h3 style="margin:16px 0 6px;">🗑️ Unused（资源表里有，但剧本没用到）</h3>';
  if (unused.length === 0) {
    html += '<div style="color:#8bd48b;">没有 unused（当前 scope）。你的资源表挺干净。</div>';
  } else {
    html += '<table class="qa-table"><thead><tr><th>id</th><th>type</th><th>path</th><th>where</th></tr></thead><tbody>';
    unused.slice(0, 200).forEach(function (r) {
      html += '<tr>';
      html += '<td><code>' + __qaEscapeHtml(r.id) + '</code></td>';
      html += '<td>' + __qaEscapeHtml(r.type || __qaInferTypeById(r.id)) + '</td>';
      html += '<td><code>' + __qaEscapeHtml(r.path || '') + '</code></td>';
      html += '<td>' + __qaEscapeHtml(r.where || '') + '</td>';
      html += '</tr>';
    });
    if (unused.length > 200) {
      html += '<tr><td colspan="4" style="color:#777;">... 仅显示前 200 条，避免你浏览器当场去世（总计 ' + unused.length + ' 条）</td></tr>';
    }
    html += '</tbody></table>';
  }

  // 文件加载失败
  html += '<h3 style="margin:16px 0 6px;">⚠️ File Load Fail（路径加载失败）</h3>';
  if (!checkFiles) {
    html += '<div style="color:#777;">已关闭 file check。</div>';
  } else if (loadFails.length === 0) {
    html += '<div style="color:#8bd48b;">没有检测到加载失败。</div>';
  } else {
    html += '<table class="qa-table"><thead><tr><th>id</th><th>type</th><th>path</th><th>declared</th><th>guessed</th><th>reason</th></tr></thead><tbody>';
    loadFails.forEach(function (x) {
      html += '<tr>';
      html += '<td><code>' + __qaEscapeHtml(x.id) + '</code></td>';
      html += '<td>' + __qaEscapeHtml(x.type) + '</td>';
      html += '<td><code>' + __qaEscapeHtml(x.path) + '</code></td>';
      html += '<td>' + (x.declared ? 'yes' : 'no') + '</td>';
      html += '<td>' + (x.guessed ? 'yes' : 'no') + '</td>';
      html += '<td>' + __qaEscapeHtml(x.reason || '') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
  }

  rep.innerHTML = html;
  st.textContent = '完成：used=' + used.size + '，missing=' + missing.length + '，unused=' + unused.length + (checkFiles ? ('，fileFail=' + loadFails.length) : '');

  // 6) 生成可下载 markdown
  var md = '';
  md += '# QA-01 资源校验报告\n\n';
  md += '- scope: ' + scope + '\n';
  md += '- includeGlobal: ' + (includeGlobal ? 'true' : 'false') + '\n';
  md += '- checkFiles: ' + (checkFiles ? 'true' : 'false') + '\n';
  md += '- used: ' + used.size + '\n';
  md += '- missing: ' + missing.length + '\n';
  md += '- unused: ' + unused.length + '\n';
  md += '- fileFail: ' + loadFails.length + '\n\n';

  md += '## Missing\n\n';
  if (missing.length === 0) {
    md += '- (none)\n';
  } else {
    missing.forEach(function (id) {
      var tp = __qaInferTypeById(id);
      var guess = (tp === 'bgm' || tp === 'se' || tp === 'voice') ? __qaGuessAudioPath(id) : __qaGuessImagePath(id);
      md += '- ' + id + ' (' + tp + ')\n';
      if (guess) md += '  - guessPath: ' + guess + '\n';
      (refs[id] || []).slice(0, 10).forEach(function (r) { md += '  - ref: ' + r + '\n'; });
      if ((refs[id] || []).length > 10) md += '  - ... more refs: ' + ((refs[id] || []).length - 10) + '\n';
    });
  }

  md += '\n## Unused (declared but not referenced)\n\n';
  if (unused.length === 0) {
    md += '- (none)\n';
  } else {
    unused.forEach(function (r) {
      md += '- ' + r.id + ' | ' + (r.type || '') + ' | ' + (r.path || '') + ' | ' + (r.where || '') + '\n';
    });
  }

  md += '\n## File Load Fail\n\n';
  if (!checkFiles) {
    md += '- (file check disabled)\n';
  } else if (loadFails.length === 0) {
    md += '- (none)\n';
  } else {
    loadFails.forEach(function (x) {
      md += '- ' + x.id + ' | ' + x.type + ' | ' + x.path + ' | declared=' + (x.declared ? 'yes' : 'no') + ' | guessed=' + (x.guessed ? 'yes' : 'no') + ' | reason=' + (x.reason || '') + '\n';
    });
  }

  _lastAuditReport = {
    filename: 'QA_resource_audit_' + (new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')) + '.md',
    text: md,
    html: html,
    data: { scope: scope, includeGlobal: includeGlobal, checkFiles: checkFiles, usedCount: used.size, missing: missing, unused: unused, fileFail: loadFails }
  };
}

// ==================== 查看改动（相对“原有剧本文件”基准） ====================
function openDiffModal() {
  if (!EditorState.currentChapterIndex) {
    alert('请先从左侧选择一个章节，再查看改动。');
    return;
  }

  const num = EditorState.currentChapterIndex;
  const base = EditorState.baselineChapters.get(num);
  const cur = EditorState.chapters.get(num);

  if (!base || !cur) {
    alert('当前章节缺少基准版本，无法对比改动（请尝试“重新加载项目章节”）。');
    return;
  }

  const ops = diffChapter(base, cur);
  const stats = ops.reduce((acc, it) => {
    acc[it.op] = (acc[it.op] || 0) + 1;
    return acc;
  }, {});

  const summary = ops.length === 0
    ? '✅ 没有检测到改动（与基准一致）'
    : `共 ${ops.length} 处变更：替换 ${stats.replace || 0}，新增 ${stats.add || 0}，删除 ${stats.remove || 0}`;

  const text = ops.length === 0 ? '（无改动）' : formatDiffOps(ops);

  _lastDiffReport = {
    chapter: num,
    generatedAt: new Date().toISOString(),
    summary,
    ops,
    text
  };

  const titleEl = document.getElementById('diffTitle');
  const summaryEl = document.getElementById('diffSummary');
  const textEl = document.getElementById('diffText');
  titleEl.textContent = `🧾 第${num}章 改动`;
  summaryEl.textContent = summary;
  textEl.textContent = text;

  document.getElementById('diffModal').classList.add('show');
}

function closeDiffModal() {
  const modal = document.getElementById('diffModal');
  if (modal) modal.classList.remove('show');
}

function copyDiffToClipboard() {
  if (!_lastDiffReport) {
    alert('没有可复制的改动内容。');
    return;
  }
  const content = `# 第${_lastDiffReport.chapter}章 改动\n${_lastDiffReport.summary}\n\n${_lastDiffReport.text}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(content).then(() => {
      alert('已复制到剪贴板 ✅');
    }).catch(() => {
      fallbackCopy(content);
    });
  } else {
    fallbackCopy(content);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    alert('已复制到剪贴板 ✅');
  } catch (e) {
    alert('复制失败，请手动选择复制。');
  }
  document.body.removeChild(ta);
}

function downloadDiffReport() {
  if (!_lastDiffReport) {
    alert('没有可下载的改动报告。');
    return;
  }
  const filename = `chapter${_lastDiffReport.chapter}_diff_report.json`;
  downloadTextFile(filename, JSON.stringify(_lastDiffReport, null, 2), 'application/json');
}

function formatDiffOps(ops) {
  const lines = [];
  for (const op of ops) {
    const tag = op.op === 'add' ? '[+]' : op.op === 'remove' ? '[-]' : '[~]';
    lines.push(`${tag} ${op.path}`);
    if (op.op === 'add') {
      lines.push(`  + ${formatValue(op.newValue)}`);
    } else if (op.op === 'remove') {
      lines.push(`  - ${formatValue(op.oldValue)}`);
    } else {
      lines.push(`  - ${formatValue(op.oldValue)}`);
      lines.push(`  + ${formatValue(op.newValue)}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function formatValue(v) {
  if (v === undefined) return '(undefined)';
  if (v === null) return 'null';
  if (typeof v === 'string') {
    const s = v.length > 220 ? v.slice(0, 220) + '…' : v;
    return JSON.stringify(s);
  }
  const json = JSON.stringify(v);
  if (!json) return String(v);
  return json.length > 260 ? json.slice(0, 260) + '…' : json;
}

function escPtr(seg) {
  return String(seg).replace(/~/g, '~0').replace(/\//g, '~1');
}

function typeOfVal(v) {
  if (Array.isArray(v)) return 'array';
  if (v && typeof v === 'object') return 'object';
  return typeof v;
}

// 章节对比：资源和场景使用 id 做键，避免数组下标噪音
function diffChapter(oldCh, newCh) {
  const ops = [];
  diffAny(oldCh?.meta || {}, newCh?.meta || {}, '/meta', ops);
  diffArrayById(oldCh?.resources?.images || [], newCh?.resources?.images || [], 'id', '/resources/images', ops);
  diffArrayById(oldCh?.resources?.audios || [], newCh?.resources?.audios || [], 'id', '/resources/audios', ops);
  diffArrayById(oldCh?.scenes || [], newCh?.scenes || [], 'id', '/scenes', ops);
  return ops;
}

function diffArrayById(oldArr, newArr, idKey, path, ops) {
  const oldMap = new Map();
  const newMap = new Map();
  oldArr.forEach((it, i) => {
    const key = it && it[idKey] ? it[idKey] : `__idx_${i}`;
    oldMap.set(key, it);
  });
  newArr.forEach((it, i) => {
    const key = it && it[idKey] ? it[idKey] : `__idx_${i}`;
    newMap.set(key, it);
  });
  const keys = new Set([...oldMap.keys(), ...newMap.keys()]);
  for (const key of keys) {
    const p = `${path}/${escPtr(key)}`;
    if (!oldMap.has(key)) {
      ops.push({ op: 'add', path: p, oldValue: undefined, newValue: newMap.get(key) });
    } else if (!newMap.has(key)) {
      ops.push({ op: 'remove', path: p, oldValue: oldMap.get(key), newValue: undefined });
    } else {
      diffAny(oldMap.get(key), newMap.get(key), p, ops);
    }
  }
}

function diffAny(a, b, path, ops) {
  if (a === b) return;
  const ta = typeOfVal(a);
  const tb = typeOfVal(b);
  if (ta !== tb) {
    ops.push({ op: 'replace', path, oldValue: a, newValue: b });
    return;
  }
  if (ta === 'array') {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}/${i}`;
      if (i >= a.length) {
        ops.push({ op: 'add', path: p, oldValue: undefined, newValue: b[i] });
      } else if (i >= b.length) {
        ops.push({ op: 'remove', path: p, oldValue: a[i], newValue: undefined });
      } else {
        diffAny(a[i], b[i], p, ops);
      }
    }
    return;
  }
  if (ta === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const p = `${path}/${escPtr(k)}`;
      if (!(k in a)) {
        ops.push({ op: 'add', path: p, oldValue: undefined, newValue: b[k] });
      } else if (!(k in b)) {
        ops.push({ op: 'remove', path: p, oldValue: a[k], newValue: undefined });
      } else {
        diffAny(a[k], b[k], p, ops);
      }
    }
    return;
  }
  // primitive
  ops.push({ op: 'replace', path, oldValue: a, newValue: b });
}

function exportProject() {
  if (EditorState.chapters.size === 0) {
    alert('暂无章节可导出');
    return;
  }
  
  // 生成所有章节文件
  EditorState.chapters.forEach((chapter, num) => {
    const jsCode = generateChapterJS(num, chapter);
    downloadFile(`chapter${num}.js`, jsCode);
  });
  
  // 生成资源导出说明
  if (EditorState.resources.images.length > 0 || EditorState.resources.audios.length > 0) {
    let resourceInfo = '# 资源文件说明\n\n';
    resourceInfo += '请将以下资源文件放入对应目录：\n\n';
    
    resourceInfo += '## 图片资源\n';
    EditorState.resources.images.forEach(img => {
      resourceInfo += `- ${img.name} → images/${img.category}/\n`;
    });
    
    resourceInfo += '\n## 音频资源\n';
    EditorState.resources.audios.forEach(audio => {
      resourceInfo += `- ${audio.name} → audios/${audio.category}/\n`;
    });
    
    downloadFile('资源放置说明.txt', resourceInfo);
  }
  
  alert('导出完成！\n\n章节文件已下载。\n请将 chapter*.js 文件放入 chapters/ 目录。\n如有资源文件，请按照"资源放置说明.txt"中的指引放置。');
}

// 重新加载项目中的章节
function reloadFromProject() {
  if (!confirm('重新加载将会用项目中的章节覆盖当前编辑器中的数据（未保存的修改会丢失）。\n\n确定要继续吗？')) {
    return;
  }
  
  // 清空当前数据
  EditorState.chapters.clear();
  EditorState.baselineChapters.clear();
  EditorState.currentChapter = null;
  EditorState.currentChapterIndex = null;
  
  // 重新加载
  loadExistingChapters();
  // 同步全局资源表（让资源下拉不会空）
  __injectDefaultImageResourcesOnce();
  
  alert('已重新加载项目章节！\n\n如果刚才修改了 chapter*.js 文件，请刷新浏览器页面才能看到更新。');
}

