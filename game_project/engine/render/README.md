# engine/render

渲染层。

后续用于放置：

```text
backgroundRenderer.js
characterRenderer.js
itemDisplay.js
items.js
```

职责：

- 背景渲染和切换。
- 角色立绘创建、替换、移动、高亮。
- 道具展示。
- 与 DOM 舞台层相关的显示逻辑。

注意：

- 渲染层不应直接决定剧情跳转。
- 渲染层可以被 scene 层调用。
