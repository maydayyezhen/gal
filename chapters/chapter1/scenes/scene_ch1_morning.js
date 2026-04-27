window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_morning = {
  id: 'scene_ch1_morning',
  background: 'bg_bedroom_morning',
  bgm: 'bgm_daily',
  particles: null,
  characters: [
    { id: 'char_sora_surprised', position: 'center', opacity: 1 }
  ],
  dialogs: [
    { speaker: '', text: '……' },
    { speaker: '', text: '『叮铃铃铃——』', se: 'se_bell' },
    { speaker: '', text: '闹钟响了。' },
    { speaker: '夜', text: '……嗯?' },
    {
      speaker: '',
      text: '我睁开了眼，看到熟悉的天花板。',
      effects: { eyeOpen: { duration: 760, blur: 1.3, hold: 520 } }
    },
    {
      speaker: '夜',
      text: '梦……吗?',
      effects: { wake: { duration: 560, count: 10, sparkColor: '#f0c674', spread: 120 } }
    },
    { speaker: '', text: '刚才的一切都太真实了。森林、魔法、还有……' },
    { speaker: '夜', text: '……希尔薇。' },
    { speaker: '', text: '那个在梦里只依赖我的「阳菜」。' },
    {
      speaker: '',
      text: '我摇了摇头，起床洗漱，抓起伞准备去学校。',
      itemShow: { itemId: 'item_umbrella', options: { position: 'left', duration: 2200, animation: 'float' } }
    }
  ],
  choices: null,
  autoNext: 'scene_ch1_school_again'
};
