window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_dream_battle = {
  id: 'scene_ch1_dream_battle',
  background: 'bg_battle',
  bgm: 'bgm_battle_comedy',
  particles: null,
  characters: [
    { id: 'char_homework_slime', position: 'left', opacity: 1 },
    { id: 'char_sora_serious', position: 'center', opacity: 1 },
    { id: 'char_princess_surprised', position: 'right', opacity: 1 }
  ],
  dialogs: [
    {
      speaker: '',
      text: '刚说完，树林深处传来奇怪的声音。',
      effects: { shake: { intensity: 8, duration: 600 } },
      stage: { swapChars: [{ match: 'sora', id: 'char_sora_surprised', duration: 140, mode: 'replace' }] }
    },
    {
      speaker: '',
      text: '「啾啾啾啾——」',
      charAnim: { charId: 'princess', type: 'shake', options: { duration: 400 } }
    },
    {
      speaker: '夜',
      text: '什么鬼?!',
      effects: { shake: { intensity: 12, duration: 700 } }
    },
    { speaker: '', text: '从灌木丛里蹦出来一只……巨大的……' },
    { speaker: '', text: '……软绵绵的绿色史莱姆?' },
    { speaker: '', text: '而且它头上顶着一个牌子，上面写着:【作业怪 Lv.1】' },
    { speaker: '夜', text: '作业怪是什么鬼啊?!' },
    { speaker: '希尔薇', text: '小心!它要攻击了!', voice: 'voice_hina_01' },
    {
      speaker: '',
      text: '史莱姆张开嘴，吐出了……一张数学试卷?!',
      se: 'se_page_flip',
      itemShow: {
        itemId: 'fx_paper_sheet',
        label: '试卷',
        options: { position: 'left', duration: 1400, animation: 'float' }
      },
      stage: { swapChars: [{ match: 'sora', id: 'char_sora_serious', duration: 140, mode: 'replace' }] }
    },
    {
      speaker: '',
      text: '试卷在空中展开，上面写着:『请在3秒内算出273×19=?』',
      itemShow: {
        itemId: 'fx_paper_stack',
        label: '作业',
        options: { position: 'center', duration: 1200, animation: 'float' }
      }
    }
  ],
  choices: [
    { text: '「这谁算得出来啊!」(硬抗)', nextSceneId: 'scene_ch1_battle_tank' },
    { text: '「躲开躲开!」(闪避)', nextSceneId: 'scene_ch1_battle_dodge' }
  ],
  autoNext: null
};
