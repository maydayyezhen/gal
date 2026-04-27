window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_dream_princess_2 = {
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
};
