// ===== 打工系统 =====
const WorkSystem = {
  _gameState: null,

  init(gameState) {
    this._gameState = gameState;
  },

  // 获取可选工作
  getAvailableJobs() {
    const eduLevel = this._gameState.education.level;
    return Object.values(JOBS).filter(j => j.reqLevel <= eduLevel);
  },

  // 开始打工
  startWork(jobId, pet) {
    const work = this._gameState.work;
    const job = JOBS[jobId];
    if (!job) return { ok: false, msg: '工作不存在' };
    if (job.reqLevel > this._gameState.education.level) {
      return { ok: false, msg: `需要${SCHOOL_LEVELS[job.reqLevel].name}学历` };
    }
    if (work.working) return { ok: false, msg: '正在打工中...' };
    if (pet.energy < job.energyCost) return { ok: false, msg: '体力不足，先休息一下吧' };
    if (pet.sick) return { ok: false, msg: '生病了不能打工，先去治疗吧' };

    // Consume energy immediately
    pet.energy = pet.clamp(pet.energy - job.energyCost);
    pet.clean = pet.clamp(pet.clean - 5);

    work.working = {
      jobId: jobId,
      endTime: Date.now() + job.duration * 1000
    };
    work.jobId = jobId;
    return { ok: true, msg: `开始${job.name}，${job.duration}秒后完成` };
  },

  // 检查打工是否完成
  checkWorkComplete(pet) {
    const work = this._gameState.work;
    if (!work.working) return null;
    if (Date.now() < work.working.endTime) return null;

    const job = JOBS[work.working.jobId];
    Economy.earn(job.pay, job.name);
    pet.exp += job.exp;
    this._gameState.stats.totalWorked++;
    work.working = null;

    return {
      jobName: job.name,
      pay: job.pay,
      exp: job.exp
    };
  },

  // 获取打工进度
  getWorkProgress() {
    const work = this._gameState.work;
    if (!work.working) return null;
    const job = JOBS[work.working.jobId];
    const total = job.duration * 1000;
    const elapsed = Date.now() - (work.working.endTime - total);
    const progress = Math.min(1, elapsed / total);
    return {
      jobName: job.name,
      progress: progress,
      timeLeft: Math.max(0, work.working.endTime - Date.now())
    };
  },

  isWorking() {
    return !!this._gameState.work.working;
  }
};

window.WorkSystem = WorkSystem;
