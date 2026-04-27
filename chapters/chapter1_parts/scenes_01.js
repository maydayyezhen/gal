window.CHAPTER1_DATA = window.CHAPTER1_DATA || {};
window.CHAPTER1_DATA.scenes_01 = [
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
  }
];
