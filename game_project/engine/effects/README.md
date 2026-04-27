# engine/effects

视觉特效层。

后续用于放置：

```text
effects.js
particleSystem.js
visualEffects.css
```

职责：

- 屏幕震动、闪光、模糊、闭眼、睁眼等画面特效。
- 施法、光束、受击、烟雾、纸张消散等局部特效。
- 粒子系统。

注意：

- effects 层只负责视觉表现。
- 是否触发特效由剧本 `effects` 字段或 scene 层决定。
- 如果后续继续拆分，优先把粒子、全屏氛围、局部战斗特效分开。
