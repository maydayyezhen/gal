/**
 * 资源路径配置文件
 * 所有图片和音频资源的路径都在这里配置
 * 修改资源只需要替换对应文件即可,无需改代码
 */

const RESOURCE_CONFIG = {
  // 音频资源配置
  audio: {
    // 背景音乐 (BGM)
    bgm: {
      daily: 'audios/bgm/bgm_daily.mp3',
      dreamForest: 'audios/bgm/bgm_dream_forest.mp3',
      battleComedy: 'audios/bgm/bgm_battle_comedy.mp3',
      mystery: 'audios/bgm/bgm_mystery.mp3',
      day: 'audios/bgm/day.mp3',
      night: 'audios/bgm/night.mp3'
    },
    // 音效 (SE)
    se: {
      bell: 'audios/se/bell.mp3',
      click: 'audios/se/click.mp3',
      seBell: 'audios/se/se_bell.mp3',
      fumble: 'audios/se/se_fumble.mp3',
      hitLight: 'audios/se/se_hit_light.mp3',
      magicSparkle: 'audios/se/se_magic_sparkle.mp3',
      notification: 'audios/se/se_notification.mp3',
      pageFlip: 'audios/se/se_page_flip.mp3',
      swordSwing: 'audios/se/se_sword_swing.mp3'
    },
    // 角色语音
    voices: {
      hina: {
        '01': 'audios/voices/hina_01.mp3',
        '02': 'audios/voices/hina_02.mp3',
        '03': 'audios/voices/hina_03.mp3'
      },
      sora: {
        '01': 'audios/voices/sora_01.mp3'
      }
    }
  },

  // 图片资源配置
  images: {
    // 背景图
    backgrounds: {
      title: 'images/backgrounds/title.png',
      school: 'images/backgrounds/school.png',
      schoolMorning: 'images/backgrounds/school_morning.png',
      rooftop: 'images/backgrounds/rooftop.png',
      park: 'images/backgrounds/park.png',
      bedroom: 'images/backgrounds/bedroom.png',
      forest: 'images/backgrounds/forest.png',
      battle: 'images/backgrounds/battle.png',
      vendingMachine: 'images/backgrounds/vending_machine.png'
    },
    // 角色立绘
    characters: {
      hina: {
        normal: 'images/characters/hina_normal.png',
        happy: 'images/characters/hina_happy.png',
        serious: 'images/characters/hina_serious.png',
        surprised: 'images/characters/hina_surprised.png',
        angry: 'images/characters/hina_angry.png',
        embarrassed: 'images/characters/hina_embarrassed.png',
        thinking: 'images/characters/hina_thinking.png'
      },
      sora: {
        normal: 'images/characters/sora_normal.png',
        smile: 'images/characters/sora_smile.png',
        thinking: 'images/characters/sora_thinking.png',
        embarrassed: 'images/characters/sora_embarrassed.png',
        serious: 'images/characters/sora_serious.png'
      },
      princess: {
        normal: 'images/characters/princess_normal.png',
        happy: 'images/characters/princess_happy.png',
        serious: 'images/characters/princess_serious.png',
        embarrassed: 'images/characters/princess_embarrassed.png'
      },
      homeworkSlime: {
        normal: 'images/characters/homework_slime_normal.png',
        angry: 'images/characters/homework_slime_angry.png'
      }
    },
    // 其他图片 (道具、特效等)
    others: {
      book: 'images/others/book.png',
      drink: 'images/others/drink.png'
    }
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RESOURCE_CONFIG;
}
