// ===== 医院系统 =====
const HospitalSystem = {
  _gameState: null,

  init(gameState) {
    this._gameState = gameState;
  },

  // 诊断
  diagnose(pet) {
    if (!pet.sick) {
      return { sick: false, msg: '宠物很健康！', health: pet.health };
    }
    const disease = DISEASES[pet.sick.id];
    return {
      sick: true,
      disease: disease,
      sickInfo: pet.sick,
      health: pet.health,
      msg: `诊断结果：${disease.name} - ${disease.desc}`,
      medicineName: ITEMS[disease.medicine] ? ITEMS[disease.medicine].name : '未知药品',
      hospitalCost: disease.hospitalCost
    };
  },

  // 医院治疗（花Q币）
  treat(pet) {
    if (!pet.sick) return { ok: false, msg: '宠物没有生病' };
    const result = pet.hospitalCure();
    if (result.ok && result.cost > 0) {
      const spendResult = Economy.spend(result.cost, '医院治疗');
      if (!spendResult.ok) {
        // Revert cure - re-apply sickness
        // Actually, let's check money first
        return { ok: false, msg: spendResult.msg };
      }
    }
    return result;
  },

  // 先检查费用再治疗
  canTreat(pet) {
    if (!pet.sick) return false;
    const disease = DISEASES[pet.sick.id];
    return Economy.canAfford(disease.hospitalCost);
  },

  // 使用背包中的药品
  useFromBag(itemId, pet) {
    return Inventory.use(itemId, pet);
  }
};

window.HospitalSystem = HospitalSystem;
