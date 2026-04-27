window.CHAPTER1_SCENES = window.CHAPTER1_SCENES || {};
window.CHAPTER1_SCENES.scene_ch1_dream_hesitate = {
  id: 'scene_ch1_dream_hesitate',
  background: 'bg_forest',
  bgm: 'bgm_dream_forest',
  particles: 'firefly',
  characters: [
    { id: 'char_sora_serious', position: 'left', opacity: 1 },
    { id: 'char_princess_smile', position: 'right', opacity: 1 }
  ],
  dialogs: [
    { speaker: '夜', text: '等等，让我先搞清楚状况……这到底是梦还是什么？' },
    { speaker: '希尔薇', text: '梦？这里是梦之森啊，当然是梦的一部分。', voice: 'voice_hina_02' },
    { speaker: '夜', text: '不是，我是说……算了，太复杂了。' },
    { speaker: '希尔薇', text: '总之，你愿意帮我吗？', voice: 'voice_hina_01' },
    { speaker: '夜', text: '……行吧。反正是梦，先跟着剧情走。' },
    { speaker: '希尔薇', text: '太好了！那你就是我的勇者了！', voice: 'voice_hina_03' }
  ],
  choices: null,
  autoNext: 'scene_ch1_dream_battle'
};
