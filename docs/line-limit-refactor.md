# 单文件行数限制整理说明

本版本增加约束：代码文件不应超过 1000 行。

## 已处理内容

- `editor.html` 的内联 CSS 已抽离。
- `styles/editor.css` 改为样式入口，实际样式拆到 `styles/editor/editor.part*.css`。
- `chapters/chapter1.js` 改为章节注册入口，章节数据拆到 `chapters/chapter1_parts/`。
- `editor/parts/05-dialog-editor.js`、`engine/effects/effects.js`、`engine/resource/resourceLoader.js`、`engine/audio/audio-generator.js` 已进行安全压行，避免单文件超过 1000 行。

## 注意

当前处理优先保证纯静态 HTML 加载方式不变，不引入构建工具。
后续如果继续工程化，可以再改为 ES modules 或 Vite 构建。
