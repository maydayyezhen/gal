# 资源命名与管理规则

本文档说明 `game_project/` 中图片、音频、角色、背景、道具和特效资源的推荐命名方式。

当前项目资源主要分布在：

```text
game_project/images/
game_project/audios/
game_project/config/resources.js
game_project/chapters/chapter*.js resources 字段
```

## 1. 总体原则

1. 剧本中优先使用资源 ID，而不是直接写文件路径。
2. 资源文件按类型放入固定目录。
3. 资源 ID 与文件名尽量保持可推导关系。
4. `chapter*.js` 中的 `resources` 是当前运行时主资源声明。
5. `scriptLoader.js` 的自动补齐只作为容错，不应代替正式资源配置。
6. 编辑器导出的章节文件应尽量补齐 `resources.images` 和 `resources.audios`。

## 2. 图片资源目录

推荐目录：

```text
images/
├── backgrounds/     # 背景图
├── characters/      # 角色立绘
└── others/          # 道具、特效贴图、其他图片
```

## 3. 音频资源目录

推荐目录：

```text
audios/
├── bgm/             # 背景音乐
├── se/              # 音效
└── voices/          # 角色语音
```

## 4. 背景图命名

### 4.1 资源 ID

背景图资源 ID 使用：

```text
bg_{场景名}
```

示例：

```text
bg_school
bg_school_morning
bg_rooftop
bg_bedroom
bg_forest
bg_battle
bg_vending_machine
```

### 4.2 文件名

推荐文件名去掉 `bg_` 前缀：

```text
images/backgrounds/school.png
images/backgrounds/school_morning.png
images/backgrounds/rooftop.png
```

### 4.3 剧本引用

```javascript
{
  id: "scene_ch1_classroom",
  background: "bg_school"
}
```

### 4.4 resources 声明

```javascript
{
  id: "bg_school",
  type: "background",
  path: "images/backgrounds/school.png"
}
```

## 5. 角色立绘命名

### 5.1 资源 ID

角色立绘资源 ID 使用：

```text
char_{角色key}_{表情}
```

示例：

```text
char_hina_normal
char_hina_happy
char_hina_serious
char_hina_surprised
char_hina_embarrassed
char_sora_normal
char_sora_smile
char_princess_cry
char_homework_slime
```

### 5.2 文件名

推荐文件名去掉 `char_` 前缀：

```text
images/characters/hina_normal.png
images/characters/hina_happy.png
images/characters/sora_normal.png
images/characters/princess_cry.png
```

### 5.3 speakerMap

`meta.speakerMap` 应维护显示名称到角色 key 的映射：

```javascript
speakerMap: {
  "阳菜": "hina",
  "夜": "sora",
  "希尔薇": "princess",
  "???": "princess",
  "作业怪": "homework_slime"
}
```

这个映射用于：

- 判断当前说话人对应哪个立绘。
- 角色高亮 / 变暗。
- stage 指令按 key 匹配角色。
- 角色动画定位。

### 5.4 剧本引用

```javascript
characters: [
  {
    id: "char_hina_happy",
    position: "right",
    opacity: 1
  }
]
```

或在对白中引用：

```javascript
{
  speaker: "阳菜",
  text: "明天见！",
  character: "char_hina_happy",
  position: "right"
}
```

## 6. 道具图片命名

### 6.1 资源 ID

道具资源 ID 使用：

```text
item_{道具名}
```

示例：

```text
item_book
item_phone
item_broom
item_sword
item_umbrella
```

### 6.2 文件名

```text
images/others/book.png
images/others/phone.png
images/others/broom.png
images/others/plastic_sword.png
images/others/umbrella.png
```

注意：如果资源 ID 和文件名不一致，需要在 `resources.images` 中明确声明路径。比如：

```javascript
{
  id: "item_sword",
  type: "item",
  path: "images/others/plastic_sword.png"
}
```

## 7. 特效贴图命名

### 7.1 资源 ID

特效贴图资源 ID 使用：

```text
fx_{特效名}
```

示例：

```text
fx_magic_circle
fx_beam
fx_hit_spark
fx_impact_ring
fx_dream_bokeh
fx_eye_glow
fx_zzz
fx_snowflake
fx_paper_sheet
fx_paper_stack
```

### 7.2 文件名

```text
images/others/magic_circle.png
images/others/beam.png
images/others/hit_spark.png
images/others/impact_ring.png
images/others/dream_bokeh.png
```

### 7.3 使用方式

特效贴图通常由 `effects.js` 内部读取，不一定直接出现在对白字段里。但仍建议在章节 `resources.images` 中声明，方便预加载。

## 8. BGM 命名

### 8.1 资源 ID

BGM 资源 ID 使用：

```text
bgm_{音乐名}
```

示例：

```text
bgm_title
bgm_daily
bgm_dream_forest
bgm_battle_comedy
bgm_mystery
```

