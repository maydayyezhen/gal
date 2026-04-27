# 结构整理说明

本版本面向“直接替换 master”的静态项目结构整理，重点是拆大文件、分清职责目录，并保持原生 HTML/CSS/JavaScript 的运行方式。

## 1. 编辑器大文件拆分

### 1.1 `editor.html` 样式抽离

原本 `editor.html` 内联了大量 `<style>` 样式。现在已拆为：

```text
editor.html
styles/editor.css
```

`editor.html` 中只保留：

```html
<link rel="stylesheet" href="styles/editor.css">
```

### 1.2 `editor/editor.js` 拆分

原 `editor/editor.js` 体积较大，现在变成轻量入口加载器，实际代码在：

```text
editor/parts/
├── 01-state-and-resources.js
├── 02-init-drafts-chapters-scenes.js
├── 03-scene-form-and-basic-preview.js
├── 04-preview-state-and-stage.js
├── 05-dialog-editor.js
├── 06-preview-and-resource-tools.js
├── 07-chapter-settings-save.js
└── 08-qa-diff-export.js
```

当前仍然是普通 `<script>` 方式，不是 ES Module。分片之间共享全局作用域，因此加载顺序不能乱改。

## 2. 游戏运行时代码分层

原先平铺在 `js/` 下的运行时代码已迁移到：

```text
engine/
├── core/
│   ├── main.js
│   ├── scriptLoader.js
│   └── utils.js
├── scene/
│   ├── choiceManager.js
│   └── sceneManager.js
├── render/
│   ├── itemDisplay.js
│   └── items.js
├── animation/
│   └── characterAnimations.js
├── effects/
│   ├── effects.js
│   └── particleSystem.js
├── audio/
│   ├── audio-generator.js
│   └── title_music.js
├── resource/
│   └── resourceLoader.js
├── title/
│   └── title.js
└── preview/
    └── previewBridge.js
```

对应入口页已经更新：

- `game.html`
- `index.html`
- `title.html`
- `preview.html`
- `editor.html`

## 3. 注意事项

当前项目仍然是纯静态网页，不使用 ES Module 或构建工具。

所有脚本依赖 `<script>` 顺序加载。修改 HTML 或 `editor/editor.js` 的加载顺序时要谨慎。

## 4. 建议验收

参考：

```text
docs/validation-checklist.md
```
