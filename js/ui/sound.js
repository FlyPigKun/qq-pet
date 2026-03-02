// ===== 音效管理 =====
const SoundManager = {
  _ctx: null,
  _enabled: true,

  init(enabled) {
    this._enabled = enabled;
  },

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  },

  setEnabled(on) {
    this._enabled = on;
  },

  // 播放简单音效
  play(type) {
    if (!this._enabled) return;
    try {
      const ctx = this._getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      switch (type) {
        case 'click':
          osc.frequency.value = 800;
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'coin':
          osc.frequency.value = 1200;
          gain.gain.setValueAtTime(0.1, now);
          osc.frequency.setValueAtTime(1600, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'levelup':
          osc.frequency.value = 523;
          gain.gain.setValueAtTime(0.12, now);
          osc.frequency.setValueAtTime(659, now + 0.15);
          osc.frequency.setValueAtTime(784, now + 0.3);
          osc.frequency.setValueAtTime(1047, now + 0.45);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        case 'eat':
          osc.type = 'sawtooth';
          osc.frequency.value = 300;
          gain.gain.setValueAtTime(0.08, now);
          osc.frequency.setValueAtTime(400, now + 0.05);
          osc.frequency.setValueAtTime(300, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        case 'happy':
          osc.frequency.value = 600;
          gain.gain.setValueAtTime(0.08, now);
          osc.frequency.setValueAtTime(800, now + 0.1);
          osc.frequency.setValueAtTime(1000, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'error':
          osc.type = 'square';
          osc.frequency.value = 200;
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'sick':
          osc.type = 'sine';
          osc.frequency.value = 300;
          gain.gain.setValueAtTime(0.06, now);
          osc.frequency.setValueAtTime(200, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        default:
          osc.frequency.value = 600;
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio not supported
    }
  }
};

window.SoundManager = SoundManager;
