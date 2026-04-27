# Galgame Engine & Editor

这是一个基于原生 Web 技术实现的视觉小说 / Galgame 项目，包含游戏运行端与可视化剧本编辑器。

> 当前项目主体位于 `game_project/` 目录下。

## 项目定位

本仓库主要用于维护一个轻量级 Web Galgame 制作与运行环境：

- 游戏端：负责标题页、剧情播放、背景切换、角色立绘、对白、选择分支、存档读档、音效与特效。
- 编辑器端：负责章节、场景、对白、资源与导出流程的可视化编辑。
- 剧本数据：通过 `chapters/chapter*.js` 形式注册章节，并由章节加载器合并为游戏运行时使用的 `SCRIPT_DATA`。

## 快速入口

进入项目主体目录：

```text
/game_project
```

常用入口文件：

```text
game_project/index.html      # 标题页 / 游戏入口
game_project/game.html       # 游戏主页面
game_project/editor.html     # 可视化剧本编辑器
```

本地预览方式：

1. 下载或克隆本仓库。
2. 进入 `game_project/`。
3. 双击 `index.html` 开始游戏，或双击 `editor.html` 打开编辑器。

如果浏览器对本地文件加载有限制，建议在 `game_project/` 下启动一个本地静态服务器，例如：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/index.html
http://localhost:8000/editor.html
```

## 项目文档

后续维护和重构优先参考：

```text
game_project/docs/architecture.md      # 当前架构、运行链路与目标分层
game_project/docs/refactor-plan.md     # 分阶段重构计划与风险控制
game_project/docs/script-format.md     # 章节、场景、对白、stage、choices 格式
game_project/docs/resource-rules.md    # 图片、音频、角色、背景、道具、特效资源规则
```

推荐先读 `architecture.md`，再按 `refactor-plan.md` 的顺序逐步整理。不要直接大规模移动文件，因为当前项目依赖纯静态 `<script>` 加载顺序。

## 目录结构概览

```text
game_project/
├── index.html              # 标题页 / 游戏入口
├── game.html               # 游戏主运行页
├── title.html              # 备用标题页
├── editor.html             # 可视化剧本编辑器
│
├── editor/
│   └── editor.js           # 编辑器核心逻辑
│
├── chapters/
│   ├── chapter1.js         # 第一章正式剧本
│   └── chapter2.js         # 后续章节模板 / 预留
│
├── scripts/
│   └── chapterLoader.js    # 章节注册、读取与合并
│
├── js/
│   ├── main.js             # 游戏主流程、存档、设置、日志
│   ├── scriptLoader.js     # 剧本读取、校验与资源兜底
│   ├── resourceLoader.js   # 图片 / 音频预加载与 fallback
│   ├── sceneManager.js     # 背景、立绘、对白、舞台演出渲染
│   ├── choiceManager.js    # 选择分支逻辑
│   ├── effects.js          # 画面特效
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
│   └── style.css
│
├── images/
│   ├── backgrounds/
│   ├── characters/
│   └── others/
│
├── audios/
│   ├── bgm/
│   ├── se/
│   └── voices/
│
├── docs/
│   ├── architecture.md
│   ├── refactor-plan.md
│   ├── script-format.md
│   └── resource-rules.md
│
└── archive/
    └── old_patches/
```

## 剧本章节机制

章节文件通过全局 `chapterLoader.registerChapter()` 注册，例如：

```javascript
chapterLoader.registerChapter(1, {
  meta: {},
  resources: {
    images: [],
    audios: []
  },
  scenes: []
});
```

运行时由 `chapterLoader.getMergedScriptData()` 合并所有已注册章节，并提供给游戏主流程使用。

当前纯静态版本需要在 `index.html` 和 `game.html` 中手动引入章节文件：

```html
<script src="chapters/chapter1.js"></script>
```

新增章节后，需要同步添加对应 `<script>` 引用。

## 编辑器使用建议

推荐创作流程：

1. 打开 `editor.html`。
2. 新建或选择章节。
3. 添加场景、对白、背景、BGM、角色立绘与分支。
4. 使用 Playtest 检查指定场景。
5. 保存并导出章节文件。
6. 将导出的章节文件放入 `chapters/` 目录。
7. 在 `index.html` / `game.html` 中引入新增章节。
8. 打开 `index.html` 或 `game.html` 测试完整流程。

## 维护说明

当前项目是纯静态结构，优点是部署简单，缺点是不能自动扫描本地目录。后续如果章节数量增多，可以考虑加入 `chapters/manifest.js` 统一维护章节列表，减少多个 HTML 文件中重复维护 `<script>` 标签的问题。

当前资源来源主要包括：

- 章节文件内的 `resources.images` / `resources.audios`
- `scriptLoader.js` 对剧本引用资源的自动补齐
- 编辑器内置的默认资源注入
- `config/resources.js` 中的旧版 / 辅助资源配置

后续如果继续重构，建议优先统一资源配置来源，避免同一资源在多个地方重复维护。

## 当前状态

- 项目类型：静态 Web Galgame / 视觉小说引擎
- 技术栈：HTML + CSS + 原生 JavaScript
- 主要入口：`game_project/index.html`
- 编辑器入口：`game_project/editor.html`
- 当前章节：`game_project/chapters/chapter1.js`

## 说明

本仓库为个人创作与实验项目，可继续扩展为更完整的视觉小说制作工具链。
