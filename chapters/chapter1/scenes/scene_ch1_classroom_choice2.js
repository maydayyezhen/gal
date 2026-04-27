window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_classroom_choice2 = {
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
};
