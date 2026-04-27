# 梦境恋爱事故 - 项目说明文档

## 🎮 项目简介

这是一个基于 Web 的视觉小说游戏引擎，配备可视化剧本编辑器。
你可以使用编辑器轻松创建自己的Galgame，无需编写代码。

## ⚡ 快速开始

### 方式一：直接游玩（推荐新手）
1. 双击 `index.html` 或 `game.html` 打开游戏
2. 点击"开始游戏"体验第一章剧情

### 方式二：使用编辑器创作
1. 双击 `editor.html` 打开剧本编辑器
2. 创建新章节并编辑剧情
3. 导入图片和音频资源
4. 导出章节文件到 `chapters/` 目录
5. 运行游戏查看效果

**详细教程请看：**
- 编辑器使用 → `EDITOR_GUIDE.md` ⭐推荐
- 游戏资源 → `RESOURCES.md`
- 快速上手 → `QUICKSTART.md`

## 📁 项目结构

```
game_project/
├── editor.html            # 🎨 剧本编辑器（推荐使用）
├── index.html             # 游戏入口（标题页面）
├── game.html              # 游戏主页面
├── title.html             # 备用标题页
│
├── editor/                # 📝 编辑器核心代码
│   └── editor.js         # 编辑器逻辑
│
├── chapters/              # 📖 章节剧本目录
│   ├── chapter1.js       # 第一章剧本
│   ├── chapter2.js       # 第二章剧本（模板）
│   └── ...               # 继续添加新章节
│
├── scripts/              # 📜 核心脚本
│   └── chapterLoader.js  # 章节加载器
│
├── config/               # ⚙️ 配置文件
│   └── resources.js      # 资源路径配置
│
├── js/                   # 🎮 游戏引擎代码
│   ├── main.js          # 主程序
│   ├── sceneManager.js  # 场景管理
│   ├── effects.js       # 特效系统
│   └── ...
│
├── audios/              # 🎵 音频资源
│   ├── bgm/            # 背景音乐
│   ├── se/             # 音效
│   └── voices/         # 角色语音
│
├── images/              # 🖼️ 图片资源
│   ├── backgrounds/    # 背景图
│   ├── characters/     # 角色立绘
│   └── others/         # 其他图片
│
├── css/                 # 🎨 样式文件
│   └── style.css
│
├── archive/             # 📦 归档（旧文件）
│   └── old_patches/    # 历史补丁和备份
│
└── 文档/
    ├── README.md            # 本文件
    ├── EDITOR_GUIDE.md      # ⭐ 编辑器使用手册
    ├── QUICKSTART.md        # 快速开始
    ├── RESOURCES.md         # 资源说明
    ├── UPDATE.md            # 更新日志
    └── START_HERE.txt       # 新手指引
```

## 🎨 使用剧本编辑器（推荐）

### 为什么用编辑器？

- ✅ **零代码** - 不需要懂编程
- ✅ **可视化** - 所见即所得
- ✅ **资源管理** - 拖拽上传文件
- ✅ **实时预览** - 编辑立即生效
- ✅ **一键导出** - 自动生成标准文件

### 编辑器工作流程

```
1. 打开 editor.html
2. 创建新章节
3. 添加场景和对话
4. 上传图片和音频
5. 保存并导出
6. 将文件放入项目
7. 运行游戏测试
```

**详细教程：** 查看 `EDITOR_GUIDE.md`

## 🚀 快速开始 - 添加新章节

### 方法一：复制模板（推荐）

1. **复制章节模板**
   ```bash
   cp chapters/chapter2.js chapters/chapter3.js
   ```

2. **修改章节信息**
   打开 `chapter3.js`，修改：
   ```javascript
   chapterLoader.registerChapter(3, {  // 改成章节号 3
     "meta": {
       "chapterNumber": 3,
       "title": "第三章 你的标题",  // 改标题
       ...
     }
   ```

3. **添加场景**
   在 `scenes` 数组中添加你的剧情场景：
   ```javascript
   "scenes": [
     {
       "id": "scene_ch3_opening",  // 场景ID必须以 scene_ch3_ 开头
       "background": "bg_xxx",
       "bgm": "bgm_xxx",
       "dialogs": [
         {
           "speaker": "",
           "text": "——第三章 你的标题——",
           ...
         },
         ...
       ]
     }
   ]
   ```

4. **在 game.html 中引入**
   在 `<script>` 标签区域添加：
   ```html
   <script src="chapters/chapter3.js"></script>
   ```

### 方法二：从头编写

参考 `chapter1.js` 的结构，重点关注：
- **章节开头**：添加章节标题提示
- **章节结尾**：添加 `——第X章 完——` 提示
- **场景ID**：统一使用 `scene_chX_xxx` 格式
- **资源引用**：使用 `bg_xxx`、`char_xxx`、`bgm_xxx` 等ID

## 🎨 添加/替换资源

### 图片资源

1. **添加新背景**
   - 放入 `images/backgrounds/your_bg.png`
   - 在剧本中引用：`"background": "bg_your_bg"`

2. **添加新角色立绘**
   - 放入 `images/characters/character_emotion.png`
   - 在剧本中引用：`"id": "char_character_emotion"`

### 音频资源

1. **添加新BGM**
   - 放入 `audios/bgm/your_music.mp3`
   - 在剧本中引用：`"bgm": "bgm_your_music"`

