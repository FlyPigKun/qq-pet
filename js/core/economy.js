// ===== 经济系统 =====
const Economy = {
  _gameState: null,

  init(gameState) {
    this._gameState = gameState;
  },

  getCoins() {
    return this._gameState.coins;
  },

  // 增加Q币
  earn(amount, reason) {
    this._gameState.coins += amount;
    this._gameState.stats.totalCoins += amount;
    this._addDiaryEntry(`赚了${amount}Q币 (${reason})`);
    return this._gameState.coins;
  },

  // 花费Q币
  spend(amount, reason) {
    if (this._gameState.coins < amount) {
      return { ok: false, msg: `Q币不足！需要${amount}，当前${this._gameState.coins}` };
    }
    this._gameState.coins -= amount;
    this._addDiaryEntry(`花了${amount}Q币 (${reason})`);
    return { ok: true, remaining: this._gameState.coins };
  },

  // 检查是否买得起
  canAfford(amount) {
    return this._gameState.coins >= amount;
  },

  _addDiaryEntry(text) {
    if (typeof DiarySystem !== 'undefined' && DiarySystem.addEntry) {
      DiarySystem.addEntry(text);
    }
  }
};

window.Economy = Economy;
