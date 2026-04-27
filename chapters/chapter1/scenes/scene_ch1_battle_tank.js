window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_battle_tank = {
  id: 'scene_ch1_battle_tank',
  background: 'bg_battle',
  bgm: 'bgm_battle_comedy',
  particles: null,
  characters: [
    { id: 'char_homework_slime', position: 'left', opacity: 1 },
    { id: 'char_sora_annoyed', position: 'center', opacity: 1 },
    { id: 'char_princess_surprised', position: 'right', opacity: 1 }
  ],
  dialogs: [
    {
      speaker: '夜',
      text: '这谁算得出来啊!',
      itemShow: { itemId: 'fx_paper_sheet', label: '试卷', options: { position: 'left', duration: 1400, animation: 'appear' } }
    },
    {
      speaker: '',
      text: '试卷直接糊在了我脸上。',
      se: 'se_hit_light',
      charAnim: { charId: 'homework_slime', type: 'bounce', options: { duration: 520 } }
    },
    { speaker: '', text: '【你受到了精神伤害:社恐+3，智力-1】' },
    { speaker: '夜', text: '什么鬼的debuff啊!' },
    { speaker: '希尔薇', text: '让开!我来!', voice: 'voice_hina_02' },
    {
      speaker: '',
      text: '她举起手，周围的光点开始聚集……',
      se: 'se_magic_sparkle',
      stage: { swapChars: [{ match: 'princess', id: 'char_princess_cast', duration: 140, mode: 'replace' }] },
      effects: { spell: { caster: 'princess', color: '#d080ff', duration: 720, count: 22, size: 150 } }
    },
    { speaker: '希尔薇', text: '『魔法·橡皮擦!』', voice: 'voice_hina_03' },
    {
      speaker: '',
      text: '一道光束射出，直接把试卷蒸发了。',
      se: 'se_beam',
      stage: { swapChars: [{ match: 'princess', id: 'char_princess_cast', duration: 140, mode: 'replace', delay: 900 }] },
      effects: {
        beam: { from: 'princess', to: 'homework_slime', color: '#d080ff', duration: 320, width: 10 },
        hit: { target: 'homework_slime', color: '#70d0ff', duration: 420, count: 16, size: 110 },
        paperVanish: { target: 'homework_slime', variant: 'stack', duration: 420, size: 180, delay: 40 }
      },
      charAnim: { charId: 'homework_slime', type: 'hurt', options: { duration: 380 } }
    },
    {
      speaker: '夜',
      text: '卧槽，公主你这么猛的吗?!',
      stage: { swapChars: [{ match: 'princess', id: 'char_princess_smile', duration: 140, mode: 'replace' }] }
    }
  ],
  choices: null,
  autoNext: 'scene_ch1_battle_continue'
};
