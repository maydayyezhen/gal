# engine/scene

场景流程层。

后续用于放置：

```text
sceneManager.js
choiceManager.js
stageCommands.js
dialogRunner.js
```

职责：

- 场景生命周期管理。
- 对白推进。
- 选择分支。
- stage 指令解析与执行。
- 场景结束后的跳转处理。

注意：

- `sceneManager.js` 当前职责较重，后续应逐步拆分。
- 拆分时要保持 `GG.renderScene`、`GG.renderSceneAt`、`GG.handleClick` 等外部 API 不变。
