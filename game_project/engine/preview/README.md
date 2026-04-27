# engine/preview

编辑器预览与 Playtest 支持层。

后续用于放置：

```text
previewSceneAt.js
playtestBridge.js
```

职责：

- 支持编辑器从指定场景、指定对白行开始预览。
- 支持 `game.html?scene=xxx&line=xxx` 这类 Playtest 链路。
- 将编辑器预览逻辑从 `sceneManager.js` 中逐步拆出。

注意：

- 当前 `GG.previewSceneAt` 仍位于 `sceneManager.js` 中。
- 后续拆分时应保持 `GG.previewSceneAt(script, sceneOrId, targetIndex, options)` 的外部调用方式不变。
- 预览逻辑不应影响正式游戏运行流程。
