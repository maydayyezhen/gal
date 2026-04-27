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

