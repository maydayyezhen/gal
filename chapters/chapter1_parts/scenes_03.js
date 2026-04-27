window.CHAPTER1_DATA = window.CHAPTER1_DATA || {};
window.CHAPTER1_DATA.scenes_03 = [
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
];
