// ===== 迷你游戏UI =====
const GamesUI = {
  // 游戏列表面板
  open() {
    const html = `
      <div class="games-list">
        <div class="game-card" onclick="GamesUI.startRPS()">
          <div class="game-card-icon">✊</div>
          <div class="game-card-info">
            <div class="game-card-name">猜拳游戏</div>
            <div class="game-card-desc">石头剪刀布！赢一局+5Q币</div>
          </div>
        </div>
        <div class="game-card" onclick="GamesUI.startMath()">
          <div class="game-card-icon">🔢</div>
          <div class="game-card-info">
            <div class="game-card-name">算术挑战</div>
            <div class="game-card-desc">30秒内答对尽量多题，每题+3Q币</div>
          </div>
        </div>
        <div class="game-card" onclick="GamesUI.startStars()">
          <div class="game-card-icon">⭐</div>
          <div class="game-card-info">
            <div class="game-card-name">接星星</div>
            <div class="game-card-desc">点击掉落的星星，每颗+2Q币</div>
          </div>
        </div>
      </div>
    `;
    Panels.open('games', '🎮 迷你游戏', html);
  },

  // ========== 猜拳游戏 ==========
  _rpsChoices: ['rock', 'scissors', 'paper'],
  _rpsEmoji: { rock: '✊', scissors: '✌️', paper: '🖐️' },
  _rpsNames: { rock: '石头', scissors: '剪刀', paper: '布' },
  _rpsScore: 0,
  _rpsRound: 0,
  _rpsMaxRounds: 5,

  startRPS() {
    Panels.close('games');
    this._rpsScore = 0;
    this._rpsRound = 0;
    this._showRPSRound();
  },

  _showRPSRound() {
    if (this._rpsRound >= this._rpsMaxRounds) {
      this._endRPS();
      return;
    }
    const html = `
      <div class="rps-game">
        <div class="rps-info">第 ${this._rpsRound + 1}/${this._rpsMaxRounds} 局 | 赢了 ${this._rpsScore} 局</div>
        <div class="rps-prompt">请出拳！</div>
        <div class="rps-choices">
          <button class="rps-btn" onclick="GamesUI.playRPS('rock')">✊<br>石头</button>
          <button class="rps-btn" onclick="GamesUI.playRPS('scissors')">✌️<br>剪刀</button>
          <button class="rps-btn" onclick="GamesUI.playRPS('paper')">🖐️<br>布</button>
        </div>
      </div>
    `;
    Panels.open('rps', '✊ 猜拳游戏', html);
  },

  playRPS(choice) {
    const cpu = this._rpsChoices[Math.floor(Math.random() * 3)];
    let resultText, won = false;

    if (choice === cpu) {
      resultText = '平局！';
    } else if (
      (choice === 'rock' && cpu === 'scissors') ||
      (choice === 'scissors' && cpu === 'paper') ||
      (choice === 'paper' && cpu === 'rock')
    ) {
      resultText = '你赢了！+5Q币';
      won = true;
      this._rpsScore++;
    } else {
      resultText = '你输了...';
    }

    this._rpsRound++;

    const html = `
      <div class="rps-game">
        <div class="rps-info">第 ${this._rpsRound}/${this._rpsMaxRounds} 局 | 赢了 ${this._rpsScore} 局</div>
        <div class="rps-result">
          <div class="rps-show">
            <div>你出了 ${this._rpsEmoji[choice]} ${this._rpsNames[choice]}</div>
            <div>对手出了 ${this._rpsEmoji[cpu]} ${this._rpsNames[cpu]}</div>
          </div>
          <div class="rps-result-text ${won ? 'win' : ''}">${resultText}</div>
        </div>
        <button class="btn btn-primary" onclick="GamesUI._showRPSRound()" style="margin-top:16px">
          ${this._rpsRound >= this._rpsMaxRounds ? '查看结果' : '下一局'}
        </button>
      </div>
    `;
    Panels.updateBody('rps', html);
  },

  _endRPS() {
    const coins = this._rpsScore * 5;
    if (coins > 0) Economy.earn(coins, '猜拳游戏');
    App.getGameState().stats.gamesPlayed++;
    DailySystem.completeTask('game');
    App.saveGame();
    App.updateCoinsDisplay();

    const html = `
      <div class="game-over">
        <div class="game-over-icon">✊</div>
        <div class="game-over-title">游戏结束</div>
        <div class="game-over-score">赢了 ${this._rpsScore}/${this._rpsMaxRounds} 局</div>
        <div class="game-over-coins">获得 💰${coins} Q币</div>
        <button class="btn btn-primary" onclick="Panels.close('rps')">太棒了！</button>
      </div>
    `;
    Panels.updateBody('rps', html);
    SoundManager.play('coin');
  },

  // ========== 算术挑战 ==========
  _mathScore: 0,
  _mathTimer: null,
  _mathTimeLeft: 30,
  _mathAnswer: 0,

  startMath() {
    Panels.close('games');
    this._mathScore = 0;
    this._mathTimeLeft = 30;
    this._showMathPanel();
    this._mathNewQuestion();
    this._mathTimer = setInterval(() => {
      this._mathTimeLeft--;
      const timer = document.getElementById('mathTimer');
      if (timer) timer.textContent = this._mathTimeLeft;
      if (this._mathTimeLeft <= 0) {
        this._endMath();
      }
    }, 1000);
  },

  _showMathPanel() {
    const html = `
      <div class="math-game">
        <div class="math-info">
          <span>⏱️ <span id="mathTimer">${this._mathTimeLeft}</span>秒</span>
          <span>✅ 答对 ${this._mathScore} 题</span>
        </div>
        <div class="math-question" id="mathQuestion">...</div>
        <div class="math-options" id="mathOptions"></div>
      </div>
    `;
    Panels.open('math', '🔢 算术挑战', html);
  },

  _mathNewQuestion() {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
    }

    this._mathAnswer = answer;
    const qEl = document.getElementById('mathQuestion');
    if (qEl) qEl.textContent = `${a} ${op} ${b} = ?`;

    // Generate 4 options
    const options = new Set([answer]);
    while (options.size < 4) {
      options.add(answer + Math.floor(Math.random() * 21) - 10);
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);

    const optEl = document.getElementById('mathOptions');
    if (optEl) {
      optEl.innerHTML = shuffled.map(opt =>
        `<button class="math-opt" onclick="GamesUI._mathCheck(${opt})">${opt}</button>`
      ).join('');
    }
  },

  _mathCheck(answer) {
    if (answer === this._mathAnswer) {
      this._mathScore++;
      SoundManager.play('coin');
      const info = document.querySelector('.math-info');
      if (info) info.lastElementChild.textContent = `✅ 答对 ${this._mathScore} 题`;
    } else {
      SoundManager.play('error');
    }
    this._mathNewQuestion();
  },

  _endMath() {
    clearInterval(this._mathTimer);
    const coins = this._mathScore * 3;
    if (coins > 0) Economy.earn(coins, '算术挑战');
    App.getGameState().stats.gamesPlayed++;
    DailySystem.completeTask('game');
    App.saveGame();
    App.updateCoinsDisplay();

    const html = `
      <div class="game-over">
        <div class="game-over-icon">🔢</div>
        <div class="game-over-title">时间到！</div>
        <div class="game-over-score">答对 ${this._mathScore} 题</div>
        <div class="game-over-coins">获得 💰${coins} Q币</div>
        <button class="btn btn-primary" onclick="Panels.close('math')">太棒了！</button>
      </div>
    `;
    Panels.updateBody('math', html);
  },

  // ========== 接星星游戏 ==========
  _starsScore: 0,
  _starsTimer: null,
  _starsSpawnTimer: null,
  _starsTimeLeft: 20,

  startStars() {
    Panels.close('games');
    this._starsScore = 0;
    this._starsTimeLeft = 20;

    const html = `
      <div class="stars-game">
        <div class="stars-info">
          <span>⏱️ <span id="starsTimer">${this._starsTimeLeft}</span>秒</span>
          <span>⭐ <span id="starsScore">0</span>颗</span>
        </div>
        <div class="stars-field" id="starsField"></div>
      </div>
    `;
    Panels.open('stars', '⭐ 接星星', html, { fullscreen: true });

    this._starsTimer = setInterval(() => {
      this._starsTimeLeft--;
      const el = document.getElementById('starsTimer');
      if (el) el.textContent = this._starsTimeLeft;
      if (this._starsTimeLeft <= 0) this._endStars();
    }, 1000);

    this._starsSpawnTimer = setInterval(() => {
      this._spawnStar();
    }, 600);
  },

  _spawnStar() {
    const field = document.getElementById('starsField');
    if (!field) return;
    const star = document.createElement('div');
    star.className = 'falling-star';
    const emojis = ['⭐', '🌟', '✨'];
    star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    star.style.left = (Math.random() * 85 + 5) + '%';
    star.style.animationDuration = (2 + Math.random() * 1.5) + 's';

    star.addEventListener('click', (e) => {
      e.stopPropagation();
      this._starsScore++;
      const scoreEl = document.getElementById('starsScore');
      if (scoreEl) scoreEl.textContent = this._starsScore;
      star.classList.add('star-caught');
      SoundManager.play('coin');
      setTimeout(() => star.remove(), 200);
    });

    field.appendChild(star);
    setTimeout(() => { if (star.parentNode) star.remove(); }, 4000);
  },

  _endStars() {
    clearInterval(this._starsTimer);
    clearInterval(this._starsSpawnTimer);
    const coins = this._starsScore * 2;
    if (coins > 0) Economy.earn(coins, '接星星');
    App.getGameState().stats.gamesPlayed++;
    DailySystem.completeTask('game');
    App.saveGame();
    App.updateCoinsDisplay();

    const html = `
      <div class="game-over">
        <div class="game-over-icon">⭐</div>
        <div class="game-over-title">时间到！</div>
        <div class="game-over-score">接到 ${this._starsScore} 颗星星</div>
        <div class="game-over-coins">获得 💰${coins} Q币</div>
        <button class="btn btn-primary" onclick="Panels.close('stars')">太棒了！</button>
      </div>
    `;
    Panels.updateBody('stars', html);
  }
};

window.GamesUI = GamesUI;
