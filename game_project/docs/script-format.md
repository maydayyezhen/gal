# 剧本格式说明

本文档说明 `game_project/chapters/chapter*.js` 的标准数据结构。

当前项目采用纯静态 JavaScript 剧本文件，每个章节通过 `chapterLoader.registerChapter()` 注册。

## 1. 章节文件基本结构

```javascript
chapterLoader.registerChapter(1, {
  meta: {},
  resources: {
    images: [],
    audios: []
  },
  scenes: []
});
```

其中：

- 第一个参数是章节号。
- 第二个参数是章节数据对象。
- 游戏运行时会按章节号排序，并通过 `chapterLoader.getMergedScriptData()` 合并所有章节。

## 2. meta 字段

`meta` 用于描述章节和游戏基础信息。

示例：

```javascript
meta: {
  chapterNumber: 1,
  title: "梦境恋爱事故",
  gameTitle: "梦境恋爱事故",
  version: "1.0.4",
  author: "夜真",
  speakerMap: {
    "阳菜": "hina",
    "夜": "sora",
    "希尔薇": "princess",
    "???": "princess",
    "作业怪": "homework_slime"
  }
}
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| chapterNumber | number | 章节号 |
| title | string | 章节标题 |
| gameTitle | string | 游戏标题 |
| version | string | 剧本版本 |
| author | string | 作者 |
| speakerMap | object | 说话人名称到角色 key 的映射 |

`speakerMap` 主要用于角色高亮、自动匹配立绘和动画目标。

## 3. resources 字段

`resources` 用于声明本章节使用的图片和音频资源。

```javascript
resources: {
  images: [],
  audios: []
}
```

### 3.1 图片资源

示例：

```javascript
{
  id: "char_hina_happy",
  type: "character",
  path: "images/characters/hina_happy.png"
}
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 资源 ID，剧本中通过该 ID 引用 |
| type | string | 图片类型：background / character / item |
| path | string | 资源相对路径 |

常见图片类型：

```text
background  # 背景图
character   # 角色立绘
item        # 道具、特效贴图、其他图片
```

### 3.2 音频资源

示例：

```javascript
{
  id: "bgm_daily",
  type: "bgm",
  path: "audios/bgm/daily.mp3",
  volume: 0.4
}
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 音频 ID |
| type | string | 音频类型：bgm / se / voice |
| path | string | 音频路径，生成式音频可使用 generated |
| volume | number | 默认音量，范围建议 0 到 1 |

常见音频类型：

```text
bgm     # 背景音乐
se      # 音效
voice   # 角色语音
```

## 4. scenes 字段

`scenes` 是章节中的场景数组。

示例：

```javascript
scenes: [
  {
    id: "scene_ch1_classroom",
    background: "bg_school",
    bgm: "bgm_daily",
    particles: null,
    characters: [],
    dialogs: [],
    choices: null,
    autoNext: "scene_ch1_next"
  }
]
```

## 5. 场景结构

### 5.1 基本字段

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 场景唯一 ID |
| background | string | 背景资源 ID |
| bgm | string | BGM 资源 ID |
| particles | string / object / null | 粒子效果 |
| characters | array | 进入场景时的初始角色立绘 |
| dialogs | array | 对白数组 |
| choices | array / null | 选择分支 |
| autoNext | string / null | 无选择分支时自动跳转的下一个场景 |

### 5.2 场景 ID 命名

推荐格式：

```text
scene_ch{章节号}_{场景名}
```

示例：

```text
scene_ch1_classroom
scene_ch1_dream_start
scene_ch2_opening
```

## 6. characters 字段

`characters` 表示进入场景时已经站在舞台上的角色。

示例：

```javascript
characters: [
  {
    id: "char_sora_normal",
    position: "left",
    opacity: 1
  },
  {
    id: "char_hina_happy",
    position: "right",
    opacity: 1
  }
]
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 角色立绘资源 ID |
| position | string | 位置：left / center / right |
| opacity | number | 透明度，范围 0 到 1 |

如果角色需要在对白过程中出场、退场、换表情或移动，建议使用对白中的 `stage` 字段。

## 7. dialogs 字段

`dialogs` 是对白数组。

基本示例：

