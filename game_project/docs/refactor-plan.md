# Galgame 项目重构计划

本文档记录 `game_project/` 后续整理和分层的推荐路线。

目标不是一次性推倒重写，而是在保持游戏和编辑器可运行的前提下，逐步把目录、样式、游戏引擎和编辑器逻辑整理清楚。

## 1. 当前状态判断

当前项目已经具备较完整的功能：

- 标题页。
- 游戏主页面。
- 章节剧本系统。
- 场景、对白、立绘、背景、BGM、SE、选择分支。
- AUTO / SKIP。
- 存档 / 读档。
- 视觉特效。
- 角色动画。
- 粒子系统。
- 道具展示。
- 可视化剧本编辑器。
- 场景级 / 对白级 Playtest。

当前问题主要不是“功能不完整”，而是：

- 文件目录不够分层。
- `js/` 文件平铺。
- `sceneManager.js` 和 `editor/editor.js` 职责偏重。
- `editor.html` 内联样式过多。
- 资源配置来源重复。
- 章节加载仍依赖手动 `<script>` 标签。

## 2. 总体重构原则

### 2.1 不做大爆炸式重构

不要一次提交同时做这些事情：

- 移动大量文件。
- 修改大量 `<script>` 路径。
- 拆函数。
- 改运行逻辑。
- 改资源路径。

否则一旦出错，很难判断是路径问题、加载顺序问题、函数拆分问题还是资源问题。

### 2.2 保持每次提交都可运行

每个阶段完成后，都应该至少能完成：

- 打开 `index.html`。
- 点击开始游戏。
- 进入 `game.html`。
- 打开 `editor.html`。
- 编辑器能读取已有章节。
- Playtest 能正常跳到指定场景。

### 2.3 先低风险，再高风险

推荐顺序：

```text
文档 → CSS → 路径移动 → 小模块拆分 → 大模块拆分 → 资源策略统一
```

## 3. 阶段一：文档与边界确认

状态：已开始。

目标：先固定项目结构、职责边界和后续路线。

建议文件：

```text
game_project/docs/architecture.md
game_project/docs/refactor-plan.md
game_project/docs/script-format.md
game_project/docs/resource-rules.md
```

其中：

- `architecture.md`：说明当前架构、运行链路和目标分层。
- `refactor-plan.md`：说明重构步骤和风险控制。
- `script-format.md`：说明章节、场景、对白、stage、choices、resources 的格式。
- `resource-rules.md`：说明图片、音频、角色、背景、道具、特效资源的命名与路径规则。

验收点：

- 仓库根 README 能指向项目主体。
- `game_project/docs/architecture.md` 存在。
- `game_project/docs/refactor-plan.md` 存在。
- 不改任何运行逻辑。

## 4. 阶段二：拆分编辑器样式

目标：把 `editor.html` 中的大量内联 CSS 移动到独立文件，降低 HTML 体积。

推荐新增：

```text
game_project/styles/editor.css
```

修改：

```text
game_project/editor.html
```

将原本 `<style>...</style>` 中的样式迁移到 `styles/editor.css`，然后在 `editor.html` 中引入：

```html
<link rel="stylesheet" href="styles/editor.css">
```

注意：

- 只移动 CSS，不改 HTML 结构。
- 不改 JS。
- 不改 class 名。
- 不改 id。

验收点：

- 打开 `editor.html` 后样式不丢失。
- 侧边栏、章节列表、场景卡片、模态框仍正常显示。
- 场景编辑弹窗能打开。

风险：低。

## 5. 阶段三：整理游戏端样式

目标：把游戏端 CSS 从旧 `css/` 逐步统一到 `styles/`。

推荐目标：

```text
game_project/styles/game.css
game_project/styles/title.css
game_project/styles/editor.css
```

短期可先保留旧路径：

```text
game_project/css/style.css
```

不要急着删除旧文件。可以先新增 `styles/`，等全部 HTML 都稳定引用新路径后，再考虑是否归档旧 CSS。

验收点：

- 标题页样式正常。
- 游戏页样式正常。
- 编辑器样式正常。

风险：中低。

## 6. 阶段四：目录迁移 `js/` 到 `engine/`

目标：只移动文件，不拆逻辑。

推荐迁移：

```text
js/main.js                  → engine/core/main.js
js/utils.js                 → engine/core/utils.js
js/scriptLoader.js          → engine/core/scriptLoader.js
js/resourceLoader.js        → engine/resource/resourceLoader.js
js/sceneManager.js          → engine/scene/sceneManager.js
js/choiceManager.js         → engine/scene/choiceManager.js
js/effects.js               → engine/effects/effects.js
js/particleSystem.js        → engine/effects/particleSystem.js
js/characterAnimations.js   → engine/animation/characterAnimations.js
js/itemDisplay.js           → engine/render/itemDisplay.js
js/items.js                 → engine/render/items.js
js/audio-generator.js       → engine/audio/audio-generator.js
js/title_music.js           → engine/audio/title_music.js
js/title.js                 → engine/title/title.js
```

