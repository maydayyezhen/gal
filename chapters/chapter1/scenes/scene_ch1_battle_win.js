window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_battle_win = {
  id: 'scene_ch1_battle_win',
  background: 'bg_battle',
  bgm: 'bgm_battle_comedy',
  particles: null,
  characters: [
    { id: 'char_homework_slime', position: 'left', opacity: 1 },
    { id: 'char_sora_smile', position: 'center', opacity: 1 },
    { id: 'char_princess_smile', position: 'right', opacity: 1 }
  ],
  dialogs: [
    {
      speaker: '夜',
      text: '管他的，扫帚也能打!',
      effects: { particles: { type: 'sparkle', count: 18, duration: 900 } }
    },
    {
      speaker: '',
      text: '我冲上去，用扫帚狠狠戳向作业怪。',
      se: 'se_sword_swing',
      charAnim: { charId: 'sora', type: 'jump', options: { duration: 620 } },
      itemShow: { itemId: 'item_broom', options: { position: 'center', duration: 1300, animation: 'float' } }
    },
    {
      speaker: '',
      text: '『嘭!』',
      se: 'se_hit_light',
      effects: {
        hit: { target: 'homework_slime', color: '#70d0ff', duration: 380, count: 14, size: 100 },
        shake: { intensity: 6, duration: 220 }
      },
      charAnim: { charId: 'homework_slime', type: 'hurt', options: { duration: 360 } }
    },
    {
      speaker: '',
      text: '作业怪被戳得倒飞出去，撞在树上，化成一团粉色烟雾消失了。',
      stage: { hideChars: [{ charId: 'homework_slime', duration: 200, remove: true }] },
      effects: { puff: { target: 'homework_slime', color: '#ffb0d0', duration: 520, count: 18, size: 140 } }
    },
    { speaker: '', text: '【战斗胜利!获得经验值10!扫帚熟练度+5!】', se: 'se_notification' },
    { speaker: '夜', text: '扫帚熟练度是什么鬼啊……' },
    { speaker: '希尔薇', text: '你好厉害!一击就打败了!', voice: 'voice_hina_03' },
    { speaker: '', text: '她眼睛亮晶晶的，看着我的表情就像在看什么超级英雄。' },
    { speaker: '', text: '这种被崇拜的感觉……意外地不错。' }
  ],
  choices: null,
  autoNext: 'scene_ch1_after_battle'
};
