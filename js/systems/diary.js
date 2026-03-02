// ===== 宠物日记系统 =====
const DiarySystem = {
  _gameState: null,
  MAX_ENTRIES: 50,

  init(gameState) {
    this._gameState = gameState;
  },

  // 添加日记
  addEntry(text) {
    const entry = {
      date: new Date().toLocaleString('zh-CN'),
      text: text
    };
    this._gameState.diary.unshift(entry);
    // 最多保留50条
    if (this._gameState.diary.length > this.MAX_ENTRIES) {
      this._gameState.diary = this._gameState.diary.slice(0, this.MAX_ENTRIES);
    }
  },

  // 获取所有日记
  getAll() {
    return this._gameState.diary;
  },

  // 获取最近N条
  getRecent(n = 10) {
    return this._gameState.diary.slice(0, n);
  },

  // 清空日记
  clear() {
    this._gameState.diary = [];
  }
};

window.DiarySystem = DiarySystem;
