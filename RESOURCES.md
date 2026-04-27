# 资源文件放置说明

## 📂 资源目录结构

```
images/
├── backgrounds/     # 背景图片
│   ├── title.png
│   ├── school.png
│   ├── school_morning.png
│   ├── rooftop.png
│   ├── park.png
│   ├── bedroom.png
│   ├── forest.png
│   ├── battle.png
│   └── vending_machine.png
│
├── characters/      # 角色立绘
│   ├── hina_normal.png
│   ├── hina_happy.png
│   ├── hina_serious.png
│   ├── hina_surprised.png
│   ├── hina_angry.png
│   ├── hina_embarrassed.png
│   ├── hina_thinking.png
│   ├── sora_normal.png
│   ├── sora_smile.png
│   ├── sora_thinking.png
│   ├── sora_embarrassed.png
│   ├── sora_serious.png
│   ├── princess_normal.png
│   ├── princess_happy.png
│   ├── princess_serious.png
│   ├── princess_embarrassed.png
│   ├── homework_slime_normal.png
│   └── homework_slime_angry.png
│
└── others/          # 其他图片（道具、UI等）
    ├── book.png
    └── drink.png

audios/
├── bgm/             # 背景音乐
│   ├── bgm_daily.mp3
│   ├── bgm_dream_forest.mp3
│   ├── bgm_battle_comedy.mp3
│   ├── bgm_mystery.mp3
│   ├── day.mp3
│   └── night.mp3
│
├── se/              # 音效
│   ├── bell.mp3
│   ├── click.mp3
│   ├── se_bell.mp3
│   ├── se_fumble.mp3
│   ├── se_hit_light.mp3
│   ├── se_magic_sparkle.mp3
│   ├── se_notification.mp3
│   ├── se_page_flip.mp3
│   └── se_sword_swing.mp3
│
└── voices/          # 角色语音
    ├── hina_01.mp3
    ├── hina_02.mp3
    ├── hina_03.mp3
    └── sora_01.mp3
```

## 🎨 图片规格建议

### 背景图片
- **分辨率**: 1920x1080 (16:9)
- **格式**: PNG (推荐) / JPG
- **文件大小**: 建议 < 2MB
- **命名规则**: `bg_{场景名}.png`

### 角色立绘
- **分辨率**: 宽度 800-1200px，高度 1200-1800px
- **格式**: PNG (需要透明背景)
- **文件大小**: 建议 < 1MB
- **命名规则**: `char_{角色名}_{表情}.png`

### 其他图片
- **格式**: PNG (推荐)
- **命名规则**: `{类型名}.png`

## 🎵 音频规格建议

### 背景音乐 (BGM)
- **格式**: MP3
- **比特率**: 128-192 kbps
- **长度**: 2-5 分钟（循环播放）
- **文件大小**: 建议 < 5MB
- **命名规则**: `bgm_{主题名}.mp3`

### 音效 (SE)
- **格式**: MP3
- **比特率**: 128 kbps
- **长度**: 0.5-3 秒
- **文件大小**: 建议 < 100KB
- **命名规则**: `se_{效果名}.mp3`

### 角色语音
- **格式**: MP3
- **比特率**: 128 kbps
- **长度**: 1-5 秒
- **文件大小**: 建议 < 200KB
- **命名规则**: `voice_{角色名}_{编号}.mp3`

## 📝 添加新资源的步骤

### 1. 添加图片

1. **准备图片文件**
   - 确保图片符合上述规格
   - 文件名使用英文和下划线

2. **放入对应目录**
   - 背景 → `images/backgrounds/`
   - 角色 → `images/characters/`
   - 其他 → `images/others/`

3. **在剧本中引用**
   ```javascript
   // 背景
   "background": "bg_your_scene"
   
   // 角色立绘
   "id": "char_name_emotion"
   ```

### 2. 添加音频

1. **准备音频文件**
   - 确保音频符合上述规格
   - 文件名使用英文和下划线

2. **放入对应目录**
   - BGM → `audios/bgm/`
   - 音效 → `audios/se/`
   - 语音 → `audios/voices/`

3. **在剧本中引用**
   ```javascript
   // 背景音乐
   "bgm": "bgm_your_theme"
   
   // 音效
   "se": "se_your_sound"
   
   // 语音
   "voice": "voice_character_01"
   ```

## 🔧 资源路径规则

游戏系统会自动处理资源ID到文件路径的映射：

- `bg_xxx` → `images/backgrounds/xxx.png`
- `char_xxx_yyy` → `images/characters/xxx_yyy.png`
- `bgm_xxx` → `audios/bgm/xxx.mp3`
- `se_xxx` → `audios/se/xxx.mp3`
- `voice_xxx` → `audios/voices/xxx.mp3`

## ⚠️ 注意事项

1. **文件名不要使用中文**
   - ❌ `背景_学校.png`
   - ✅ `school.png`

2. **文件名不要有空格**
   - ❌ `hina happy.png`
   - ✅ `hina_happy.png`

3. **区分大小写**
   - Windows 不区分，但 Linux/Mac 区分
   - 建议统一使用小写

4. **保持一致的命名风格**
   - 使用下划线分隔: `school_morning.png`
   - 不要混用: `school-morning.png`, `schoolMorning.png`

5. **文件大小优化**
   - 图片可以用 TinyPNG 等工具压缩
   - 音频使用合适的比特率，不需要过高

## 🛠️ 推荐工具

### 图片处理
- **压缩**: [TinyPNG](https://tinypng.com/)
- **编辑**: Photoshop / GIMP / Krita
- **格式转换**: XnConvert / ImageMagick

### 音频处理
- **编辑**: Audacity (免费)
- **格式转换**: FFmpeg / fre:ac
- **剪辑**: Adobe Audition

---

如有问题，请参考 `README.md` 主文档或联系开发者。
