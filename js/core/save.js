// ===== 统一存档管理 =====
const SaveManager = {
  SAVE_KEY: 'qq_pet_save',

  // 默认存档结构
  defaultSave() {
    return {
      pet: {
        name: '',
        type: 'cat',
        hunger: 80,
        happiness: 80,
        energy: 80,
        clean: 80,
        health: 100,
        exp: 0,
        stage: 0,
        sick: null,
        clothing: { head: null, body: null, accessory: null },
        lastSave: Date.now()
      },
      coins: 100,
      inventory: [],
      furniture: [],
      education: {
        level: 0,
        courses: {},
        studying: null
      },
      work: {
        jobId: null,
        working: null
      },
      daily: {
        lastLogin: '',
        streak: 0,
        tasks: {}
      },
      achievements: [],
      diary: [],
      stats: {
        totalFeeds: 0,
        totalPlays: 0,
        totalCoins: 100,
        totalWorked: 0,
        daysPlayed: 1,
        gamesPlayed: 0,
        totalPurchases: 0
      },
      settings: {
        soundOn: true
      }
    };
  },

  // 加载存档
  load() {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        return this._migrate(data);
      } catch (e) {
        console.warn('存档损坏，尝试迁移旧数据');
      }
    }
    // 尝试迁移旧版存档
    return this._migrateOld();
  },

  // 保存存档
  save(data) {
    data.pet.lastSave = Date.now();
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
  },

  // 迁移旧版存档 (qq_pet_data -> qq_pet_save)
  _migrateOld() {
    const oldRaw = localStorage.getItem('qq_pet_data');
    if (!oldRaw) return null;

    try {
      const old = JSON.parse(oldRaw);
      const save = this.defaultSave();
      save.pet.name = old.name || '小花';
      save.pet.hunger = old.hunger ?? 80;
      save.pet.happiness = old.happiness ?? 80;
      save.pet.energy = old.energy ?? 80;
      save.pet.clean = old.clean ?? 80;
      save.pet.exp = old.exp ?? 0;
      // Map old 3-stage to new 6-stage
      save.pet.stage = Math.min((old.stage || 0) * 2, 5);
      save.pet.lastSave = old.lastSave || Date.now();
      // Keep old save as backup
      localStorage.setItem('qq_pet_data_backup', oldRaw);
      this.save(save);
      return save;
    } catch (e) {
      return null;
    }
  },

  // 填充缺失字段（版本升级时）
  _migrate(data) {
    const def = this.defaultSave();
    // Deep merge missing keys
    for (const key of Object.keys(def)) {
      if (data[key] === undefined) {
        data[key] = def[key];
      } else if (typeof def[key] === 'object' && !Array.isArray(def[key]) && def[key] !== null) {
        for (const subKey of Object.keys(def[key])) {
          if (data[key][subKey] === undefined) {
            data[key][subKey] = def[key][subKey];
          }
        }
      }
    }
    // Ensure pet has health field
    if (data.pet.health === undefined) data.pet.health = 100;
    if (data.pet.sick === undefined) data.pet.sick = null;
    if (data.pet.clothing === undefined) data.pet.clothing = { head: null, body: null, accessory: null };
    if (!data.stats) data.stats = def.stats;
    return data;
  },

  // 重置存档
  reset() {
    localStorage.removeItem(this.SAVE_KEY);
    localStorage.removeItem('qq_pet_data');
  },

  // 检查是否有存档
  hasSave() {
    return !!(localStorage.getItem(this.SAVE_KEY) || localStorage.getItem('qq_pet_data'));
  }
};

window.SaveManager = SaveManager;
