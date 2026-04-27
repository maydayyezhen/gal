/**
 * chapters/chapter1/index.js - 第一章独立入口
 *
 * 本文件只负责组装并注册第一章。
 * 新结构优先使用 chapters/chapter1/scenes/ 下的独立场景文件。
 * 尚未迁移的场景会继续从 chapter1_parts/scenes_02.js、scenes_03.js 读取。
 */
(function () {
  var data = window.CHAPTER1_DATA || {};
  var sceneMap = window.CHAPTER1_SCENES || {};
  var sceneOrder = window.CHAPTER1_SCENE_ORDER || [];

  var standaloneScenes = sceneOrder
    .map(function (sceneId) { return sceneMap[sceneId]; })
    .filter(function (scene) { return !!scene; });

  chapterLoader.registerChapter(1, {
    meta: data.meta || {},
    resources: data.resources || { images: [], audios: [] },
    scenes: [].concat(
      standaloneScenes,
      data.scenes_02 || [],
      data.scenes_03 || []
    )
  });
})();
