window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_classroom = {
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
};
