export default class Missile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 6;
    this.height = 16;
    this.speed = 5; // 每幀像素（基準 60fps）
    this.active = true;

    // 閃爍動畫計時器
    this._elapsed = 0;
  }

  update(deltaTime) {
    const factor = deltaTime / 16.67;
    this.y += this.speed * factor;
    this._elapsed += deltaTime;
  }

  draw(ctx) {
    if (!this.active) return;

    const cx = this.x;
    const top = this.y;

    ctx.save();

    // 飛彈本體（白色橢圓）
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff4400';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, top + this.height * 0.38, this.width / 2, this.height * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭部（紅色三角）
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.moveTo(cx, top + this.height);         // 底部尖端（朝下）
    ctx.lineTo(cx - this.width / 2, top + this.height * 0.6);
    ctx.lineTo(cx + this.width / 2, top + this.height * 0.6);
    ctx.closePath();
    ctx.fill();

    // 尾焰（橘黃色漸層）
    const flameLength = 6 + Math.sin(this._elapsed / 60) * 3;
    const gradient = ctx.createLinearGradient(cx, top, cx, top - flameLength);
    gradient.addColorStop(0, 'rgba(255,170,0,0.9)');
    gradient.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(cx - 3, top + 2);
    ctx.lineTo(cx, top - flameLength);
    ctx.lineTo(cx + 3, top + 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
