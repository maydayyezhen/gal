/**
 * 章节加载器
 * 负责加载和管理各章节剧本
 */

class ChapterLoader {
  constructor() {
    this.chapters = new Map();
    this.currentChapter = 1;
  }

  /**
   * 注册章节
   * @param {number} chapterNumber - 章节号
   * @param {object} chapterData - 章节数据
   */
  registerChapter(chapterNumber, chapterData) {
    this.chapters.set(chapterNumber, chapterData);
    console.log(`Chapter ${chapterNumber} registered:`, chapterData.meta?.title || 'Untitled');
  }

  /**
   * 获取章节数据
   * @param {number} chapterNumber - 章节号
   * @returns {object|null} 章节数据
   */
  getChapter(chapterNumber) {
    return this.chapters.get(chapterNumber) || null;
  }

  /**
   * 获取当前章节
   * @returns {object|null}
   */
  getCurrentChapter() {
    return this.getChapter(this.currentChapter);
  }

  /**
   * 切换到指定章节
   * @param {number} chapterNumber
   * @returns {boolean} 是否切换成功
   */
  switchToChapter(chapterNumber) {
    if (this.chapters.has(chapterNumber)) {
      this.currentChapter = chapterNumber;
      console.log(`Switched to Chapter ${chapterNumber}`);
      return true;
    }
    console.error(`Chapter ${chapterNumber} not found`);
    return false;
  }

  /**
   * 获取所有已注册的章节号
   * @returns {number[]}
   */
  getAvailableChapters() {
    return Array.from(this.chapters.keys()).sort((a, b) => a - b);
  }

  /**
   * 合并所有章节的场景数据 (用于兼容原有系统)
   * @returns {object} 合并后的SCRIPT_DATA格式
   */
  getMergedScriptData() {
    const merged = {
      meta: {},
      resources: { images: [], audios: [] },
      scenes: []
    };

    // 按章节顺序合并
    const chapterNumbers = this.getAvailableChapters();
    
    for (const num of chapterNumbers) {
      const chapter = this.getChapter(num);
      if (!chapter) continue;

      // 合并meta (第一章的meta作为基础)
      if (num === 1 && chapter.meta) {
        merged.meta = { ...chapter.meta };
      }

      // 合并resources
      if (chapter.resources) {
        if (chapter.resources.images) {
          merged.resources.images.push(...chapter.resources.images);
        }
        if (chapter.resources.audios) {
          merged.resources.audios.push(...chapter.resources.audios);
        }
      }

      // 合并scenes
      if (chapter.scenes) {
        merged.scenes.push(...chapter.scenes);
      }
    }

    return merged;
  }
}

// 创建全局实例
const chapterLoader = new ChapterLoader();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChapterLoader, chapterLoader };
}
