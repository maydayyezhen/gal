window.CHAPTER1_DATA = window.CHAPTER1_DATA || {};
window.CHAPTER1_DATA.scenes_02 = [
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
  }
];
