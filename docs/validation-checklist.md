# 手动验收清单

## 游戏端

打开本地静态服务器：

```bash
cd game_project
python -m http.server 8000
```

访问：

```text
http://localhost:8000/index.html
http://localhost:8000/game.html
```

检查：

- 标题页正常显示
- 开始游戏可进入
- 对白能推进
- 分支按钮能显示并跳转
- BGM / SE 不报错
- 角色动画不报错
- 粒子特效不报错
- 道具展示不报错
- 控制台没有 404
- 控制台没有 `GG.xxx is not a function`

## 编辑器端

访问：

```text
http://localhost:8000/editor.html
```

检查：

- 编辑器页面样式正常
- 左侧章节列表正常
- 能读取 chapter1 / chapter2
- 能打开场景编辑器
- 能编辑对白
- 能导出章节
- Playtest 按钮能打开预览/游戏页
