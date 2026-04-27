# 快速开始指南 🚀

## 📦 项目已完成的改动

✅ **第一章剧本修改**
- 改为在白天结束（学校场景）
- 删除了立刻切换晚上的情节
- 晚上睡觉的内容保留为第二章开场模板

✅ **章节提示**
- 第一个场景开头添加：`——第一章 梦境恋爱事故——`
- 结尾场景添加：`——第一章 完——`

✅ **模块化结构**
- 创建 `chapters/` 目录存放各章节剧本
- 创建 `scripts/` 目录存放章节加载器
- 创建 `config/` 目录存放资源配置

## 🎮 如何运行游戏

### 方法一：直接打开（推荐）
双击 `game.html` 文件即可在浏览器中运行

### 方法二：本地服务器
如果遇到跨域问题，可以使用本地服务器：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# VS Code 插件
安装 Live Server 插件，右键 game.html → Open with Live Server
```

然后访问 `http://localhost:8000/game.html`

## 📝 添加你的资源

### 1. 添加图片
你说你有图片资源，按照这个方式放置：

```
images/
├── backgrounds/
│   ├── title.png          # 标题画面
│   ├── school.png         # 学校教室
│   ├── school_morning.png # 学校早晨
│   ├── rooftop.png        # 屋顶
│   ├── park.png           # 公园
│   ├── bedroom.png        # 卧室
│   ├── forest.png         # 梦境森林
│   ├── battle.png         # 战斗场景
│   └── vending_machine.png # 自动贩卖机
│
└── characters/
    ├── hina_normal.png    # 阳菜-普通
    ├── hina_happy.png     # 阳菜-开心
    ├── hina_serious.png   # 阳菜-严肃
    └── ... (参考 RESOURCES.md)
```

**直接替换即可**，文件名和路径已经在剧本中配置好了！

### 2. 替换音频（可选）
音频文件路径已经配置好，如果要替换：

```
audios/
├── bgm/
│   ├── bgm_daily.mp3      # 日常BGM
│   ├── bgm_dream_forest.mp3 # 梦境森林BGM
│   └── ...
├── se/
│   ├── bell.mp3           # 上课铃声
│   └── ...
└── voices/
    ├── hina_01.mp3        # 阳菜语音1
    └── ...
```

**直接替换同名文件即可**！

## 🆕 添加新章节

### 最简单的方式

1. **复制模板**
   ```bash
   cp chapters/chapter2.js chapters/chapter3.js
   ```

2. **修改章节号和标题**
   打开 `chapter3.js`，修改开头：
   ```javascript
   chapterLoader.registerChapter(3, {  // 改成 3
     "meta": {
       "chapterNumber": 3,
       "title": "第三章 你的标题",
       ...
   ```

3. **写你的剧情**
   在 `scenes` 数组中添加场景，参考第一章的写法

4. **引入新章节**
   在 `game.html` 中添加一行：
   ```html
   <script src="chapters/chapter3.js"></script>
   ```

详细教程请看 `README.md`！

## 📚 文档说明

- **README.md** - 完整的项目说明和教程
- **RESOURCES.md** - 资源文件规格和放置说明
- **QUICKSTART.md** (本文件) - 快速开始指南

## 🔧 常见问题

### Q1: 打开 game.html 什么都不显示？
**A:** 
- 检查浏览器控制台（F12）是否有错误
- 确保所有文件都在同一目录下
- 尝试使用本地服务器运行

### Q2: 图片/音频不显示/不播放？
**A:**
- 检查文件路径是否正确
- 检查文件名是否和剧本中的ID对应
- 参考 `RESOURCES.md` 确认文件格式

### Q3: 如何测试新章节？
**A:**
- 保存修改后刷新浏览器
- 打开控制台查看：`Loaded chapters: [1, 2, ...]`
- 从第一章玩到新章节的入口

### Q4: 想改第一章的剧情？
**A:**
- 编辑 `chapters/chapter1.js`
- 场景结构参考现有内容
- 不要改 `chapterLoader.registerChapter(1, {` 这一行

## 🎯 下一步做什么？

1. **添加你的图片资源** → 按照 `RESOURCES.md` 放置
2. **测试第一章** → 确保所有资源正常显示
3. **编写第二章** → 基于 `chapters/chapter2.js` 模板
4. **继续扩展** → 添加更多章节和剧情分支

## 💡 提示

- 剧本中的资源ID（如 `bg_school`）会自动映射到文件路径
- 不需要手动配置路径，只要文件名对应即可
- 每次修改后记得保存并刷新浏览器

---

**祝你创作愉快！** ✨

有问题随时参考 `README.md` 或查看第一章的源码学习。
