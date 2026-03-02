// ===== 工作数据 =====
const JOBS = {
  // === 无学历要求 ===
  trash:    { id: 'trash',    name: '捡垃圾',   reqLevel: 0, pay: 5,  energyCost: 15, duration: 20, exp: 3,  desc: '虽然辛苦，但也是劳动' },
  flyer:    { id: 'flyer',    name: '发传单',   reqLevel: 0, pay: 8,  energyCost: 12, duration: 25, exp: 4,  desc: '在街上发广告传单' },
  sweep:    { id: 'sweep',    name: '扫地',     reqLevel: 0, pay: 6,  energyCost: 10, duration: 15, exp: 2,  desc: '打扫卫生' },

  // === 小学学历 ===
  cashier:  { id: 'cashier',  name: '收银员',   reqLevel: 1, pay: 15, energyCost: 10, duration: 30, exp: 6,  desc: '超市收银，需要会算数' },
  courier:  { id: 'courier',  name: '快递员',   reqLevel: 1, pay: 12, energyCost: 18, duration: 25, exp: 5,  desc: '风雨无阻送快递' },
  waiter:   { id: 'waiter',   name: '服务员',   reqLevel: 1, pay: 13, energyCost: 12, duration: 25, exp: 5,  desc: '餐厅服务员' },

  // === 中学学历 ===
  clerk:    { id: 'clerk',    name: '文员',     reqLevel: 2, pay: 25, energyCost: 8,  duration: 35, exp: 10, desc: '坐办公室的白领' },
  guide:    { id: 'guide',    name: '导游',     reqLevel: 2, pay: 30, energyCost: 15, duration: 40, exp: 12, desc: '带团旅游，见多识广' },
  nurse:    { id: 'nurse',    name: '护士',     reqLevel: 2, pay: 28, energyCost: 12, duration: 35, exp: 11, desc: '白衣天使' },

  // === 大学学历 ===
  teacher:  { id: 'teacher',  name: '教师',     reqLevel: 3, pay: 50, energyCost: 10, duration: 45, exp: 20, desc: '教书育人，受人尊敬' },
  coder:    { id: 'coder',    name: '程序员',   reqLevel: 3, pay: 60, energyCost: 12, duration: 50, exp: 25, desc: '996福报，但工资高' },
  doctor:   { id: 'doctor',   name: '医生',     reqLevel: 3, pay: 55, energyCost: 15, duration: 50, exp: 22, desc: '悬壶济世' },
  designer: { id: 'designer', name: '设计师',   reqLevel: 3, pay: 45, energyCost: 8,  duration: 40, exp: 18, desc: '用创意改变世界' },
};

window.JOBS = JOBS;
