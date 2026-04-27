# 更新说明：v1.6.3 QA-01 / QA-02（编辑器校验 + 行级 Playtest）

本次更新把“写剧本最常见的两种翻车姿势”补上了：资源缺失不自知，以及想从某一句开始测却只能从头按到手抽筋。

## 变更内容

### QA-01：资源校验（引用 / 缺失 / 未使用 / 文件可加载性）
- 新增「🧪 校验/Playtest」Tab。
- 提供一键扫描：
  - **Missing**：剧本里引用了，但资源表里找不到（按 id 前缀识别：bg_/char_/item_/fx_/bgm_/se_/voice_）。
  - **Unused**：资源表里声明了，但当前扫描范围内剧本没用到。
  - **File Load Fail**：可选检测图片/音频路径是否能被浏览器加载（并做 cache-bust，避免缓存误判）。
- 支持范围：
  - 当前章节
  - 全部已加载章节（取决于 editor.html 中引用了哪些 chapters/*.js）

### QA-02：行级 Playtest
- 场景列表（章节编辑页）每个场景卡片右上角新增：**▶ Playtest**
  - 打开 `game.html?scene=<sceneId>&line=0&fromEditor=1`
- 场景编辑 Step-4（对话卡片）右上角新增：**▶ Playtest**
  - 打开 `game.html?scene=<sceneId>&line=<dialogIndex>&fromEditor=1`
- 游戏页 `js/main.js` 支持解析参数：
  - `scene` / `sceneId`
  - `line` / `dialog` / `dialogIndex`

## 使用方法
- 打开 `editor.html`
- 进入「🧪 校验/Playtest」Tab：
  - QA-01：配置扫描范围与是否检查文件，点“开始扫描”。
  - QA-02：直接点场景/对白上的 **▶ Playtest**。

---

## 测试过程 + 验收点（预期 / 实际）

### 用例 1：QA-01 资源校验（当前章节）
1) 打开 `editor.html`，选择任意章节。
2) 进入「🧪 校验/Playtest」Tab。
3) scope 选“当前章节”，勾选“包含全局资源表”“尝试检测文件是否可加载”。
4) 点击“开始扫描”。

预期：
- 页面出现报告区：包含 used/missing/unused/fileFail 统计。
- 若资源表缺失或路径错误，Missing / File Load Fail 表格应给出 id、推断类型、引用位置。

实际：
- ✅ 报告正常生成并可下载 markdown。
- ✅ Missing / Unused / File Load Fail 分区可见。

### 用例 2：QA-01 资源校验（全部已加载章节）
1) scope 切换为“全部已加载章节”。
2) 点击“开始扫描”。

预期：
- 统计范围覆盖 editor.html 已加载的 chapters/*.js。
- Missing 的引用位置会包含 chapterX/sceneId/dialogIndex 字段。

实际：
- ✅ 覆盖全部已加载章节，定位信息正常。

### 用例 3：QA-02 场景级 Playtest
1) 在「📝 场景编辑」列表中，点击某个场景的 **▶ Playtest**。

预期：
- 新标签页打开 `game.html`。
- 自动进入该场景第 1 句（line=0）。

实际：
- ✅ 正常打开并定位到 line=0。

### 用例 4：QA-02 行级 Playtest
1) 进入某场景编辑 Step-4（编辑对话）。
2) 在任意对话卡片右上角点击 **▶ Playtest**。

预期：
- 新标签页打开 `game.html?scene=...&line=...`。
- 游戏从该句开始渲染（相同 sceneId，dialogIndex 对齐）。

实际：
- ✅ 能从指定 line 开始播放。

