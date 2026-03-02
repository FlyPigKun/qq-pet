// ===== 场景切换系统 =====
const ScenesUI = {
  _currentScene: 'home',

  scenes: {
    home:     { name: '家',   icon: '🏠', bgClass: 'scene-home' },
    school:   { name: '学校', icon: '🏫', bgClass: 'scene-school' },
    shop:     { name: '商店', icon: '🏪', bgClass: 'scene-shop' },
    park:     { name: '公园', icon: '🌳', bgClass: 'scene-park' },
    hospital: { name: '医院', icon: '🏥', bgClass: 'scene-hospital' },
  },

  init() {
    this.applyDayNight();
    this.switchScene('home');
  },

  getCurrentScene() {
    return this._currentScene;
  },

  switchScene(sceneId) {
    this._currentScene = sceneId;
    const room = document.getElementById('room');
    if (!room) return;
    // Remove all scene classes
    Object.values(this.scenes).forEach(s => room.classList.remove(s.bgClass));
    room.classList.add(this.scenes[sceneId].bgClass);

    // Update scene decorations
    this._updateDecorations(sceneId);
  },

  _updateDecorations(sceneId) {
    const deco = document.getElementById('roomDecorations');
    if (!deco) return;

    const decoMap = {
      home: `
        <div class="room-window">
          <div class="window-sky"></div>
          <div class="window-cloud" style="left:10%;animation-delay:0s"></div>
          <div class="window-cloud" style="left:50%;animation-delay:2s"></div>
        </div>
        <div class="room-shelf">
          <div class="book" style="background:#e57373;width:18px"></div>
          <div class="book" style="background:#64b5f6;width:24px"></div>
          <div class="book" style="background:#81c784;width:16px"></div>
        </div>
        <div class="floor-rug"></div>
      `,
      school: `
        <div class="scene-blackboard">📖 好好学习</div>
        <div class="scene-desk"></div>
      `,
      shop: `
        <div class="scene-shopfront">🏪</div>
        <div class="scene-shelves"></div>
      `,
      park: `
        <div class="scene-tree" style="left:10%">🌳</div>
        <div class="scene-tree" style="right:10%">🌲</div>
        <div class="scene-flowers">🌸🌼🌺</div>
      `,
      hospital: `
        <div class="scene-cross">➕</div>
        <div class="scene-bed"></div>
      `
    };

    deco.innerHTML = decoMap[sceneId] || '';
  },

  // 日夜变化
  applyDayNight() {
    const hour = new Date().getHours();
    const room = document.getElementById('room');
    if (!room) return;

    room.classList.remove('time-day', 'time-night', 'time-dawn', 'time-dusk');

    if (hour >= 6 && hour < 8) {
      room.classList.add('time-dawn');
    } else if (hour >= 8 && hour < 17) {
      room.classList.add('time-day');
    } else if (hour >= 17 && hour < 19) {
      room.classList.add('time-dusk');
    } else {
      room.classList.add('time-night');
    }
  },

  // 返回日夜描述
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'dusk';
    return 'night';
  }
};

window.ScenesUI = ScenesUI;
