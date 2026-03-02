// ===== 成就系统 =====
const AchievementSystem = {
  _gameState: null,
  _pet: null,
  _pendingNotifications: [],

  init(gameState, pet) {
    this._gameState = gameState;
    this._pet = pet;
  },

  // 检查所有成就
  checkAll() {
    const gs = this._gameState;
    const pet = this._pet;
    const unlocked = gs.achievements;

    const checks = {
      // Growth
      stage_baby:     () => pet.stage >= 1,
      stage_child:    () => pet.stage >= 2,
      stage_teen:     () => pet.stage >= 3,
      stage_young:    () => pet.stage >= 4,
      stage_adult:    () => pet.stage >= 5,
      // Feed
      feed_10:        () => gs.stats.totalFeeds >= 10,
      feed_50:        () => gs.stats.totalFeeds >= 50,
      feed_100:       () => gs.stats.totalFeeds >= 100,
      // Play
      play_10:        () => gs.stats.totalPlays >= 10,
      play_50:        () => gs.stats.totalPlays >= 50,
      // Economy
      coins_100:      () => gs.stats.totalCoins >= 100,
      coins_500:      () => gs.stats.totalCoins >= 500,
      coins_2000:     () => gs.stats.totalCoins >= 2000,
      first_purchase: () => gs.stats.totalPurchases > 0,
      // Games
      game_first:     () => gs.stats.gamesPlayed >= 1,
      game_30:        () => gs.stats.gamesPlayed >= 30,
      // Education
      enroll_primary: () => gs.education.level >= 1,
      enroll_middle:  () => gs.education.level >= 2,
      enroll_college: () => gs.education.level >= 3,
      // Work
      first_job:      () => gs.stats.totalWorked >= 1,
      work_20:        () => gs.stats.totalWorked >= 20,
      // Login
      login_7:        () => gs.daily.streak >= 7,
      login_30:       () => gs.daily.streak >= 30,
      // Misc (first_sick and first_cure are event-triggered via .unlock())
      full_dress:     () => pet.clothing.head && pet.clothing.body && pet.clothing.accessory,
      days_30:        () => gs.stats.daysPlayed >= 30,
    };

    const newlyUnlocked = [];
    for (const [id, check] of Object.entries(checks)) {
      if (!unlocked.includes(id) && ACHIEVEMENTS[id] && check()) {
        unlocked.push(id);
        const ach = ACHIEVEMENTS[id];
        Economy.earn(ach.reward, `成就奖励：${ach.name}`);
        newlyUnlocked.push(ach);
      }
    }

    return newlyUnlocked;
  },

  // 手动解锁（用于事件触发）
  unlock(achievementId) {
    if (this._gameState.achievements.includes(achievementId)) return null;
    if (!ACHIEVEMENTS[achievementId]) return null;
    this._gameState.achievements.push(achievementId);
    const ach = ACHIEVEMENTS[achievementId];
    Economy.earn(ach.reward, `成就奖励：${ach.name}`);
    return ach;
  },

  // 获取所有成就（含解锁状态）
  getAll() {
    const unlocked = this._gameState.achievements;
    return Object.values(ACHIEVEMENTS).map(a => ({
      ...a,
      unlocked: unlocked.includes(a.id)
    }));
  },

  // 已解锁数量
  getUnlockedCount() {
    return this._gameState.achievements.length;
  },

  getTotalCount() {
    return Object.keys(ACHIEVEMENTS).length;
  }
};

window.AchievementSystem = AchievementSystem;
