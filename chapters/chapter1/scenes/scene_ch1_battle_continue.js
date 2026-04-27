window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_battle_continue = {
  id: 'scene_ch1_battle_continue',
  background: 'bg_battle',
  bgm: 'bgm_battle_comedy',
  particles: null,
  characters: [
    { id: 'char_homework_slime', position: 'left', opacity: 1 },
    { id: 'char_sora_serious', position: 'center', opacity: 1 },
    { id: 'char_princess_smile', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '', text: '作业怪又开始蓄力，准备吐出第二张试卷。' },
    { speaker: '夜', text: '不行，得想办法反击!' },
    {
      speaker: '',
      text: '但我手里什么武器都没有……等等，如果这是梦的话……',
      effects: { particles: { type: 'sparkle', count: 18, duration: 1200 } }
    },
    {
      speaker: '夜',
      text: '给我出来!武器!',
      se: 'se_magic_sparkle',
      effects: { particles: { type: 'sparkle', count: 14, duration: 900 } }
    },
    { speaker: '', text: '我伸手往空中一抓——', se: 'se_magic_sparkle' },
    {
      speaker: '',
      text: '手里凭空出现了……一把扫帚?!',
      itemShow: { itemId: 'item_broom', options: { position: 'center', duration: 1800, animation: 'float' } }
    },
    { speaker: '夜', text: '为什么是扫帚啊?!' },
    { speaker: '希尔薇', text: '武器是根据心灵形态具现化的!你平时一定很常用扫帚!', voice: 'voice_hina_02' },
    { speaker: '夜', text: '我不想承认……' }
  ],
  choices: [
    { text: '「管他的，扫帚也能打!」', nextSceneId: 'scene_ch1_battle_win' },
    { text: '「让我换个武器!剑!剑啊!」', nextSceneId: 'scene_ch1_battle_fumble' }
  ],
  autoNext: null
};
