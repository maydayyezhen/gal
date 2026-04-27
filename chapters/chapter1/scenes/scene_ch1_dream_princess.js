window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_dream_princess = {
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
};
