# engine/animation

动画层。

后续用于放置：

```text
characterAnimations.js
```

职责：

- 角色动作动画。
- 角色待机动画。
- 受击、心跳、跳跃、摇晃等角色级动画。

注意：

- 动画层只负责角色动画表现。
- 具体什么时候播放动画，应由 scene 层或 stage 指令决定。
