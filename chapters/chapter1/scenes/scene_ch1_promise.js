window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_promise = {
  id: 'scene_ch1_promise',
  background: 'bg_forest',
  bgm: 'bgm_dream_forest',
  particles: 'firefly',
  characters: [
    { id: 'char_sora_smile', position: 'left', opacity: 1 },
    { id: 'char_princess_smile', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '当然，我会陪你。' },
    { speaker: '希尔薇', text: '真的?!太好了!', voice: 'voice_hina_03' },
    {
      speaker: '',
      text: '她开心地握住了我的手。',
      stage: {
        moveChars: [{ match: 'princess', x: '-16vw', y: '0px', duration: 380, easing: 'ease-in-out' }],
        swapChars: [{ match: 'sora', id: 'char_sora_surprised', duration: 120, mode: 'replace' }]
      },
      charAnim: { charId: 'sora', type: 'heartbeat', options: { duration: 520 } }
    },
    {
      speaker: '',
      text: '手心很温暖。',
      stage: { swapChars: [{ match: 'sora', id: 'char_sora_embarrassed', duration: 140, mode: 'replace' }] }
    },
    { speaker: '', text: '但就在这时——' },
    { speaker: '', text: '周围的景色开始扭曲，光点逐渐消失。' },
    { speaker: '希尔薇', text: '诶?怎么了?', voice: 'voice_hina_01' },
    {
      speaker: '',
      text: '我的意识越来越模糊……',
      effects: { eyeClose: { duration: 720, persist: true, blur: 0.9 } }
    },
    { speaker: '', text: '该醒了。' }
  ],
  choices: null,
  autoNext: 'scene_ch1_morning'
};
