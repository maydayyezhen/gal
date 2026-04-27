/**
 * chapters/chapter1/index.js - 第一章独立入口
 *
 * 本文件只负责组装并注册第一章。
 * 具体数据来源：
 * - chapters/chapter1_parts/meta.js
 * - chapters/chapter1_parts/resources.js
 * - chapters/chapter1_parts/scenes_01.js
 * - chapters/chapter1_parts/scenes_02.js
 * - chapters/chapter1_parts/scenes_03.js
 *
 * 后续目标：逐步把 chapter1_parts 迁入 chapters/chapter1/ 内部，
 * 最终形成每章独立目录。
 */
(function () {
  var data = window.CHAPTER1_DATA || {};

  chapterLoader.registerChapter(1, {
    meta: data.meta || {},
    resources: data.resources || { images: [], audios: [] },
    scenes: [].concat(
      data.scenes_01 || [],
      data.scenes_02 || [],
      data.scenes_03 || []
    )
  });
})();
