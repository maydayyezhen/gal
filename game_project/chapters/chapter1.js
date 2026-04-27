/**
 * 第1章剧本: 梦境恋爱事故
 * 作者: 夜真
 * 使用剧本编辑器生成
 */
chapterLoader.registerChapter(1, {
  "meta": {
    "chapterNumber": 1,
    "title": "梦境恋爱事故",
    "gameTitle": "梦境恋爱事故",
    "version": "1.0.4",
    "author": "夜真",
    "speakerMap": {
      "阳菜": "hina",
      "夜": "sora",
      "希尔薇": "princess",
      "???": "princess",
      "作业怪": "homework_slime"
    }
  },
  "resources": {
    "images": [
      {
        "id": "bg_title",
        "type": "background",
        "path": "images/backgrounds/title.png"
      },
      {
        "id": "bg_school",
        "type": "background",
        "path": "images/backgrounds/school.png"
      },
      {
        "id": "bg_school_morning",
        "type": "background",
        "path": "images/backgrounds/school_morning.png"
      },
      {
        "id": "bg_rooftop",
        "type": "background",
        "path": "images/backgrounds/rooftop.png"
      },
      {
        "id": "bg_park",
        "type": "background",
        "path": "images/backgrounds/park.png"
      },
      {
        "id": "bg_bedroom",
        "type": "background",
        "path": "images/backgrounds/bedroom.png"
      },
      {
        "id": "bg_forest",
        "type": "background",
        "path": "images/backgrounds/forest.png"
      },
      {
        "id": "bg_battle",
        "type": "background",
        "path": "images/backgrounds/battle.png"
      },
      {
        "id": "bg_vending_machine",
        "type": "background",
        "path": "images/backgrounds/vending_machine.png"
      },
      {
        "id": "char_hina_normal",
        "type": "character",
        "path": "images/characters/hina_normal.png"
      },
      {
        "id": "char_hina_happy",
        "type": "character",
        "path": "images/characters/hina_happy.png"
      },
      {
        "id": "char_hina_serious",
        "type": "character",
        "path": "images/characters/hina_serious.png"
      },
      {
        "id": "char_hina_surprised",
        "type": "character",
        "path": "images/characters/hina_surprised.png"
      },
      {
        "id": "char_hina_angry",
        "type": "character",
        "path": "images/characters/hina_angry.png"
      },
      {
        "id": "char_hina_embarrassed",
        "type": "character",
        "path": "images/characters/hina_embarrassed.png"
      },
      {
        "id": "char_hina_thinking",
        "type": "character",
        "path": "images/characters/hina_thinking.png"
      },
      {
        "id": "char_sora_normal",
        "type": "character",
        "path": "images/characters/sora_normal.png"
      },
      {
        "id": "char_sora_smile",
        "type": "character",
        "path": "images/characters/sora_smile.png"
      },
      {
        "id": "char_sora_serious",
        "type": "character",
        "path": "images/characters/sora_serious.png"
      },
      {
        "id": "char_sora_surprised",
        "type": "character",
        "path": "images/characters/sora_surprised.png"
      },
      {
        "id": "char_sora_annoyed",
        "type": "character",
        "path": "images/characters/sora_annoyed.png"
      },
      {
        "id": "char_sora_embarrassed",
        "type": "character",
        "path": "images/characters/sora_embarrassed.png"
      },
      {
        "id": "char_princess",
        "type": "character",
        "path": "images/characters/princess.png"
      },
      {
        "id": "char_princess_cast",
        "type": "character",
        "path": "images/characters/princess_cast.png"
      },
      {
        "id": "char_princess_cry",
        "type": "character",
        "path": "images/characters/princess_cry.png"
      },
      {
        "id": "char_princess_smile",
        "type": "character",
        "path": "images/characters/princess_smile.png"
      },
      {
        "id": "char_princess_surprised",
        "type": "character",
        "path": "images/characters/princess_surprised.png"
      },
      {
        "id": "char_homework_slime",
        "type": "character",
        "path": "images/characters/homework_slime.png"
      },
      {
        "id": "item_broom",
        "type": "item",
        "path": "images/others/broom.png"
      },
      {
        "id": "item_book",
        "type": "item",
        "path": "images/others/book.png"
      },
      {
        "id": "item_phone",
        "type": "item",
        "path": "images/others/phone.png"
      },
      {
        "id": "item_sword",
        "type": "item",
        "path": "images/others/plastic_sword.png"
      },
      {
        "id": "item_umbrella",
        "type": "item",
        "path": "images/others/umbrella.png"
      },
      {
        "id": "fx_magic_circle",
        "type": "item",
        "path": "images/others/magic_circle.png"
      },
      {
        "id": "fx_beam",
        "type": "item",
        "path": "images/others/beam.png"
      },
      {
        "id": "fx_hit_spark",
        "type": "item",
        "path": "images/others/hit_spark.png"
      },
      {
        "id": "fx_impact_ring",
        "type": "item",
        "path": "images/others/impact_ring.png"
      },
      {
        "id": "fx_dream_bokeh",
        "type": "item",
        "path": "images/others/dream_bokeh.png"
      },
      {
        "id": "fx_eye_glow",
        "type": "item",
        "path": "images/others/eye_glow.png"
      },
      {
        "id": "fx_zzz",
        "type": "item",
        "path": "images/others/zzz.png"
      },
      {
        "id": "fx_snowflake",
        "type": "item",
        "path": "images/others/snowflake_single.png"
      },
      {
        "id": "fx_paper_sheet",
        "type": "item",
        "path": "images/others/paper_sheet.png"
      },
      {
        "id": "fx_paper_stack",
        "type": "item",
        "path": "images/others/paper_stack.png"
      },
      {
        "id": "char_sora_sleepy",
        "type": "character",
        "path": "images/characters/sora_sleepy.png"
      },
      {
        "id": "bg_bedroom_morning",
        "type": "background",
        "path": "images/backgrounds/bedroom_morning.png"
      }
    ],
    "audios": [
      {
        "id": "bgm_daily",
        "type": "bgm",
        "path": "audios/bgm/daily.mp3",
        "volume": 0.4
      },
      {
        "id": "bgm_dream_forest",
        "type": "bgm",
        "path": "audios/bgm/dream_forest.mp3",
        "volume": 0.35
      },
      {
        "id": "bgm_battle_comedy",
        "type": "bgm",
        "path": "audios/bgm/battle_comedy.mp3",
        "volume": 0.45
      },
      {
        "id": "bgm_mystery",
        "type": "bgm",
        "path": "audios/bgm/mystery.mp3",
        "volume": 0.3
      },
      {
        "id": "se_bell",
        "type": "se",
        "path": "audios/se/bell.mp3",
        "volume": 0.5
      },
      {
        "id": "se_page_flip",
        "type": "se",
        "path": "audios/se/page_flip.mp3",
        "volume": 0.6
      },
      {
        "id": "se_magic_sparkle",
        "type": "se",
        "path": "audios/se/magic_sparkle.mp3",
        "volume": 0.65
      },
      {
        "id": "se_sword_swing",
        "type": "se",
        "path": "audios/se/sword_swing.mp3",
        "volume": 0.7
      },
      {
        "id": "se_hit_light",
        "type": "se",
        "path": "audios/se/hit_light.mp3",
        "volume": 0.6
      },
      {
        "id": "se_fumble",
        "type": "se",
        "path": "audios/se/fumble.mp3",
        "volume": 0.55
      },
      {
        "id": "se_notification",
        "type": "se",
        "path": "audios/se/notification.mp3",
        "volume": 0.5
      },
      {
        "id": "voice_hina_01",
        "type": "voice",
        "path": "audios/voices/hina_01.mp3",
        "volume": 0.8
      },
      {
        "id": "voice_hina_02",
        "type": "voice",
        "path": "audios/voices/hina_02.mp3",
        "volume": 0.8
      },
      {
        "id": "voice_hina_03",
        "type": "voice",
        "path": "audios/voices/hina_03.mp3",
        "volume": 0.8
      },
      {
        "id": "se_click",
        "type": "se",
        "path": "audios/se/click.mp3",
        "volume": 0.38
      },
      {
        "id": "se_choice_open",
        "type": "se",
        "path": "audios/se/choice_open.mp3",
        "volume": 0.55
      },
      {
        "id": "se_choice_confirm",
        "type": "se",
        "path": "audios/se/choice_confirm.mp3",
        "volume": 0.6
      },
      {
        "id": "se_transition",
        "type": "se",
        "path": "audios/se/transition.mp3",
        "volume": 0.45
      },
      {
        "id": "se_item_show",
        "type": "se",
        "path": "audios/se/item_show.mp3",
        "volume": 0.55
      },
      {
        "id": "se_puff",
        "type": "se",
        "path": "audios/se/puff.mp3",
        "volume": 0.5
      },
      {
        "id": "se_beam",
        "type": "se",
        "path": "audios/se/beam.mp3",
        "volume": 0.62
      },
      {
        "id": "se_sleep",
        "type": "se",
        "path": "audios/se/sleep.mp3",
        "volume": 0.42
      },
      {
        "id": "se_wake",
        "type": "se",
        "path": "audios/se/wake.mp3",
        "volume": 0.58
      },
      {
        "id": "se_eye_open",
        "type": "se",
        "path": "audios/se/eye_open.mp3",
        "volume": 0.48
      }
    ]
  },
  "scenes": [
    {
      "id": "scene_ch1_classroom",
      "background": "bg_school",
      "bgm": "bgm_daily",
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
          "text": "——第一章 梦境——",
          "stage": {
            "hideChars": [
              "sora"
            ]
          }
        },
        {
          "speaker": "",
          "text": "又是普通的一天。"
        },
        {
          "speaker": "",
          "text": "放学铃响了，我把笔记本塞回书包准备逃离这个充满数学题的牢笼。",
          "character": "char_sora_normal",
          "position": "center",
          "se": "se_bell",
          "itemShow": {
            "itemId": "item_book",
            "options": {
              "position": "center",
              "duration": 1800,
              "animation": "appear"
            }
          }
        },
        {
          "speaker": "",
          "text": "身后传来熟悉的声音。"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_classroom_2"
    },
    {
      "id": "scene_ch1_classroom_2",
      "background": "bg_school",
      "bgm": "bgm_daily",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_normal",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_hina_normal",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "阳菜",
          "text": "等一下！你的笔记能借我抄吗？",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "春日阳菜。班级委员长，成绩优秀，待人温柔,是那种'对所有人都很好'的类型。"
        },
        {
          "speaker": "",
          "text": "也正因为如此,我完全看不出她到底对我是什么想法。"
        },
        {
          "speaker": "夜",
          "text": "你这个委员长,怎么会没做笔记?"
        },
        {
          "speaker": "阳菜",
          "text": "上课的时候……走神了。",
          "voice": "voice_hina_02"
        }
      ],
      "choices": [
        {
          "text": "「借你,不过你要请我喝饮料」",
          "nextSceneId": "scene_ch1_classroom_choice1"
        },
        {
          "text": "「行啊,反正我也不看」",
          "nextSceneId": "scene_ch1_classroom_choice2"
        }
      ],
      "autoNext": null
    },
    {
      "id": "scene_ch1_classroom_choice1",
      "background": "bg_school",
      "bgm": "bgm_daily",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_smile",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_hina_happy",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "借你,不过你要请我喝饮料。"
        },
        {
          "speaker": "阳菜",
          "text": "成交!明天放学自动贩卖机见~",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "",
          "text": "她接过笔记本的时候,指尖好像碰到了我的手。",
          "stage": {
            "moveChars": [
              {
                "match": "hina",
                "x": "-4vw",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              },
              {
                "match": "sora",
                "x": "2vw",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              }
            ],
            "swapChars": [
              {
                "match": "hina",
                "id": "char_hina_embarrassed",
                "duration": 140,
                "mode": "replace"
              },
              {
                "match": "sora",
                "id": "char_sora_embarrassed",
                "duration": 140,
                "mode": "replace"
              }
            ]
          },
          "charAnim": {
            "charId": "sora",
            "type": "heartbeat",
            "options": {
              "duration": 520
            }
          },
          "itemShow": {
            "itemId": "item_book",
            "options": {
              "position": "right",
              "duration": 1800,
              "animation": "appear"
            }
          }
        },
        {
          "speaker": "",
          "text": "我想多了吗?"
        },
        {
          "speaker": "阳菜",
          "text": "那我先走啦,明天见!",
          "voice": "voice_hina_01",
          "stage": {
            "swapChars": [
              {
                "match": "hina",
                "id": "char_hina_happy",
                "duration": 120,
                "mode": "replace"
              }
            ],
            "moveChars": [
              {
                "match": "hina",
                "x": "0px",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              },
              {
                "match": "sora",
                "x": "0px",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              }
            ]
          },
          "charAnim": {
            "charId": "hina",
            "type": "bounce",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "",
          "text": "她挥了挥手,转身离开教室。"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_home"
    },
    {
      "id": "scene_ch1_classroom_choice2",
      "background": "bg_school",
      "bgm": "bgm_daily",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_normal",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_hina_embarrassed",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "行啊,反正我也不看。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "阳菜",
          "text": "谢谢!你真是好人~",
          "voice": "voice_hina_02",
          "se": null
        },
        {
          "speaker": "",
          "text": "'好人'……这个词怎么听起来有点微妙。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "阳菜",
          "text": "明天还你!那我先走啦!",
          "voice": "voice_hina_01",
          "se": null
        },
        {
          "speaker": "",
          "text": "她拿着笔记本小跑出了教室。",
          "voice": null,
          "se": null,
          "itemShow": {
            "itemId": "item_book",
            "options": {
              "position": "right",
              "duration": 1600,
              "animation": "appear"
            }
          }
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_home"
    },
    {
      "id": "scene_ch1_home",
      "background": "bg_bedroom",
      "bgm": "bgm_daily",
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
          "text": "回到家,洗完澡,躺在床上。",
          "character": "char_sora_sleepy"
        },
        {
          "speaker": "",
          "text": "脑子里莫名其妙地回放着阳菜的笑容。"
        },
        {
          "speaker": "夜",
          "text": "……烦死了，赶紧睡觉。"
        },
        {
          "speaker": "",
          "text": "我把手机丢到枕边，闭上了眼睛。",
          "effects": {
            "sleep": {
              "duration": 4200,
              "strength": 0.62,
              "zCount": 6,
              "fadeIn": 2000,
              "hold": 1800,
              "fadeOut": 900
            }
          },
          "itemShow": {
            "itemId": "item_phone",
            "options": {
              "position": "center",
              "duration": 1400,
              "animation": "float"
            }
          }
        },
        {
          "speaker": "",
          "text": "困意像潮水一样涌上来，连思绪都变慢了。"
        },
        {
          "speaker": "",
          "text": "意识逐渐模糊……",
          "effects": {
            "eyeClose": {
              "duration": 560,
              "persist": true,
              "blur": 0.8
            }
          }
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_dream_start"
    },
    {
      "id": "scene_ch1_dream_start",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_surprised",
          "position": "center",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "",
          "text": "……嗯?",
          "effects": {
            "eyeOpen": {
              "duration": 520,
              "blur": 1.3
            }
          }
        },
        {
          "speaker": "",
          "text": "我睁开了眼,发现自己站在一片奇怪的森林里。"
        },
        {
          "speaker": "",
          "text": "周围的树发着淡淡的蓝光,空气中飘着像萤火虫一样的光点。"
        },
        {
          "speaker": "夜",
          "text": "这……做梦了?"
        },
        {
          "speaker": "",
          "text": "但这梦也太清晰了。我能感觉到脚下草地的触感,闻到花香,甚至听到远处的水声。"
        },
        {
          "speaker": "夜",
          "text": "好吧,既然是梦,那就随便走走。"
        },
        {
          "speaker": "",
          "text": "我沿着小路往前走,前方传来了……哭声?"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_dream_princess"
    },
    {
      "id": "scene_ch1_dream_princess",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_surprised",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_cry",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "",
          "text": "树下坐着一个穿着华丽长裙的女孩,正低着头抹眼泪。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "",
          "text": "等等……这张脸……",
          "voice": null,
          "se": null
        },
        {
          "speaker": "夜",
          "text": "阳……阳菜?!",
          "voice": null,
          "se": null
        },
        {
          "speaker": "???",
          "text": "诶?你……你认识我?",
          "voice": "voice_hina_01",
          "se": null,
          "charAnim": {
            "charId": "princess",
            "type": "bounce",
            "options": {
              "duration": 600
            }
          }
        },
        {
          "speaker": "",
          "text": "她抬起头,眼睛红红的,脸上写满了困惑。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "夜",
          "text": "你不记得我了?我们是同班同学啊。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "???",
          "text": "同班……同学?什么意思?",
          "voice": "voice_hina_02",
          "se": null
        },
        {
          "speaker": "",
          "text": "她歪了歪头,表情很认真,完全不像在装傻。",
          "voice": null,
          "se": null,
          "charAnim": {
            "charId": "princess",
            "type": "sway",
            "options": {
              "duration": 500
            }
          }
        },
        {
          "speaker": "夜",
          "text": "你……真的不记得了?",
          "voice": null,
          "se": null
        },
        {
          "speaker": "???",
          "text": "我……我什么都不记得。只知道我叫'希尔薇',好像是……公主?",
          "voice": "voice_hina_03",
          "se": null
        },
        {
          "speaker": "希尔薇",
          "text": "但是!我看到你的脸,就觉得……很安心。",
          "voice": "voice_hina_01",
          "se": null
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_dream_princess_2"
    },
    {
      "id": "scene_ch1_dream_princess_2",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_serious",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_cry",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "希尔薇",
          "text": "你能帮帮我吗?我想找回记忆……",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "",
          "text": "她抓住我的衣角,眼神里满是期待。",
          "stage": {
            "moveChars": [
              {
                "match": "princess",
                "x": "-10vw",
                "y": "0px",
                "duration": 360,
                "easing": "ease-in-out"
              }
            ],
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_surprised",
                "duration": 120,
                "mode": "replace"
              }
            ]
          },
          "charAnim": {
            "charId": "sora",
            "type": "heartbeat",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "",
          "text": "这和现实里那个'对所有人都温柔'的阳菜完全不一样。"
        },
        {
          "speaker": "",
          "text": "这个'希尔薇'……只依赖我一个人。"
        }
      ],
      "choices": [
        {
          "text": "「当然,我会帮你」",
          "nextSceneId": "scene_ch1_dream_accept"
        },
        {
          "text": "「等等,让我先搞清楚状况」",
          "nextSceneId": "scene_ch1_dream_hesitate"
        }
      ],
      "autoNext": null
    },
    {
      "id": "scene_ch1_dream_accept",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_embarrassed",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "当然,我会帮你。"
        },
        {
          "speaker": "希尔薇",
          "text": "真的吗?!太好了!",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "",
          "text": "她突然抱住了我。",
          "stage": {
            "moveChars": [
              {
                "match": "princess",
                "x": "-18vw",
                "y": "0px",
                "duration": 360,
                "easing": "ease-in-out"
              },
              {
                "match": "sora",
                "x": "3vw",
                "y": "0px",
                "duration": 360,
                "easing": "ease-in-out"
              }
            ]
          },
          "charAnim": {
            "charId": "sora",
            "type": "shake",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "夜",
          "text": "喂喂喂!至少在梦里也注意下距离啊!"
        },
        {
          "speaker": "希尔薇",
          "text": "诶?为什么要注意距离?你是我的勇者呀!",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "等等,什么时候我就成勇者了?!"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_dream_battle"
    },
    {
      "id": "scene_ch1_dream_hesitate",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_serious",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "等等,让我先搞清楚状况……这到底是梦还是什么?",
          "voice": null,
          "se": null
        },
        {
          "speaker": "希尔薇",
          "text": "梦?这里是梦之森啊,当然是梦的一部分。",
          "voice": "voice_hina_02",
          "se": null
        },
        {
          "speaker": "夜",
          "text": "不是,我是说……算了,太复杂了。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "希尔薇",
          "text": "总之,你愿意帮我吗?",
          "voice": "voice_hina_01",
          "se": null
        },
        {
          "speaker": "夜",
          "text": "……行吧。反正是梦,随便了。",
          "voice": null,
          "se": null
        },
        {
          "speaker": "希尔薇",
          "text": "太好了!那你就是我的勇者了!",
          "voice": "voice_hina_03",
          "se": null
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_dream_battle"
    },
    {
      "id": "scene_ch1_dream_battle",
      "background": "bg_battle",
      "bgm": "bgm_battle_comedy",
      "particles": null,
      "characters": [
        {
          "id": "char_homework_slime",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_sora_serious",
          "position": "center",
          "opacity": 1
        },
        {
          "id": "char_princess_surprised",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "",
          "text": "刚说完,树林深处传来奇怪的声音。",
          "effects": {
            "shake": {
              "intensity": 8,
              "duration": 600
            }
          },
          "stage": {
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_surprised",
                "duration": 140,
                "mode": "replace"
              }
            ]
          }
        },
        {
          "speaker": "",
          "text": "「啾啾啾啾——」",
          "charAnim": {
            "charId": "princess",
            "type": "shake",
            "options": {
              "duration": 400
            }
          }
        },
        {
          "speaker": "夜",
          "text": "什么鬼?!",
          "effects": {
            "shake": {
              "intensity": 12,
              "duration": 700
            }
          }
        },
        {
          "speaker": "",
          "text": "从灌木丛里蹦出来一只……巨大的……"
        },
        {
          "speaker": "",
          "text": "……软绵绵的绿色史莱姆?"
        },
        {
          "speaker": "",
          "text": "而且它头上顶着一个牌子,上面写着:【作业怪 Lv.1】"
        },
        {
          "speaker": "夜",
          "text": "作业怪是什么鬼啊?!"
        },
        {
          "speaker": "希尔薇",
          "text": "小心!它要攻击了!",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "史莱姆张开嘴,吐出了……一张数学试卷?!",
          "se": "se_page_flip",
          "itemShow": {
            "itemId": "fx_paper_sheet",
            "label": "试卷",
            "options": {
              "position": "left",
              "duration": 1400,
              "animation": "float"
            }
          },
          "stage": {
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_serious",
                "duration": 140,
                "mode": "replace"
              }
            ]
          }
        },
        {
          "speaker": "",
          "text": "试卷在空中展开,上面写着:『请在3秒内算出273×19=?』",
          "itemShow": {
            "itemId": "fx_paper_stack",
            "label": "作业",
            "options": {
              "position": "center",
              "duration": 1200,
              "animation": "float"
            }
          }
        }
      ],
      "choices": [
        {
          "text": "「这谁算得出来啊!」(硬抗)",
          "nextSceneId": "scene_ch1_battle_tank"
        },
        {
          "text": "「躲开躲开!」(闪避)",
          "nextSceneId": "scene_ch1_battle_dodge"
        }
      ],
      "autoNext": null
    },
    {
      "id": "scene_ch1_battle_tank",
      "background": "bg_battle",
      "bgm": "bgm_battle_comedy",
      "particles": null,
      "characters": [
        {
          "id": "char_homework_slime",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_sora_annoyed",
          "position": "center",
          "opacity": 1
        },
        {
          "id": "char_princess_surprised",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "这谁算得出来啊!",
          "itemShow": {
            "itemId": "fx_paper_sheet",
            "label": "试卷",
            "options": {
              "position": "left",
              "duration": 1400,
              "animation": "appear"
            }
          }
        },
        {
          "speaker": "",
          "text": "试卷直接糊在了我脸上。",
          "se": "se_hit_light",
          "charAnim": {
            "charId": "homework_slime",
            "type": "bounce",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "",
          "text": "【你受到了精神伤害:社恐+3,智力-1】"
        },
        {
          "speaker": "夜",
          "text": "什么鬼的debuff啊!"
        },
        {
          "speaker": "希尔薇",
          "text": "让开!我来!",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "",
          "text": "她举起手,周围的光点开始聚集……",
          "se": "se_magic_sparkle",
          "stage": {
            "swapChars": [
              {
                "match": "princess",
                "id": "char_princess_cast",
                "duration": 140,
                "mode": "replace"
              }
            ]
          },
          "effects": {
            "spell": {
              "caster": "princess",
              "color": "#d080ff",
              "duration": 720,
              "count": 22,
              "size": 150
            }
          }
        },
        {
          "speaker": "希尔薇",
          "text": "『魔法·橡皮擦!』",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "",
          "text": "一道光束射出,直接把试卷蒸发了。",
          "se": "se_beam",
          "stage": {
            "swapChars": [
              {
                "match": "princess",
                "id": "char_princess_cast",
                "duration": 140,
                "mode": "replace",
                "delay": 900
              }
            ]
          },
          "effects": {
            "beam": {
              "from": "princess",
              "to": "homework_slime",
              "color": "#d080ff",
              "duration": 320,
              "width": 10
            },
            "hit": {
              "target": "homework_slime",
              "color": "#70d0ff",
              "duration": 420,
              "count": 16,
              "size": 110
            },
            "paperVanish": {
              "target": "homework_slime",
              "variant": "stack",
              "duration": 420,
              "size": 180,
              "delay": 40
            }
          },
          "charAnim": {
            "charId": "homework_slime",
            "type": "hurt",
            "options": {
              "duration": 380
            }
          }
        },
        {
          "speaker": "夜",
          "text": "卧槽,公主你这么猛的吗?!",
          "stage": {
            "swapChars": [
              {
                "match": "princess",
                "id": "char_princess_smile",
                "duration": 140,
                "mode": "replace"
              }
            ]
          }
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_battle_continue"
    },
    {
      "id": "scene_ch1_battle_dodge",
      "background": "bg_battle",
      "bgm": "bgm_battle_comedy",
      "particles": null,
      "characters": [
        {
          "id": "char_homework_slime",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_sora_serious",
          "position": "center",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "躲开躲开!"
        },
        {
          "speaker": "",
          "text": "我一个侧身滚到旁边,试卷擦着我的脸飞过去。"
        },
        {
          "speaker": "",
          "text": "【闪避成功!敏捷+1】"
        },
        {
          "speaker": "希尔薇",
          "text": "好厉害!你好灵活!",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "夜",
          "text": "废话,我可是躲了三年班主任投粉笔头的男人!"
        },
        {
          "speaker": "",
          "text": "等等,我为什么要在梦里吹这种牛。"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_battle_continue"
    },
    {
      "id": "scene_ch1_battle_continue",
      "background": "bg_battle",
      "bgm": "bgm_battle_comedy",
      "particles": null,
      "characters": [
        {
          "id": "char_homework_slime",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_sora_serious",
          "position": "center",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "",
          "text": "作业怪又开始蓄力,准备吐出第二张试卷。"
        },
        {
          "speaker": "夜",
          "text": "不行,得想办法反击!"
        },
        {
          "speaker": "",
          "text": "但我手里什么武器都没有……等等,如果这是梦的话……",
          "effects": {
            "particles": {
              "type": "sparkle",
              "count": 18,
              "duration": 1200
            }
          }
        },
        {
          "speaker": "夜",
          "text": "给我出来!武器!",
          "se": "se_magic_sparkle",
          "effects": {
            "particles": {
              "type": "sparkle",
              "count": 14,
              "duration": 900
            }
          }
        },
        {
          "speaker": "",
          "text": "我伸手往空中一抓——",
          "se": "se_magic_sparkle"
        },
        {
          "speaker": "",
          "text": "手里凭空出现了……一把扫帚?!",
          "itemShow": {
            "itemId": "item_broom",
            "options": {
              "position": "center",
              "duration": 1800,
              "animation": "float"
            }
          }
        },
        {
          "speaker": "夜",
          "text": "为什么是扫帚啊?!"
        },
        {
          "speaker": "希尔薇",
          "text": "武器是根据心灵形态具现化的!你平时一定很常用扫帚!",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "夜",
          "text": "我不想承认……"
        }
      ],
      "choices": [
        {
          "text": "「管他的,扫帚也能打!」",
          "nextSceneId": "scene_ch1_battle_win"
        },
        {
          "text": "「让我换个武器!剑!剑啊!」",
          "nextSceneId": "scene_ch1_battle_fumble"
        }
      ],
      "autoNext": null
    },
    {
      "id": "scene_ch1_battle_win",
      "background": "bg_battle",
      "bgm": "bgm_battle_comedy",
      "particles": null,
      "characters": [
        {
          "id": "char_homework_slime",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_sora_smile",
          "position": "center",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "管他的,扫帚也能打!",
          "effects": {
            "particles": {
              "type": "sparkle",
              "count": 18,
              "duration": 900
            }
          }
        },
        {
          "speaker": "",
          "text": "我冲上去,用扫帚狠狠戳向作业怪。",
          "se": "se_sword_swing",
          "charAnim": {
            "charId": "sora",
            "type": "jump",
            "options": {
              "duration": 620
            }
          },
          "itemShow": {
            "itemId": "item_broom",
            "options": {
              "position": "center",
              "duration": 1300,
              "animation": "float"
            }
          }
        },
        {
          "speaker": "",
          "text": "『嘭!』",
          "se": "se_hit_light",
          "effects": {
            "hit": {
              "target": "homework_slime",
              "color": "#70d0ff",
              "duration": 380,
              "count": 14,
              "size": 100
            },
            "shake": {
              "intensity": 6,
              "duration": 220
            }
          },
          "charAnim": {
            "charId": "homework_slime",
            "type": "hurt",
            "options": {
              "duration": 360
            }
          }
        },
        {
          "speaker": "",
          "text": "作业怪被戳得倒飞出去,撞在树上,化成一团粉色烟雾消失了。",
          "stage": {
            "hideChars": [
              {
                "charId": "homework_slime",
                "duration": 200,
                "remove": true
              }
            ]
          },
          "effects": {
            "puff": {
              "target": "homework_slime",
              "color": "#ffb0d0",
              "duration": 520,
              "count": 18,
              "size": 140
            }
          }
        },
        {
          "speaker": "",
          "text": "【战斗胜利!获得经验值10!扫帚熟练度+5!】",
          "se": "se_notification"
        },
        {
          "speaker": "夜",
          "text": "扫帚熟练度是什么鬼啊……"
        },
        {
          "speaker": "希尔薇",
          "text": "你好厉害!一击就打败了!",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "",
          "text": "她眼睛亮晶晶的,看着我的表情就像在看什么超级英雄。"
        },
        {
          "speaker": "",
          "text": "这种被崇拜的感觉……意外地不错。"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_after_battle"
    },
    {
      "id": "scene_ch1_battle_fumble",
      "background": "bg_battle",
      "bgm": "bgm_battle_comedy",
      "particles": null,
      "characters": [
        {
          "id": "char_homework_slime",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_sora_annoyed",
          "position": "center",
          "opacity": 1
        },
        {
          "id": "char_princess_surprised",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "让我换个武器!剑!剑啊!",
          "character": "char_sora_serious"
        },
        {
          "speaker": "",
          "text": "我拼命想象手里拿着一把剑……"
        },
        {
          "speaker": "",
          "text": "扫帚变成了……一把塑料玩具剑。",
          "se": "se_fumble",
          "itemShow": {
            "itemId": "item_sword",
            "options": {
              "position": "center",
              "duration": 2200,
              "animation": "spin"
            }
          }
        },
        {
          "speaker": "夜",
          "text": "这更差劲了吧?!"
        },
        {
          "speaker": "希尔薇",
          "text": "小心!它又要攻击了!",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "没办法了,我抡起玩具剑冲了上去。",
          "se": "se_sword_swing"
        },
        {
          "speaker": "",
          "text": "『啪叽!』",
          "se": "se_hit_light",
          "effects": {
            "hit": {
              "target": "homework_slime",
              "color": "#ffb0d0",
              "duration": 380,
              "count": 14,
              "size": 100
            },
            "shake": {
              "intensity": 6,
              "duration": 220
            }
          },
          "charAnim": {
            "charId": "homework_slime",
            "type": "hurt",
            "options": {
              "duration": 360
            }
          }
        },
        {
          "speaker": "",
          "text": "玩具剑拍在作业怪身上,发出了超级滑稽的声音。"
        },
        {
          "speaker": "",
          "text": "但……作业怪居然消失了?!",
          "stage": {
            "hideChars": [
              {
                "charId": "homework_slime",
                "duration": 200,
                "remove": true
              }
            ]
          },
          "effects": {
            "puff": {
              "target": "homework_slime",
              "color": "#ffb0d0",
              "duration": 520,
              "count": 18,
              "size": 140
            }
          }
        },
        {
          "speaker": "",
          "text": "【战斗胜利!获得经验值10!羞耻抗性+3!】",
          "se": "se_notification"
        },
        {
          "speaker": "夜",
          "text": "羞耻抗性又是什么鬼啊?!",
          "character": "char_sora_annoyed"
        },
        {
          "speaker": "希尔薇",
          "text": "虽然过程有点……但你还是赢了!太棒了!",
          "voice": "voice_hina_02"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_after_battle"
    },
    {
      "id": "scene_ch1_after_battle",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_normal",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "希尔薇",
          "text": "谢谢你救了我!你真的很可靠!",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "",
          "text": "她又往我这边靠了靠。",
          "stage": {
            "moveChars": [
              {
                "match": "princess",
                "x": "-12vw",
                "y": "0px",
                "duration": 420,
                "easing": "ease-in-out"
              }
            ],
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_surprised",
                "duration": 120,
                "mode": "replace"
              }
            ]
          },
          "charAnim": {
            "charId": "princess",
            "type": "sway",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "",
          "text": "这种距离……在现实里绝对不可能。",
          "stage": {
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_embarrassed",
                "duration": 140,
                "mode": "replace"
              }
            ]
          },
          "charAnim": {
            "charId": "sora",
            "type": "heartbeat",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "夜",
          "text": "那个……希尔薇,你接下来打算怎么办?"
        },
        {
          "speaker": "希尔薇",
          "text": "我想找回记忆。听说在梦之塔的顶层,有能看见过去的魔镜。",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "希尔薇",
          "text": "你能陪我一起去吗?",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "",
          "text": "她的眼神很真诚,没有一丝犹豫。"
        },
        {
          "speaker": "",
          "text": "和现实里那个'对谁都温柔'的阳菜完全不同……"
        },
        {
          "speaker": "",
          "text": "这个梦里的她,只看着我一个人。"
        }
      ],
      "choices": [
        {
          "text": "「当然,我会陪你」",
          "nextSceneId": "scene_ch1_promise"
        },
        {
          "text": "「……我再想想」",
          "nextSceneId": "scene_ch1_hesitate2"
        }
      ],
      "autoNext": null
    },
    {
      "id": "scene_ch1_promise",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_smile",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_smile",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "当然,我会陪你。"
        },
        {
          "speaker": "希尔薇",
          "text": "真的?!太好了!",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "",
          "text": "她开心地握住了我的手。",
          "stage": {
            "moveChars": [
              {
                "match": "princess",
                "x": "-16vw",
                "y": "0px",
                "duration": 380,
                "easing": "ease-in-out"
              }
            ],
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_surprised",
                "duration": 120,
                "mode": "replace"
              }
            ]
          },
          "charAnim": {
            "charId": "sora",
            "type": "heartbeat",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "",
          "text": "手心很温暖。",
          "stage": {
            "swapChars": [
              {
                "match": "sora",
                "id": "char_sora_embarrassed",
                "duration": 140,
                "mode": "replace"
              }
            ]
          }
        },
        {
          "speaker": "",
          "text": "但就在这时——"
        },
        {
          "speaker": "",
          "text": "周围的景色开始扭曲,光点逐渐消失。"
        },
        {
          "speaker": "希尔薇",
          "text": "诶?怎么了?",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "我的意识越来越模糊……",
          "effects": {
            "eyeClose": {
              "duration": 720,
              "persist": true,
              "blur": 0.9
            }
          }
        },
        {
          "speaker": "",
          "text": "该醒了。"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_morning"
    },
    {
      "id": "scene_ch1_hesitate2",
      "background": "bg_forest",
      "bgm": "bgm_dream_forest",
      "particles": "firefly",
      "characters": [
        {
          "id": "char_sora_serious",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_princess_cry",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "……我再想想。"
        },
        {
          "speaker": "希尔薇",
          "text": "诶?为什么?",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "夜",
          "text": "因为这毕竟是梦……我不确定能帮到你多少。"
        },
        {
          "speaker": "希尔薇",
          "text": "但是……你在这里,就已经帮到我了。",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "她低下头,看起来有点失落。"
        },
        {
          "speaker": "",
          "text": "就在我想说点什么的时候——"
        },
        {
          "speaker": "",
          "text": "周围的景色开始扭曲,光点逐渐消失。"
        },
        {
          "speaker": "夜",
          "text": "等等……!"
        },
        {
          "speaker": "",
          "text": "意识越来越模糊……",
          "effects": {
            "eyeClose": {
              "duration": 520,
              "persist": true,
              "blur": 0.9
            }
          }
        },
        {
          "speaker": "",
          "text": "……"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_morning"
    },
    {
      "id": "scene_ch1_morning",
      "background": "bg_bedroom_morning",
      "bgm": "bgm_daily",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_surprised",
          "position": "center",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "",
          "text": "……"
        },
        {
          "speaker": "",
          "text": "『叮铃铃铃——』",
          "se": "se_bell"
        },
        {
          "speaker": "",
          "text": "闹钟响了。"
        },
        {
          "speaker": "夜",
          "text": "……嗯?"
        },
        {
          "speaker": "",
          "text": "我睁开了眼,看到熟悉的天花板。",
          "effects": {
            "eyeOpen": {
              "duration": 760,
              "blur": 1.3,
              "hold": 520
            }
          }
        },
        {
          "speaker": "夜",
          "text": "梦……吗?",
          "effects": {
            "wake": {
              "duration": 560,
              "count": 10,
              "sparkColor": "#f0c674",
              "spread": 120
            }
          }
        },
        {
          "speaker": "",
          "text": "刚才的一切都太真实了。森林、魔法、还有……"
        },
        {
          "speaker": "夜",
          "text": "……希尔薇。"
        },
        {
          "speaker": "",
          "text": "那个在梦里只依赖我的'阳菜'。"
        },
        {
          "speaker": "",
          "text": "我摇了摇头,起床洗漱,抓起伞准备去学校。",
          "itemShow": {
            "itemId": "item_umbrella",
            "options": {
              "position": "left",
              "duration": 2200,
              "animation": "float"
            }
          }
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_school_again"
    },
    {
      "id": "scene_ch1_school_again",
      "background": "bg_school_morning",
      "bgm": "bgm_daily",
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
          "text": "到了学校,我刚坐下——"
        }
      ],
      "choices": null,
      "autoNext": "scene_ch1_school_again_2"
    },
    {
      "id": "scene_ch1_school_again_2",
      "background": "bg_school_morning",
      "bgm": "bgm_daily",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_embarrassed",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_hina_happy",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "阳菜",
          "text": "早上好~!",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "阳菜走了过来,笑容和往常一样明媚。"
        },
        {
          "speaker": "",
          "text": "但我看到她的瞬间,脑子里闪过梦中的画面——"
        },
        {
          "speaker": "",
          "text": "那个握着我的手,眼里只有我的'希尔薇'。"
        },
        {
          "speaker": "阳菜",
          "text": "你的笔记,还你~谢谢啦!",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "",
          "text": "她把笔记本放在我桌上,手指不小心碰到了我的手。",
          "stage": {
            "moveChars": [
              {
                "match": "hina",
                "x": "-4vw",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              },
              {
                "match": "sora",
                "x": "2vw",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              }
            ],
            "swapChars": [
              {
                "match": "hina",
                "id": "char_hina_thinking",
                "duration": 140,
                "mode": "replace"
              }
            ]
          },
          "charAnim": {
            "charId": "sora",
            "type": "heartbeat",
            "options": {
              "duration": 520
            }
          },
          "itemShow": {
            "itemId": "item_book",
            "options": {
              "position": "center",
              "duration": 1600,
              "animation": "appear"
            }
          }
        },
        {
          "speaker": "",
          "text": "和昨天一样的触感。"
        },
        {
          "speaker": "",
          "text": "但我的心跳……好像比昨天快了一点。"
        },
        {
          "speaker": "阳菜",
          "text": "诶?你脸怎么红了?",
          "voice": "voice_hina_03",
          "stage": {
            "swapChars": [
              {
                "match": "hina",
                "id": "char_hina_surprised",
                "duration": 120,
                "mode": "replace"
              }
            ],
            "moveChars": [
              {
                "match": "hina",
                "x": "0px",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              },
              {
                "match": "sora",
                "x": "0px",
                "y": "0px",
                "duration": 260,
                "easing": "ease-in-out"
              }
            ]
          },
          "charAnim": {
            "charId": "hina",
            "type": "bounce",
            "options": {
              "duration": 520
            }
          }
        },
        {
          "speaker": "夜",
          "text": "没、没有!"
        },
        {
          "speaker": "阳菜",
          "text": "哈哈,你该不会发烧了吧?",
          "voice": "voice_hina_01"
        }
      ],
      "choices": [
        {
          "text": "「只是没睡好」",
          "nextSceneId": "scene_ch1_excuse"
        },
        {
          "text": "「……你昨晚做梦了吗?」",
          "nextSceneId": "scene_ch1_ask_dream"
        }
      ],
      "autoNext": null
    },
    {
      "id": "scene_ch1_excuse",
      "background": "bg_school_morning",
      "bgm": "bgm_daily",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_normal",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_hina_normal",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "只是没睡好……"
        },
        {
          "speaker": "阳菜",
          "text": "那你今晚要早点睡哦。",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "",
          "text": "她说完就回到了自己的座位。"
        },
        {
          "speaker": "",
          "text": "我看着她的背影,心里有点复杂。"
        },
        {
          "speaker": "",
          "text": "现实里的她,和梦里的她……"
        },
        {
          "speaker": "",
          "text": "到底哪个才是真的?"
        },
        {
          "speaker": "",
          "text": "上课铃响了。",
          "se": "se_bell"
        },
        {
          "speaker": "",
          "text": "我的日常继续着,但心里隐隐感觉……"
        },
        {
          "speaker": "",
          "text": "有什么不一样的事情,要开始了。",
          "effects": {
            "particles": {
              "type": "sparkle",
              "count": 15,
              "duration": 3000
            }
          }
        },
        {
          "speaker": "",
          "text": "——第一章 完——"
        }
      ],
      "choices": null,
      "autoNext": null
    },
    {
      "id": "scene_ch1_ask_dream",
      "background": "bg_school_morning",
      "bgm": "bgm_mystery",
      "particles": null,
      "characters": [
        {
          "id": "char_sora_serious",
          "position": "left",
          "opacity": 1
        },
        {
          "id": "char_hina_thinking",
          "position": "right",
          "opacity": 1
        }
      ],
      "dialogs": [
        {
          "speaker": "夜",
          "text": "……你昨晚做梦了吗?"
        },
        {
          "speaker": "阳菜",
          "text": "诶?梦?",
          "voice": "voice_hina_01"
        },
        {
          "speaker": "",
          "text": "她愣了一下,然后歪了歪头。"
        },
        {
          "speaker": "阳菜",
          "text": "好像……有做梦?但醒来就忘了。",
          "voice": "voice_hina_02"
        },
        {
          "speaker": "阳菜",
          "text": "怎么突然问这个?",
          "voice": "voice_hina_03"
        },
        {
          "speaker": "夜",
          "text": "没、没什么,随便问问。"
        },
        {
          "speaker": "",
          "text": "她笑了笑,回到了自己的座位。"
        },
        {
          "speaker": "",
          "text": "但我注意到——"
        },
        {
          "speaker": "",
          "text": "她在转身的瞬间,表情好像闪过一丝困惑。"
        },
        {
          "speaker": "",
          "text": "就好像……她也在努力回想什么。"
        },
        {
          "speaker": "",
          "text": "上课铃响了。",
          "se": "se_bell"
        },
        {
          "speaker": "",
          "text": "我回到座位,看向窗外明媚的阳光。"
        },
        {
          "speaker": "",
          "text": "梦境和现实,开始在心里交织起来……",
          "effects": {
            "particles": {
              "type": "sparkle",
              "count": 15,
              "duration": 3000
            }
          }
        },
        {
          "speaker": "",
          "text": "——第一章 完——"
        }
      ],
      "choices": null,
      "autoNext": null
    }
  ]
});
