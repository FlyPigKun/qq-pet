// ===== 换装UI =====
const ClothingUI = {
  open() {
    const html = this._render();
    Panels.open('clothing', '👗 换装', html);
  },

  _render() {
    const pet = App.getPet();
    const clothing = pet.clothing;

    // Current equipment
    let equipped = '<div class="clothing-current"><h3>当前装扮</h3><div class="clothing-slots">';
    const slots = [
      { key: 'head', name: '头部', icon: '🎩' },
      { key: 'body', name: '身体', icon: '👔' },
      { key: 'accessory', name: '配饰', icon: '💍' },
    ];
    for (const slot of slots) {
      const itemId = clothing[slot.key];
      const item = itemId ? ITEMS[itemId] : null;
      equipped += `
        <div class="clothing-slot">
          <div class="slot-icon">${slot.icon}</div>
          <div class="slot-name">${slot.name}</div>
          <div class="slot-item">${item ? item.name : '空'}</div>
          ${item ? `<button class="btn btn-sm" onclick="ClothingUI.unequip('${slot.key}')">卸下</button>` : ''}
        </div>
      `;
    }
    equipped += '</div></div>';

    // Available clothing from inventory
    const clothingItems = Inventory.getByType('clothing');
    let available = '<div class="clothing-available"><h3>可装备的服装</h3>';
    if (clothingItems.length === 0) {
      available += '<div class="bag-empty">没有服装，去商店购买吧</div>';
    } else {
      available += '<div class="bag-list">';
      for (const entry of clothingItems) {
        const item = ITEMS[entry.id];
        if (!item) continue;
        const slotName = slots.find(s => s.key === item.slot)?.name || '';
        available += `
          <div class="bag-item">
            <div class="bag-item-info">
              <span class="bag-item-name">${item.name}</span>
              <span class="bag-item-count">x${entry.count}</span>
              <span class="clothing-slot-tag">${slotName}</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="ClothingUI.equip('${entry.id}')">装备</button>
          </div>
        `;
      }
      available += '</div>';
    }
    available += '</div>';

    return equipped + available;
  },

  equip(itemId) {
    const result = Inventory.use(itemId, App.getPet());
    if (result.ok) {
      Panels.toast(result.msg);
      App.updatePetAppearance();
      App.saveGame();
      // Check full dress achievement
      AchievementSystem.checkAll();
    } else {
      Panels.toast(result.msg);
    }
    Panels.updateBody('clothing', this._render());
  },

  unequip(slot) {
    const result = Inventory.unequip(slot, App.getPet());
    if (result.ok) {
      Panels.toast(result.msg);
      App.updatePetAppearance();
      App.saveGame();
    } else {
      Panels.toast(result.msg);
    }
    Panels.updateBody('clothing', this._render());
  }
};

window.ClothingUI = ClothingUI;
