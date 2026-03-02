// ===== 宠物数据与逻辑层 =====

const PET_STAGES = [
  { name: '幼崽', minExp: 0,   icon: '🐣', greeting: '喵～叫我一声吧！' },
  { name: '少年', minExp: 100, icon: '🐱', greeting: '我长大一点了哦！' },
  { name: '成年', minExp: 300, icon: '🐈', greeting: '我已经长大成猫了！' },
]

const MESSAGES = {
  feed: ['好好吃哦～', '谢谢铲屎官！', '吃饱啦～真满足！', '喵！再来一口！', '这个最好吃了！'],
  play: ['好开心～', '玩耍最棒了！', '陪我多玩一会儿嘛！', '耶！一起玩！', '哈哈好好玩！'],
  sleep: ['打哈欠...', '好困了...zzz', '做个好梦～', '嗯...再睡一下...', '别吵我...zzz'],
  bath: ['好香香～', '干净的感觉真好！', '凉凉的好舒服！', '洗完啦～摸摸我！', '喵～闻起来好香'],
  hungry: ['肚子好饿哦...', '好饿...能给点吃的吗？', '咕咕咕...饿了...', '喵～我想吃东西'],
  sad: ['好无聊...陪陪我嘛', '有点难过...', '我需要你陪我...', '好寂寞...'],
  tired: ['好累...想睡觉了', '撑不住了...zzz', '让我休息一下...'],
  dirty: ['我脏脏了...', '帮我洗澡吧...', '感觉不舒服...'],
  happy: ['今天好开心哦！', '喵！我很幸福！', '有你在真好！'],
  idle: ['喵～', '...', '在想什么呢～', '摸摸我～', '今天天气不错哦', '你在做什么呀？'],
  levelup: {
    '少年': { title: '宠物成长啦！', desc: '小花已经长成少年猫了！', icon: '🐱' },
    '成年': { title: '完全成长！', desc: '小花已经长成成年猫！真厉害！', icon: '🐈' },
  }
}

class Pet {
  constructor() {
    this.load()
  }

  load() {
    const saved = localStorage.getItem('qq_pet_data')
    if (saved) {
      const d = JSON.parse(saved)
      this.name      = d.name      || '小花'
      this.hunger    = d.hunger    ?? 70
      this.happiness = d.happiness ?? 70
      this.energy    = d.energy    ?? 70
      this.clean     = d.clean     ?? 70
      this.exp       = d.exp       ?? 0
      this.stage     = d.stage     ?? 0
      this.lastSave  = d.lastSave  ?? Date.now()
      this._applyDecay()
    } else {
      this.name      = '小花'
      this.hunger    = 80
      this.happiness = 80
      this.energy    = 80
      this.clean     = 80
      this.exp       = 0
      this.stage     = 0
      this.lastSave  = Date.now()
    }
  }

  save() {
    localStorage.setItem('qq_pet_data', JSON.stringify({
      name: this.name,
      hunger: this.hunger,
      happiness: this.happiness,
      energy: this.energy,
      clean: this.clean,
      exp: this.exp,
      stage: this.stage,
      lastSave: Date.now()
    }))
  }

  // 离线衰减（最多8小时）
  _applyDecay() {
    const elapsed = Math.min((Date.now() - this.lastSave) / 1000, 60 * 60 * 8)
    const mins = elapsed / 60
    this.hunger    = Math.max(0, this.hunger    - mins * 0.8)
    this.happiness = Math.max(0, this.happiness - mins * 0.5)
    this.energy    = Math.max(0, this.energy    - mins * 0.4)
    this.clean     = Math.max(0, this.clean     - mins * 0.3)
  }

  // 实时衰减（每30秒调用一次）
  tick() {
    this.hunger    = Math.max(0, this.hunger    - 0.4)
    this.happiness = Math.max(0, this.happiness - 0.25)
    this.energy    = Math.max(0, this.energy    - 0.2)
    this.clean     = Math.max(0, this.clean     - 0.15)
    this.save()
  }

  clamp(v) { return Math.min(100, Math.max(0, v)) }

  feed() {
    if (this.hunger >= 95) return { ok: false, msg: '吃太饱啦，撑死了！' }
    this.hunger    = this.clamp(this.hunger + 25)
    this.happiness = this.clamp(this.happiness + 5)
    this.exp += 3
    this.save()
    return { ok: true, msg: this._pick(MESSAGES.feed), action: 'eat' }
  }

  play() {
    if (this.energy < 15) return { ok: false, msg: '太累了，先让我休息一下吧...' }
    this.happiness = this.clamp(this.happiness + 25)
    this.energy    = this.clamp(this.energy - 12)
    this.clean     = this.clamp(this.clean - 8)
    this.exp += 5
    this.save()
    return { ok: true, msg: this._pick(MESSAGES.play), action: 'play' }
  }

  sleep() {
    if (this.energy >= 95) return { ok: false, msg: '精力充沛，不需要睡觉啦！' }
    this.energy    = this.clamp(this.energy + 35)
    this.hunger    = this.clamp(this.hunger - 5)
    this.exp += 2
    this.save()
    return { ok: true, msg: this._pick(MESSAGES.sleep), action: 'sleep' }
  }

  bath() {
    if (this.clean >= 95) return { ok: false, msg: '已经很干净了，不用洗了！' }
    this.clean     = this.clamp(this.clean + 30)
    this.happiness = this.clamp(this.happiness + 8)
    this.exp += 3
    this.save()
    return { ok: true, msg: this._pick(MESSAGES.bath), action: 'bath' }
  }

  // 检查是否升级（返回新阶段名 or null）
  checkLevelUp() {
    const old = this.stage
    for (let i = PET_STAGES.length - 1; i >= 0; i--) {
      if (this.exp >= PET_STAGES[i].minExp) {
        this.stage = i
        break
      }
    }
    if (this.stage > old) {
      this.save()
      return PET_STAGES[this.stage].name
    }
    return null
  }

  // 心情状态
  getMood() {
    if (this.hunger < 20)    return 'hungry'
    if (this.energy < 20)    return 'tired'
    if (this.clean < 20)     return 'dirty'
    if (this.happiness < 20) return 'sad'
    if (this.happiness > 80 && this.hunger > 60) return 'happy'
    return 'idle'
  }

  getIdleMsg() {
    const mood = this.getMood()
    const pool = MESSAGES[mood] || MESSAGES.idle
    return this._pick(pool)
  }

  getStageInfo() { return PET_STAGES[this.stage] }

  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
}

// 导出
window.Pet = Pet
window.PET_STAGES = PET_STAGES
window.PET_MESSAGES = MESSAGES
