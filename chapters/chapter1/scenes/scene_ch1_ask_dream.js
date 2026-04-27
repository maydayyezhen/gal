window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_ask_dream = {
  id: 'scene_ch1_ask_dream',
  background: 'bg_school_morning',
  bgm: 'bgm_mystery',
  particles: null,
  characters: [
    { id: 'char_sora_serious', position: 'left', opacity: 1 },
    { id: 'char_hina_thinking', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '……你昨晚做梦了吗?' },
    { speaker: '阳菜', text: '诶?梦?', voice: 'voice_hina_01' },
    { speaker: '', text: '她愣了一下，然后歪了歪头。' },
    { speaker: '阳菜', text: '好像……有做梦?但醒来就忘了。', voice: 'voice_hina_02' },
    { speaker: '阳菜', text: '怎么突然问这个?', voice: 'voice_hina_03' },
    { speaker: '夜', text: '没、没什么，随便问问。' },
    { speaker: '', text: '她笑了笑，回到了自己的座位。' },
    { speaker: '', text: '但我注意到——' },
    { speaker: '', text: '她在转身的瞬间，表情好像闪过一丝困惑。' },
    { speaker: '', text: '就好像……她也在努力回想什么。' },
    { speaker: '', text: '上课铃响了。', se: 'se_bell' },
    { speaker: '', text: '我回到座位，看向窗外明媚的阳光。' },
    {
      speaker: '',
      text: '梦境和现实，开始在心里交织起来……',
      effects: { particles: { type: 'sparkle', count: 15, duration: 3000 } }
    },
    { speaker: '', text: '——第一章 完——' }
  ],
  choices: null,
  autoNext: null
};
