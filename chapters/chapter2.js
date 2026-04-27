/**
 * 第二章剧本模板
 * 复制这个文件开始创建新章节
 */

// 注册第二章
chapterLoader.registerChapter(2, {
  "meta": {
    "chapterNumber": 2,
    "title": "第二章标题",
    "author": "夜真",
    "speakerMap": {
      // 添加新角色的映射
      // "角色名": "角色ID"
    }
  },
  "resources": {
    "images": [
      // 第二章需要的新图片资源
      // {
      //   "id": "bg_new_place",
      //   "type": "background",
      //   "path": "images/backgrounds/new_place.png"
      // }
    ],
    "audios": [
      // 第二章需要的新音频资源
      // {
      //   "id": "bgm_new_theme",
      //   "type": "bgm",
      //   "path": "audios/bgm/new_theme.mp3"
      // }
    ]
  },
  "scenes": [
    // ============ 第二章开场 ============
    {
      "id": "scene_ch2_opening",
      "background": "bg_bedroom",
      "bgm": "bgm_mystery",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_normal",
          "position": "center",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "",
          "text": "——第二章 章节标题——",
          "voice": null,
          "se": null
        },
        {
          "speaker": "",
          "text": "那天晚上,夜又早早上床睡觉。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "",
          "text": "脑子里满是那个森林,那个叫希尔薇的公主。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "",
          "text": "夜想知道……",
          "voice": null,
          "se": null
        },
        {
          "speaker": "",
          "text": "那个梦,还会继续吗?",
          "voice": null,
          "se": null
        },
        {
          "speaker": "",
          "text": "夜闭上了眼睛。",
          "voice": null,
          "se": null,
          "effects": {
            "particles": {
              "type": "sparkle",
              "count": 25,
              "duration": 4000
            }
          }
        },
        {
          "speaker": "",
          "text": "意识再次沉入黑暗……",
          "voice": null,
          "se": null
        }
      ],
      "choices": null,
      "autoNext": "scene_ch2_dream_return"
    },

    // ============ 继续添加第二章的场景 ============
    {
      "id": "scene_ch2_dream_return",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": {
        "type": "sparkle",
        "count": 30,
        "continuous": true
      },
      "characters": [],
      "dialogs": [
        {
          "speaker": "",
          "text": "再次睁开眼时,夜又回到了那片梦幻森林。",
          "voice": null,
          "se": null
        }
        // ... 继续添加剧情
      ],
      "choices": null,
      "autoNext": null
    }

    // 在这里继续添加更多场景...
    // 场景ID命名规则: scene_ch2_xxx
  ]
});
