# editor/parts 目录说明

原 `editor/editor.js` 体积较大，已经拆成以下按顺序加载的脚本分片：

```text
01-state-and-resources.js
02-init-drafts-chapters-scenes.js
03-scene-form-and-basic-preview.js
04-preview-state-and-stage.js
05-dialog-editor.js
06-preview-and-resource-tools.js
07-chapter-settings-save.js
08-qa-diff-export.js
```

`editor/editor.js` 现在只是入口加载器，会用 `document.write` 顺序加载这些分片。

注意：

1. 当前仍是普通 `<script>` 加载，不是 ES Module。
2. 所有分片共享浏览器全局作用域。
3. 不要随意调整加载顺序。
4. 如果编辑器白屏，优先检查浏览器控制台是否有某个分片 404 或语法错误。
