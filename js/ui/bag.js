// ===== 背包UI =====
const BagUI = {
  _currentFilter: 'all',

  open() {
    const html = this._render();
    Panels.open('bag', '🎒 背包', html);
  },

  _render() {
    const allItems = Inventory.getAll();
    let filters = `
      <div class="bag-filters">
        <button class="bag-filter ${this._currentFilter === 'all' ? 'active' : ''}" onclick="BagUI.filter('all')">全部</button>
        <button class="bag-filter ${this._currentFilter === 'food' ? 'active' : ''}" onclick="BagUI.filter('food')">🍎食品</button>
        <button class="bag-filter ${this._currentFilter === 'toy' ? 'active' : ''}" onclick="BagUI.filter('toy')">🎾玩具</button>
        <button class="bag-filter ${this._currentFilter === 'medicine' ? 'active' : ''}" onclick="BagUI.filter('medicine')">💊药品</button>
        <button class="bag-filter ${this._currentFilter === 'clothing' ? 'active' : ''}" onclick="BagUI.filter('clothing')">👗服装</button>
      </div>
    `;

    let filtered = allItems;
    if (this._currentFilter !== 'all') {
      filtered = allItems.filter(i => {
        const def = ITEMS[i.id];
        return def && def.type === this._currentFilter;
      });
    }

    if (filtered.length === 0) {
      return filters + '<div class="bag-empty">背包空空的～去商店逛逛吧</div>';
    }

    let list = '<div class="bag-list">';
    for (const entry of filtered) {
      const item = ITEMS[entry.id];
      if (!item) continue;
      const useLabel = item.type === 'clothing' ? '装备' : '使用';
      list += `
        <div class="bag-item">
          <div class="bag-item-info">
            <span class="bag-item-name">${item.name}</span>
            <span class="bag-item-count">x${entry.count}</span>
          </div>
          <div class="bag-item-desc">${item.desc}</div>
          <button class="btn btn-sm btn-primary" onclick="BagUI.useItem('${entry.id}')">${useLabel}</button>
        </div>
      `;
    }
    list += '</div>';
    return filters + list;
  },

  filter(type) {
    this._currentFilter = type;
    Panels.updateBody('bag', this._render());
  },

  useItem(itemId) {
    const result = Inventory.use(itemId, App.getPet());
    if (result.ok) {
      Panels.toast(result.msg);
      App.updateStats();
      App.saveGame();

      // Track daily tasks
      const item = ITEMS[itemId];
      if (item) {
        if (item.type === 'food') {
          App.getGameState().stats.totalFeeds++;
          DailySystem.completeTask('feed');
        } else if (item.type === 'toy') {
          App.getGameState().stats.totalPlays++;
          DailySystem.completeTask('play');
        }
      }
    } else {
      Panels.toast(result.msg);
    }
    Panels.updateBody('bag', this._render());
  }
};

window.BagUI = BagUI;
