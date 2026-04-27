window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_battle_fumble = {
  id: 'scene_ch1_battle_fumble',
  background: 'bg_battle',
  bgm: 'bgm_battle_comedy',
  particles: null,
  characters: [
    { id: 'char_homework_slime', position: 'left', opacity: 1 },
    { id: 'char_sora_annoyed', position: 'center', opacity: 1 },
    { id: 'char_princess_surprised', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '让我换个武器!剑!剑啊!', character: 'char_sora_serious' },
    { speaker: '', text: '我拼命想象手里拿着一把剑……' },
    {
      speaker: '',
      text: '扫帚变成了……一把塑料玩具剑。',
      se: 'se_fumble',
      itemShow: { itemId: 'item_sword', options: { position: 'center', duration: 2200, animation: 'spin' } }
    },
    { speaker: '夜', text: '这更差劲了吧?!' },
    { speaker: '希尔薇', text: '小心!它又要攻击了!', voice: 'voice_hina_01' },
    { speaker: '', text: '没办法了，我抡起玩具剑冲了上去。', se: 'se_sword_swing' },
    {
      speaker: '',
      text: '『啪叽!』',
      se: 'se_hit_light',
      effects: {
        hit: { target: 'homework_slime', color: '#ffb0d0', duration: 380, count: 14, size: 100 },
        shake: { intensity: 6, duration: 220 }
      },
      charAnim: { charId: 'homework_slime', type: 'hurt', options: { duration: 360 } }
    },
    { speaker: '', text: '玩具剑拍在作业怪身上，发出了超级滑稽的声音。' },
    {
      speaker: '',
      text: '但……作业怪居然消失了?!',
      stage: { hideChars: [{ charId: 'homework_slime', duration: 200, remove: true }] },
      effects: { puff: { target: 'homework_slime', color: '#ffb0d0', duration: 520, count: 18, size: 140 } }
    },
    { speaker: '', text: '【战斗胜利!获得经验值10!羞耻抗性+3!】', se: 'se_notification' },
    { speaker: '夜', text: '羞耻抗性又是什么鬼啊?!', character: 'char_sora_annoyed' },
    { speaker: '希尔薇', text: '虽然过程有点……但你还是赢了!太棒了!', voice: 'voice_hina_02' }
  ],
  choices: null,
  autoNext: 'scene_ch1_after_battle'
};
