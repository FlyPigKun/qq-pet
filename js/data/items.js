// ===== 物品数据库 =====
const ITEMS = {
  // === 食品 ===
  bread:      { id: 'bread',      name: '面包',     type: 'food', price: 5,   hunger: 15, happiness: 2,  desc: '普通的面包，管饱' },
  rice:       { id: 'rice',       name: '米饭',     type: 'food', price: 8,   hunger: 20, happiness: 3,  desc: '热腾腾的白米饭' },
  milk:       { id: 'milk',       name: '牛奶',     type: 'food', price: 10,  hunger: 12, happiness: 5,  desc: '新鲜牛奶，营养丰富' },
  chicken:    { id: 'chicken',    name: '鸡腿',     type: 'food', price: 15,  hunger: 25, happiness: 8,  desc: '香喷喷的烤鸡腿' },
  fish:       { id: 'fish',       name: '烤鱼',     type: 'food', price: 18,  hunger: 22, happiness: 10, desc: '鲜美的烤鱼' },
  cake:       { id: 'cake',       name: '蛋糕',     type: 'food', price: 25,  hunger: 18, happiness: 15, desc: '甜蜜的奶油蛋糕' },
  icecream:   { id: 'icecream',   name: '冰淇淋',   type: 'food', price: 12,  hunger: 8,  happiness: 12, desc: '冰凉的冰淇淋' },
  candy:      { id: 'candy',      name: '棒棒糖',   type: 'food', price: 3,   hunger: 5,  happiness: 8,  desc: '甜甜的棒棒糖' },
  dumpling:   { id: 'dumpling',   name: '饺子',     type: 'food', price: 20,  hunger: 28, happiness: 10, desc: '妈妈包的饺子' },
  hotpot:     { id: 'hotpot',     name: '火锅',     type: 'food', price: 40,  hunger: 35, happiness: 20, desc: '豪华火锅大餐！' },
  noodle:     { id: 'noodle',     name: '拉面',     type: 'food', price: 12,  hunger: 22, happiness: 6,  desc: '一碗热气腾腾的拉面' },
  fruit:      { id: 'fruit',      name: '水果拼盘', type: 'food', price: 15,  hunger: 12, happiness: 8,  desc: '新鲜水果，维生素满满' },

  // === 玩具 ===
  ball:       { id: 'ball',       name: '皮球',     type: 'toy',  price: 15,  happiness: 20, energy: -8,  desc: '弹弹弹，弹走鱼尾纹' },
  kite:       { id: 'kite',       name: '风筝',     type: 'toy',  price: 20,  happiness: 25, energy: -12, desc: '在风中自由翱翔' },
  blocks:     { id: 'blocks',     name: '积木',     type: 'toy',  price: 25,  happiness: 18, energy: -5,  desc: '搭建自己的小世界' },
  doll:       { id: 'doll',       name: '布娃娃',   type: 'toy',  price: 30,  happiness: 22, energy: -3,  desc: '软绵绵的小伙伴' },
  puzzle:     { id: 'puzzle',     name: '拼图',     type: 'toy',  price: 18,  happiness: 15, energy: -4,  desc: '动脑筋的好玩具' },
  yoyo:       { id: 'yoyo',       name: '悠悠球',   type: 'toy',  price: 12,  happiness: 16, energy: -6,  desc: '炫酷的悠悠球' },

  // === 药品 ===
  coldmed:    { id: 'coldmed',    name: '感冒药',   type: 'medicine', price: 20,  cures: ['cold'],      desc: '治疗感冒' },
  feverpill:  { id: 'feverpill',  name: '退烧药',   type: 'medicine', price: 25,  cures: ['fever'],     desc: '退烧专用' },
  stomachmed: { id: 'stomachmed', name: '肠胃药',   type: 'medicine', price: 20,  cures: ['stomachache'], desc: '缓解肚子疼' },
  allergymed: { id: 'allergymed', name: '抗过敏药', type: 'medicine', price: 30,  cures: ['allergy'],   desc: '治疗过敏症状' },
  bandaid:    { id: 'bandaid',    name: '创可贴',   type: 'medicine', price: 10,  cures: ['wound'],     desc: '小伤口专用' },
  wonderpill: { id: 'wonderpill', name: '万能药',   type: 'medicine', price: 80,  cures: ['all'],       desc: '包治百病的灵丹妙药' },
  vitamin:    { id: 'vitamin',    name: '维生素',   type: 'medicine', price: 15,  health: 10,           desc: '增强体质，+10健康' },

  // === 服装 - 头部 ===
  hat_red:    { id: 'hat_red',    name: '红色小帽', type: 'clothing', slot: 'head', price: 30,  desc: '可爱的红色小帽子' },
  hat_crown:  { id: 'hat_crown',  name: '皇冠',     type: 'clothing', slot: 'head', price: 100, desc: '闪亮的金色皇冠' },
  hat_bow:    { id: 'hat_bow',    name: '蝴蝶结',   type: 'clothing', slot: 'head', price: 25,  desc: '粉色蝴蝶结发饰' },
  hat_cap:    { id: 'hat_cap',    name: '棒球帽',   type: 'clothing', slot: 'head', price: 35,  desc: '酷酷的棒球帽' },

  // === 服装 - 身体 ===
  body_shirt: { id: 'body_shirt', name: 'T恤',      type: 'clothing', slot: 'body', price: 40,  desc: '休闲T恤' },
  body_dress: { id: 'body_dress', name: '连衣裙',   type: 'clothing', slot: 'body', price: 60,  desc: '漂亮的连衣裙' },
  body_suit:  { id: 'body_suit',  name: '小西装',   type: 'clothing', slot: 'body', price: 80,  desc: '帅气的小西装' },
  body_scarf: { id: 'body_scarf', name: '围巾',     type: 'clothing', slot: 'body', price: 25,  desc: '温暖的围巾' },

  // === 服装 - 配饰 ===
  acc_glasses:  { id: 'acc_glasses',  name: '眼镜',   type: 'clothing', slot: 'accessory', price: 35,  desc: '文艺圆框眼镜' },
  acc_necklace: { id: 'acc_necklace', name: '项链',   type: 'clothing', slot: 'accessory', price: 45,  desc: '亮晶晶的项链' },
  acc_bag:      { id: 'acc_bag',      name: '小书包', type: 'clothing', slot: 'accessory', price: 30,  desc: '背上小书包去上学' },
  acc_bell:     { id: 'acc_bell',     name: '铃铛',   type: 'clothing', slot: 'accessory', price: 20,  desc: '叮铃铃的小铃铛' },

  // === 家具 ===
  fur_rug:    { id: 'fur_rug',    name: '粉色地毯', type: 'furniture', price: 50,  desc: '柔软的粉色地毯' },
  fur_plant:  { id: 'fur_plant',  name: '绿植盆栽', type: 'furniture', price: 30,  desc: '清新的小绿植' },
  fur_frame:  { id: 'fur_frame',  name: '相框',     type: 'furniture', price: 25,  desc: '挂满回忆的相框' },
  fur_lamp:   { id: 'fur_lamp',   name: '小台灯',   type: 'furniture', price: 35,  desc: '温馨的小台灯' },
  fur_shelf:  { id: 'fur_shelf',  name: '书架',     type: 'furniture', price: 60,  desc: '装满书的小书架' },
  fur_bed:    { id: 'fur_bed',    name: '豪华猫窝', type: 'furniture', price: 100, desc: '舒适的豪华猫窝' },
};

// 按类型分组
const ITEM_CATEGORIES = {
  food:      { name: '食品', icon: '🍎', items: Object.values(ITEMS).filter(i => i.type === 'food') },
  toy:       { name: '玩具', icon: '🎾', items: Object.values(ITEMS).filter(i => i.type === 'toy') },
  medicine:  { name: '药品', icon: '💊', items: Object.values(ITEMS).filter(i => i.type === 'medicine') },
  clothing:  { name: '服装', icon: '👗', items: Object.values(ITEMS).filter(i => i.type === 'clothing') },
  furniture: { name: '家具', icon: '🪑', items: Object.values(ITEMS).filter(i => i.type === 'furniture') },
};

window.ITEMS = ITEMS;
window.ITEM_CATEGORIES = ITEM_CATEGORIES;
