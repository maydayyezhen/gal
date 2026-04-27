# Galgame 项目架构说明

本文档用于说明当前 `game_project/` 的整体结构、运行链路和后续分层方向。

> 当前项目是一个纯静态 Web Galgame / 视觉小说项目，主要由 HTML、CSS 和原生 JavaScript 组成。

## 1. 当前项目定位

`game_project/` 同时包含两部分能力：

1. **游戏运行端**：负责标题页、剧情播放、背景切换、立绘显示、对白推进、选择分支、存档读档、音效、特效与动画。
2. **可视化编辑器**：负责章节、场景、对白、资源、导出和 Playtest 的编辑流程。

当前没有使用构建工具，也没有模块打包流程。所有脚本都依赖 HTML 中的 `<script>` 标签按顺序加载，并通过全局对象 `window.GG` 与 `chapterLoader` 协作。

## 2. 当前目录结构

```text
game_project/
├── index.html              # 标题页 / 游戏入口
├── game.html               # 游戏主运行页
├── title.html              # 备用标题页
├── editor.html             # 可视化剧本编辑器页面
│
├── editor/
│   └── editor.js           # 编辑器核心逻辑
│
├── chapters/
│   ├── chapter1.js         # 第一章正式剧本
│   └── chapter2.js         # 后续章节模板 / 预留
│
├── scripts/
│   └── chapterLoader.js    # 章节注册、获取与合并
│
├── js/                     # 游戏运行时脚本，当前仍为平铺结构
│   ├── main.js
│   ├── scriptLoader.js
│   ├── resourceLoader.js
│   ├── sceneManager.js
│   ├── choiceManager.js
│   ├── effects.js
│   ├── characterAnimations.js
│   ├── particleSystem.js
│   ├── itemDisplay.js
│   ├── items.js
│   ├── audio-generator.js
│   ├── title.js
│   ├── title_music.js
│   └── utils.js
│
├── config/
│   └── resources.js        # 资源路径配置 / 旧版兼容配置
│
├── css/
│   └── style.css           # 游戏端样式
│
├── images/
├── audios/
├── archive/
└── docs/
```

## 3. 游戏运行链路

游戏端的核心加载流程如下：

```text
index.html / game.html
        ↓
scripts/chapterLoader.js
        ↓
chapters/chapter*.js
        ↓
chapterLoader.registerChapter()
        ↓
chapterLoader.getMergedScriptData()
        ↓
SCRIPT_DATA
        ↓
js/scriptLoader.js 校验剧本并补齐资源
        ↓
js/resourceLoader.js 预加载资源
        ↓
js/main.js 启动游戏主流程
        ↓
js/sceneManager.js 渲染场景、对白、角色与舞台演出
```

其中：

- `chapterLoader` 负责章节注册与合并。
- `SCRIPT_DATA` 是运行时统一使用的剧本对象。
- `scriptLoader.js` 会校验 `SCRIPT_DATA`，并扫描剧本引用的背景、立绘、道具、音频，补齐遗漏资源。
- `resourceLoader.js` 负责图片、音频预加载，并在图片不存在时生成 Canvas 占位图。
- `main.js` 负责游戏启动、存档读档、设置面板、对话记录、AUTO / SKIP、返回标题页等主流程。
- `sceneManager.js` 负责背景、立绘、对白、场景切换、stage 指令和编辑器预览。

## 4. 编辑器运行链路

编辑器入口是：

```text
editor.html
        ↓
scripts/chapterLoader.js
        ↓
chapters/chapter*.js
        ↓
editor/editor.js
        ↓
读取项目章节 / 编辑章节 / 导出章节 / Playtest
```

编辑器当前主要能力：

- 读取已有项目章节。
- 新建章节。
- 编辑章节信息。
- 添加、删除、排序场景。
- 编辑场景背景、BGM、初始立绘、对白、选择分支、特效和 stage 指令。
- 管理全局资源和默认资源候选。
- 保存本地草稿。
- 导出 `chapter*.js`。
- 通过 `game.html?scene=xxx&line=xxx` 做场景级或对白级 Playtest。

## 5. 当前已形成的模块边界

虽然 `js/` 目录仍是平铺结构，但内部已经有一些职责分离：

