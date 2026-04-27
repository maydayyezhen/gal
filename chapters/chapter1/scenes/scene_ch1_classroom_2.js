window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_classroom_2 = {
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
};
