window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_school_again_2 = {
  id: 'scene_ch1_school_again_2',
  background: 'bg_school_morning',
  bgm: 'bgm_daily',
  particles: null,
  characters: [
    { id: 'char_sora_embarrassed', position: 'left', opacity: 1 },
    { id: 'char_hina_happy', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '阳菜', text: '早上好~!', voice: 'voice_hina_01' },
    { speaker: '', text: '阳菜走了过来，笑容和往常一样明媚。' },
    { speaker: '', text: '但我看到她的瞬间，脑子里闪过梦中的画面——' },
    { speaker: '', text: '那个握着我的手，眼里只有我的「希尔薇」。' },
    { speaker: '阳菜', text: '你的笔记，还你~谢谢啦!', voice: 'voice_hina_02' },
    {
      speaker: '',
      text: '她把笔记本放在我桌上，手指不小心碰到了我的手。',
      stage: {
        moveChars: [
          { match: 'hina', x: '-4vw', y: '0px', duration: 260, easing: 'ease-in-out' },
          { match: 'sora', x: '2vw', y: '0px', duration: 260, easing: 'ease-in-out' }
        ],
        swapChars: [{ match: 'hina', id: 'char_hina_thinking', duration: 140, mode: 'replace' }]
      },
      charAnim: { charId: 'sora', type: 'heartbeat', options: { duration: 520 } },
      itemShow: { itemId: 'item_book', options: { position: 'center', duration: 1600, animation: 'appear' } }
    },
    { speaker: '', text: '和昨天一样的触感。' },
    { speaker: '', text: '但我的心跳……好像比昨天快了一点。' },
    {
      speaker: '阳菜',
      text: '诶?你脸怎么红了?',
      voice: 'voice_hina_03',
      stage: {
        swapChars: [{ match: 'hina', id: 'char_hina_surprised', duration: 120, mode: 'replace' }],
        moveChars: [
          { match: 'hina', x: '0px', y: '0px', duration: 260, easing: 'ease-in-out' },
          { match: 'sora', x: '0px', y: '0px', duration: 260, easing: 'ease-in-out' }
        ]
      },
      charAnim: { charId: 'hina', type: 'bounce', options: { duration: 520 } }
    },
    { speaker: '夜', text: '没、没有!' },
    { speaker: '阳菜', text: '哈哈，你该不会发烧了吧?', voice: 'voice_hina_01' }
  ],
  choices: [
    { text: '「只是没睡好」', nextSceneId: 'scene_ch1_excuse' },
    { text: '「……你昨晚做梦了吗?」', nextSceneId: 'scene_ch1_ask_dream' }
  ],
  autoNext: null
};
