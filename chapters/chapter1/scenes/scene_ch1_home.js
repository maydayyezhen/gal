window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_home = {
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
};
