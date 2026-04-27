window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_classroom_choice1 = {
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
};
