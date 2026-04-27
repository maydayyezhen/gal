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

