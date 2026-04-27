# engine 目录说明

游戏运行时引擎目录。

当前项目已从原先平铺的 `js/` 目录迁移到按职责分层的 `engine/` 目录：

```text
engine/
├── core/       # 主流程、工具函数、剧本读取
├── scene/      # 场景生命周期、对白推进、选择分支
├── render/     # 道具等渲染逻辑
├── animation/  # 角色动画
├── effects/    # 视觉特效与粒子
├── audio/      # 音频与生成式 BGM
├── resource/   # 资源预加载与解析
├── title/      # 标题页逻辑
└── preview/    # 编辑器预览桥接
```

本项目仍是纯静态网页，脚本顺序就是依赖顺序，修改 HTML 里的 `<script>` 顺序时要谨慎。
