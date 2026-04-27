# 项目功能汇总

## 🎮 游戏引擎 v1.2.0

这是一个完整的 Web 视觉小说游戏引擎，包含以下核心功能：

### ✨ 游戏特性

1. **完整的AVG系统**
   - 场景切换和背景管理
   - 角色立绘系统（多表情支持）
   - 对话系统（带角色名、语音）
   - 选择分支系统
   - 背景音乐和音效
   - 粒子特效系统
   - 角色动画（心跳、弹跳等）

2. **用户界面**
   - 标题菜单
   - 设置面板（音量、速度调节）
   - 对话历史记录
   - 快速存档/读档
   - 自动播放
   - 快进功能

3. **资源系统**
   - 图片资源加载
   - 音频资源管理
   - 预加载机制
   - 资源缓存

### 🎨 剧本编辑器

**核心功能：**
- ✅ 零代码可视化编辑
- ✅ 章节和场景管理
- ✅ 对话简化编辑
- ✅ 选择分支配置
- ✅ 资源导入管理
- ✅ 自动保存
- ✅ 一键导出

**支持格式：**
- 导出标准 JavaScript 章节文件
- 兼容游戏引擎原生格式
- 支持批量导出

### 📦 模块化设计

**章节系统：**
- 每个章节独立文件
- 动态加载机制
- 易于扩展

**资源配置：**
- 统一资源路径管理
- 自动资源ID映射
- 灵活的资源替换

### 🛠️ 开发工具

1. **剧本编辑器** (`editor.html`)
   - 可视化界面
   - 实时编辑
   - 资源管理

2. **章节加载器** (`scripts/chapterLoader.js`)
   - 章节注册
   - 数据合并
   - 版本管理

3. **资源配置** (`config/resources.js`)
   - 路径映射
   - 类型分类
   - 扩展接口

## 📂 完整文件清单

### 游戏主文件
- `index.html` - 游戏入口
- `game.html` - 游戏主页
- `title.html` - 标题页面

### 编辑器
- `editor.html` - 编辑器主页
- `editor/editor.js` - 编辑器逻辑

### 章节剧本
- `chapters/chapter1.js` - 第一章（示例）
- `chapters/chapter2.js` - 第二章（模板）

### 核心脚本
- `scripts/chapterLoader.js` - 章节加载器

### 游戏引擎 (`js/` 目录)
- `main.js` - 主程序
- `sceneManager.js` - 场景管理
- `scriptLoader.js` - 剧本加载
- `resourceLoader.js` - 资源加载
- `effects.js` - 特效系统
- `characterAnimations.js` - 角色动画
- `particleSystem.js` - 粒子系统
- `items.js` - 道具系统
- `itemDisplay.js` - 道具显示
- `choiceManager.js` - 选择管理
- `audio-generator.js` - 音频生成
- `title.js` - 标题逻辑
- `title_music.js` - 标题音乐
- `utils.js` - 工具函数

### 样式
- `css/style.css` - 游戏界面样式

### 资源目录
- `images/backgrounds/` - 背景图片
- `images/characters/` - 角色立绘
- `images/others/` - 其他图片
- `audios/bgm/` - 背景音乐
- `audios/se/` - 音效
- `audios/voices/` - 角色语音

### 配置文件
- `config/resources.js` - 资源路径配置

### 文档
- `README.md` - 项目说明
- `EDITOR_GUIDE.md` - 编辑器手册
- `QUICKSTART.md` - 快速开始
- `RESOURCES.md` - 资源说明
- `UPDATE.md` - 更新日志
- `START_HERE.txt` - 新手指引

### 归档
- `archive/old_patches/` - 历史文件

## 🔧 技术栈

- **前端框架**: 原生 JavaScript
- **样式**: CSS3
- **音频**: Web Audio API
- **图片**: Canvas API
- **动画**: CSS Transitions + requestAnimationFrame
- **存储**: localStorage

## 📊 项目统计

- **代码行数**: ~5000+ 行
- **文件数量**: 50+ 个文件
- **文档页数**: 7 个主要文档
- **示例章节**: 1 个完整章节
- **支持格式**: PNG, JPG, MP3

## 🎯 适用场景

1. **视觉小说游戏开发**
   - AVG/Galgame
   - 互动小说
   - 教育故事游戏

2. **原型开发**
   - 快速验证剧情
   - 演示Demo
   - 概念展示

3. **学习项目**
   - JavaScript 实践
   - 游戏开发入门
   - Web 技术学习

## 🚀 未来计划

- [ ] 更多角色动画效果
- [ ] 存档系统优化
- [ ] CG图片系统
- [ ] 更多特效选项
- [ ] 编辑器实时预览
- [ ] 多语言支持

## 📄 许可

本项目为个人创作项目，可自由使用和修改。

---

**项目版本**: v1.2.0  
**最后更新**: 2025-02-07  
**维护者**: 夜真 & 小栀