同时修改：

```text
index.html
game.html
title.html
editor.html
```

把 `<script src="js/xxx.js"></script>` 改成新路径。

注意：

- 文件内容先不动。
- 加载顺序不能改。
- 旧路径如果暂时不删除，会降低风险。

验收点：

- `index.html` 能进入标题页。
- `game.html` 能启动第一章。
- `editor.html` 能读取章节。
- Playtest 能跳转到 `game.html?scene=xxx&line=xxx`。

风险：中。

## 7. 阶段五：拆分 `sceneManager.js`

目标：拆出最重的游戏端模块。

建议拆分：

```text
engine/scene/sceneManager.js        # 场景生命周期
engine/scene/dialogRunner.js        # 对白推进、打字机、点击推进
engine/scene/stageCommands.js       # stage.showChars / hideChars / swapChars / moveChars
engine/render/backgroundRenderer.js # 背景双层交叉淡入
engine/render/characterRenderer.js  # 角色立绘创建、替换、移动、高亮
engine/preview/previewSceneAt.js    # 编辑器预览专用
```

拆分原则：

- 先把纯函数和小工具函数拆出去。
- 保持对外 API 不变，例如 `GG.renderScene`、`GG.renderSceneAt`、`GG.previewSceneAt`。
- 每拆一个子模块就测试一次。

验收点：

- 对白推进正常。
- 背景切换正常。
- 角色出场、替换、移动正常。
- 选择分支正常。
- Playtest 正常。

风险：高。

## 8. 阶段六：拆分编辑器逻辑

目标：降低 `editor/editor.js` 复杂度。

建议拆分：

```text
editor/state.js             # EditorState 和全局状态
editor/resourceStore.js     # 全局资源、默认资源注入、资源路径查询
editor/chapterStore.js      # 章节加载、新建、删除、选择
editor/sceneEditor.js       # 场景列表与场景编辑弹窗
editor/dialogEditor.js      # 对白编辑、角色选择、对白特效面板
editor/exporter.js          # 导出 chapter*.js
editor/playtest.js          # game.html?scene=xxx&line=xxx
editor/diffViewer.js        # 改动对比
editor/qaChecker.js         # QA 检查
editor/editor.js            # 入口初始化
```

拆分原则：

- 先按功能移动函数，不急着改调用关系。
- 可以继续使用全局函数，后续再逐步收口命名空间。
- 不要同时改 UI 结构。

验收点：

- 编辑器能加载章节。
- 能新建章节。
- 能添加场景。
- 能编辑对白。
- 能导出章节。
- 能 Playtest。

风险：高。

## 9. 阶段七：统一资源策略

目标：明确资源配置的唯一主线。

当前资源来源：

```text
chapter*.js resources
scriptLoader.js 自动兜底
editor.js 默认资源注入
config/resources.js 旧配置
```

推荐方向：

1. 章节文件中的 `resources` 作为运行时主配置。
2. 编辑器负责生成和维护章节 `resources`。
3. `scriptLoader.js` 保留兜底扫描，但只作为容错，不作为主要配置来源。
4. `config/resources.js` 要么升级为全局资源清单，要么归档为旧版兼容文件。

可以考虑新增：

```text
game_project/config/resource-manifest.js
```

用于统一列出项目中可选资源。

风险：中高。

## 10. 阶段八：章节 manifest 化

目标：避免 `index.html` 和 `game.html` 都要手动维护章节 `<script>`。

纯静态项目不能直接扫描目录，但可以维护一个显式清单：

```text
game_project/chapters/manifest.js
```

示例：

```javascript
window.CHAPTER_MANIFEST = [
  'chapters/chapter1.js',
  'chapters/chapter2.js'
];
```

不过注意：如果不用模块加载器，动态加载脚本会引入异步加载问题，需要等所有章节脚本加载完成后再调用 `getMergedScriptData()`。

因此这个阶段不应太早做。

风险：中高。

## 11. 推荐近期行动

近期最适合做的三步：

```text
1. 补文档：architecture.md / refactor-plan.md
2. 拆 editor.html 内联 CSS 到 styles/editor.css
3. 整理 docs 和 README 链接
```

暂时不建议立刻拆 `sceneManager.js` 和 `editor/editor.js`，因为这两个文件虽然大，但都是核心运行链路，直接拆容易把可运行状态弄坏。

## 12. 每阶段提交建议

提交信息建议：

```text
docs: add architecture overview
docs: add refactor plan
style: extract editor styles
refactor: move runtime scripts into engine folders
refactor: split stage commands from scene manager
refactor: split editor resource store
```

每次提交只做一类事情，方便回滚和定位问题。