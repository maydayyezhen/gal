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
// 这里的字段对齐 game_project/engine/effects/effects.js + sceneManager.js 里对白行的触发逻辑
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
// 对齐 game_project/engine/animation/characterAnimations.js 支持的动作类型
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

