// ===== 学校教育系统 =====
const SchoolSystem = {
  _gameState: null,

  init(gameState) {
    this._gameState = gameState;
  },

  getEducation() {
    return this._gameState.education;
  },

  getCurrentLevel() {
    return this._gameState.education.level;
  },

  getLevelInfo() {
    return SCHOOL_LEVELS[this._gameState.education.level];
  },

  // 入学/升学
  enroll(targetLevel) {
    const edu = this._gameState.education;
    if (targetLevel !== edu.level + 1) return { ok: false, msg: '只能升到下一个学级' };
    if (targetLevel > 3) return { ok: false, msg: '已经是最高学历了' };

    const info = SCHOOL_LEVELS[targetLevel];
    const result = Economy.spend(info.enrollCost, `${info.name}入学`);
    if (!result.ok) return result;

    edu.level = targetLevel;
    return { ok: true, msg: `成功进入${info.name}！` };
  },

  // 获取可选课程
  getAvailableCourses() {
    const level = this._gameState.education.level;
    return Object.values(COURSES).filter(c => c.level <= level);
  },

  // 开始上课
  startCourse(courseId) {
    const edu = this._gameState.education;
    const course = COURSES[courseId];
    if (!course) return { ok: false, msg: '课程不存在' };
    if (course.level > edu.level) return { ok: false, msg: `需要${SCHOOL_LEVELS[course.level].name}学历` };
    if (edu.studying) return { ok: false, msg: '正在上课中...' };

    // Check if already completed
    if (edu.courses[courseId] && edu.courses[courseId].completed) {
      return { ok: false, msg: '这门课已经学完了' };
    }

    const result = Economy.spend(course.price, `上课：${course.name}`);
    if (!result.ok) return result;

    edu.studying = {
      courseId: courseId,
      endTime: Date.now() + course.duration * 1000 // duration in seconds for gameplay
    };
    return { ok: true, msg: `开始学习${course.name}，${course.duration}秒后完成` };
  },

  // 检查上课是否完成
  checkStudyComplete(pet) {
    const edu = this._gameState.education;
    if (!edu.studying) return null;
    if (Date.now() < edu.studying.endTime) return null;

    const course = COURSES[edu.studying.courseId];
    const grade = 60 + Math.floor(Math.random() * 41); // 60-100
    edu.courses[edu.studying.courseId] = { completed: true, grade: grade };
    pet.exp += course.exp;
    edu.studying = null;

    return {
      courseName: course.name,
      grade: grade,
      exp: course.exp
    };
  },

  // 获取上课进度
  getStudyProgress() {
    const edu = this._gameState.education;
    if (!edu.studying) return null;
    const course = COURSES[edu.studying.courseId];
    const total = course.duration * 1000;
    const elapsed = Date.now() - (edu.studying.endTime - total);
    const progress = Math.min(1, elapsed / total);
    return {
      courseName: course.name,
      progress: progress,
      timeLeft: Math.max(0, edu.studying.endTime - Date.now())
    };
  },

  // 获取已完成课程数
  getCompletedCount() {
    return Object.values(this._gameState.education.courses).filter(c => c.completed).length;
  }
};

window.SchoolSystem = SchoolSystem;
