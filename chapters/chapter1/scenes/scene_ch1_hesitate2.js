window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_hesitate2 = {
  id: 'scene_ch1_hesitate2',
  background: 'bg_forest',
  bgm: 'bgm_dream_forest',
  particles: 'firefly',
  characters: [
    { id: 'char_sora_serious', position: 'left', opacity: 1 },
    { id: 'char_princess_cry', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '……我再想想。' },
    { speaker: '希尔薇', text: '诶?为什么?', voice: 'voice_hina_02' },
    { speaker: '夜', text: '因为这毕竟是梦……我不确定能帮到你多少。' },
    { speaker: '希尔薇', text: '但是……你在这里，就已经帮到我了。', voice: 'voice_hina_01' },
    { speaker: '', text: '她低下头，看起来有点失落。' },
    { speaker: '', text: '就在我想说点什么的时候——' },
    { speaker: '', text: '周围的景色开始扭曲，光点逐渐消失。' },
    { speaker: '夜', text: '等等……!' },
    {
      speaker: '',
      text: '意识越来越模糊……',
      effects: { eyeClose: { duration: 520, persist: true, blur: 0.9 } }
    },
    { speaker: '', text: '……' }
  ],
  choices: null,
  autoNext: 'scene_ch1_morning'
};
