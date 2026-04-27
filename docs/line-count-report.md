# 单文件行数检查报告

检查范围：`*.js`、`*.html`、`*.css`

结论：没有超过 1000 行的代码文件。

## 最大文件 Top 40

| 文件 | 行数 |
|---|---:|
| engine/scene/sceneManager.js | 996 |
| styles/editor/editor.part01.css | 850 |
| editor/parts/08-qa-diff-export.js | 844 |
| editor/parts/06-preview-and-resource-tools.js | 832 |
| chapters/chapter1_parts/scenes_02.js | 810 |
| styles/editor/editor.part02.css | 776 |
| engine/title/title.js | 739 |
| chapters/chapter1_parts/scenes_01.js | 718 |
| chapters/chapter1_parts/scenes_03.js | 592 |
| engine/audio/title_music.js | 539 |
| editor/parts/03-scene-form-and-basic-preview.js | 502 |
| engine/core/utils.js | 488 |
| engine/core/main.js | 482 |
| engine/effects/particleSystem.js | 456 |
| css/style.css | 421 |
| editor/parts/02-init-drafts-chapters-scenes.js | 416 |
| chapters/chapter1_parts/resources.js | 376 |
| editor/parts/04-preview-state-and-stage.js | 324 |
| engine/render/items.js | 309 |
| engine/render/itemDisplay.js | 287 |
| editor/parts/07-chapter-settings-save.js | 251 |
| engine/animation/characterAnimations.js | 232 |
| engine/core/scriptLoader.js | 231 |
| editor/parts/01-state-and-resources.js | 225 |
| editor.html | 201 |
| editor/parts/05-dialog-editor.js | 178 |
| engine/preview/previewBridge.js | 144 |
| chapters/chapter2.js | 131 |
| game.html | 126 |
| engine/effects/effects.js | 122 |
| engine/resource/resourceLoader.js | 115 |
| engine/audio/audio-generator.js | 112 |
| scripts/chapterLoader.js | 111 |
| config/resources.js | 98 |
| engine/scene/choiceManager.js | 96 |
| title.html | 87 |
| index.html | 87 |
| preview.html | 65 |
| editor/editor.js | 22 |
| chapters/chapter1_parts/meta.js | 15 |

## 处理摘要

- 最大文件：`engine/scene/sceneManager.js`，996 行。
- `chapter1.js` 已改为注册入口，章节数据拆到 `chapters/chapter1_parts/`。
- `editor.css` 已改为样式入口，样式拆到 `styles/editor/`。
- 超限 JS 文件已压到 1000 行以内。
