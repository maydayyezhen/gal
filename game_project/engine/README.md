# engine 目录说明

本目录用于承载后续逐步迁移过来的游戏运行时引擎代码。

当前项目的游戏运行时代码仍主要位于：

```text
game_project/js/
```

后续目标是把 `js/` 中平铺的脚本按职责移动到 `engine/` 下。

## 目标结构

```text
engine/
├── core/          # 游戏主流程、工具函数、剧本读取
├── scene/         # 场景生命周期、对白推进、选择分支、stage 指令
├── render/        # 背景、角色、道具渲染
├── animation/     # 角色动画
├── effects/       # 视觉特效、粒子系统
├── audio/         # 音频、生成式 BGM、标题音乐
├── resource/      # 资源加载、路径解析、fallback
├── title/         # 标题页逻辑
└── preview/       # 编辑器预览 / Playtest 支持
```

## 当前迁移原则

1. 第一轮只建目录和说明，不移动 JS 文件。
2. 第二轮如果移动 JS 文件，只做路径迁移，不改文件内容。
3. 移动后必须同步修改 HTML 中的 `<script src="...">`。
4. 纯静态模式下脚本加载顺序非常重要，不能随意调整顺序。
5. `window.GG` 仍是当前模块协作的全局对象，迁移目录时不改变它。

## 建议迁移映射

```text
js/main.js                  -> engine/core/main.js
js/utils.js                 -> engine/core/utils.js
js/scriptLoader.js          -> engine/core/scriptLoader.js
js/resourceLoader.js        -> engine/resource/resourceLoader.js
js/sceneManager.js          -> engine/scene/sceneManager.js
js/choiceManager.js         -> engine/scene/choiceManager.js
js/effects.js               -> engine/effects/effects.js
js/particleSystem.js        -> engine/effects/particleSystem.js
js/characterAnimations.js   -> engine/animation/characterAnimations.js
js/itemDisplay.js           -> engine/render/itemDisplay.js
js/items.js                 -> engine/render/items.js
js/audio-generator.js       -> engine/audio/audio-generator.js
js/title_music.js           -> engine/audio/title_music.js
js/title.js                 -> engine/title/title.js
```

## 验收点

每次迁移后至少验证：

```text
index.html 能打开标题页
game.html 能进入第一章
选择分支能跳转
存档读档可用
editor.html 能读取章节
Playtest 能跳转到指定场景
```
