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

