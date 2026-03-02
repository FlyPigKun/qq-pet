// ===== 主控制器 =====
const App = {
  _pet: null,
  _gameState: null,
  _isBusy: false,
  _sleepingMode: false,
  _tickTimer: null,
  _idleTimer: null,
  _currentTab: 'home',

  // DOM 引用
  $(id) { return document.getElementById(id); },

  getPet() { return this._pet; },
  getGameState() { return this._gameState; },

  // ===== 初始化 =====
  init() {
    // Load or create save
    let data = SaveManager.load();
    const isNew = !data;

    if (!data) {
      // No save - show egg hatching intro
      data = SaveManager.defaultSave();
      data.pet.stage = 0;
      data.pet.exp = 0;
    }

    this._gameState = data;
    this._pet = new Pet(data.pet);

    // Init all systems
    Economy.init(data);
    Inventory.init(data);
    DiarySystem.init(data);
    DailySystem.init(data);
    SchoolSystem.init(data);
    WorkSystem.init(data);
    HospitalSystem.init(data);
    AchievementSystem.init(data, this._pet);
    SoundManager.init(data.settings.soundOn);
    ScenesUI.init();

    // Apply offline decay
    if (!isNew) {
      this._pet.applyDecay();
    }

    // Check daily login
    const loginResult = DailySystem.checkLogin();

    // Update all displays
    this.updateStats();
    this.updateStageDisplay();
    this.updateCoinsDisplay();
    this.updatePetAppearance();
    this.showIdleMsg();
    this.startTimers();
    this._bindEvents();

    // Show login reward if new day
    if (!loginResult.alreadyLoggedIn) {
      const reward = DailySystem.claimLoginReward();
      setTimeout(() => {
        Panels.toast(`签到成功！连续${reward.streak}天，获得${reward.reward}Q币`);
        this.updateCoinsDisplay();
      }, 500);
    }

    // If new game, show hatching
    if (isNew) {
      this._showHatchingIntro();
    }

    // Save immediately
    this.saveGame();
  },

  // ===== 孵蛋开场 =====
  _showHatchingIntro() {
    const html = `
      <div class="hatching-intro">
        <div class="hatching-egg" id="hatchingEgg">🥚</div>
        <div class="hatching-text" id="hatchingText">一颗神秘的蛋出现了...</div>
        <div class="hatching-name" id="hatchingNameArea" style="display:none">
          <label>给宠物起个名字吧：</label>
          <input type="text" id="hatchingNameInput" maxlength="8" placeholder="小花" class="input-text" />
          <button class="btn btn-primary" onclick="App._finishHatching()">确定</button>
        </div>
      </div>
    `;
    Panels.open('hatching', '🥚 宠物孵化', html, { fullscreen: true });

    // Animate egg hatching
    setTimeout(() => {
      const egg = document.getElementById('hatchingEgg');
      if (egg) { egg.classList.add('egg-shaking'); }
    }, 500);

    setTimeout(() => {
      const egg = document.getElementById('hatchingEgg');
      const text = document.getElementById('hatchingText');
      if (egg) egg.textContent = '🐣';
      if (text) text.textContent = '宠物破壳而出了！';
      SoundManager.play('levelup');
    }, 2500);

    setTimeout(() => {
      const nameArea = document.getElementById('hatchingNameArea');
      if (nameArea) nameArea.style.display = '';
    }, 3500);
  },

  _finishHatching() {
    const input = document.getElementById('hatchingNameInput');
    const name = (input?.value || '').trim() || '小花';
    this._pet.name = name;
    this._pet.stage = 1;
    this._pet.exp = 20;
    AchievementSystem.unlock('first_hatch');
    AchievementSystem.unlock('stage_baby');
    DiarySystem.addEntry(`${name}破壳而出了！欢迎来到这个世界！`);
    Panels.close('hatching');
    this.updateStageDisplay();
    this.saveGame();
    Panels.toast(`欢迎${name}！`);
  },

  // ===== 定时器 =====
  startTimers() {
    this._tickTimer = setInterval(() => {
      this._pet.tick();
      this.updateStats();

      // Check study/work completion
      const studyResult = SchoolSystem.checkStudyComplete(this._pet);
      if (studyResult) {
        Panels.toast(`${studyResult.courseName}学完了！成绩${studyResult.grade}分，经验+${studyResult.exp}`);
        DailySystem.completeTask('study');
      }
      const workResult = WorkSystem.checkWorkComplete(this._pet);
      if (workResult) {
        Panels.toast(`${workResult.jobName}打工完成！获得${workResult.pay}Q币，经验+${workResult.exp}`);
        DailySystem.completeTask('work');
        this.updateCoinsDisplay();
      }

      // Check level up
      const lvl = this._pet.checkLevelUp();
      if (lvl) this._showLevelUp(lvl);

      // Check achievements
      const newAch = AchievementSystem.checkAll();
      newAch.forEach(a => {
        Panels.toast(`🏆 成就解锁：${a.name}！+${a.reward}Q币`);
        this.updateCoinsDisplay();
      });

      this.saveGame();
    }, 30000);

    this._idleTimer = setInterval(() => {
      if (!this._isBusy && !this._sleepingMode) {
        this.showIdleMsg();
        this._checkMoodExpression();
      }
    }, 25000);

    // Day/night update every 5 minutes
    setInterval(() => ScenesUI.applyDayNight(), 300000);
  },

  // ===== Tab导航 =====
  switchTab(tab) {
    this._currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.classList.add('active');

    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + tab)?.classList.add('active');

    SoundManager.play('click');
  },

  // ===== 更多菜单 =====
  openMoreMenu() {
    const gs = this._gameState;
    const studyProgress = SchoolSystem.getStudyProgress();
    const workProgress = WorkSystem.getWorkProgress();

    let studyStatus = '';
    if (studyProgress) {
      const pct = Math.round(studyProgress.progress * 100);
      studyStatus = `<span class="more-badge">学习中 ${pct}%</span>`;
    }
    let workStatus = '';
    if (workProgress) {
      const pct = Math.round(workProgress.progress * 100);
      workStatus = `<span class="more-badge">打工中 ${pct}%</span>`;
    }

    const html = `
      <div class="more-menu">
        <div class="more-item" onclick="Panels.close('more'); App.openSchool()">
          <span class="more-icon">🏫</span><span>学校</span>${studyStatus}
        </div>
        <div class="more-item" onclick="Panels.close('more'); App.openWork()">
          <span class="more-icon">💼</span><span>打工</span>${workStatus}
        </div>
        <div class="more-item" onclick="Panels.close('more'); BagUI.open()">
          <span class="more-icon">🎒</span><span>背包</span>
          <span class="more-badge">${Inventory.getAll().length}种</span>
        </div>
        <div class="more-item" onclick="Panels.close('more'); ClothingUI.open()">
          <span class="more-icon">👗</span><span>换装</span>
        </div>
        <div class="more-item" onclick="Panels.close('more'); App.openHospital()">
          <span class="more-icon">🏥</span><span>医院</span>
          ${this._pet.sick ? '<span class="more-badge sick">生病中</span>' : ''}
        </div>
        <div class="more-item" onclick="Panels.close('more'); App.openDaily()">
          <span class="more-icon">📅</span><span>签到</span>
        </div>
        <div class="more-item" onclick="Panels.close('more'); App.openAchievements()">
          <span class="more-icon">🏆</span><span>成就</span>
          <span class="more-badge">${AchievementSystem.getUnlockedCount()}/${AchievementSystem.getTotalCount()}</span>
        </div>
        <div class="more-item" onclick="Panels.close('more'); App.openDiary()">
          <span class="more-icon">📔</span><span>日记</span>
        </div>
        <div class="more-item" onclick="Panels.close('more'); App.openSettings()">
          <span class="more-icon">⚙️</span><span>设置</span>
        </div>
      </div>
    `;
    Panels.open('more', '📋 更多', html);
  },

  // ===== 快捷操作 =====
  feed() {
    if (this._isBusy) return;
    // Check if has food in inventory
    const foods = Inventory.getByType('food');
    if (foods.length > 0) {
      this._showFoodSelect();
      return;
    }
    // Default feed (free)
    const result = this._pet.feed();
    if (!result.ok) { Panels.toast(result.msg); return; }
    this._gameState.stats.totalFeeds++;
    DailySystem.completeTask('feed');
    this._playAction('eat', result.msg, '🍖', 2000);
  },

  _showFoodSelect() {
    const foods = Inventory.getByType('food');
    let html = '<div class="food-select"><div class="food-select-hint">选择食物喂食（或免费喂食普通猫粮）</div>';
    html += `<div class="bag-item" onclick="Panels.close('foodSelect'); App._doFreeFeed()">
      <div class="bag-item-info"><span class="bag-item-name">🍚 普通猫粮</span><span class="bag-item-count">免费</span></div>
      <div class="bag-item-desc">普通的猫粮，饱食度+25</div>
    </div>`;
    for (const entry of foods) {
      const item = ITEMS[entry.id];
      html += `<div class="bag-item" onclick="Panels.close('foodSelect'); App._doFeedItem('${entry.id}')">
        <div class="bag-item-info"><span class="bag-item-name">${item.name}</span><span class="bag-item-count">x${entry.count}</span></div>
        <div class="bag-item-desc">${item.desc} | 饱食+${item.hunger} 快乐+${item.happiness}</div>
      </div>`;
    }
    html += '</div>';
    Panels.open('foodSelect', '🍎 选择食物', html);
  },

  _doFreeFeed() {
    const result = this._pet.feed();
    if (!result.ok) { Panels.toast(result.msg); return; }
    this._gameState.stats.totalFeeds++;
    DailySystem.completeTask('feed');
    this._playAction('eat', result.msg, '🍖', 2000);
  },

  _doFeedItem(itemId) {
    const item = ITEMS[itemId];
    if (!Inventory.remove(itemId)) { Panels.toast('物品不足'); return; }
    const result = this._pet.feed(item);
    if (!result.ok) { Inventory.add(itemId); Panels.toast(result.msg); return; }
    this._gameState.stats.totalFeeds++;
    DailySystem.completeTask('feed');
    this._playAction('eat', result.msg, '🍖', 2000);
  },

  play() {
    if (this._isBusy) return;
    const result = this._pet.play();
    if (!result.ok) { Panels.toast(result.msg); return; }
    this._gameState.stats.totalPlays++;
    DailySystem.completeTask('play');
    this._playAction('play', result.msg, '✨', 2500);
  },

  sleep() {
    if (this._isBusy) return;
    const result = this._pet.sleep();
    if (!result.ok) { Panels.toast(result.msg); return; }
    this._isBusy = true;
    this._sleepingMode = true;
    this._showSpeech(result.msg);
    this._setExpression('sleep');
    const svg = this.$('petSvg');
    svg?.classList.add('pet-sleeping');
    this.$('zzz') && (this.$('zzz').style.display = '');
    SoundManager.play('click');

    setTimeout(() => {
      svg?.classList.remove('pet-sleeping');
      this.$('zzz') && (this.$('zzz').style.display = 'none');
      this._setExpression('normal');
      this.updateStats();
      this._showSpeech('睡醒啦！精神满满！');
      this._isBusy = false;
      this._sleepingMode = false;
      this.saveGame();
    }, 3000);
  },

  bath() {
    if (this._isBusy) return;
    const result = this._pet.bath();
    if (!result.ok) { Panels.toast(result.msg); return; }
    this._playAction('bath', result.msg, '💧', 2000);
  },

  // 通用动作动画
  _playAction(type, msg, emoji, duration) {
    this._isBusy = true;
    this._showSpeech(msg);
    this._spawnParticles(emoji, 6);

    const svg = this.$('petSvg');
    if (type === 'eat') {
      this._setExpression('eat');
      svg?.classList.add('pet-eating');
      this.$('foodIcon') && (this.$('foodIcon').style.display = '');
      SoundManager.play('eat');
    } else if (type === 'play') {
      this._setExpression('happy');
      svg?.classList.add('pet-happy');
      this.$('hearts') && (this.$('hearts').style.display = '');
      SoundManager.play('happy');
    } else if (type === 'bath') {
      this._setExpression('happy');
      svg?.classList.add('pet-bathing');
      SoundManager.play('click');
    }

    setTimeout(() => {
      svg?.classList.remove('pet-eating', 'pet-happy', 'pet-bathing');
      this.$('foodIcon') && (this.$('foodIcon').style.display = 'none');
      this.$('hearts') && (this.$('hearts').style.display = 'none');
      this._setExpression('normal');
      this.updateStats();
      const lvl = this._pet.checkLevelUp();
      if (lvl) this._showLevelUp(lvl);
      this._isBusy = false;
      this.saveGame();
    }, duration);
  },

  // ===== 学校面板 =====
  openSchool() {
    const edu = SchoolSystem.getEducation();
    const levelInfo = SchoolSystem.getLevelInfo();
    const progress = SchoolSystem.getStudyProgress();

    let html = `<div class="school-panel">`;
    html += `<div class="school-info">当前学历：${levelInfo.icon} ${levelInfo.name}</div>`;

    // Studying progress
    if (progress) {
      const pct = Math.round(progress.progress * 100);
      const secs = Math.ceil(progress.timeLeft / 1000);
      html += `
        <div class="study-progress">
          <div>正在学习：${progress.courseName}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div>剩余 ${secs} 秒</div>
        </div>
      `;
    }

    // Enroll button
    if (edu.level < 3) {
      const next = SCHOOL_LEVELS[edu.level + 1];
      html += `<div class="school-enroll">
        <button class="btn btn-primary" onclick="App._enroll(${edu.level + 1})">
          升学到${next.name} (${next.enrollCost}Q币)
        </button>
      </div>`;
    }

    // Course list
    const courses = SchoolSystem.getAvailableCourses();
    if (courses.length > 0) {
      html += '<h3>可选课程</h3><div class="course-list">';
      for (const c of courses) {
        const done = edu.courses[c.id]?.completed;
        const grade = edu.courses[c.id]?.grade;
        html += `
          <div class="course-item ${done ? 'course-done' : ''}">
            <div class="course-info">
              <span class="course-name">${c.name}</span>
              <span class="course-meta">💰${c.price} | ⏱️${c.duration}秒 | 经验+${c.exp}</span>
              ${done ? `<span class="course-grade">成绩：${grade}分 ✅</span>` : ''}
            </div>
            ${!done && !progress ? `<button class="btn btn-sm btn-primary" onclick="App._startCourse('${c.id}')">上课</button>` : ''}
          </div>
        `;
      }
      html += '</div>';
    } else {
      html += '<div class="bag-empty">先入学才能上课哦</div>';
    }

    html += '</div>';
    Panels.open('school', '🏫 学校', html);
  },

  _enroll(level) {
    const result = SchoolSystem.enroll(level);
    Panels.toast(result.msg);
    if (result.ok) {
      DiarySystem.addEntry(`进入${SCHOOL_LEVELS[level].name}学习了！`);
      this.saveGame();
      this.updateCoinsDisplay();
    }
    Panels.close('school');
    this.openSchool();
  },

  _startCourse(courseId) {
    const result = SchoolSystem.startCourse(courseId);
    Panels.toast(result.msg);
    if (result.ok) {
      ScenesUI.switchScene('school');
      this.saveGame();
      this.updateCoinsDisplay();
    }
    Panels.close('school');
    this.openSchool();
  },

  // ===== 打工面板 =====
  openWork() {
    const progress = WorkSystem.getWorkProgress();
    let html = '<div class="work-panel">';

    if (progress) {
      const pct = Math.round(progress.progress * 100);
      const secs = Math.ceil(progress.timeLeft / 1000);
      html += `
        <div class="study-progress">
          <div>正在打工：${progress.jobName}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div>剩余 ${secs} 秒</div>
        </div>
      `;
    }

    const jobs = WorkSystem.getAvailableJobs();
    html += '<h3>可选工作</h3><div class="course-list">';
    for (const j of jobs) {
      const canDo = this._pet.energy >= j.energyCost && !this._pet.sick && !WorkSystem.isWorking();
      html += `
        <div class="course-item">
          <div class="course-info">
            <span class="course-name">${j.name}</span>
            <span class="course-meta">💰+${j.pay} | ⚡-${j.energyCost} | ⏱️${j.duration}秒</span>
            <span class="course-meta">需要${SCHOOL_LEVELS[j.reqLevel].name}学历 | 经验+${j.exp}</span>
          </div>
          ${canDo ? `<button class="btn btn-sm btn-primary" onclick="App._startWork('${j.id}')">打工</button>` : ''}
        </div>
      `;
    }
    html += '</div></div>';
    Panels.open('work', '💼 打工', html);
  },

  _startWork(jobId) {
    const result = WorkSystem.startWork(jobId, this._pet);
    Panels.toast(result.msg);
    if (result.ok) {
      this.updateStats();
      this.saveGame();
    }
    Panels.close('work');
    this.openWork();
  },

  // ===== 医院面板 =====
  openHospital() {
    const diag = HospitalSystem.diagnose(this._pet);
    let html = '<div class="hospital-panel">';
    html += `<div class="health-display">❤️ 健康值：${Math.round(this._pet.health)}/100</div>`;

    if (diag.sick) {
      html += `
        <div class="sick-info">
          <div class="sick-icon">${diag.disease.icon}</div>
          <div class="sick-name">${diag.disease.name}</div>
          <div class="sick-desc">${diag.disease.desc}</div>
          <div class="sick-treatment">
            推荐药品：${diag.medicineName}<br>
            医院治疗费：💰${diag.hospitalCost}
          </div>
          <div class="sick-btns">
            <button class="btn btn-primary" onclick="App._hospitalTreat()">医院治疗 (💰${diag.hospitalCost})</button>
          </div>
        </div>
      `;
      // Show medicines in inventory
      const meds = Inventory.getByType('medicine');
      if (meds.length > 0) {
        html += '<h3>背包中的药品</h3><div class="bag-list">';
        for (const entry of meds) {
          const item = ITEMS[entry.id];
          html += `
            <div class="bag-item">
              <div class="bag-item-info">
                <span class="bag-item-name">${item.name}</span>
                <span class="bag-item-count">x${entry.count}</span>
              </div>
              <button class="btn btn-sm btn-primary" onclick="App._useHospitalMed('${entry.id}')">使用</button>
            </div>
          `;
        }
        html += '</div>';
      }
    } else {
      html += '<div class="hospital-healthy">🎉 宠物很健康！</div>';
    }
    html += '</div>';
    Panels.open('hospital', '🏥 医院', html);
  },

  _hospitalTreat() {
    const disease = DISEASES[this._pet.sick?.id];
    if (!disease) return;
    const spendResult = Economy.spend(disease.hospitalCost, '医院治疗');
    if (!spendResult.ok) { Panels.toast(spendResult.msg); return; }
    this._pet.sick = null;
    this._pet.health = this._pet.clamp(this._pet.health + 30);
    AchievementSystem.unlock('first_cure');
    DiarySystem.addEntry('在医院治好了病');
    Panels.toast('治好了！');
    this.updateStats();
    this.updateCoinsDisplay();
    this.saveGame();
    Panels.close('hospital');
  },

  _useHospitalMed(itemId) {
    const result = Inventory.use(itemId, this._pet);
    Panels.toast(result.msg);
    if (result.ok) {
      AchievementSystem.unlock('first_cure');
      DiarySystem.addEntry('吃药治好了病');
      this.updateStats();
      this.saveGame();
    }
    Panels.close('hospital');
    this.openHospital();
  },

  // ===== 每日签到面板 =====
  openDaily() {
    const info = DailySystem.getLoginInfo();
    const tasks = DailySystem.getDailyTasks();

    let html = `<div class="daily-panel">`;
    html += `<div class="daily-streak">🔥 连续签到 ${info.streak} 天</div>`;
    html += `<div class="daily-status">${info.isLoggedInToday ? '✅ 今日已签到' : '❌ 今日未签到'}</div>`;

    html += '<h3>每日任务</h3><div class="task-list">';
    for (const t of tasks) {
      html += `
        <div class="task-item ${t.done ? 'task-done' : ''}">
          <span class="task-check">${t.done ? '✅' : '⬜'}</span>
          <span class="task-name">${t.name}</span>
          <span class="task-reward">+${t.reward}Q币</span>
        </div>
      `;
    }
    html += '</div>';

    const allDone = DailySystem.allTasksDone();
    if (allDone) {
      html += '<div class="daily-bonus">🎉 所有任务完成！太棒了！</div>';
    }

    html += '</div>';
    Panels.open('daily', '📅 每日签到', html);
  },

  // ===== 成就面板 =====
  openAchievements() {
    const all = AchievementSystem.getAll();
    let html = `<div class="achievements-panel">`;
    html += `<div class="ach-count">已解锁 ${AchievementSystem.getUnlockedCount()}/${AchievementSystem.getTotalCount()}</div>`;
    html += '<div class="ach-list">';
    for (const a of all) {
      html += `
        <div class="ach-item ${a.unlocked ? 'ach-unlocked' : 'ach-locked'}">
          <span class="ach-icon">${a.unlocked ? a.icon : '🔒'}</span>
          <div class="ach-info">
            <div class="ach-name">${a.unlocked ? a.name : '???'}</div>
            <div class="ach-desc">${a.unlocked ? a.desc : '未解锁'}</div>
          </div>
          ${a.unlocked ? `<span class="ach-reward">+${a.reward}💰</span>` : ''}
        </div>
      `;
    }
    html += '</div></div>';
    Panels.open('achievements', '🏆 成就', html);
  },

  // ===== 日记面板 =====
  openDiary() {
    const entries = DiarySystem.getAll();
    let html = '<div class="diary-panel">';
    if (entries.length === 0) {
      html += '<div class="bag-empty">日记还是空的...</div>';
    } else {
      for (const e of entries) {
        html += `
          <div class="diary-entry">
            <div class="diary-date">${e.date}</div>
            <div class="diary-text">${e.text}</div>
          </div>
        `;
      }
    }
    html += '</div>';
    Panels.open('diary', '📔 宠物日记', html);
  },

  // ===== 设置面板 =====
  openSettings() {
    const s = this._gameState.settings;
    const html = `
      <div class="settings-panel">
        <div class="setting-row">
          <span>🔊 音效</span>
          <button class="btn btn-sm ${s.soundOn ? 'btn-primary' : ''}"
            onclick="App._toggleSound()">${s.soundOn ? '开' : '关'}</button>
        </div>
        <div class="setting-row">
          <span>📊 统计</span>
          <div class="stats-detail">
            喂食 ${this._gameState.stats.totalFeeds} 次 |
            玩耍 ${this._gameState.stats.totalPlays} 次 |
            打工 ${this._gameState.stats.totalWorked} 次<br>
            游戏 ${this._gameState.stats.gamesPlayed} 次 |
            累计 ${this._gameState.stats.daysPlayed} 天
          </div>
        </div>
        <div class="setting-row danger">
          <span>⚠️ 重置游戏</span>
          <button class="btn btn-sm btn-danger" onclick="App._confirmReset()">重置</button>
        </div>
      </div>
    `;
    Panels.open('settings', '⚙️ 设置', html);
  },

  _toggleSound() {
    this._gameState.settings.soundOn = !this._gameState.settings.soundOn;
    SoundManager.setEnabled(this._gameState.settings.soundOn);
    this.saveGame();
    Panels.close('settings');
    this.openSettings();
  },

  _confirmReset() {
    Panels.confirm('重置游戏', '确定要重置所有数据吗？这将删除所有存档！', () => {
      SaveManager.reset();
      location.reload();
    });
  },

  // ===== 显示更新 =====
  updateStats() {
    const p = this._pet;
    this._setBar('hungerBar', 'hungerNum', p.hunger);
    this._setBar('happyBar', 'happyNum', p.happiness);
    this._setBar('energyBar', 'energyNum', p.energy);
    this._setBar('cleanBar', 'cleanNum', p.clean);
    this._setBar('healthBar', 'healthNum', p.health);
    this._checkMoodExpression();
  },

  _setBar(barId, numId, val) {
    const v = Math.round(val);
    const bar = this.$(barId);
    if (!bar) return;
    bar.style.width = v + '%';
    const num = this.$(numId);
    if (num) num.textContent = v;
    if (v < 25) bar.classList.add('low');
    else bar.classList.remove('low');
  },

  updateStageDisplay() {
    const info = this._pet.getStageInfo();
    const stageEl = this.$('petStage');
    const nameEl = this.$('petName');
    const expEl = this.$('expVal');
    if (stageEl) stageEl.textContent = info.icon + ' ' + info.name;
    if (nameEl) nameEl.textContent = this._pet.name;
    if (expEl) expEl.textContent = this._pet.exp;
  },

  updateCoinsDisplay() {
    const el = this.$('coinsDisplay');
    if (el) el.textContent = this._gameState.coins;
  },

  updatePetAppearance() {
    const clothing = this._pet.clothing;
    // Update SVG clothing layers
    const headLayer = this.$('clothingHead');
    const bodyLayer = this.$('clothingBody');
    const accLayer = this.$('clothingAcc');

    if (headLayer) {
      if (clothing.head && ITEMS[clothing.head]) {
        headLayer.style.display = '';
        this._applyClothingSVG(headLayer, clothing.head);
      } else {
        headLayer.style.display = 'none';
      }
    }
    if (bodyLayer) {
      if (clothing.body && ITEMS[clothing.body]) {
        bodyLayer.style.display = '';
        this._applyClothingSVG(bodyLayer, clothing.body);
      } else {
        bodyLayer.style.display = 'none';
      }
    }
    if (accLayer) {
      if (clothing.accessory && ITEMS[clothing.accessory]) {
        accLayer.style.display = '';
        this._applyClothingSVG(accLayer, clothing.accessory);
      } else {
        accLayer.style.display = 'none';
      }
    }

    // Stage-based size
    const stage = PET_STAGES[this._pet.stage];
    const container = this.$('petContainer');
    if (container) {
      container.style.transform = `translateX(-50%) scale(${stage.size})`;
    }
  },

  _applyClothingSVG(element, itemId) {
    const clothingStyles = {
      // Head
      hat_red:    { fill: '#e53935', d: 'M 60 68 Q 100 45 140 68 L 135 78 Q 100 60 65 78 Z' },
      hat_crown:  { fill: '#ffd700', d: 'M 70 72 L 78 50 L 88 65 L 100 42 L 112 65 L 122 50 L 130 72 Z' },
      hat_bow:    { fill: '#f48fb1', d: 'M 85 60 Q 75 50 80 40 Q 90 45 85 60 Q 95 50 100 40 Q 105 45 95 60 Z' },
      hat_cap:    { fill: '#1565c0', d: 'M 58 78 Q 100 55 142 78 L 155 75 L 148 72 Q 100 50 55 72 Z' },
      // Body
      body_shirt: { fill: '#42a5f5', d: 'M 65 145 Q 100 135 135 145 L 138 180 Q 100 185 62 180 Z' },
      body_dress: { fill: '#ec407a', d: 'M 65 145 Q 100 135 135 145 L 145 200 Q 100 210 55 200 Z' },
      body_suit:  { fill: '#37474f', d: 'M 68 145 Q 100 138 132 145 L 135 180 Q 100 183 65 180 Z' },
      body_scarf: { fill: '#ff7043', d: 'M 75 130 Q 100 125 125 130 Q 128 138 120 140 Q 100 135 80 140 Q 72 138 75 130' },
      // Accessories
      acc_glasses:  { fill: 'none', stroke: '#333', strokeWidth: 2, d: 'M 68 106 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 112 106 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 88 106 L 112 106' },
      acc_necklace: { fill: 'none', stroke: '#ffd700', strokeWidth: 2, d: 'M 75 135 Q 100 148 125 135' },
      acc_bag:      { fill: '#8d6e63', d: 'M 130 150 L 150 150 L 152 180 L 128 180 Z M 132 150 Q 140 140 148 150' },
      acc_bell:     { fill: '#ffd700', d: 'M 95 132 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0' },
    };

    const style = clothingStyles[itemId];
    if (!style) { element.style.display = 'none'; return; }

    let pathAttrs = `d="${style.d}" fill="${style.fill}"`;
    if (style.stroke) pathAttrs += ` stroke="${style.stroke}" stroke-width="${style.strokeWidth || 2}"`;
    element.innerHTML = `<path ${pathAttrs}/>`;
  },

  // ===== 表情系统 =====
  _setExpression(type) {
    const els = {
      eyes: this.$('eyes'),
      sleepEyes: this.$('sleepEyes'),
      happyEyes: this.$('happyEyes'),
      sadEyes: this.$('sadEyes'),
      mouth: this.$('mouth'),
      eatMouth: this.$('eatMouth'),
      sadMouth: this.$('sadMouth'),
      blushL: this.$('blushL'),
      blushR: this.$('blushR'),
    };

    // Reset
    if (els.eyes) els.eyes.style.display = '';
    if (els.sleepEyes) els.sleepEyes.style.display = 'none';
    if (els.happyEyes) els.happyEyes.style.display = 'none';
    if (els.sadEyes) els.sadEyes.style.display = 'none';
    if (els.mouth) els.mouth.style.display = '';
    if (els.eatMouth) els.eatMouth.style.display = 'none';
    if (els.sadMouth) els.sadMouth.style.display = 'none';
    if (els.blushL) els.blushL.style.opacity = '0';
    if (els.blushR) els.blushR.style.opacity = '0';

    if (type === 'happy') {
      if (els.eyes) els.eyes.style.display = 'none';
      if (els.happyEyes) els.happyEyes.style.display = '';
      if (els.blushL) els.blushL.style.opacity = '0.7';
      if (els.blushR) els.blushR.style.opacity = '0.7';
    } else if (type === 'sleep') {
      if (els.eyes) els.eyes.style.display = 'none';
      if (els.sleepEyes) els.sleepEyes.style.display = '';
      if (els.mouth) els.mouth.style.display = 'none';
    } else if (type === 'eat') {
      if (els.mouth) els.mouth.style.display = 'none';
      if (els.eatMouth) els.eatMouth.style.display = '';
    } else if (type === 'sad') {
      if (els.eyes) els.eyes.style.display = 'none';
      if (els.sadEyes) els.sadEyes.style.display = '';
      if (els.mouth) els.mouth.style.display = 'none';
      if (els.sadMouth) els.sadMouth.style.display = '';
    } else if (type === 'sick') {
      if (els.eyes) els.eyes.style.display = 'none';
      if (els.sadEyes) els.sadEyes.style.display = '';
      if (els.mouth) els.mouth.style.display = 'none';
      if (els.sadMouth) els.sadMouth.style.display = '';
    }
  },

  _checkMoodExpression() {
    if (this._isBusy || this._sleepingMode) return;
    const mood = this._pet.getMood();
    const svg = this.$('petSvg');
    if (!svg) return;

    if (mood === 'sad' || mood === 'hungry' || mood === 'dirty' || mood === 'sick') {
      this._setExpression(mood === 'sick' ? 'sick' : 'sad');
      svg.classList.add('pet-sad');
    } else if (mood === 'happy') {
      this._setExpression('happy');
      svg.classList.remove('pet-sad');
    } else {
      this._setExpression('normal');
      svg.classList.remove('pet-sad');
    }
    this.updateStageDisplay();

    // Update sick indicator
    const sickIndicator = this.$('sickIndicator');
    if (sickIndicator) {
      sickIndicator.style.display = this._pet.sick ? '' : 'none';
      if (this._pet.sick) {
        sickIndicator.textContent = DISEASES[this._pet.sick.id]?.icon || '🤒';
      }
    }
  },

  // ===== 成长弹窗 =====
  _showLevelUp(info) {
    this.updateStageDisplay();
    this.updatePetAppearance();
    const stage = PET_STAGES[info.newStage];
    SoundManager.play('levelup');
    DiarySystem.addEntry(`成长了！变成了${stage.name}！`);

    const html = `
      <div class="game-over">
        <div class="game-over-icon">${stage.icon}</div>
        <div class="game-over-title">宠物成长了！</div>
        <div class="game-over-score">${this._pet.name}变成了${stage.name}！</div>
        <button class="btn btn-primary" onclick="Panels.close('levelup')">太棒了！</button>
      </div>
    `;
    Panels.open('levelup', '🎉 成长', html);
    this._spawnParticles('🎉', 12);
    this._spawnParticles('⭐', 8);
  },

  // ===== 气泡/粒子 =====
  _showSpeech(text) {
    const el = this.$('speechBubble');
    const txt = this.$('speechText');
    if (!el || !txt) return;
    txt.textContent = text;
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'bubbleAppear 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  },

  showIdleMsg() {
    this._showSpeech(this._pet.getIdleMsg());
  },

  _spawnParticles(emoji, count) {
    const container = this.$('petContainer');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = emoji;
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 60 + Math.random() * 40;
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', (Math.sin(angle) * dist - 30) + 'px');
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  },

  // ===== 事件绑定 =====
  _bindEvents() {
    const petContainer = this.$('petContainer');
    if (petContainer) {
      petContainer.addEventListener('click', () => {
        if (this._isBusy || this._sleepingMode) return;
        this._showSpeech(this._pet.getIdleMsg());
        // Blush
        const bl = this.$('blushL'), br = this.$('blushR');
        if (bl) bl.style.opacity = '0.7';
        if (br) br.style.opacity = '0.7';
        setTimeout(() => {
          if (bl) bl.style.opacity = '0';
          if (br) br.style.opacity = '0';
        }, 1500);
        SoundManager.play('click');
      });
    }
  },

  // ===== 保存 =====
  saveGame() {
    this._gameState.pet = this._pet.toData();
    SaveManager.save(this._gameState);
  }
};

window.App = App;
