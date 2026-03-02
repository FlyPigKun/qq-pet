// ===== 课程数据 =====
const COURSES = {
  // === 小学课程 (education.level >= 1) ===
  chinese1:  { id: 'chinese1',  name: '语文',   level: 1, price: 20, duration: 30, exp: 15, desc: '学习识字和阅读' },
  math1:     { id: 'math1',     name: '数学',   level: 1, price: 20, duration: 30, exp: 15, desc: '学习基础算术' },
  english1:  { id: 'english1',  name: '英语',   level: 1, price: 20, duration: 30, exp: 15, desc: '学习ABC' },
  art1:      { id: 'art1',      name: '美术',   level: 1, price: 15, duration: 25, exp: 10, desc: '画画真有趣' },
  music1:    { id: 'music1',    name: '音乐',   level: 1, price: 15, duration: 25, exp: 10, desc: 'Do Re Mi' },

  // === 中学课程 (education.level >= 2) ===
  physics:   { id: 'physics',   name: '物理',   level: 2, price: 50, duration: 45, exp: 30, desc: '探索自然规律' },
  chemistry: { id: 'chemistry', name: '化学',   level: 2, price: 50, duration: 45, exp: 30, desc: '神奇的化学反应' },
  biology:   { id: 'biology',   name: '生物',   level: 2, price: 50, duration: 45, exp: 30, desc: '认识生命世界' },
  history:   { id: 'history',   name: '历史',   level: 2, price: 40, duration: 40, exp: 25, desc: '以史为鉴' },
  music2:    { id: 'music2',    name: '音乐鉴赏', level: 2, price: 45, duration: 40, exp: 25, desc: '欣赏世界名曲' },

  // === 大学课程 (education.level >= 3) ===
  programming: { id: 'programming', name: '编程',   level: 3, price: 100, duration: 60, exp: 50, desc: 'Hello World!' },
  economics:   { id: 'economics',   name: '经济学', level: 3, price: 100, duration: 60, exp: 50, desc: '供给与需求' },
  artdesign:   { id: 'artdesign',   name: '艺术设计', level: 3, price: 100, duration: 60, exp: 50, desc: '创意无限' },
  literature:  { id: 'literature',  name: '文学',   level: 3, price: 80,  duration: 50, exp: 40, desc: '品味经典文学' },
  philosophy:  { id: 'philosophy',  name: '哲学',   level: 3, price: 80,  duration: 50, exp: 40, desc: '思考人生' },
};

// 学校等级信息
const SCHOOL_LEVELS = {
  0: { name: '未入学', desc: '还没有上学哦', icon: '🏠', enrollCost: 0 },
  1: { name: '小学', desc: '快乐的小学时光', icon: '🏫', enrollCost: 50 },
  2: { name: '中学', desc: '努力学习的中学', icon: '🎓', enrollCost: 150 },
  3: { name: '大学', desc: '知识的殿堂',     icon: '🏛️', enrollCost: 300 },
};

window.COURSES = COURSES;
window.SCHOOL_LEVELS = SCHOOL_LEVELS;
