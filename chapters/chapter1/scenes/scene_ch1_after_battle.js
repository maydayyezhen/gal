window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_after_battle = {
  id: 'scene_ch1_after_battle',
  background: 'bg_forest',
  bgm: 'bgm_dream_forest',
  particles: 'firefly',
  characters: [
    { id: 'char_sora_normal', position: 'left', opacity: 1 },
    { id: 'char_princess_smile', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '希尔薇', text: '谢谢你救了我!你真的很可靠!', voice: 'voice_hina_03' },
    {
      speaker: '',
      text: '她又往我这边靠了靠。',
      stage: {
        moveChars: [{ match: 'princess', x: '-12vw', y: '0px', duration: 420, easing: 'ease-in-out' }],
        swapChars: [{ match: 'sora', id: 'char_sora_surprised', duration: 120, mode: 'replace' }]
      },
      charAnim: { charId: 'princess', type: 'sway', options: { duration: 520 } }
    },
    {
      speaker: '',
      text: '这种距离……在现实里绝对不可能。',
      stage: { swapChars: [{ match: 'sora', id: 'char_sora_embarrassed', duration: 140, mode: 'replace' }] },
      charAnim: { charId: 'sora', type: 'heartbeat', options: { duration: 520 } }
    },
    { speaker: '夜', text: '那个……希尔薇，你接下来打算怎么办?' },
    { speaker: '希尔薇', text: '我想找回记忆。听说在梦之塔的顶层，有能看见过去的魔镜。', voice: 'voice_hina_01' },
    { speaker: '希尔薇', text: '你能陪我一起去吗?', voice: 'voice_hina_02' },
    { speaker: '', text: '她的眼神很真诚，没有一丝犹豫。' },
    { speaker: '', text: '和现实里那个「对谁都温柔」的阳菜完全不同……' },
    { speaker: '', text: '这个梦里的她，只看着我一个人。' }
  ],
  choices: [
    { text: '「当然，我会陪你」', nextSceneId: 'scene_ch1_promise' },
    { text: '「……我再想想」', nextSceneId: 'scene_ch1_hesitate2' }
  ],
  autoNext: null
};
