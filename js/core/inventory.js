// ===== 背包系统 =====
const Inventory = {
  _gameState: null,

  init(gameState) {
    this._gameState = gameState;
  },

  // 获取所有物品
  getAll() {
    return this._gameState.inventory;
  },

  // 获取某类物品
  getByType(type) {
    return this._gameState.inventory.filter(item => {
      const def = ITEMS[item.id];
      return def && def.type === type;
    });
  },

  // 获取物品数量
  getCount(itemId) {
    const entry = this._gameState.inventory.find(i => i.id === itemId);
    return entry ? entry.count : 0;
  },

  // 添加物品
  add(itemId, count = 1) {
    const entry = this._gameState.inventory.find(i => i.id === itemId);
    if (entry) {
      entry.count += count;
    } else {
      this._gameState.inventory.push({ id: itemId, count: count });
    }
  },

  // 移除物品
  remove(itemId, count = 1) {
    const entry = this._gameState.inventory.find(i => i.id === itemId);
    if (!entry || entry.count < count) return false;
    entry.count -= count;
    if (entry.count <= 0) {
      this._gameState.inventory = this._gameState.inventory.filter(i => i.id !== itemId);
    }
    return true;
  },

  // 购买物品
  buy(itemId, count = 1) {
    const item = ITEMS[itemId];
    if (!item) return { ok: false, msg: '物品不存在' };
    const totalCost = item.price * count;
    const result = Economy.spend(totalCost, `购买${item.name}x${count}`);
    if (!result.ok) return result;
    this.add(itemId, count);
    this._gameState.stats.totalPurchases++;
    return { ok: true, msg: `购买了${item.name}x${count}` };
  },

  // 使用物品
  use(itemId, pet) {
    const item = ITEMS[itemId];
    if (!item) return { ok: false, msg: '物品不存在' };
    if (this.getCount(itemId) <= 0) return { ok: false, msg: '背包中没有这个物品' };

    let result;
    switch (item.type) {
      case 'food':
        result = pet.feed(item);
        if (result.ok) this.remove(itemId);
        break;
      case 'toy':
        result = pet.play(item);
        if (result.ok) this.remove(itemId);
        break;
      case 'medicine':
        if (item.health && !pet.sick) {
          // Vitamin - just boost health
          pet.health = pet.clamp(pet.health + item.health);
          this.remove(itemId);
          result = { ok: true, msg: `健康值+${item.health}` };
        } else {
          result = pet.useMedicine(item);
          if (result.ok) this.remove(itemId);
        }
        break;
      case 'clothing':
        // Equip clothing
        result = this._equipClothing(itemId, item, pet);
        break;
      default:
        result = { ok: false, msg: '这个物品不能使用' };
    }
    return result;
  },

  _equipClothing(itemId, item, pet) {
    const slot = item.slot;
    if (!slot) return { ok: false, msg: '无法装备' };
    // Unequip current
    if (pet.clothing[slot]) {
      this.add(pet.clothing[slot]);
    }
    this.remove(itemId);
    pet.clothing[slot] = itemId;
    return { ok: true, msg: `装备了${item.name}`, action: 'equip' };
  },

  // 卸下装备
  unequip(slot, pet) {
    if (!pet.clothing[slot]) return { ok: false, msg: '该部位没有装备' };
    const itemId = pet.clothing[slot];
    this.add(itemId);
    pet.clothing[slot] = null;
    return { ok: true, msg: `卸下了${ITEMS[itemId].name}` };
  },

  // 获取家具
  getFurniture() {
    return this._gameState.furniture;
  },

  // 添加家具
  addFurniture(itemId) {
    if (!this._gameState.furniture.includes(itemId)) {
      this._gameState.furniture.push(itemId);
    }
  }
};

window.Inventory = Inventory;
