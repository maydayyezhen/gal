/**
 * chapter1.js - 第一章注册入口
 *
 * 章节数据已拆分到 chapters/chapter1_parts/，避免单个剧本文件超过 1000 行。
 */
(function () {
  var data = window.CHAPTER1_DATA || {};
  chapterLoader.registerChapter(1, {
    meta: data.meta || {},
    resources: data.resources || { images: [], audios: [] },
    scenes: [].concat((data.scenes_01 || []), (data.scenes_02 || []), (data.scenes_03 || []))
  });
})();
