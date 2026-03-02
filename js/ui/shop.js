// ===== 商店UI =====
const ShopUI = {
  _currentCategory: 'food',

  open() {
    const html = this._render();
    Panels.open('shop', '🏪 商店', html);
  },

  _render() {
    const cats = ITEM_CATEGORIES;
    let tabs = '<div class="shop-tabs">';
    for (const [key, cat] of Object.entries(cats)) {
      const active = key === this._currentCategory ? 'active' : '';
      tabs += `<button class="shop-tab ${active}" onclick="ShopUI.switchCategory('${key}')">${cat.icon} ${cat.name}</button>`;
    }
    tabs += '</div>';

    const items = cats[this._currentCategory].items;
    let grid = '<div class="shop-grid">';
    for (const item of items) {
      const canBuy = Economy.canAfford(item.price);
      grid += `
        <div class="shop-item ${canBuy ? '' : 'shop-item-disabled'}">
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.desc}</div>
          <div class="shop-item-footer">
            <span class="shop-item-price">💰${item.price}</span>
            <button class="btn btn-sm btn-primary" ${canBuy ? '' : 'disabled'}
              onclick="ShopUI.buy('${item.id}')">购买</button>
          </div>
        </div>
      `;
    }
    grid += '</div>';

    const coinDisplay = `<div class="shop-coins">💰 我的Q币：${Economy.getCoins()}</div>`;
    return coinDisplay + tabs + grid;
  },

  switchCategory(cat) {
    this._currentCategory = cat;
    Panels.updateBody('shop', this._render());
  },

  buy(itemId) {
    const result = Inventory.buy(itemId);
    if (result.ok) {
      Panels.toast(result.msg);
      // Check achievement
      if (typeof AchievementSystem !== 'undefined') {
        const newAch = AchievementSystem.checkAll();
        newAch.forEach(a => Panels.toast(`🏆 解锁成就：${a.name}`));
      }
    } else {
      Panels.toast(result.msg);
    }
    Panels.updateBody('shop', this._render());
    App.saveGame();
    App.updateCoinsDisplay();
  }
};

window.ShopUI = ShopUI;
