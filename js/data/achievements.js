// ===== 成就数据 =====
const ACHIEVEMENTS = {
  // === 成长相关 ===
  first_hatch:    { id: 'first_hatch',    name: '破壳而出',   icon: '🥚', desc: '宠物成功孵化', reward: 10 },
  stage_baby:     { id: 'stage_baby',     name: '婴儿时代',   icon: '👶', desc: '成长到婴儿阶段', reward: 10 },
  stage_child:    { id: 'stage_child',    name: '快乐童年',   icon: '🧒', desc: '成长到幼年阶段', reward: 20 },
  stage_teen:     { id: 'stage_teen',     name: '青涩少年',   icon: '🧑', desc: '成长到少年阶段', reward: 30 },
  stage_young:    { id: 'stage_young',    name: '意气风发',   icon: '💪', desc: '成长到青年阶段', reward: 50 },
  stage_adult:    { id: 'stage_adult',    name: '独当一面',   icon: '🌟', desc: '成长到成年阶段', reward: 100 },

  // === 喂食相关 ===
  feed_10:        { id: 'feed_10',        name: '小小美食家', icon: '🍽️', desc: '累计喂食10次', reward: 10 },
  feed_50:        { id: 'feed_50',        name: '美食达人',   icon: '🍖', desc: '累计喂食50次', reward: 30 },
  feed_100:       { id: 'feed_100',       name: '吃货本色',   icon: '🍰', desc: '累计喂食100次', reward: 50 },

  // === 玩耍相关 ===
  play_10:        { id: 'play_10',        name: '初级玩家',   icon: '🎮', desc: '累计玩耍10次', reward: 10 },
  play_50:        { id: 'play_50',        name: '游戏达人',   icon: '🕹️', desc: '累计玩耍50次', reward: 30 },

  // === 经济相关 ===
  coins_100:      { id: 'coins_100',      name: '小有积蓄',   icon: '💰', desc: '累计赚取100Q币', reward: 10 },
  coins_500:      { id: 'coins_500',      name: '中产阶级',   icon: '💎', desc: '累计赚取500Q币', reward: 30 },
  coins_2000:     { id: 'coins_2000',     name: '富甲一方',   icon: '👑', desc: '累计赚取2000Q币', reward: 80 },
  first_purchase: { id: 'first_purchase', name: '第一次购物', icon: '🛒', desc: '在商店购买第一件物品', reward: 5 },

  // === 游戏相关 ===
  game_first:     { id: 'game_first',     name: '初试身手',   icon: '🎯', desc: '完成第一个迷你游戏', reward: 10 },
  game_30:        { id: 'game_30',        name: '游戏狂人',   icon: '🏆', desc: '累计玩30次迷你游戏', reward: 30 },

  // === 教育相关 ===
  enroll_primary: { id: 'enroll_primary', name: '入学啦',     icon: '🏫', desc: '进入小学学习', reward: 10 },
  enroll_middle:  { id: 'enroll_middle',  name: '中学生',     icon: '📚', desc: '升入中学', reward: 20 },
  enroll_college: { id: 'enroll_college', name: '大学生',     icon: '🎓', desc: '考入大学', reward: 50 },

  // === 工作相关 ===
  first_job:      { id: 'first_job',      name: '初入职场',   icon: '💼', desc: '完成第一份工作', reward: 10 },
  work_20:        { id: 'work_20',        name: '劳动模范',   icon: '🏅', desc: '累计打工20次', reward: 30 },

  // === 签到相关 ===
  login_7:        { id: 'login_7',        name: '常来看看',   icon: '📅', desc: '连续签到7天', reward: 20 },
  login_30:       { id: 'login_30',       name: '风雨无阻',   icon: '🗓️', desc: '连续签到30天', reward: 100 },

  // === 其他 ===
  first_sick:     { id: 'first_sick',     name: '小小病号',   icon: '🤒', desc: '第一次生病', reward: 5 },
  first_cure:     { id: 'first_cure',     name: '药到病除',   icon: '💊', desc: '第一次治好疾病', reward: 10 },
  full_dress:     { id: 'full_dress',     name: '全副武装',   icon: '👗', desc: '同时装备头部、身体和配饰', reward: 20 },
  days_30:        { id: 'days_30',        name: '老朋友',     icon: '🤝', desc: '累计游玩30天', reward: 50 },
};

window.ACHIEVEMENTS = ACHIEVEMENTS;
