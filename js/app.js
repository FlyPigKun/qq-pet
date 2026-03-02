// ===== 界面控制器 =====

const app = (() => {
  let pet = null
  let isBusy = false       // 动作冷却中
  let idleTimer = null
  let tickTimer = null
  let sleepingMode = false

  // DOM 引用
  const $ = id => document.getElementById(id)

  function init() {
    pet = new Pet()
    updateStats()
    updateStageDisplay()
    randomIdleMsg()
    startTimers()

    // 点击宠物
    $('petContainer').addEventListener('click', () => {
      if (isBusy || sleepingMode) return
      const mood = pet.getMood()
      const msg = mood === 'idle'
        ? PET_MESSAGES.idle[Math.floor(Math.random() * PET_MESSAGES.idle.length)]
        : pet.getIdleMsg()
      showSpeech(msg)
      playBlush()
    })
  }

  function startTimers() {
    // 实时衰减（每30秒）
    tickTimer = setInterval(() => {
      pet.tick()
      updateStats()
      const newStage = pet.checkLevelUp()
      if (newStage) showLevelUp(newStage)
    }, 30000)

    // 随机喊话（每25秒）
    idleTimer = setInterval(() => {
      if (!isBusy && !sleepingMode) {
        showSpeech(pet.getIdleMsg())
        checkMoodExpression()
      }
    }, 25000)
  }

  // ===== 喂食 =====
  function feed() {
    if (isBusy) return
    const result = pet.feed()
    if (!result.ok) { showHint(result.msg); return }

    isBusy = true
    showSpeech(result.msg)
    showHint('🍖 正在吃东西...')
    spawnParticles('🍖', 5)

    // 切换吃饭表情
    setExpression('eat')
    $('petSvg').classList.add('pet-eating')
    $('foodIcon').style.display = ''

    setTimeout(() => {
      $('petSvg').classList.remove('pet-eating')
      $('foodIcon').style.display = 'none'
      setExpression('normal')
      updateStats()
      const newStage = pet.checkLevelUp()
      if (newStage) showLevelUp(newStage)
      showHint('吃得香香的！')
      isBusy = false
    }, 2000)
  }

  // ===== 玩耍 =====
  function play() {
    if (isBusy) return
    const result = pet.play()
    if (!result.ok) { showHint(result.msg); return }

    isBusy = true
    showSpeech(result.msg)
    showHint('🎮 玩得好开心～')
    spawnParticles('✨', 8)

    setExpression('happy')
    $('petSvg').classList.add('pet-happy')
    $('hearts').style.display = ''

    setTimeout(() => {
      $('petSvg').classList.remove('pet-happy')
      $('hearts').style.display = 'none'
      setExpression('normal')
      updateStats()
      const newStage = pet.checkLevelUp()
      if (newStage) showLevelUp(newStage)
      showHint('玩耍结束，好快乐！')
      isBusy = false
    }, 2500)
  }

  // ===== 睡觉 =====
  function sleep() {
    if (isBusy) return
    const result = pet.sleep()
    if (!result.ok) { showHint(result.msg); return }

    isBusy = true
    sleepingMode = true
    showSpeech(result.msg)
    showHint('💤 宠物正在睡觉...')

    setExpression('sleep')
    $('petSvg').classList.add('pet-sleeping')
    $('zzz').style.display = ''

    // 睡3秒（模拟，实际体力已更新）
    setTimeout(() => {
      $('petSvg').classList.remove('pet-sleeping')
      $('zzz').style.display = 'none'
      setExpression('normal')
      updateStats()
      const newStage = pet.checkLevelUp()
      if (newStage) showLevelUp(newStage)
      showSpeech('睡醒啦！精神满满！')
      showHint('休息好了，精力恢复！')
      isBusy = false
      sleepingMode = false
    }, 3000)
  }

  // ===== 洗澡 =====
  function bath() {
    if (isBusy) return
    const result = pet.bath()
    if (!result.ok) { showHint(result.msg); return }

    isBusy = true
    showSpeech(result.msg)
    showHint('🛁 正在洗澡...')
    spawnParticles('💧', 10)

    setExpression('happy')
    $('petSvg').classList.add('pet-bathing')

    setTimeout(() => {
      $('petSvg').classList.remove('pet-bathing')
      setExpression('normal')
      updateStats()
      const newStage = pet.checkLevelUp()
      if (newStage) showLevelUp(newStage)
      showHint('干干净净香喷喷！')
      isBusy = false
    }, 2000)
  }

  // ===== 更新状态栏 =====
  function updateStats() {
    const s = pet
    setBar('hungerBar', 'hungerNum', s.hunger)
    setBar('happyBar',  'happyNum',  s.happiness)
    setBar('energyBar', 'energyNum', s.energy)
    setBar('cleanBar',  'cleanNum',  s.clean)
    checkMoodExpression()
  }

  function setBar(barId, numId, val) {
    const v = Math.round(val)
    const bar = $(barId)
    bar.style.width = v + '%'
    $(numId).textContent = v
    if (v < 25) bar.classList.add('low')
    else bar.classList.remove('low')
  }

  // ===== 阶段显示 =====
  function updateStageDisplay() {
    const info = pet.getStageInfo()
    $('petStage').textContent = info.icon + ' ' + info.name
    $('petName').textContent  = pet.name
    $('expVal').textContent   = pet.exp
  }

  // ===== 表情切换 =====
  function setExpression(type) {
    const ids = ['eyes','sleepEyes','happyEyes','sadEyes','mouth','eatMouth','sadMouth','blushL','blushR']
    // 先全部重置
    $('eyes').style.display       = ''
    $('sleepEyes').style.display  = 'none'
    $('happyEyes').style.display  = 'none'
    $('sadEyes').style.display    = 'none'
    $('mouth').style.display      = ''
    $('eatMouth').style.display   = 'none'
    $('sadMouth').style.display   = 'none'
    $('blushL').style.opacity     = '0'
    $('blushR').style.opacity     = '0'

    if (type === 'happy') {
      $('eyes').style.display       = 'none'
      $('happyEyes').style.display  = ''
      $('blushL').style.opacity     = '0.7'
      $('blushR').style.opacity     = '0.7'
    } else if (type === 'sleep') {
      $('eyes').style.display       = 'none'
      $('sleepEyes').style.display  = ''
      $('mouth').style.display      = 'none'
    } else if (type === 'eat') {
      $('mouth').style.display      = 'none'
      $('eatMouth').style.display   = ''
    } else if (type === 'sad') {
      $('sadEyes').style.display    = ''
      $('eyes').style.display       = 'none'
      $('mouth').style.display      = 'none'
      $('sadMouth').style.display   = ''
    }
  }

  function checkMoodExpression() {
    if (isBusy || sleepingMode) return
    const mood = pet.getMood()
    if (mood === 'sad' || mood === 'hungry' || mood === 'dirty') {
      setExpression('sad')
      if (!$('petSvg').classList.contains('pet-sad')) {
        $('petSvg').classList.remove('petIdle')
        $('petSvg').classList.add('pet-sad')
      }
    } else if (mood === 'happy') {
      setExpression('happy')
      $('petSvg').classList.remove('pet-sad')
    } else {
      setExpression('normal')
      $('petSvg').classList.remove('pet-sad')
    }
    updateStageDisplay()
  }

  // ===== 脸红动画 =====
  function playBlush() {
    $('blushL').style.opacity = '0.7'
    $('blushR').style.opacity = '0.7'
    setTimeout(() => {
      $('blushL').style.opacity = '0'
      $('blushR').style.opacity = '0'
    }, 1500)
  }

  // ===== 气泡消息 =====
  function showSpeech(text) {
    const el = $('speechBubble')
    $('speechText').textContent = text
    el.style.animation = 'none'
    el.offsetHeight // reflow
    el.style.animation = 'bubbleAppear 0.3s cubic-bezier(0.34,1.56,0.64,1)'
  }

  function randomIdleMsg() {
    showSpeech(pet.getIdleMsg())
  }

  // ===== 提示栏 =====
  function showHint(text) {
    $('hintBar').textContent = text
  }

  // ===== 粒子特效 =====
  function spawnParticles(emoji, count) {
    const container = $('petContainer')
    const rect = container.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.textContent = emoji
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5
      const dist = 60 + Math.random() * 40
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist - 30
      p.style.left = cx + 'px'
      p.style.top  = cy + 'px'
      p.style.setProperty('--dx', dx + 'px')
      p.style.setProperty('--dy', dy + 'px')
      p.style.animationDelay = (Math.random() * 0.3) + 's'
      document.body.appendChild(p)
      setTimeout(() => p.remove(), 1500)
    }
  }

  // ===== 成长弹窗 =====
  function showLevelUp(stageName) {
    updateStageDisplay()
    const info = PET_MESSAGES.levelup[stageName]
    if (!info) return

    const overlay = document.createElement('div')
    overlay.className = 'levelup-overlay'
    overlay.innerHTML = `
      <div class="levelup-card">
        <div class="levelup-icon">${info.icon}</div>
        <div class="levelup-title">${info.title}</div>
        <div class="levelup-desc">${info.desc}</div>
        <button class="levelup-btn" onclick="this.closest('.levelup-overlay').remove()">太棒了！</button>
      </div>
    `
    document.body.appendChild(overlay)
    spawnParticles('🎉', 12)
    spawnParticles('⭐', 8)
  }

  // 公开接口
  return { init, feed, play, sleep, bath }
})()

window.addEventListener('DOMContentLoaded', () => app.init())
