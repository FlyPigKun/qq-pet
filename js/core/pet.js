// ===== 宠物核心类 =====

const PET_STAGES = [
  { name: '蛋',   minExp: 0,    icon: '🥚', size: 0.6, greeting: '...(蛋在微微颤动)' },
  { name: '婴儿', minExp: 20,   icon: '🐣', size: 0.7, greeting: '喵...喵...' },
  { name: '幼年', minExp: 80,   icon: '🐱', size: 0.8, greeting: '喵～叫我一声吧！' },
  { name: '少年', minExp: 200,  icon: '😺', size: 0.9, greeting: '我长大一点了哦！' },
  { name: '青年', minExp: 500,  icon: '😸', size: 0.95, greeting: '我变得更强了！' },
  { name: '成年', minExp: 1000, icon: '🐈', size: 1.0, greeting: '我已经完全长大了！' },
];

const PET_MESSAGES = {
  feed:    ['好好吃哦～', '谢谢铲屎官！', '吃饱啦～真满足！', '喵！再来一口！', '这个最好吃了！'],
  play:    ['好开心～', '玩耍最棒了！', '陪我多玩一会儿嘛！', '耶！一起玩！', '哈哈好好玩！'],
  sleep:   ['打哈欠...', '好困了...zzz', '做个好梦～', '嗯...再睡一下...', '别吵我...zzz'],
  bath:    ['好香香～', '干净的感觉真好！', '凉凉的好舒服！', '洗完啦～摸摸我！', '喵～闻起来好香'],
  hungry:  ['肚子好饿哦...', '好饿...能给点吃的吗？', '咕咕咕...饿了...', '喵～我想吃东西'],
  sad:     ['好无聊...陪陪我嘛', '有点难过...', '我需要你陪我...', '好寂寞...'],
  tired:   ['好累...想睡觉了', '撑不住了...zzz', '让我休息一下...'],
  dirty:   ['我脏脏了...', '帮我洗澡吧...', '感觉不舒服...'],
  sick:    ['不舒服...带我去医院吧...', '好难受...', '需要吃药...'],
  happy:   ['今天好开心哦！', '喵！我很幸福！', '有你在真好！'],
  idle:    ['喵～', '...', '在想什么呢～', '摸摸我～', '今天天气不错哦', '你在做什么呀？'],
};

class Pet {
  constructor(data) {
    if (data) {
      Object.assign(this, data);
    } else {
      this.name = '小花';
      this.type = 'cat';
      this.hunger = 80;
      this.happiness = 80;
      this.energy = 80;
      this.clean = 80;
      this.health = 100;
      this.exp = 0;
      this.stage = 0;
      this.sick = null;
      this.clothing = { head: null, body: null, accessory: null };
      this.lastSave = Date.now();
    }
  }

  // 离线衰减（最多8小时）
  applyDecay() {
    const elapsed = Math.min((Date.now() - this.lastSave) / 1000, 60 * 60 * 8);
    const mins = elapsed / 60;
    this.hunger    = Math.max(0, this.hunger    - mins * 0.8);
    this.happiness = Math.max(0, this.happiness - mins * 0.5);
    this.energy    = Math.max(0, this.energy    - mins * 0.4);
    this.clean     = Math.max(0, this.clean     - mins * 0.3);
    // 健康值受其他属性影响缓慢变化
    if (this.hunger < 20 || this.clean < 20) {
      this.health = Math.max(0, this.health - mins * 0.2);
    }
  }

  // 实时衰减（每30秒调用一次）
  tick() {
    this.hunger    = Math.max(0, this.hunger    - 0.4);
    this.happiness = Math.max(0, this.happiness - 0.25);
    this.energy    = Math.max(0, this.energy    - 0.2);
    this.clean     = Math.max(0, this.clean     - 0.15);

    // 健康值缓慢变化
    if (this.hunger < 15 || this.clean < 15) {
      this.health = Math.max(0, this.health - 0.3);
    } else if (this.hunger > 50 && this.clean > 50 && !this.sick) {
      this.health = Math.min(100, this.health + 0.1);
    }

    // 生病时每tick扣属性
    if (this.sick && DISEASES[this.sick.id]) {
      const effect = DISEASES[this.sick.id].effect;
      for (const [attr, val] of Object.entries(effect)) {
        if (this[attr] !== undefined) {
          this[attr] = Math.max(0, this[attr] + val * 0.1);
        }
      }
    }

    // 随机生病检测
    this._checkSickness();
  }

  clamp(v) { return Math.min(100, Math.max(0, v)); }

  feed(foodItem) {
    if (this.hunger >= 95) return { ok: false, msg: '吃太饱啦，撑死了！' };
    const hungerGain = foodItem ? foodItem.hunger : 25;
    const happyGain = foodItem ? (foodItem.happiness || 5) : 5;
    this.hunger    = this.clamp(this.hunger + hungerGain);
    this.happiness = this.clamp(this.happiness + happyGain);
    this.exp += 3;
    return { ok: true, msg: this._pick(PET_MESSAGES.feed), action: 'eat' };
  }

