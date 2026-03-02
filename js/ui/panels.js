// ===== 面板/弹窗管理 =====
const Panels = {
  _stack: [],

  // 打开面板
  open(id, title, contentHtml, options = {}) {
    const existing = document.getElementById('panel-' + id);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'panel-' + id;
    overlay.className = 'panel-overlay';
    overlay.innerHTML = `
      <div class="panel-container ${options.fullscreen ? 'panel-fullscreen' : ''}">
        <div class="panel-header">
          <span class="panel-title">${title}</span>
          <button class="panel-close" onclick="Panels.close('${id}')">&times;</button>
        </div>
        <div class="panel-body" id="panelBody-${id}">
          ${contentHtml}
        </div>
      </div>
    `;

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Panels.close(id);
    });

    document.body.appendChild(overlay);
    this._stack.push(id);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('panel-open'));

    return overlay;
  },

  // 关闭面板
  close(id) {
    const el = document.getElementById('panel-' + id);
    if (!el) return;
    el.classList.remove('panel-open');
    el.classList.add('panel-closing');
    setTimeout(() => el.remove(), 200);
    this._stack = this._stack.filter(s => s !== id);
  },

  // 关闭所有面板
  closeAll() {
    [...this._stack].forEach(id => this.close(id));
  },

  // 更新面板内容
  updateBody(id, html) {
    const body = document.getElementById('panelBody-' + id);
    if (body) body.innerHTML = html;
  },

  // 确认弹窗
  confirm(title, message, onConfirm) {
    const id = 'confirm-' + Date.now();
    const html = `
      <div class="confirm-content">
        <p>${message}</p>
        <div class="confirm-btns">
          <button class="btn btn-cancel" onclick="Panels.close('${id}')">取消</button>
          <button class="btn btn-primary" id="confirmBtn-${id}">确定</button>
        </div>
      </div>
    `;
    this.open(id, title, html);
    document.getElementById('confirmBtn-' + id).onclick = () => {
      this.close(id);
      onConfirm();
    };
  },

  // Toast提示
  toast(msg, duration = 2000) {
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast-show'));
    setTimeout(() => {
      el.classList.remove('toast-show');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
};

window.Panels = Panels;
