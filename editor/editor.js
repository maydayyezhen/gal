/**
 * editor.js - 编辑器入口加载器
 *
 * 原文件体积较大，已拆分到 editor/parts/。
 * 本文件只负责按顺序加载分片，保持纯静态 HTML 的使用方式。
 */
(function () {
  var parts = [
    'editor/parts/01-state-and-resources.js',
    'editor/parts/02-init-drafts-chapters-scenes.js',
    'editor/parts/03-scene-form-and-basic-preview.js',
    'editor/parts/04-preview-state-and-stage.js',
    'editor/parts/05-dialog-editor.js',
    'editor/parts/06-preview-and-resource-tools.js',
    'editor/parts/07-chapter-settings-save.js',
    'editor/parts/08-qa-diff-export.js'
  ];

  parts.forEach(function (src) {
    document.write('<script src="' + src + '"><\/script>');
  });
})();