  play(toyItem) {
    if (this.energy < 15) return { ok: false, msg: '太累了，先让我休息一下吧...' };
    const happyGain = toyItem ? toyItem.happiness : 25;
    const energyCost = toyItem ? Math.abs(toyItem.energy || 12) : 12;
    this.happiness = this.clamp(this.happiness + happyGain);
    this.energy    = this.clamp(this.energy - energyCost);
    this.clean     = this.clamp(this.clean - 8);
    this.exp += 5;
    return { ok: true, msg: this._pick(PET_MESSAGES.play), action: 'play' };
  }

  sleep() {
    if (this.energy >= 95) return { ok: false, msg: '精力充沛，不需要睡觉啦！' };
    this.energy    = this.clamp(this.energy + 35);
    this.hunger    = this.clamp(this.hunger - 5);
    this.health    = this.clamp(this.health + 3);
    this.exp += 2;
    return { ok: true, msg: this._pick(PET_MESSAGES.sleep), action: 'sleep' };
  }

  bath() {
    if (this.clean >= 95) return { ok: false, msg: '已经很干净了，不用洗了！' };
    this.clean     = this.clamp(this.clean + 30);
    this.happiness = this.clamp(this.happiness + 8);
    this.health    = this.clamp(this.health + 2);
    this.exp += 3;
    return { ok: true, msg: this._pick(PET_MESSAGES.bath), action: 'bath' };
  }

  // 使用药品
  useMedicine(medItem) {
    if (!this.sick) return { ok: false, msg: '宠物没有生病哦' };
    if (medItem.cures && (medItem.cures.includes('all') || medItem.cures.includes(this.sick.id))) {
      const cured = this.sick.name;
      this.sick = null;
      this.health = this.clamp(this.health + 20);
      return { ok: true, msg: `${cured}治好了！` };
    }
    if (medItem.health) {
      this.health = this.clamp(this.health + medItem.health);
      return { ok: true, msg: `健康值+${medItem.health}` };
    }
    return { ok: false, msg: '这个药治不了当前的病...' };
  }

  // 去医院治疗
  hospitalCure() {
    if (!this.sick) return { ok: false, msg: '宠物没有生病', cost: 0 };
    const disease = DISEASES[this.sick.id];
    if (!disease) return { ok: false, msg: '未知疾病', cost: 0 };
    const cost = disease.hospitalCost;
    const cured = this.sick.name;
    this.sick = null;
    this.health = this.clamp(this.health + 30);
    return { ok: true, msg: `${cured}治好了！医药费${cost}Q币`, cost: cost };
  }

  // 检查是否升级
  checkLevelUp() {
    const old = this.stage;
    for (let i = PET_STAGES.length - 1; i >= 0; i--) {
      if (this.exp >= PET_STAGES[i].minExp) {
        this.stage = i;
        break;
      }
    }
    if (this.stage > old) {
      return { oldStage: old, newStage: this.stage, name: PET_STAGES[this.stage].name };
    }
    return null;
  }

  // 心情状态
  getMood() {
    if (this.sick) return 'sick';
    if (this.hunger < 20)    return 'hungry';
    if (this.energy < 20)    return 'tired';
    if (this.clean < 20)     return 'dirty';
    if (this.happiness < 20) return 'sad';
    if (this.happiness > 80 && this.hunger > 60) return 'happy';
    return 'idle';
  }

  getIdleMsg() {
    if (this.sick) {
      const msgs = (typeof SICK_MESSAGES !== 'undefined' && SICK_MESSAGES[this.sick.id]) || PET_MESSAGES.sick;
      return this._pick(msgs);
    }
    const mood = this.getMood();
    const pool = PET_MESSAGES[mood] || PET_MESSAGES.idle;
    return this._pick(pool);
  }

  getStageInfo() { return PET_STAGES[this.stage]; }

  // 随机生病检测
  _checkSickness() {
    if (this.sick) return;
    if (this.health > 40) return;
    // 健康值越低越容易生病
    const chance = (40 - this.health) / 4000; // max ~1% per tick
    if (Math.random() < chance) {
      const diseaseIds = Object.keys(typeof DISEASES !== 'undefined' ? DISEASES : {});
      if (diseaseIds.length === 0) return;
      const id = diseaseIds[Math.floor(Math.random() * diseaseIds.length)];
      const disease = DISEASES[id];
      this.sick = { id: id, name: disease.name };
      this.health = Math.max(0, this.health - 10);
      // Trigger achievement
      if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.unlock('first_sick');
      }
    }
  }

  // 导出数据
  toData() {
    return {
      name: this.name,
      type: this.type,
      hunger: this.hunger,
      happiness: this.happiness,
      energy: this.energy,
      clean: this.clean,
      health: this.health,
      exp: this.exp,
      stage: this.stage,
      sick: this.sick,
      clothing: this.clothing,
      lastSave: Date.now()
    };
  }

  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
}

window.Pet = Pet;
window.PET_STAGES = PET_STAGES;
window.PET_MESSAGES = PET_MESSAGES;