```text
main.js                  # 游戏主流程
scriptLoader.js          # 剧本读取与资源兜底
resourceLoader.js        # 资源预加载
sceneManager.js          # 场景渲染与对白推进
effects.js               # 视觉特效
characterAnimations.js   # 角色动画
particleSystem.js        # 粒子系统
choiceManager.js         # 选择分支
itemDisplay.js           # 道具展示
audio-generator.js       # 生成式音频 / BGM
title.js                 # 标题页逻辑
title_music.js           # 标题音乐
utils.js                 # 通用工具
```

也就是说，当前不是完全没有分层，而是“有模块雏形，但目录层级和职责边界还不够清晰”。

## 6. 当前主要结构问题

### 6.1 游戏脚本平铺

`js/` 目录下同时放了核心流程、场景渲染、资源加载、音频、标题页、特效、动画等文件。随着功能变多，查找和维护成本会上升。

### 6.2 `sceneManager.js` 职责过重

`sceneManager.js` 目前同时承担：

- 场景生命周期管理。
- 背景切换。
- 立绘创建、替换、移动与高亮。
- 对白推进。
- stage 指令执行。
- Playtest / Preview 支持。

后续应逐步拆出背景渲染、角色渲染、stage 指令和预览逻辑。

### 6.3 编辑器文件膨胀

`editor.html` 内联了大量 CSS，`editor/editor.js` 也同时承担章节、场景、资源、导出、差异对比、QA 检查等职责。

后续需要先拆样式，再拆编辑器逻辑。

### 6.4 资源配置来源重复

当前资源来源包括：

- `chapter*.js` 内的 `resources.images` / `resources.audios`。
- `scriptLoader.js` 的自动资源补齐。
- `editor.js` 的默认资源注入。
- `config/resources.js` 的旧版 / 辅助资源配置。

后续需要统一资源配置策略，避免同一个资源在多个地方重复维护。

### 6.5 章节启用依赖手动 `<script>` 引入

当前纯静态结构下，新增章节需要同步修改 `index.html` 和 `game.html` 中的 `<script src="chapters/chapterX.js"></script>`。

如果章节数量增加，建议引入 `chapters/manifest.js` 统一维护章节列表。

## 7. 推荐目标分层

长期目标可以整理为：

```text
game_project/
├── engine/                    # 游戏运行时引擎
│   ├── core/                  # 主流程、工具、剧本读取
│   ├── scene/                 # 场景生命周期、对白推进、选择分支、stage 指令
│   ├── render/                # 背景、角色、道具渲染
│   ├── animation/             # 角色动画
│   ├── effects/               # 视觉特效、粒子系统
│   ├── audio/                 # 音频、BGM、标题音乐
│   ├── resource/              # 资源加载、资源路径解析
│   ├── title/                 # 标题页逻辑
│   └── preview/               # 编辑器预览 / Playtest 支持
│
├── editor/                    # 可视化编辑器
│   ├── state.js
│   ├── editor.js
│   ├── chapterEditor.js
│   ├── sceneEditor.js
│   ├── dialogEditor.js
│   ├── resourcePanel.js
│   ├── exporter.js
│   ├── diffViewer.js
│   ├── qaChecker.js
│   └── playtest.js
│
├── chapters/                  # 章节剧本
├── config/                    # 项目配置
├── styles/                    # 样式
├── images/                    # 图片资源
├── audios/                    # 音频资源
├── docs/                      # 文档
└── archive/                   # 归档
```

## 8. 重构原则

后续整理时应遵守以下原则：

1. **先文档，后代码**：先固定架构与职责边界，再移动文件。
2. **先拆样式，再拆逻辑**：CSS 拆分风险低，JS 拆分风险高。
3. **先移动文件，再拆函数**：避免同时改路径和改逻辑造成问题难定位。
4. **保持全局对象兼容**：在引入构建工具前，继续保持 `window.GG` 和 `chapterLoader` 的全局访问方式。
5. **保持 script 加载顺序**：纯静态模式下，脚本顺序就是依赖顺序，不能随意调整。
6. **每次只做一个小阶段**：每次提交都应能独立运行和回滚。
7. **运行逻辑优先稳定**：游戏端和编辑器端能跑比目录漂亮更重要。

## 9. 后续优先级

推荐顺序：

1. 补充架构文档和重构计划。
2. 拆分 `editor.html` 内联 CSS。
3. 新建 `styles/`，逐步迁移样式。
4. 在不改逻辑的前提下，把 `js/` 移动到 `engine/` 子目录。
5. 再拆 `sceneManager.js` 的背景、角色、stage、preview 逻辑。
6. 最后拆 `editor/editor.js`。

当前文档属于第一步。