### 8.2 文件路径

```text
audios/bgm/daily.mp3
audios/bgm/dream_forest.mp3
audios/bgm/battle_comedy.mp3
audios/bgm/mystery.mp3
```

### 8.3 generated 音频

当前项目支持生成式音频。如果某个 BGM 由 `audio-generator.js` 生成，可以使用：

```javascript
{
  id: "bgm_daily",
  type: "bgm",
  path: "generated",
  volume: 0.4
}
```

加载器会把 `generated` 映射回资源 ID，以便音频生成器播放。

## 9. 音效 SE 命名

### 9.1 资源 ID

音效资源 ID 使用：

```text
se_{音效名}
```

示例：

```text
se_click
se_transition
se_bell
se_page_flip
se_magic_sparkle
se_sword_swing
se_hit_light
se_notification
se_item_show
se_puff
se_beam
se_sleep
se_wake
se_eye_open
```

### 9.2 文件路径

```text
audios/se/click.mp3
audios/se/transition.mp3
audios/se/bell.mp3
```

如果资源 ID 和文件名不一致，需要在 `resources.audios` 中明确声明。

## 10. 角色语音命名

### 10.1 资源 ID

语音资源 ID 使用：

```text
voice_{角色key}_{编号}
```

示例：

```text
voice_hina_01
voice_hina_02
voice_hina_03
voice_sora_01
```

### 10.2 文件路径

```text
audios/voices/hina_01.mp3
audios/voices/hina_02.mp3
audios/voices/hina_03.mp3
```

### 10.3 剧本引用

```javascript
{
  speaker: "阳菜",
  text: "等一下！你的笔记能借我抄吗？",
  voice: "voice_hina_01"
}
```

## 11. 资源声明示例

```javascript
resources: {
  images: [
    {
      id: "bg_school",
      type: "background",
      path: "images/backgrounds/school.png"
    },
    {
      id: "char_hina_happy",
      type: "character",
      path: "images/characters/hina_happy.png"
    },
    {
      id: "item_book",
      type: "item",
      path: "images/others/book.png"
    }
  ],
  audios: [
    {
      id: "bgm_daily",
      type: "bgm",
      path: "audios/bgm/daily.mp3",
      volume: 0.4
    },
    {
      id: "se_click",
      type: "se",
      path: "audios/se/click.mp3",
      volume: 0.38
    },
    {
      id: "voice_hina_01",
      type: "voice",
      path: "audios/voices/hina_01.mp3",
      volume: 0.8
    }
  ]
}
```

## 12. 当前资源配置问题

当前项目存在多处资源来源：

```text
chapter*.js resources
scriptLoader.js 自动补齐
editor.js 默认资源注入
config/resources.js 旧版 / 辅助配置
```

这会带来几个问题：

1. 同一资源可能在多个地方重复声明。
2. `config/resources.js` 中的路径可能和实际章节资源路径不一致。
3. 编辑器可见资源和游戏运行时预加载资源可能不完全一致。
4. 后续新增资源时，不知道应该改哪个文件。

## 13. 推荐统一方向

短期：

- 继续以 `chapter*.js resources` 作为运行时主资源声明。
- 保留 `scriptLoader.js` 自动补齐作为兜底。
- 编辑器导出章节时尽量补齐 resources。

中期：

- 新增统一资源清单，例如 `config/resource-manifest.js`。
- 编辑器从统一资源清单读取可选资源。
- 章节导出时只记录实际使用资源。

长期：

- 将 `config/resources.js` 升级为统一资源清单，或移动到 `archive/` 作为旧版兼容文档。

## 14. 新增资源建议流程

新增背景：

1. 将图片放入 `images/backgrounds/`。
2. 使用 `bg_` 前缀定义资源 ID。
3. 在章节 `resources.images` 中声明。
4. 在场景 `background` 中引用。
5. 用 `game.html` 测试。
6. 用 `editor.html` 检查编辑器是否能显示。

新增角色立绘：

1. 将图片放入 `images/characters/`。
2. 使用 `char_{角色key}_{表情}` 命名。
3. 更新 `speakerMap`，如果是新角色。
4. 在章节 `resources.images` 中声明。
5. 在 `characters`、对白 `character` 或 `stage` 中引用。

新增音效：

1. 将音频放入 `audios/se/`。
2. 使用 `se_` 前缀定义资源 ID。
3. 在章节 `resources.audios` 中声明。
4. 在对白 `se` 或特效逻辑中引用。

## 15. 避免事项

1. 不要在剧本中大量直接写资源路径。
2. 不要让同一个资源 ID 指向多个不同文件。
3. 不要在没有确认加载链路的情况下删除 `scriptLoader.js` 的资源兜底逻辑。
4. 不要同时修改资源路径、HTML 引用和加载器逻辑。
5. 不要让编辑器默认资源注入和章节 resources 长期互相打架。
