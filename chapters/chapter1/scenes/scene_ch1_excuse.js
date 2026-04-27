window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_excuse = {
  id: 'scene_ch1_excuse',
  background: 'bg_school_morning',
  bgm: 'bgm_daily',
  particles: null,
  characters: [
    { id: 'char_sora_normal', position: 'left', opacity: 1 },
    { id: 'char_hina_normal', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '只是没睡好……' },
    { speaker: '阳菜', text: '那你今晚要早点睡哦。', voice: 'voice_hina_02' },
    { speaker: '', text: '她说完就回到了自己的座位。' },
    { speaker: '', text: '我看着她的背影，心里有点复杂。' },
    { speaker: '', text: '现实里的她，和梦里的她……' },
    { speaker: '', text: '到底哪个才是真的?' },
    { speaker: '', text: '上课铃响了。', se: 'se_bell' },
    { speaker: '', text: '我的日常继续着，但心里隐隐感觉……' },
    {
      speaker: '',
      text: '有什么不一样的事情，要开始了。',
      effects: { particles: { type: 'sparkle', count: 15, duration: 3000 } }
    },
    { speaker: '', text: '——第一章 完——' }
  ],
  choices: null,
  autoNext: null
};
