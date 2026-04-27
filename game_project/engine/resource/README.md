# engine/resource

资源加载层。

后续用于放置：

```text
resourceLoader.js
resourceResolver.js
```

职责：

- 图片和音频预加载。
- 资源 ID 到真实路径的解析。
- 图片加载失败时的 fallback。
- generated / placeholder 这类特殊资源处理。

注意：

- resource 层不应直接控制剧情流程。
- 资源命名和路径规则参考 `game_project/docs/resource-rules.md`。