2. **添加新音效**
   - 放入 `audios/se/your_sound.mp3`
   - 在对话中引用：`"se": "se_your_sound"`

3. **添加新语音**
   - 放入 `audios/voices/character_01.mp3`
   - 在对话中引用：`"voice": "voice_character_01"`

### 资源路径配置（可选）

如果你想统一管理资源路径，可以编辑 `config/resources.js`：

```javascript
const RESOURCE_CONFIG = {
  audio: {
    bgm: {
      yourMusic: 'audios/bgm/your_music.mp3'  // 添加新BGM
    },
    se: {
      yourSound: 'audios/se/your_sound.mp3'   // 添加新SE
    }
  },
  images: {
    backgrounds: {
      yourBg: 'images/backgrounds/your_bg.png'  // 添加新背景
    }
  }
};
```

## 📝 剧本编写指南

### 场景基本结构

```javascript
{
  "id": "scene_ch1_example",           // 场景唯一ID
  "background": "bg_school",            // 背景图ID
  "bgm": "bgm_daily",                   // 背景音乐ID
  "particles": null,                    // 粒子特效（可选）
  "characters": [                       // 角色列表
    {
      "id": "char_hina_normal",        // 角色立绘ID
      "position": "right",              // 位置: left/center/right
      "opacity": 1                      // 透明度: 0-1
    }
  ],
  "dialogs": [                          // 对话列表
    {
      "speaker": "阳菜",                // 说话者名字（空字符串为旁白）
      "text": "对话内容",               // 对话文本
      "voice": "voice_hina_01",        // 语音文件（可选）
      "se": "se_bell"                   // 音效（可选）
    }
  ],
  "choices": null,                      // 选择分支（可选）
  "autoNext": "scene_ch1_next"         // 自动跳转下一场景（可选）
}
```

### 添加选择分支

```javascript
"choices": [
  {
    "text": "「选项一」",
    "nextSceneId": "scene_ch1_choice1"
  },
  {
    "text": "「选项二」",
    "nextSceneId": "scene_ch1_choice2"
  }
]
```

### 添加特效

```javascript
"effects": {
  "particles": {
    "type": "sparkle",      // 粒子类型
    "count": 25,            // 粒子数量
    "duration": 4000        // 持续时间（毫秒）
  }
}
```

### 章节开始/结束标记

**章节开始**（第一个场景的第一句对话）：
```javascript
{
  "speaker": "",
  "text": "——第X章 章节标题——",
  "voice": null,
  "se": null
}
```

**章节结束**（最后一个场景的最后一句对话）：
```javascript
{
  "speaker": "",
  "text": "——第X章 完——",
  "voice": null,
  "se": null
}
```

## 🎯 最佳实践

1. **场景ID命名规范**
   - 格式：`scene_ch{章节号}_{场景描述}`
   - 例如：`scene_ch2_classroom`, `scene_ch3_battle_start`

2. **资源ID命名规范**
   - 背景：`bg_xxx`
   - 角色：`char_{角色名}_{表情}`
   - BGM：`bgm_xxx`
   - 音效：`se_xxx`
   - 语音：`voice_{角色名}_{编号}`

3. **场景连接**
   - 线性剧情：使用 `autoNext` 自动跳转
   - 分支剧情：使用 `choices` 让玩家选择
   - 章节结束：不设置 `autoNext` 或 `choices`

4. **章节开头处理**
   - 从白天场景开始（避免立刻进入晚上/睡觉场景）
   - 添加明确的章节标题提示

5. **章节结尾处理**
   - 在白天/日常场景结束（保持悬念）
   - 添加 `——第X章 完——` 提示

## 🔧 技术细节

### 章节加载流程

1. `chapterLoader.js` 创建全局章节管理器
2. 各章节文件通过 `chapterLoader.registerChapter()` 注册
3. `main.js` 调用 `getMergedScriptData()` 获取完整剧本
4. 游戏系统按顺序执行所有场景

### 兼容性说明

- 新的模块化结构完全兼容原有游戏系统
- 不需要修改 `js/` 目录下的核心代码
- 只需关注章节剧本和资源文件

## 📞 常见问题

**Q: 如何测试新章节？**
A: 在浏览器中打开 `game.html`，游戏会自动加载所有已注册的章节。

**Q: 资源文件找不到怎么办？**
A: 检查文件路径是否正确，确保文件已放入对应目录。

**Q: 如何删除某个章节？**
A: 从 `game.html` 中删除对应的 `<script>` 标签引用即可。

**Q: 可以改变章节播放顺序吗？**
A: 章节按照注册时的章节号（第一个参数）排序，修改章节号即可。

## 📄 更新日志

### v1.1.0 (2025-02-07)
- ✅ 重构章节结构，支持模块化添加新章节
- ✅ 添加章节开始/结束提示
- ✅ 第一章改为白天结束，不立刻切换晚上
- ✅ 创建资源配置系统
- ✅ 添加第二章模板

---

**祝你创作顺利！** 🎮✨

## 结构整理提示

本版本已将原先平铺的 `js/` 运行时代码迁移到 `engine/` 目录，并将编辑器大文件拆分：

- `editor.html` 的内联样式已抽离到 `styles/editor.css`
- `editor/editor.js` 已拆分到 `editor/parts/`
- 结构整理说明见 `docs/structure-refactor.md`
- 手动验收清单见 `docs/validation-checklist.md`