```javascript
dialogs: [
  {
    speaker: "阳菜",
    text: "等一下！你的笔记能借我抄吗？",
    voice: "voice_hina_01",
    se: null
  }
]
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| speaker | string | 说话人，空字符串表示旁白 |
| text | string | 对白文本 |
| voice | string / null | 语音资源 ID |
| se | string / null | 音效资源 ID |
| character | string / null | 当前对白对应的角色立绘 ID |
| position | string / null | 角色位置 |
| animation | string / null | 简单角色动画 |
| charAnim | object / null | 角色动画指令 |
| stage | object / null | 舞台指令 |
| effects | object / null | 画面特效 |
| itemShow | object / null | 显示道具 |
| itemHide | object / null | 隐藏道具 |
| itemGet | object / null | 获得道具提示 |

## 8. choices 字段

`choices` 表示选择分支。

示例：

```javascript
choices: [
  {
    text: "「借你，不过你要请我喝饮料」",
    nextSceneId: "scene_ch1_classroom_choice1"
  },
  {
    text: "「行啊，反正我也不看」",
    nextSceneId: "scene_ch1_classroom_choice2"
  }
]
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| text | string | 选项显示文本 |
| nextSceneId | string | 选择后跳转的场景 ID |

如果场景存在 `choices`，通常不再设置 `autoNext`。

## 9. autoNext 字段

`autoNext` 表示当前场景对白播放完后自动跳转到指定场景。

示例：

```javascript
autoNext: "scene_ch1_home"
```

如果 `choices` 和 `autoNext` 都为空，场景结束后视为当前剧情段落结束。

## 10. stage 指令

`stage` 用于控制对白过程中的角色出场、退场、换表情和移动。

### 10.1 showChars

显示角色。

```javascript
stage: {
  showChars: [
    {
      id: "char_hina_happy",
      position: "right",
      opacity: 1,
      duration: 240
    }
  ]
}
```

### 10.2 hideChars

隐藏角色。

```javascript
stage: {
  hideChars: ["hina"]
}
```

也可以使用对象格式：

```javascript
stage: {
  hideChars: [
    {
      charId: "hina",
      duration: 200,
      remove: true
    }
  ]
}
```

### 10.3 swapChars

替换角色立绘。

```javascript
stage: {
  swapChars: [
    {
      match: "hina",
      id: "char_hina_embarrassed",
      duration: 140,
      mode: "replace"
    }
  ]
}
```

### 10.4 moveChars

移动角色。

```javascript
stage: {
  moveChars: [
    {
      match: "hina",
      x: "-4vw",
      y: "0px",
      duration: 260,
      easing: "ease-in-out"
    }
  ]
}
```

## 11. effects 字段

`effects` 用于画面特效。

常见示例：

```javascript
effects: {
  flash: {
    color: "#ffffff",
    duration: 300
  },
  shake: {
    intensity: 10,
    duration: 500
  },
  sleep: {
    duration: 4200,
    strength: 0.62
  }
}
```

常见效果包括：

```text
flash       # 闪白 / 闪光
shake       # 屏幕震动
focus       # 聚焦
blur        # 模糊
sleep       # 睡眠氛围
eyeClose    # 闭眼
eyeOpen     # 睁眼
dream       # 梦境氛围
spell       # 施法
beam        # 光束
hit         # 受击
puff        # 烟雾消散
particles   # 粒子切换
```

## 12. 道具字段

### 12.1 itemShow

显示道具。

```javascript
itemShow: {
  itemId: "item_book",
  options: {
    position: "center",
    duration: 1800,
    animation: "appear"
  }
}
```

### 12.2 itemHide

隐藏道具。

```javascript
itemHide: {
  itemId: "item_book"
}
```

### 12.3 itemGet

显示获得道具提示。

```javascript
itemGet: {
  itemId: "item_book",
  name: "笔记本"
}
```

## 13. 角色动画

简单动画可以写在 `animation` 字段：

```javascript
{
  speaker: "阳菜",
  text: "明天见！",
  character: "char_hina_happy",
  animation: "bounce"
}
```

更明确的角色动画可以写 `charAnim`：

```javascript
charAnim: {
  charId: "hina",
  type: "bounce",
  options: {
    duration: 520
  }
}
```

常见动画类型：

```text
nod
shake
jump
bounce
sway
heartbeat
appear
idle
hurt
```

## 14. 编写建议

1. 场景 ID 必须唯一。
2. 分支和自动跳转引用的场景 ID 必须存在。
3. 旁白的 `speaker` 使用空字符串。
4. 对白里引用的资源 ID 应尽量在 `resources` 中声明。
5. `scriptLoader.js` 有资源兜底能力，但不应该长期依赖兜底代替资源配置。
6. 同一章节内建议统一使用 `scene_chX_` 前缀。
7. 新增章节后，需要在 HTML 中添加对应 `<script>` 引入。
