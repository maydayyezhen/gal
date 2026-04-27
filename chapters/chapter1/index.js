/**
 * chapters/chapter1/index.js - 第一章独立入口
 *
 * 本文件只负责组装并注册第一章。
 * 场景数据全部来自 chapters/chapter1/scenes/ 下的独立场景文件。
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
    scenes: standaloneScenes
  });
})();
