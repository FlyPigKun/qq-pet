// ===== 疾病数据 =====
const DISEASES = {
  cold:        { id: 'cold',        name: '感冒',     icon: '🤧', effect: { happiness: -2, energy: -3 }, medicine: 'coldmed',    hospitalCost: 30, desc: '阿嚏！着凉了' },
  fever:       { id: 'fever',       name: '发烧',     icon: '🤒', effect: { happiness: -3, energy: -5 }, medicine: 'feverpill',  hospitalCost: 40, desc: '好烫...头好晕' },
  stomachache: { id: 'stomachache', name: '肚子疼',   icon: '🤢', effect: { happiness: -3, hunger: -5 },  medicine: 'stomachmed', hospitalCost: 35, desc: '肚子咕噜咕噜叫' },
  allergy:     { id: 'allergy',     name: '过敏',     icon: '😵', effect: { happiness: -2, clean: -3 },   medicine: 'allergymed', hospitalCost: 35, desc: '身上好痒...' },
  wound:       { id: 'wound',       name: '擦伤',     icon: '🩹', effect: { happiness: -1, energy: -2 },  medicine: 'bandaid',    hospitalCost: 20, desc: '不小心摔了一跤' },
};

// 生病消息
const SICK_MESSAGES = {
  cold:        ['阿嚏...好冷...', '鼻子不通气了...', '感冒好难受...'],
  fever:       ['好烫...头好晕...', '浑身没力气...', '好想喝水...'],
  stomachache: ['肚子好疼...', '不该吃那么多...', '咕噜噜...'],
  allergy:     ['身上好痒啊...', '起疹子了...', '好不舒服...'],
  wound:       ['好疼...', '下次小心一点...', '需要创可贴...'],
};

window.DISEASES = DISEASES;
window.SICK_MESSAGES = SICK_MESSAGES;
