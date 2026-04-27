window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_dream_accept = {
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
};
