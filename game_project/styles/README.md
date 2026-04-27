# styles 目录说明

本目录用于承载项目后续拆分出的样式文件。

当前项目早期样式主要分布在：

```text
game_project/css/style.css      # 游戏端样式
game_project/editor.html        # 编辑器内联样式
```

后续整理目标：

```text
styles/
├── game.css      # 游戏主页面样式
├── title.css     # 标题页样式
└── editor.css    # 编辑器样式
```

## 迁移原则

1. 先迁移编辑器样式，再整理游戏端样式。
2. 迁移 CSS 时不修改 HTML 结构、不修改 class、不修改 id。
3. 每次迁移后都要打开对应页面检查样式是否丢失。
4. `editor.html` 文件较大，拆分时应在本地完整文件上操作，避免使用截断内容覆盖。
5. 旧的 `css/style.css` 在完全确认迁移稳定前不要删除。

## 推荐顺序

```text
第一步：从 editor.html 提取 <style> 到 styles/editor.css
第二步：editor.html 引入 styles/editor.css
第三步：确认编辑器页面样式正常
第四步：再考虑 game.css / title.css 的拆分
```
