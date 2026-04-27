window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_battle_dodge = {
  id: 'scene_ch1_battle_dodge',
  background: 'bg_battle',
  bgm: 'bgm_battle_comedy',
  particles: null,
  characters: [
    { id: 'char_homework_slime', position: 'left', opacity: 1 },
    { id: 'char_sora_serious', position: 'center', opacity: 1 },
    { id: 'char_princess_smile', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '躲开躲开!' },
    { speaker: '', text: '我一个侧身滚到旁边，试卷擦着我的脸飞过去。' },
    { speaker: '', text: '【闪避成功!敏捷+1】' },
    { speaker: '希尔薇', text: '好厉害!你好灵活!', voice: 'voice_hina_03' },
    { speaker: '夜', text: '废话，我可是躲了三年班主任投粉笔头的男人!' },
    { speaker: '', text: '等等，我为什么要在梦里吹这种牛。' }
  ],
  choices: null,
  autoNext: 'scene_ch1_battle_continue'
};
