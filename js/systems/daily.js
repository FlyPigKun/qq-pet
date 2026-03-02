// ===== 每日签到 & 任务系统 =====
const DailySystem = {
  _gameState: null,

  init(gameState) {
    this._gameState = gameState;
  },

  // 获取今天的日期字符串
  _today() {
    return new Date().toISOString().split('T')[0];
  },

  // 检查签到
  checkLogin() {
    const daily = this._gameState.daily;
    const today = this._today();

    if (daily.lastLogin === today) {
      return { alreadyLoggedIn: true, streak: daily.streak };
    }

    // Check if yesterday was the last login (for streak)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (daily.lastLogin === yesterdayStr) {
      daily.streak++;
    } else {
      daily.streak = 1;
    }

    daily.lastLogin = today;
    this._gameState.stats.daysPlayed++;

    // Reset daily tasks
    daily.tasks = {
      feed: false,
      play: false,
      study: false,
      work: false,
      game: false
    };

    return { alreadyLoggedIn: false, streak: daily.streak };
  },

  // 签到领奖
  claimLoginReward() {
    const daily = this._gameState.daily;
    const streak = daily.streak;
    // Streak bonus: base 5 + streak bonus
    let reward = 5 + Math.min(streak - 1, 6) * 3; // 5, 8, 11, 14, 17, 20, 23 max
    Economy.earn(reward, `签到第${streak}天`);
    return { reward: reward, streak: streak };
  },

  // 获取每日任务
  getDailyTasks() {
    const tasks = this._gameState.daily.tasks;
    return [
      { id: 'feed',  name: '喂食一次',      reward: 5,  done: !!tasks.feed },
      { id: 'play',  name: '玩耍一次',      reward: 5,  done: !!tasks.play },
      { id: 'study', name: '上一节课',      reward: 8,  done: !!tasks.study },
      { id: 'work',  name: '打工一次',      reward: 8,  done: !!tasks.work },
      { id: 'game',  name: '玩一个小游戏',  reward: 5,  done: !!tasks.game },
    ];
  },

  // 完成任务
  completeTask(taskId) {
    const tasks = this._gameState.daily.tasks;
    if (tasks[taskId]) return null; // Already done
    tasks[taskId] = true;
    const taskDefs = {
      feed: 5, play: 5, study: 8, work: 8, game: 5
    };
    const reward = taskDefs[taskId] || 0;
    if (reward > 0) {
      Economy.earn(reward, `完成每日任务`);
    }
    return reward;
  },

  // 获取签到信息
  getLoginInfo() {
    return {
      lastLogin: this._gameState.daily.lastLogin,
      streak: this._gameState.daily.streak,
      isLoggedInToday: this._gameState.daily.lastLogin === this._today()
    };
  },

  // 所有任务是否完成
  allTasksDone() {
    const tasks = this._gameState.daily.tasks;
    return tasks.feed && tasks.play && tasks.study && tasks.work && tasks.game;
  }
};

window.DailySystem = DailySystem;
