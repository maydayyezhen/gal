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
  // 常用效果依赖（对齐 engine/effects/effects.js 的写法）
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

